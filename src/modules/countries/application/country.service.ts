import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Country } from '../domain/country.entity';
import { CountryRepository } from '../domain/country.repository.interface';
import { CountryMapper } from '../infrastructure/country.mapper';
import { CreateCountryDto } from '../presentation/dto/create-country.dto';
import { UpdateCountryDto } from '../presentation/dto/update-country.dto';
import Redis from 'ioredis';

export class CountryService {
  private readonly CACHE_KEY = 'countries:all';
  private readonly CACHE_TTL = 60 * 360;

    constructor(
    private readonly repo: CountryRepository,
    @Inject('REDIS_CLIENT') private readonly redisClient: Redis,
  ) {}

  async findAll(): Promise<Country[]> {

    const cached = await this.redisClient.get(this.CACHE_KEY)

    if(cached){
      try{
        const parsed: Country[] = JSON.parse(cached);
        return parsed;
      } catch(error){
        await this.redisClient.del(this.CACHE_KEY);
      }
    }

     const countries = (await this.repo.findAll()) || [];

     await this.redisClient.set(
      this.CACHE_KEY,
      JSON.stringify(countries),
      'EX',
      this.CACHE_TTL,
     )

     return countries;
  }

  async findById(id: string): Promise<Country> {
    const item = await this.repo.findById(id);
    if (!item) {
      throw new NotFoundException(`Country with id ${id} not found`);
    }
    return item;
  }

  async create(dto: CreateCountryDto): Promise<Country> {
    const country = CountryMapper.fromCreateDto(dto);
    const newCountry = this.repo.save(country);
    await this.invalidateCache();
    return newCountry
  }

  async updateById(
    id: string,
    dto: UpdateCountryDto,
  ): Promise<Country> {
    const existing = await this.repo.findById(id);
    if (!existing) {
      throw new NotFoundException(`Country with id ${id} not found`);
    }

    if (dto.name !== undefined) {
      existing.name = dto.name;
    }
    if (dto.importance !== undefined) {
      existing.importance = dto.importance;
    }
    const updated = this.repo.save(existing);
    await this.invalidateCache();
    return updated
  }

  async deleteById(id: string): Promise<void> {
    const existing = await this.repo.findById(id);
    if (!existing) {
      throw new NotFoundException(`Country with id ${id} not found`);
    }
    await this.repo.delete(id);
    await this.invalidateCache();
  }

  private async invalidateCache() {
    await this.redisClient.del(this.CACHE_KEY);
  }
}

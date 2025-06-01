import { NotFoundException } from '@nestjs/common';
import { Country } from '../domain/country.entity';
import { CountryRepository } from '../domain/country.repository.interface';
import { CountryMapper } from '../infrastructure/country.mapper';
import { CreateCountryDto } from '../presentation/dto/create-country.dto';
import { UpdateCountryDto } from '../presentation/dto/update-country.dto';

export class CountryService {
  constructor(private readonly repo: CountryRepository) {}

  async findAll(): Promise<Country[]> {
    const items = await this.repo.findAll();
    return items ?? [];
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
    return this.repo.save(country);
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

    return this.repo.save(existing);
  }

  async deleteById(id: string): Promise<void> {
    const existing = await this.repo.findById(id);
    if (!existing) {
      throw new NotFoundException(`Country with id ${id} not found`);
    }
    await this.repo.delete(id);
  }
}

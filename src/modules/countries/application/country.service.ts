// src/modules/countries/application/country.service.ts

import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Country } from '../domain/country.entity';
import { CountryRepository } from '../domain/country.repository.interface';
import { CountryMapper } from '../infrastructure/country.mapper';
import { CreateCountryDto } from '../presentation/dto/create-country.dto';
import { UpdateCountryDto } from '../presentation/dto/update-country.dto';
import Redis from 'ioredis';

@Injectable()
export class CountryService {
  private readonly CACHE_TTL = 60 * 360; // секунд
    private readonly MAIN_PAGE_LIMIT = 10;

  constructor(
    private readonly repo: CountryRepository,
    @Inject('REDIS_CLIENT') private readonly redisClient: Redis,
  ) {}

  async findAllForUser(
    userId: number,
    page: number,
    limit: number,
  ): Promise<{ items: Country[]; total: number }> {
    const offset = (page - 1) * limit;

    // Кэшируем только первую страницу нужного размера
    const shouldCache = page === 1 && limit === this.MAIN_PAGE_LIMIT;
    const cacheKey = `user:${userId}:countries:main`;

    if (shouldCache) {
      const cached = await this.redisClient.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }
    }

    // Читаем из репозитория
    const result = await this.repo.findAll(userId, { limit, offset });

    // Записываем в кэш только главную
    if (shouldCache) {
      await this.redisClient.set(
        cacheKey,
        JSON.stringify(result),
        'EX',
        this.CACHE_TTL,
      );
    }

    return result;
  }

  async findByIdForUser(userId: number, id: number): Promise<Country | null> {
    const country = await this.repo.findById(id);
    if (!country || country.userId !== userId) {
      return null;
    }
    return country;
  }

  async createForUser(
    userId: number,
    dto: CreateCountryDto,
  ): Promise<Country> {
    const countryData = CountryMapper.fromCreateDto(dto, userId);
    const newCountry = await this.repo.save(countryData);
    // Вместо точечного key можно инвалидацию по паттерну:
    await this.redisClient.keys(`user:${userId}:countries:*`)
      .then(keys => keys.length && this.redisClient.del(...keys));
    return newCountry;
  }

  async updateByIdForUser(
    userId: number,
    id: number,
    dto: UpdateCountryDto,
  ): Promise<Country> {
    const existing = await this.findByIdForUser(userId, id);
    if (!existing) {
      throw new NotFoundException(`Country with id ${id} not found`);
    }
    if (dto.name !== undefined) existing.name = dto.name;
    if (dto.importance !== undefined) existing.importance = dto.importance;
    if (dto.wishes !== undefined) existing.wishes = dto.wishes;
    if (dto.region !== undefined) existing.region = dto.region;
    if (dto.quote !== undefined) existing.quote = dto.quote;

    const updated = await this.repo.save(existing);
    await this.redisClient.keys(`user:${userId}:countries:*`)
      .then(keys => keys.length && this.redisClient.del(...keys));
    return updated;
  }

  async deleteByIdForUser(userId: number, id: number): Promise<void> {
    const existing = await this.findByIdForUser(userId, id);
    if (!existing) {
      throw new NotFoundException(`Country with id ${id} not found`);
    }
    await this.repo.delete(id);
    await this.redisClient.keys(`user:${userId}:countries:*`)
      .then(keys => keys.length && this.redisClient.del(...keys));
  }
}

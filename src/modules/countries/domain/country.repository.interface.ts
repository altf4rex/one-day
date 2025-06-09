import { Country } from './country.entity';

export interface CountryRepository {
  findAll(
    userId: number,
    pagination: { limit: number; offset: number },
  ): Promise<{ items: Country[]; total: number }>;

  findById(id: number): Promise<Country | null>;

  save(country: Country): Promise<Country>;

  delete(id: number): Promise<void>;
}
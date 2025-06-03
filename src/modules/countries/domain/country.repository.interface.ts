import { Country } from "./country.entity";

export interface CountryRepository {
  findAll(): Promise<Country[]>;
  findById(id: string): Promise<Country | null>;
  save(country: Country): Promise<Country>;
  delete(id: string): Promise<void>;
}
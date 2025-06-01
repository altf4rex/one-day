import { Country } from "../domain/country.entity";
import { CountryRepository } from "../domain/country.repository.interface";

export class CountryRepositoryPg implements CountryRepository {
  private countries: Country[] = [];

  constructor() {
    this.countries = [
      new Country('1', 'Japan', 'High priority'),
      new Country('2', 'USA', 'Medium priority'),
    ];
  }

  async findAll(): Promise<Country[]> {
    return [...this.countries];
  }

  async findById(id: string): Promise<Country | null> {
    const found = this.countries.find((c) => c.id === id);
    return found ? { ...found } : null;
  }

  async findByName(name: string): Promise<Country | null> {
    const found = this.countries.find((c) => c.name === name);
    return found ? { ...found } : null;
  }

  async save(country: Country): Promise<Country> {
    const index = this.countries.findIndex((c) => c.id === country.id);
    if (index === -1) {
      this.countries.push(country);
      return country;
    } else {
      this.countries[index] = country;
      return country;
    }
  }

  async delete(id: string): Promise<void> {
    this.countries = this.countries.filter((c) => c.id !== id);
  }
}

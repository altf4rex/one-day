import { Country } from '../domain/country.entity';
import { CreateCountryDto } from '../presentation/dto/create-country.dto';

const generateId = (): string => String(Math.floor(Math.random() * 10_000));

export class CountryMapper {
  static fromCreateDto(dto: CreateCountryDto): Country {
    return new Country(generateId(), dto.name, dto.importance);
  }
}

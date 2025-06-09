import { Country } from '../domain/country.entity';
import { CreateCountryDto } from '../presentation/dto/create-country.dto';

export class CountryMapper {
  static fromCreateDto(dto: CreateCountryDto, userId: number): Country {
    return new Country(
      0,
      dto.name,
      dto.importance,
      dto.wishes,
      dto.region,
      dto.quote,
      userId,
    );
  }
}
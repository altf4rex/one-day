import { Module } from '@nestjs/common';
import { CountryController } from './presentation/country.controller';
import { CountryService } from './application/country.service';
import { CountryRepositoryPg } from './infrastructure/country.repository';
import { pg } from '../../db';

const countryRepo = new CountryRepositoryPg(pg);
const countryService = new CountryService(countryRepo);

@Module({
  controllers: [CountryController],

  providers: [
    {
      provide: CountryService,
      useValue: countryService,
    },
  ],
})
export class CountriesModule {}

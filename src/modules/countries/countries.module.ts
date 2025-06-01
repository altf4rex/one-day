// src/modules/countries/countries.module.ts

import { Module } from '@nestjs/common';
import { CountryController } from './presentation/country.controller';
import { CountryService } from './application/country.service';
import { CountryRepositoryPg } from './infrastructure/country.repository';

const countryRepo = new CountryRepositoryPg();

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

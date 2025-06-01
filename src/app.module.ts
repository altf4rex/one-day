import { Module } from '@nestjs/common';
import { CountriesModule } from './modules/countries/countries.module';

@Module({
  imports: [CountriesModule],
})
export class AppModule {}

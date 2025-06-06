import { Module } from '@nestjs/common';
import { CacheModule } from './common/cache/cache.module';
import { AuthModule } from './modules/auth/auth.module';
import { CountriesModule } from './modules/countries/countries.module';

@Module({
  imports: [
    CacheModule,
    AuthModule,
    CountriesModule,
  ],
})
export class AppModule {}
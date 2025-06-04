import { Module } from '@nestjs/common';
import { AuthController } from './presentation/auth.controller';
import { AuthService } from './application/auth.service';
import { UserRepositoryPg } from './infrastructure/user.repository';
import { LocalStrategy } from './strategies/local.strategy';
import { SessionSerializer } from './strategies/session.serializer';
import { SessionAuthGuard } from './guards/session-auth.guard';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { Pool } from 'pg';

@Module({
  imports: [],
  controllers: [AuthController],
  providers: [
    AuthService,
    UserRepositoryPg,
    LocalStrategy,
    SessionSerializer,
    LocalAuthGuard,
    SessionAuthGuard,
    {
      provide: 'PG_POOL',
      useFactory: () => {
        return new Pool({
          connectionString: process.env.DATABASE_URL,
        });
      },
    },
    {
      provide: UserRepositoryPg,
      useFactory: (db: Pool) => new UserRepositoryPg(db),
      inject: ['PG_POOL'],
    },
  ],
  exports: [AuthService, SessionAuthGuard, LocalAuthGuard],
})
export class AuthModule {}

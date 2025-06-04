import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as session from 'express-session';
import * as passport from 'passport';
import RedisStore from 'connect-redis';
import Redis from 'ioredis';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const redisClient = new Redis();
  const redisStore = new RedisStore({ client: redisClient });

  app.use(
    session({
      store: redisStore,
      name: 'travel.sid',
      secret: process.env.SESSION_SECRET || 'supersecretkey',
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 1000 * 60 * 60 * 24,
        sameSite: 'lax',
      },
    }),
  );

  app.use(passport.initialize());
  app.use(passport.session());

  await app.listen(3000);
  console.log(`Server started on http://localhost:3000`);
}
bootstrap();

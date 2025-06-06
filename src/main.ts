import Redis from 'ioredis';
import session from 'express-session';
import passport from 'passport';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

const RedisStore = require('connect-redis')(session);

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const redisClient = new Redis();

  app.use(
    session({
      store: new RedisStore({ client: redisClient }),
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
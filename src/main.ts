import Redis from 'ioredis';
import session from 'express-session';
import passport from 'passport';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as csurf from 'csurf';
import helmet from 'helmet';
import * as cookieParser from 'cookie-parser';
import { ValidationPipe } from '@nestjs/common';
import rateLimit from 'express-rate-limit';

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

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 минут
    max: 100, // максимум 100 запросов
  }),
);

// Безопасные HTTP-заголовки
    app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", 'data:'],
          fontSrc: ["'self'", 'https://fonts.gstatic.com'],
        },
      },
    }),
  );

app.use(helmet.referrerPolicy({ policy: 'no-referrer' }));
app.use(helmet.hsts({ maxAge: 31536000 })); // only https


  // CORS, разрешаем только наш фронтенд, и cookie
  app.enableCors({
    origin: 'http://localhost:3000',
    credentials: true,
  });

  // Парсинг cookie (нужно для CSRF и для session-based auth)
  app.use(cookieParser());


  // CSRF-защита (если храним токен/сессию в cookie)
  app.use(
    csurf({
      cookie: {
        httpOnly: true,
        sameSite: 'lax', // или 'strict'
      },
    }),
  );

  // Глобальный ValidationPipe (валидация DTO + удаление лишних полей)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  await app.listen(3000);
  console.log(`Server started on http://localhost:3000`);
}
bootstrap();
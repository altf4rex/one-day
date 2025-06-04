// src/modules/auth/controllers/auth.controller.ts

import {
  Controller,
  Post,
  Body,
  Req,
  Res,
  UseGuards,
  Get,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { AuthService } from '../application/auth.service';
import { RegisterDto } from '../dto/register.dto';
import { LocalAuthGuard } from '../guards/local-auth.guard';
import { SessionAuthGuard } from '../guards/session-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /** Регистрация (не создаём сессию) */
  @Post('register')
  async register(@Body() dto: RegisterDto) {
    const user = await this.authService.register(dto);
    return { id: user.id, email: user.email };
  }

  /**
   * Логин:
   * - LocalAuthGuard вызывает LocalStrategy.validate()
   * - Passport создаёт сессию (serializeUser)
   * - Возвращаем простой ответ
   */
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Req() req: Request, @Res() res: Response) {
    // Passport уже положил user в req.user и создал сессию
    const user = req.user as any; // тип User
    return res.json({
      message: 'Logged in',
      user: { id: user.id, email: user.email, role: user.role },
    });
  }

  /**
   * Logout:
   * - req.logout() удаляет сессию (Passport)
   * - Очищаем cookie, чтобы клиент больше не слал старый sessionId
   */
  @UseGuards(SessionAuthGuard)
  @Post('logout')
  async logout(@Req() req: Request, @Res() res: Response) {
    req.logout(() => {
      res.clearCookie('travel.sid'); // удаляем клиентский cookie
      return res.json({ message: 'Logged out' });
    });
  }

  /** Защищённый маршрут: если пользователь залогинен, возвращаем профиль */
  @UseGuards(SessionAuthGuard)
  @Get('profile')
  getProfile(@Req() req: Request) {
    return req.user; // здесь лежит объект User, возвращённый десериализацией
  }
}

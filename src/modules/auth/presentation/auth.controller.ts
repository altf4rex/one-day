import {
  Controller,
  Post,
  Body,
  Req,
  Res,
  UseGuards,
  Get,
} from '@nestjs/common';
import { Response, Request as ExpressRequest } from 'express';
import { AuthService } from '../application/auth.service';
import { RegisterDto } from '../presentation/dto/register.dto';
import { LocalAuthGuard } from '../guards/local-auth.guard';
import { SessionAuthGuard } from '../guards/session-auth.guard';
import { User } from '../domain/user.entity';

interface SessionRequest extends ExpressRequest {
  user?: User;
  logout: (callback: () => any) => void;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /** Регистрация */
  @Post('register')
  async register(@Body() dto: RegisterDto) {
    const user = await this.authService.register(dto);
    return { id: user.id, email: user.email };
  }

  /**
   * Логин:
   * - LocalAuthGuard вызывает LocalStrategy.validate()
   * - Passport создаёт сессию (serializeUser)
   * - req.user заполняется объектом User, req.logout есть
   */
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Req() req: SessionRequest, @Res() res: Response) {
    // req.user теперь безопасно доступен
    const user = req.user!;
    return res.json({
      message: 'Logged in',
      user: { id: user.id, email: user.email, role: user.role },
    });
  }

  /**
   * Logout:
   * - вызов req.logout() удалит сессию
   * - clearCookie уберёт cookie с клиентской стороны
   */
  @UseGuards(SessionAuthGuard)
  @Post('logout')
  async logout(@Req() req: SessionRequest, @Res() res: Response) {
    req.logout(() => {
      res.clearCookie('travel.sid');
      return res.json({ message: 'Logged out' });
    });
  }

  /** Профиль: вернёт req.user, если залогинен */
  @UseGuards(SessionAuthGuard)
  @Get('profile')
  getProfile(@Req() req: SessionRequest) {
    // TS знает, что req.user — User
    return req.user!;
  }
}
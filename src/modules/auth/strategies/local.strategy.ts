import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UserRepositoryPg } from '../infrastructure/user.repository';
import { User } from '../domain/user.entity';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly userRepo: UserRepositoryPg) {
    // По умолчанию Passport ищет поля 'username' и 'password'.
    // Тут мы говорим: вместо 'username' используем 'email'.
    super({ usernameField: 'email' });
  }

  /** Passport вызывает этот метод при login */
  async validate(email: string, password: string): Promise<User> {
    const user = await this.userRepo.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    // Сравниваем plain-password с хешем в БД
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }
    // Если всё ок — возвращаем user. Passport положит его в req.user.
    return user;
  }
}

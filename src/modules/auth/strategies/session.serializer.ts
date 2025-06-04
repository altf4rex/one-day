import { PassportSerializer } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { UserRepositoryPg } from '../infrastructure/user.repository';
import { User } from '../domain/user.entity';

@Injectable()
export class SessionSerializer extends PassportSerializer {
  constructor(private readonly userRepo: UserRepositoryPg) {
    super();
  }

  /** сохранить в сессии только user.id */
  serializeUser(user: User, done: Function) {
    done(null, user.id);
  }

  /** при каждом запросе достаём user.id из сессии, загружаем full User */
  async deserializeUser(userId: string, done: Function) {
    const user = await this.userRepo.findById(userId);
    done(null, user);
  }
}
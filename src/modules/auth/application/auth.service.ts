import { Injectable, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UserRepositoryPg } from '../infrastructure/user.repository';
import { RegisterDto } from '../presentation/dto/register.dto';
import { User } from '../domain/user.entity';

@Injectable()
export class AuthService {
    constructor(private readonly userRepo: UserRepositoryPg){}

    async register(dto: RegisterDto): Promise<User>{
        const existing = await this.userRepo.findByEmail(dto.email);

        if(existing){
            throw new ConflictException('Email already in use')
        }

        const passwordHash = await bcrypt.hash(dto.password, 10);
        const user = new User(null, dto.email, dto.name, passwordHash);
        return this.userRepo.save(user)
    }
}
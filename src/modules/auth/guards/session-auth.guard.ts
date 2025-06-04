import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class SessionAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    // Passport добавит req.isAuthenticated(), если инициирован passport.session()
    if (req.isAuthenticated && req.isAuthenticated()) {
      return true;
    }
    throw new UnauthorizedException('Unauthorized');
  }
}
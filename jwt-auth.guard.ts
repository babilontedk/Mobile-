import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const auth = request.headers.authorization;
    const token = auth?.replace('Bearer ', '');
    if (!token) throw new UnauthorizedException('Missing token');
    request.user = await this.authService.verifyToken(token);
    return true;
  }
}

import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { jwtConstants } from '../constants/jwt.constant';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();

    console.log('Request Headers:', request.headers);

    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException('Token không được cung cấp');
    }

    try {
      const payload = await this.jwtService.verifyAsync(token, { secret: jwtConstants.secret });
      request['user'] = payload;
    } catch {
      throw new UnauthorizedException('Token không hợp lệ');
    }
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const authorizationHeader = request.headers.authorization;

    console.log('Authorization Header:', authorizationHeader);

    if (!authorizationHeader) {
      throw new UnauthorizedException('Authorization header is missing');
    }

    const [type, token] = authorizationHeader.split(' ');

    if (type !== 'Bearer' || !token) {
      throw new UnauthorizedException('Định dạng tiêu đề không hợp lệ');
    }
    return token;
  }
}

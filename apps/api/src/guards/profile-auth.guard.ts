import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Observable } from 'rxjs';
import { ROLES_KEY } from './roles-auth.decorator';

@Injectable()
export class ProfilesGuard implements CanActivate {
  constructor(private jwtService: JwtService, private reflector: Reflector) {}

  /**
   * Дает разрешение на использование эндпоинта
   *
   * @param context Контекст
   * @returns true(Доступ разрешен)
   */
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    try {
      console.log('3');

      const requiredRoles = this.reflector.getAllAndOverride<string[]>(
        ROLES_KEY,
        [context.getHandler(), context.getClass()],
      );
      if (!requiredRoles) {
        return true;
      }
      console.log('1');

      const req = context.switchToHttp().getRequest();
      const authHeader = req.headers.authorization;
      const bearer = authHeader.split(' ')[0];
      const token = authHeader.split(' ')[1];
      console.log(2);

      if (bearer != 'Bearer' || !token) {
        throw new UnauthorizedException({
          message: 'Пользователь не авторизован',
        });
      }
      const user = this.jwtService.verify(token);
      console.log(user);
      req.user = user;
      const paramId = req.params.id;
      return (
        user.roles.some((role) => requiredRoles.includes(role.value)) ||
        user.id == paramId
      );
    } catch (error) {
      throw new HttpException({ message: 'Нет доступа' }, HttpStatus.FORBIDDEN);
    }
  }
}

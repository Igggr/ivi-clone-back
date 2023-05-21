import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { ROLES_KEY } from './roles-auth.decorator';

export abstract class AbstractRoleGuard implements CanActivate {
  constructor(protected readonly reflector: Reflector) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    try {
      const requiredRoles = this.reflector.getAllAndOverride<string[]>(
        ROLES_KEY,
        [context.getHandler(), context.getClass()],
      );
      if (!requiredRoles) {
        return true;
      }
      const req = context.switchToHttp().getRequest();
      if (!req.user) {
        return false;
      }

      return this.check(req, req.user, requiredRoles);
    } catch (error) {
      throw new HttpException(
        { message: 'Нет доступа, либо пользователь не авторизован' },
        HttpStatus.FORBIDDEN,
      );
    }
  }

  abstract check(req, user, requiredRoles: string[]): boolean;
}

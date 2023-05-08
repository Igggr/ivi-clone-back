import { Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AbstractRoleGuard } from './abstract-guard';

@Injectable()
export class RolesGuard extends AbstractRoleGuard {
  constructor(reflector: Reflector) {
    super(reflector);
  }

  check(req: any, user: any, requiredRoles: string[]): boolean {
    return user.roles.some((role) => requiredRoles.includes(role.value));
  }
}

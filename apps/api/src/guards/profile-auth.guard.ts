import { Injectable } from '@nestjs/common';
import { AbstractRoleGuard } from './abstract-guard';
import { Reflector } from '@nestjs/core';

@Injectable()
export class ProfilesGuard extends AbstractRoleGuard {
  constructor(reflector: Reflector) {
    super(reflector);
  }

  check(req: any, user: any, requiredRoles: string[]): boolean {
    return (
      user.roles.some((role) => requiredRoles.includes(role.value)) ||
      user.id == req.params.id
    );
  }
}

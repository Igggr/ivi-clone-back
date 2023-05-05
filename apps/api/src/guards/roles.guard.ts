import { Injectable } from '@nestjs/common';
import { AbstractRoleGuard } from './abstract-guard';

@Injectable()
export class RolesGuard extends AbstractRoleGuard {
  check(req: any, user: any, requiredRoles: string[]): boolean {
    return user.roles.some((role) => requiredRoles.includes(role.value));
  }
}

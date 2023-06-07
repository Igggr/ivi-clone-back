import { Injectable } from '@nestjs/common';
import { AbstractRoleGuard } from './abstract-guard';
import { Reflector } from '@nestjs/core';

@Injectable()
export class IsAuthenticatedGuard extends AbstractRoleGuard {
    constructor(reflector: Reflector) {
        super(reflector);
    }

    check(req: any, user: any, requiredRoles: string[]): boolean {
        return user !== undefined;
    }
}
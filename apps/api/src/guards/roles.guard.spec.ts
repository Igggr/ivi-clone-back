import { ExecutionContext } from '@nestjs/common';
import { createMock } from '@golevelup/ts-jest';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from './roles.guard';
import { ADMIN, USER } from '@app/shared/constants/role.const';


describe('RolesGuard', () => {
    let rolesGuard: RolesGuard;
    let reflector: Reflector;
    let mockExecutionContext;

    beforeEach(async () => {
        mockExecutionContext = createMock<ExecutionContext>();
        reflector = new Reflector();
        rolesGuard = new RolesGuard(reflector);
    });

    it('It should be defined', () => {
        expect(rolesGuard).toBeDefined();
    });

    it('User with role is allowed', () => {
        reflector.getAllAndOverride = jest.fn().mockReturnValue([ADMIN.value]);
        mockExecutionContext.switchToHttp().getRequest.mockReturnValue({
            user: {
                id: 1,
                roles: [USER, ADMIN],
            },
        });
        expect(rolesGuard.canActivate(mockExecutionContext)).toBe(true);
    });

    it('User without role is not allowed', () => {
        reflector.getAllAndOverride = jest.fn().mockReturnValue(['ADMIN']);
        mockExecutionContext.switchToHttp().getRequest.mockReturnValue({
            user: {
                id: 1,
                roles: [USER],
            },
        });
        expect(rolesGuard.canActivate(mockExecutionContext)).toBe(false);
    });

    it('Anonymus user is not allowed if any role is required', () => {
        reflector.getAllAndOverride = jest.fn().mockReturnValue([USER.value]);
        mockExecutionContext.switchToHttp().getRequest.mockReturnValue({});
        expect(rolesGuard.canActivate(mockExecutionContext)).toBe(false);
    });
});

import { ExecutionContext } from '@nestjs/common';
import { createMock } from '@golevelup/ts-jest';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from './roles.guard';
import { USER } from '@app/shared/constants/role.const';

describe('Authentication Guard', () => {
  let authGuard: RolesGuard;
  let reflector: Reflector;
  let mockExecutionContext;

  beforeEach(async () => {
    mockExecutionContext = createMock<ExecutionContext>();
    reflector = new Reflector();
    authGuard = new RolesGuard(reflector);
  });

  it('It should be defined', () => {
    expect(authGuard).toBeDefined();
  });

  it('Authenticated user is allowed', () => {
    reflector.getAllAndOverride = jest.fn().mockReturnValue(undefined);
    mockExecutionContext.switchToHttp().getRequest.mockReturnValue({
      user: {
        id: 1,
        roles: [USER],
      },
    });
    expect(authGuard.canActivate(mockExecutionContext)).toBe(true);
  });

  it('Anonymus is not allowed', () => {
    reflector.getAllAndOverride = jest.fn().mockReturnValue(undefined);
    mockExecutionContext.switchToHttp().getRequest.mockReturnValue({});
    expect(authGuard.canActivate(mockExecutionContext)).toBe(false);
  });
});

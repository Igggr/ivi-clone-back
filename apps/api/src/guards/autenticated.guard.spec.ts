import { ExecutionContext } from '@nestjs/common';
import { createMock } from '@golevelup/ts-jest';
import { Reflector } from '@nestjs/core';
import { IsAuthenticatedGuard } from './autenticated.guard';
import { ADMIN, USER } from '@app/shared/constants/role.const';

describe('IsAuthenticatedGuard', () => {
  let profilesGuard: IsAuthenticatedGuard;
  let reflector: Reflector;
  let mockExecutionContext;

  beforeEach(async () => {
    mockExecutionContext = createMock<ExecutionContext>();
    reflector = new Reflector();
    profilesGuard = new IsAuthenticatedGuard(reflector);
  });

  it('It should be defined', () => {
    expect(profilesGuard).toBeDefined();
  });

  it('Authenticated user is allowed', () => {
    reflector.getAllAndOverride = jest.fn().mockReturnValue([ADMIN.value]);
    mockExecutionContext.switchToHttp().getRequest.mockReturnValue({
      params: {
        id: 1,
      },
      user: {
        id: 1,
        roles: [USER],
      },
    });
    expect(profilesGuard.canActivate(mockExecutionContext)).toBe(true);
  });

  it('Anonymus is not allowed', () => {
    reflector.getAllAndOverride = jest.fn().mockReturnValue([ADMIN.value]);
    mockExecutionContext.switchToHttp().getRequest.mockReturnValue({});
    expect(profilesGuard.canActivate(mockExecutionContext)).toBe(false);
  });

});

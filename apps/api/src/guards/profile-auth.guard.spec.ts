import { ExecutionContext } from '@nestjs/common';
import { createMock } from '@golevelup/ts-jest';
import { Reflector } from '@nestjs/core';
import { ProfilesGuard } from './profile-auth.guard';
import { ADMIN, USER } from '@app/shared/constants/role.const';

describe('ProfilesGuard', () => {
  let profilesGuard: ProfilesGuard;
  let reflector: Reflector;
  let mockExecutionContext;

  beforeEach(async () => {
    mockExecutionContext = createMock<ExecutionContext>();
    reflector = new Reflector();
    profilesGuard = new ProfilesGuard(reflector);
  });

  it('It should be defined', () => {
    expect(profilesGuard).toBeDefined();
  });

  it('Owner without role is allowed', () => {
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

  it('Non-owner without role is not allowed', () => {
    reflector.getAllAndOverride = jest.fn().mockReturnValue([ADMIN.value]);
    mockExecutionContext.switchToHttp().getRequest.mockReturnValue({
      params: {
        id: 1,
      },
      user: {
        id: 2,
        roles: [USER],
      },
    });
    expect(profilesGuard.canActivate(mockExecutionContext)).toBe(false);
  });

  it('Non-owner with role is allowed', () => {
    reflector.getAllAndOverride = jest.fn().mockReturnValue([ADMIN.value]);
    mockExecutionContext.switchToHttp().getRequest.mockReturnValue({
      params: {
        id: 1,
      },
      user: {
        id: 2,
        roles: [USER, ADMIN],
      },
    });
    expect(profilesGuard.canActivate(mockExecutionContext)).toBe(true);
  });
});

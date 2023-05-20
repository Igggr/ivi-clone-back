import { IntersectionType, OmitType } from '@nestjs/swagger';
import { Profile } from '../entities/profile.entity';
import { User } from '../entities/user.entity';

export class CreateUserProfileDto extends IntersectionType(
  OmitType(User, ['id', 'roles']),
  OmitType(Profile, ['id', 'userId', 'createdAt']),
) {}

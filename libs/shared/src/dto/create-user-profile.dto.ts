import { IntersectionType, OmitType } from '@nestjs/swagger';
import { Profile } from '../entities/profile.entity';
import { CreateUserDto } from './create-user.dto';

export class CreateUserProfileDto extends IntersectionType(
  CreateUserDto,
  OmitType(Profile, ['id', 'userId', 'createdAt']),
) {}

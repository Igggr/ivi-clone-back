import { IntersectionType, PickType, PartialType } from '@nestjs/swagger';
import { Profile } from '../entities/profile.entity';
import { CreateUserDTO } from './create-user.dto';

export class CreateUserProfileDto extends IntersectionType(
  CreateUserDTO,
  PickType(Profile, ['nickname', 'name', 'surname', 'city']),
  PartialType(PickType(Profile, ['photo', 'url'])),
) {}

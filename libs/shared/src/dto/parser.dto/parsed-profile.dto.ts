import { IntersectionType, OmitType } from '@nestjs/swagger';
import { Profile, User } from '../../entities';

export class ParsedProfileDTO extends IntersectionType(
  OmitType(User, ['id']),
  OmitType(Profile, ['id', 'userId', 'createdAt']),
) {}

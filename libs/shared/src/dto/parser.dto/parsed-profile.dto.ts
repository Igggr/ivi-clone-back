import { IntersectionType, PickType } from '@nestjs/swagger';
import { Profile, User } from '../../entities';

export class ParsedProfileDTO extends PickType(Profile, ['nickname', 'url', 'photo']) {}

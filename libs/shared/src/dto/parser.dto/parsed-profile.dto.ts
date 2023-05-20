import { PickType } from '@nestjs/swagger';
import { Profile } from '../../entities';

export class ParsedProfileDTO extends PickType(Profile, [
  'nickname',
  'url',
  'photo',
]) {}

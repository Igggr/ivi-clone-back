import { Profile } from '@app/shared';
import { PickType } from '@nestjs/swagger';

export class ParsedProfileDTO extends PickType(Profile, ['name']) {
  photo: string;
  url: string;
}

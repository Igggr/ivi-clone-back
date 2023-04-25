import { CreateReviewDTO } from '../create-review.dto';
import { OmitType } from '@nestjs/swagger';

export class ParsedReviewDTO extends OmitType(CreateReviewDTO, [
  'filmId',
  'profileId',
]) {}

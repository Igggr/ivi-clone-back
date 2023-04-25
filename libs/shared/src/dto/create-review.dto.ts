import { OmitType } from '@nestjs/swagger';
import { Review } from '../entities';

export class CreateReviewDTO extends OmitType(Review, [
  'id',
  'comments',
  'film',
]) {}

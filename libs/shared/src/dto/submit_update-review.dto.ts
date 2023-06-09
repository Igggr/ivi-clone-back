import { OmitType } from '@nestjs/swagger';
import { UpdateReviewDTO } from './update-review.dto';

export class SubmitUpdateReview extends OmitType(UpdateReviewDTO, [
  'profileId',
]) {}

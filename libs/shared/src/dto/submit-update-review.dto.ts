import { OmitType } from '@nestjs/swagger';
import { UpdateReviewDTO } from './update-review.dto';

export class SubmitUpdateReviewDTO extends OmitType(UpdateReviewDTO, [
  'profileId',
]) {}

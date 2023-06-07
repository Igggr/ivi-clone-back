import { OmitType } from '@nestjs/swagger';
import { CreateReviewDTO } from './create-review.dto';

export class SubmitReviewDTO extends OmitType(CreateReviewDTO, ['profileId']) {}

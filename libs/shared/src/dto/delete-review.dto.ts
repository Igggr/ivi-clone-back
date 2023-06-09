import { PickType } from '@nestjs/swagger';
import { Review } from '../entities';

export class DeleteReviewDTO extends PickType(Review, ['id', 'profileId']) {}

import { PickType } from "@nestjs/swagger";
import { Review } from "../entities";

export class UpdateReviewDTO extends PickType(Review, ['id', 'title', 'text', 'isPositive', 'profileId']) {}
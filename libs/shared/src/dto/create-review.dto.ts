import { PickType } from "@nestjs/swagger";
import { Review } from "../entities";

export class CreateReviewDTO extends PickType(Review, ['isPositive', 'title', 'text', 'profileId']) { }
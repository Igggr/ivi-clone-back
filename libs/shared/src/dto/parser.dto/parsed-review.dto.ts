import { PickType } from '@nestjs/swagger';
import { ParsedCommentDTO } from './parsed-comment.dto';
import { ParsedProfileDTO } from './parsed-profile.dto';
import { Review } from '@app/shared';

export class ParsedReviewDTO extends PickType(Review, [
  'title',
  'text',
  'url',
]) {
  comments: ParsedCommentDTO[];
  profile: ParsedProfileDTO;
}

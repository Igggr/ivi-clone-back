import { PickType } from '@nestjs/swagger';
import { ParsedCommentDTO } from './parsed-comment.dto';
import { ParsedProfileDTO } from './parsed-profile.dto';
import { Review } from '../../entities';

export class ParsedReviewDTO extends PickType(Review, [
  'title',
  'text',
  'url',
]) {
  comments: ParsedCommentDTO[];
  profile: ParsedProfileDTO;
}

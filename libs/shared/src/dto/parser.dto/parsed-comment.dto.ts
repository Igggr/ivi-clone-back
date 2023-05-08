import { PickType } from '@nestjs/swagger';
import { Comment } from '../../entities';
import { ParsedProfileDTO } from './parsed-profile.dto';

export class ParsedCommentDTO extends PickType(Comment, ['text']) {
  commentId: string;
  parentId: string;
  profile: ParsedProfileDTO;
  date: string;
}

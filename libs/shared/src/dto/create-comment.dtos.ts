import { PickType } from '@nestjs/swagger';
import { Comment } from '../entities/comment.entity';

export class CreateCommentDTO extends PickType(Comment, [
  'text',
  'reviewId',
  'profileId',
  'parentCommentId',
]) {}

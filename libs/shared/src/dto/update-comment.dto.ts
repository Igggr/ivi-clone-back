import { PickType } from '@nestjs/swagger';
import { Comment } from '../entities';

export class UpdateCommentDTO extends PickType(Comment, [
  'id',
  'profileId',
  'text',
]) {}

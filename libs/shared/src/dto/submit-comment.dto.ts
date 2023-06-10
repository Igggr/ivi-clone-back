import { OmitType } from '@nestjs/swagger';
import { CreateCommentDTO } from './create-comment.dtos';

export class SubmitCommentDTO extends OmitType(CreateCommentDTO, [
  'profileId',
]) {}

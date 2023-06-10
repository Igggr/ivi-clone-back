import { OmitType } from '@nestjs/swagger';
import { UpdateCommentDTO } from './update-comment.dto';

export class SubmitUpdateCommentDTO extends OmitType(UpdateCommentDTO, [
  'profileId',
]) {}

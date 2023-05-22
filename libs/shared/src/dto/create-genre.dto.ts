import { OmitType } from '@nestjs/swagger';
import { ParsedGenreDTO } from './parser.dto/parsed-genre.dto';

export class CreateGenreDTO extends OmitType(ParsedGenreDTO, ['url']) {}

import { Actor } from '../entities';
import { OmitType } from '@nestjs/swagger';

export class CreateActorDTO extends OmitType(Actor, ['id', 'personInFilm']) {}

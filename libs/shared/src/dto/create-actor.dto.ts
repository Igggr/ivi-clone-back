import { ActorEntity } from "../entities";
import { OmitType } from '@nestjs/swagger';

export class CreateActorDTO extends OmitType(ActorEntity, ['id', 'personInFilm']) {}
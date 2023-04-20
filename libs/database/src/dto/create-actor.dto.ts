import { ActorEntity } from "../entities";
import { PickType } from '@nestjs/swagger';

export class CreateActorDTO extends PickType(ActorEntity, ['fullName']) {}
import { Actor } from '../entities';
import { IntersectionType, OmitType, PartialType, PickType } from '@nestjs/swagger';

export class CreateActorDTO extends IntersectionType(
    OmitType(Actor, ['id', 'personInFilm', 'fullNameEn']),
    PartialType(PickType(Actor, ['fullNameEn']))
 ) {}
    

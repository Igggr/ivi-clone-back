import { OmitType } from '@nestjs/swagger';
import { AgeRestriction } from '../entities/age-restriction';

export class CreateAgeRestrictionDTO extends OmitType(AgeRestriction, [
  'id',
  'films',
]) {}

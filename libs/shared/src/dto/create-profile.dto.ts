import { IntersectionType, OmitType } from "@nestjs/swagger";
import { Profile } from "../entities";

export class CreateProfileDto extends IntersectionType(
    OmitType(Profile, ['id', 'userId', 'createdAt']),
  ) {}
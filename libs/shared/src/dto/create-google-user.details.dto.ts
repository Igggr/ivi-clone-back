import { PickType } from '@nestjs/swagger';
import { GoogleUser } from '../entities/google-user.entity';

export class CreateGoogleUserDetailsDto extends PickType(GoogleUser, [
  'email',
  'displayName',
]) {}

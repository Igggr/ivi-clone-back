import { PickType } from '@nestjs/swagger';
import { User } from '../entities';

export class CreateUserDTO extends PickType(User, ['email', 'password']) {}

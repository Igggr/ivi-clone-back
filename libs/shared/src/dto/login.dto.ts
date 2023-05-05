import { PickType } from '@nestjs/swagger';
import { User } from '../entities/user.entity';

export class LoginDto extends PickType(User, ['email', 'password']) {}

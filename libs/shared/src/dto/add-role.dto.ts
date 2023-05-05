import { PickType } from '@nestjs/swagger';
import { IsInt, IsNumber, IsPositive } from 'class-validator';
import { Role } from '../entities/role.entity';

export class AddRoleDto extends PickType(Role, ['value']) {
  @IsNumber({}, { message: 'Должно быть числом' })
  @IsPositive()
  @IsInt()
  readonly userId: number;
}

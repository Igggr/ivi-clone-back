import { PickType } from '@nestjs/swagger';
import { Role } from '../entities/role.entity';

export class CreateRoleDto extends PickType(Role, ['value', 'description']) {
  constructor(value, description = null) {
    super();
    this.value = value;
    this.description = description;
  }
}

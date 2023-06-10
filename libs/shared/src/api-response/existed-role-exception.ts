import { ApiProperty } from '@nestjs/swagger';

export class ExistedRoleException {
  @ApiProperty({ default: 400 })
  statusCode: number;

  @ApiProperty({ default: 'Такая роль уже существует' })
  message: string;
}

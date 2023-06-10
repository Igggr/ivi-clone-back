import { ApiProperty } from '@nestjs/swagger';

export class NotFoundRoleOrUserException {
  @ApiProperty({ default: 404 })
  statusCode: number;

  @ApiProperty({
    default:
      'Пользователь или роль не найдены, либо данная роль уже присвоена пользователю',
  })
  message: string;
}

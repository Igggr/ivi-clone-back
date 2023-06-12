import { ApiProperty } from '@nestjs/swagger';

export class DeletedProfileUserResponse {
  @ApiProperty({ default: 200 })
  statusCode: number;

  @ApiProperty({ default: 'Профиль и пользователь успешно удалены' })
  message: string;
}

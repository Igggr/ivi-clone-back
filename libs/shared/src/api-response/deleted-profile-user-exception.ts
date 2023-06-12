import { ApiProperty } from '@nestjs/swagger';

export class DeletedProfileUserException {
  @ApiProperty({ default: 400 })
  statusCode: number;

  @ApiProperty({ default: 'Ошибка при удалении профиля' })
  message: string;
}

import { ApiProperty } from '@nestjs/swagger';

export class RegisterException {
  @ApiProperty({ default: 400 })
  statusCode: number;

  @ApiProperty({ default: 'Ошибка при создании профиля' })
  message: string;
}

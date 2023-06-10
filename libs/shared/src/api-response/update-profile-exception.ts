import { ApiProperty } from '@nestjs/swagger';

export class UpdateProfileException {
  @ApiProperty({ default: 400 })
  statusCode: number;

  @ApiProperty({ default: 'Ошибка при обновлении профиля' })
  message: string;
}

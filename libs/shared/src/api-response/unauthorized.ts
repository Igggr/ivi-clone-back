import { ApiProperty } from '@nestjs/swagger';

export class UnauthorizedException {
  @ApiProperty({ default: 401 })
  statusCode: number;

  @ApiProperty({ default: 'Неккоректный емэйл или пароль' })
  message: string;
}

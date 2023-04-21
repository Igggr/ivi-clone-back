import { ApiProperty } from '@nestjs/swagger';

export class ErrorDTO {
  @ApiProperty({ example: 'error', description: 'Код' })
  status: 'error';

  @ApiProperty({ description: 'Сообщение об ощибке' })
  error: string;
}

export class ValueDTO<T> {
  @ApiProperty({ example: 'error', description: 'Код' })
  status: 'ok';

  @ApiProperty({ description: 'Данные' })
  value: T;
}

export type ResponseDTO<T> = ErrorDTO | ValueDTO<T>;

import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, Length } from 'class-validator';

export class CreateUserProfileDto {
  @ApiProperty({ example: 'user@mail.ru', description: 'Почтовый адрес' })
  @IsString({ message: 'Email должен быть строкой' })
  @IsEmail({}, { message: 'Некорректный email' })
  readonly email: string;
  @ApiProperty({ example: '12345678', description: 'Пароль пользователя' })
  @IsString({ message: 'Пароль должен быть строкой' })
  @Length(4, 16, {
    message: 'Пароль должен быть не меньше 4 и не больше 16 символов',
  })
  readonly password: string;
  readonly name: string;
  readonly surname: string;
  readonly phoneNumber: string;
  readonly userId: number;
}

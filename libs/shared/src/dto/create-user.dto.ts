import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, Length } from 'class-validator';

export class CreateUserDto {
  constructor(email: string, password: string) {
    this.email = email;
    this.password = password;
  }
  @ApiProperty({ example: 'user@mail.ru', description: 'Почтовый адрес' })
  @IsString({ message: 'Должно быть строкой' })
  @IsEmail({}, { message: 'Некорректный email' })
  readonly email: string;
  @ApiProperty({ example: '12345678', description: 'Пароль пользователя' })
  @IsString({ message: 'Должно быть строкой' })
  @Length(4, 16, { message: 'Не меньше 4 и не больше 16 символов' })
  readonly password: string;
}

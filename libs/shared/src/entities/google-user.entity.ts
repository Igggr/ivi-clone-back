import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'google_user' })
export class GoogleUser {
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: 'user@mail.ru', description: 'Почтовый адрес' })
  @Column()
  email: string;

  @ApiProperty({
    example: 'John Smith',
    description: 'Имя, фамилия пользователя',
  })
  @Column()
  displayName: string;
}

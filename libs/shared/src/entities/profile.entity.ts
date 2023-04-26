import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { IsString } from 'class-validator';

@Entity()
export class Profile {
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: 'Александр', description: 'Имя пользователя' })
  @IsString({ message: 'Должно быть строкой' })
  @Column({ nullable: true })
  name: string;

  @ApiProperty({ example: 'Иванов', description: 'Фамилия пользователя' })
  @IsString({ message: 'Должно быть строкой' })
  @Column({ nullable: false })
  surname: string;

  // @ApiProperty({
  //   example: '+79275046543',
  //   description: 'Номер телефона пользователя',
  // })
  // @IsMobilePhone('ru-RU')
  // @IsString({ message: 'Должно быть строкой' })
  // @Column({ nullable: false })
  // phoneNumber: string;

  @ApiProperty({
    example: 'Россия',
    description: 'Страна проживания пользователя',
  })
  @IsString({ message: 'Должно быть строкой ' })
  @Column({ nullable: true })
  country: string;

  @ApiProperty({
    example: 'Москва',
    description: 'Город проживания пользователя',
  })
  @IsString({ message: 'Должно быть строкой ' })
  @Column({ nullable: true })
  city: string;

  @ApiProperty({
    example: '21.02.2023',
    description: 'Дата создания аккаунта',
  })
  @Column({ nullable: false })
  creationDate: Date;

  @Column({ nullable: true })
  photo: string;

  @Column({ nullable: false })
  userId: number;
}

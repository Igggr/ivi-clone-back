import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { IsInt, IsOptional, IsPositive, IsString } from 'class-validator';

@Entity()
export class Profile {
  @IsInt()
  @IsPositive()
  @ApiProperty({ description: 'Первичный ключ', example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @IsOptional()
  @IsString()
  @ApiProperty({
    description:
      'Ссылка на профиль на кинопоиске (имеется только у спаршенных с кинопоиска профилей)',
  })
  @Column({ nullable: true })
  url: string;

  @ApiProperty({ example: 'Александр', description: 'Имя пользователя' })
  @IsString({ message: 'Должно быть строкой' })
  @IsOptional()
  @Column({ nullable: true })
  name: string;

  @ApiProperty({ example: 'Иванов', description: 'Фамилия пользователя' })
  @IsString({ message: 'Должно быть строкой' })
  @IsOptional()
  @Column({ nullable: true })
  surname: string;

  @ApiProperty({ example: 'stas9n', description: 'Никнейм пользователя' })
  @IsString({ message: 'Должно быть строкой' })
  @Column({ nullable: false, unique: true })
  nickname: string;

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
  @IsOptional()
  @Column({ nullable: true })
  country: string;

  @ApiProperty({
    example: 'Москва',
    description: 'Город проживания пользователя',
  })
  @IsString({ message: 'Должно быть строкой ' })
  @IsOptional()
  @Column({ nullable: true })
  city: string;

  @ApiProperty({
    example: '2023-05-02 19:42:24.926691',
    description: 'Дата создания аккаунта',
  })
  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
  })
  createdAt: Date;

  @Column({ nullable: true })
  @IsOptional()
  photo: string;

  @Column({ nullable: false })
  userId: number;
}

import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { IsMobilePhone, IsString } from 'class-validator';

@Entity()
export class Profile {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  url: string;
  
  @ApiProperty({ example: 'Alex', description: 'Имя пользователя' })
  @IsString({ message: 'Должно быть строкой' })
  @Column({ nullable: true })
  name: string;

  @ApiProperty({ example: 'Ivanov', description: 'Фамилия пользователя' })
  @IsString({ message: 'Должно быть строкой' })
  @Column({ nullable: false })
  surname: string;

  @ApiProperty({
    example: '+79275046543',
    description: 'Номер телефона пользователя',
  })
  @IsMobilePhone('ru-RU')
  @IsString({ message: 'Должно быть строкой' })
  @Column({ nullable: false })
  phoneNumber: string;

  @Column({ nullable: false })
  userId: number;
}

import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';
import { IsInt, IsOptional, IsPositive, IsString } from 'class-validator';
import { User } from './user.entity';

@Entity()
export class Role {
  @IsInt()
  @IsPositive()
  @ApiProperty({ description: 'Первичный ключ', example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: 'Администратор', description: 'Роль пользователя' })
  @IsString({ message: 'Должно быть строкой' })
  @Column({ nullable: false, unique: true })
  value: string;

  @IsString({ message: 'Должно быть строкой' })
  @IsOptional()
  @Column({ nullable: true })
  description: string;

  @ManyToMany(() => User, (user) => user.roles)
  users: User[];
}

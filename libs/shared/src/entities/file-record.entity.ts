import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class FileRecord {
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    example: 'e3b1bfc9-5cfb-44a6-8490-e3dab16db893.jpg',
    description: 'Название файла',
  })
  @IsString({ message: 'Должно быть строкой' })
  @Column({ nullable: false, unique: true })
  file: string;

  @ApiProperty({
    example: '2023-05-02 19:42:24.926691',
    description: 'Дата создания файла',
  })
  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
  })
  createdAt: Date;

  @ApiProperty({
    example: 'profiles',
    description: 'Принадлежащая таблица',
  })
  @IsString({ message: 'Должно быть строкой' })
  @Column()
  essenceTable: string;

  @ApiProperty({
    example: '23451',
    description: 'Первичный ключ сущности с принадлежащей таблице',
  })
  @IsString({ message: 'Должно быть строкой' })
  @Column()
  essenceId: number;
}

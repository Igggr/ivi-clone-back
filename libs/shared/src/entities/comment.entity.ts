import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Review } from './review.entity';
import { IsInt, IsPositive, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class Comment {
  @IsInt()
  @IsPositive()
  @ApiProperty({ description: 'Первичный ключ', example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @IsString()
  @ApiProperty({
    description: 'Ссылка на комментарий',
    example:
      'https://www.kinopoisk.ru/user/7514/comment/48770/comm/1298253/#comm1298253',
  })
  @Column({ nullable: false }) // существует только для спаршенныз с кинопоиска
  url?: string;

  @ManyToOne(() => Review, (review) => review.comments)
  review: Review;

  @IsInt()
  @IsPositive()
  @ApiProperty({ description: 'Foreign key', example: 1 })
  @Column()
  reviewId: number;

  @ManyToOne(() => Comment, (parent) => parent.childrens)
  parentComment?: Comment;

  @IsInt()
  @IsPositive()
  @ApiProperty({ description: 'Foreign key', example: 1 })
  @Column({ nullable: true })
  parentCommentId?: number;

  @OneToMany(() => Comment, (child) => child.parentComment, { nullable: true })
  childrens?: Comment[];

  @IsInt()
  @IsPositive()
  @ApiProperty({ description: 'Foreign key', example: 1 })
  @Column()
  profileId: number; // profile - в другом сервисе => связи нет

  @IsString()
  @ApiProperty({
    description: 'Текст комментария под чьим-то ревью',
    example: 'Ты просто не понял фильм, иначе б такое ревью не написал',
  })
  @Column()
  text: string;
}

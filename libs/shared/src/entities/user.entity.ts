import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { IsEmail, IsInt, IsPositive, IsString, Length } from 'class-validator';
import { Role } from './role.entity';
import * as bcrypt from 'bcryptjs';
import { instanceToPlain } from 'class-transformer';

@Entity()
export class User {
  @IsInt()
  @IsPositive()
  @ApiProperty({ description: 'Первичный ключ', example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: 'user@mail.ru', description: 'Почтовый адрес' })
  @IsString({ message: 'Должно быть строкой' })
  @IsEmail({}, { message: 'Некорректный email' })
  @Column({ nullable: false, unique: true })
  email: string;

  @ApiProperty({ example: '12345678', description: 'Пароль пользователя' })
  @IsString({ message: 'Должно быть строкой' })
  @Length(4, 16, { message: 'Не меньше 4 и не больше 16 символов' })
  @Column({ nullable: false })
  password: string;

  @ManyToMany(() => Role, (role) => role.users, { cascade: true })
  @JoinTable()
  roles: Role[];

  addRole(role: Role) {
    if (this.roles == null) {
      this.roles = new Array<Role>();
    }
    this.roles.push(role);
  }

  async setPassword(password, hash = 5) {
    this.password = await bcrypt.hash(password, hash);
  }

  // пароли не должныутекать в ответе
  toJSON() {
    const record = instanceToPlain(this);
    delete record.password;
    return record;
  }
}

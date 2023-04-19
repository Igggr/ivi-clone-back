import { CreateUserDto } from '@app/shared/dto/create-user.dto';
import { User } from '@app/shared/entities/user.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  async createUser(userDto: CreateUserDto) {
    const user = await this.userRepository.create(userDto);
    await this.userRepository.save(user);

    return user;
  }

  /**
   *  Получает пользователя по емэйлу
   *
   * @param email Емэйл пользователя
   * @returns Объект пользователя
   */
  async getUserByEmail(email: string) {
    const user = await this.userRepository.findOne({ where: { email: email } });
    return user;
  }
}

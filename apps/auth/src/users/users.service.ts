import { CreateUserProfileDto } from '@app/shared/dto/create-user-profile.dto';
import { User } from '@app/shared/entities/user.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import * as uuid from 'uuid';
import { ParsedProfileDTO } from '@app/shared';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  // поля Profile не еспользуются - стоило бы их выпилить
  async createUser(userDto: CreateUserProfileDto) {
    const hashPassword = await bcrypt.hash(userDto.password, 5);
    const user = await this.userRepository.create({
      ...userDto,
      password: hashPassword,
    });
    await this.userRepository.save(user);

    return user;
  }

  async createDummyUser(dto: ParsedProfileDTO) {
    const dummyData: CreateUserProfileDto = {
      ...dto,
      surname: '',
      phoneNumber: '', 
      password: '111111',
      email: uuid.v4() + '@com'
    };
    return this.createUser(dummyData)
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

  async checkPassword(userDtoPassword: string, userPassword: string) {
    return await bcrypt.compare(userDtoPassword, userPassword);
  }
}

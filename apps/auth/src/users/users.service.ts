import { CreateUserProfileDto } from '@app/shared/dto/create-user-profile.dto';
import { User } from '@app/shared/entities/user.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { AddRoleDto } from '@app/shared/dto/add-role.dto';
import { RolesService } from '../roles/roles.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly roleService: RolesService,
  ) {}

  async createUser(userDto: CreateUserProfileDto) {
    try {
      const hashPassword = await bcrypt.hash(userDto.password, 5);
      const user = await this.userRepository.create({
        ...userDto,
        password: hashPassword,
      });
      await this.userRepository.save(user);

      return user;
    } catch (error) {
      return {
        status: 'error',
        error: 'Ошибка при создании пользователя',
      };
    }
  }

  async updateUser(userDto: CreateUserProfileDto, userId: number) {
    try {
      const userEmail = await this.userRepository.findOneBy({
        email: userDto.email,
      });
      if (userEmail) {
        return {
          status: 'error',
          error: 'Пользователь с таким email уже существует',
        };
      }
      const user = await this.userRepository.findOneBy({ id: userId });
      let newUser;
      if (userDto.password) {
        const hashPassword = await bcrypt.hash(userDto.password, 5);
        newUser = await this.userRepository.save({
          ...user,
          ...userDto,
          password: hashPassword,
        });
      } else {
        newUser = await this.userRepository.save({
          ...user,
          ...userDto,
        });
      }
      return newUser;
    } catch (error) {
      return {
        status: 'error',
        error: 'Ошибка при обновлении пользователя',
      };
    }
  }

  async deleteUser(userId: number) {
    try {
      const user = await this.userRepository.findOneBy({ id: userId });
      await this.userRepository.remove(user);

      return 'Success';
    } catch (error) {
      return {
        status: 'error',
        error: 'Ошибка при удалении пользователя',
      };
    }
  }

  /**
   *  Получает пользователя по емэйлу
   *
   * @param email Емэйл пользователя
   * @returns Объект пользователя
   */
  async getUserByEmail(email: string) {
    const user = await this.userRepository.findOneBy({ email: email });
    return user;
  }

  async checkPassword(userDtoPassword: string, userPassword: string) {
    return await bcrypt.compare(userDtoPassword, userPassword);
  }

  /**
   * Добавляет новую роль
   *
   * @param dto Дто добавления роли
   * @returns Дто добавленной роли
   */
  async addRole(dto: AddRoleDto) {
    const user = await this.userRepository.findOneBy({ id: dto.userId });
    const role = await this.roleService.getRoleByValue(dto.value);
    if (user && role) {
      user.roles = [role];
      await this.userRepository.save(user);
      return user;
    }
    return {
      status: 'error',
      error: 'Пользователь или роль не найдены',
    };
  }

  async getUsers() {
    return await this.userRepository.find({ relations: { roles: true } });
  }
}

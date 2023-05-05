import { CreateUserProfileDto } from '@app/shared/dto/create-user-profile.dto';
import { User } from '@app/shared/entities/user.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { RolesService } from '../roles/roles.service';
import { AddRoleDto } from '@app/shared/dto/add-role.dto';
import { CreateRoleDto } from '@app/shared/dto/create-role.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly roleService: RolesService,
  ) {}

  async createUser(userDto: CreateUserProfileDto) {
    try {
      const user = await this.userRepository.create({
        ...userDto,
      });
      await user.setPassword(userDto.password);
      let role = await this.roleService.getRoleByValue('USER');
      if (!role) {
        const roleDto = new CreateRoleDto('USER');
        await this.roleService.createRole(roleDto);
      }
      role = await this.roleService.getRoleByValue('USER');
      user.addRole(role);
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
      const newUser = await this.userRepository.save({
        ...user,
        ...userDto,
      });
      if (userDto.password) {
        await user.setPassword(userDto.password);
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

      return {
        status: 'Success',
        message: 'Пользователь успешно удален',
      };
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
    const user = await this.userRepository.findOne({
      where: { email: email },
      relations: { roles: true },
    });
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
      user.addRole(role);
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

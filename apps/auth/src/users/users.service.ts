import { User, ParsedProfileDTO, CreateUserDTO } from '@app/shared';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import * as uuid from 'uuid';
import { RolesService } from '../roles/roles.service';
import { AddRoleDto } from '@app/shared/dto/add-role.dto';
import { USER } from '@app/shared/constants/role.const';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly roleService: RolesService,
  ) {}

  // поля Profile не еспользуются - стоило бы их выпилить
  async createUser(userDto: CreateUserDTO) {
    try {
      const user = await this.userRepository.create({
        ...userDto,
      });
      await user.setPassword(userDto.password);
      let role = await this.roleService.getRoleByValue('User');
      if (!role) {
        await this.roleService.createRole(USER);
      }
      role = await this.roleService.getRoleByValue('User');
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

  async updateUser(userDto: CreateUserDTO, userId: number) {
    try {
      const foundUser = await this.userRepository.findOneBy({
        email: userDto.email,
      });
      if (foundUser && foundUser.id != userId) {
        return {
          status: 'error',
          error: 'Пользователь с таким email уже существует',
        };
      }
      const user = await this.userRepository.findOneBy({ id: userId });
      if (!user) {
        return {
          status: 'error',
          error: 'Пользователя с таким id не существует',
        };
      }
      if (userDto.password) {
        await user.setPassword(userDto.password);
      }
      await this.userRepository.save({
        ...user,
        ...userDto,
        password: user.password,
      });

      return user;
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

  async createDummyUser(dto: ParsedProfileDTO) {
    const dummyData: CreateUserDTO = {
      password: '111111',
      email: uuid.v4() + '@com',
    };
    return this.createUser(dummyData);
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
    const user = await this.userRepository.findOne({
      where: { id: dto.userId },
      relations: { roles: true },
    });
    const role = await this.roleService.getRoleByValue(dto.value);
    if (
      user &&
      role &&
      !user.roles.some((role) => dto.value.includes(role.value))
    ) {
      user.addRole(role);
      await this.userRepository.save(user);
      return user;
    }
    return {
      status: 'error',
      error:
        'Пользователь или роль не найдены, либо данная роль уже присвоена пользователю',
    };
  }

  async getUsers() {
    return await this.userRepository.find({ relations: { roles: true } });
  }
}

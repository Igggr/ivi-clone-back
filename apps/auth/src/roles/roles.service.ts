import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from '@app/shared/entities/role.entity';
import { CreateRoleDto } from '@app/shared/dto/create-role.dto';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role) private readonly roleRepository: Repository<Role>,
  ) {}

  /**
   * Создает роль
   *
   * @param dto Дто роли
   * @returns Объект роли
   */
  async createRole(dto: CreateRoleDto) {
    const role = await this.roleRepository.findOneBy({ value: dto.value });
    if (role) {
      return {
        status: 'error',
        error: 'Такая роль уже существует',
      };
    }
    const newRole = await this.roleRepository.create(dto);
    await this.roleRepository.save(newRole);

    return newRole;
  }

  /**
   * Получает роль по значению
   *
   * @param value Значение роли
   * @returns Объект роли
   */
  async getRoleByValue(value: string) {
    const role = await this.roleRepository.findOneBy({ value: value });
    return role;
  }

  // async ensureRoleByValue(value: string) {
  //   const role = await this.roleRepository.findOneBy({ value: value });
  //   if (role) {
  //     return role;
  //   }
  //   const newRole = await this.roleRepository.create({ value: value });
  //   await this.roleRepository.save(newRole);

  //   return newRole;

  async getRoles() {
    return await this.roleRepository.find();
  }
}

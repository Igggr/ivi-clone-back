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
    const role = await this.roleRepository.create(dto);
    await this.roleRepository.save(role);

    return role;
  }
}

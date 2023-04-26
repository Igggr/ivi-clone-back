import { CREATE_ROLE, LOGIN } from '@app/shared';
import { AddRoleDto } from '@app/shared/dto/add-role.dto';
import { CreateRoleDto } from '@app/shared/dto/create-role.dto';
import { CreateUserDto } from '@app/shared/dto/create-user.dto';
import {
  Body,
  Controller,
  Inject,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Controller()
export class AuthController {
  constructor(@Inject('AUTH') private authService: ClientProxy) {}

  @Post('/auth/login')
  async login(@Body() userDto: CreateUserDto) {
    const res = await firstValueFrom(
      this.authService.send(
        {
          cmd: LOGIN,
        },
        userDto,
      ),
    );
    if (res.status === 'error') {
      throw new UnauthorizedException(res.error);
    }
    return res;
  }

  @Post('/roles')
  async createRole(@Body() roleDto: CreateRoleDto) {
    return await this.authService.send(
      {
        cmd: CREATE_ROLE,
      },
      roleDto,
    );
  }

  @Post('/users/role')
  async addRole(@Body() roleDto: AddRoleDto) {
    return await this.authService.send(
      {
        cmd: ADD_ROLE,
      },
      roleDto,
    );
  }
}

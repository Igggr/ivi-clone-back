import { ADD_ROLE, CREATE_ROLE, GET_USERS, LOGIN } from '@app/shared';
import { AddRoleDto } from '@app/shared/dto/add-role.dto';
import { CreateRoleDto } from '@app/shared/dto/create-role.dto';
import { CreateUserDto } from '@app/shared/dto/create-user.dto';
import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
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
    const res = await firstValueFrom(
      this.authService.send(
        {
          cmd: CREATE_ROLE,
        },
        roleDto,
      ),
    );
    if (res.status === 'error') {
      throw new HttpException(res.error, HttpStatus.BAD_REQUEST);
    }
    return res;
  }

  @Post('/users/role')
  async addRole(@Body() roleDto: AddRoleDto) {
    const res = await firstValueFrom(
      this.authService.send(
        {
          cmd: ADD_ROLE,
        },
        roleDto,
      ),
    );
    if (res.status === 'error') {
      throw new HttpException(res.error, HttpStatus.NOT_FOUND);
    }
    return res;
  }

  @Get('/users')
  async getUsers() {
    return await this.authService.send(
      {
        cmd: GET_USERS,
      },
      {},
    );
  }
}

import { LoginDto } from '@app/shared/dto/login.dto';
import { LoggingInterceptor } from '@app/shared/interceptors/logging.interceptor';
import {
  ADD_ROLE,
  AUTH,
  CREATE_ROLE,
  GET_ROLES,
  GET_USERS,
  LOGIN,
  GOOGLE_LOGIN,
  GOOGLE_REDIRECT,
} from '@app/rabbit';
import { AddRoleDto } from '@app/shared/dto/add-role.dto';
import { CreateRoleDto } from '@app/shared/dto/create-role.dto';
import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Inject,
  Post,
  Req,
  UnauthorizedException,
  UseGuards,
  UseInterceptors,
  UsePipes,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Request } from 'express';
import { firstValueFrom } from 'rxjs';
import { Roles } from '../guards/roles-auth.decorator';
import { RolesGuard } from '../guards/roles.guard';
import { ValidationPipe } from '@app/shared/pipes/validation-pipe';
import { ADMIN } from '@app/shared/constants/role-guard.const';
import { GoogleAuthGuard } from '../guards/google-auth.guard';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('auth')
@UseInterceptors(LoggingInterceptor)
@Controller('/auth')
export class AuthController {
  constructor(@Inject(AUTH) private readonly client: ClientProxy) {}

  @Post('/login')
  @UsePipes(ValidationPipe)
  async login(@Body() userDto: LoginDto) {
    const res = await firstValueFrom(
      this.client.send(
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
  @UseGuards(RolesGuard)
  @Roles(ADMIN)
  @UsePipes(ValidationPipe)
  async createRole(@Body() roleDto: CreateRoleDto) {
    const res = await firstValueFrom(
      this.client.send(
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

  @Get('/roles')
  @UseGuards(RolesGuard)
  @Roles(ADMIN)
  async getRoles() {
    return await firstValueFrom(
      this.client.send(
        {
          cmd: GET_ROLES,
        },
        {},
      ),
    );
  }

  @Post('/users/role')
  @UseGuards(RolesGuard)
  @Roles(ADMIN)
  async addRole(@Body() roleDto: AddRoleDto) {
    const res = await firstValueFrom(
      this.client.send(
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
  @UseGuards(RolesGuard)
  @Roles(ADMIN)
  async getUsers() {
    return await firstValueFrom(
      this.client.send(
        {
          cmd: GET_USERS,
        },
        {},
      ),
    );
  }

  @Get('google/login')
  @UseGuards(GoogleAuthGuard)
  async handleLogin() {
    return await firstValueFrom(
      this.client.send(
        {
          cmd: GOOGLE_LOGIN,
        },
        {},
      ),
    );
  }

  @Get('google/redirect')
  @UseGuards(GoogleAuthGuard)
  async handleRedirect(@Req() request: Request) {
    return await firstValueFrom(
      this.client.send(
        {
          cmd: GOOGLE_REDIRECT,
        },
        request.user,
      ),
    );
  }

  @Get('status')
  googleUser(@Req() request: Request) {
    if (request.user) {
      return { msg: 'Authenticated' };
    } else {
      return { msg: 'Not Authenticated' };
    }
  }
}

import { LoginDto } from '@app/shared';
import { ValidationPipe } from '@app/shared/pipes/validation-pipe';
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
import { ADMIN } from '@app/shared/constants/role-guard.const';
import { RolesGuard } from '../guards/roles.guard';
import {
  ADD_ROLE,
  CREATE_ROLE,
  GET_ROLES,
  GET_USERS,
  GOOGLE_LOGIN,
  GOOGLE_REDIRECT,
  LOGIN,
} from '@app/rabbit';
import { LoggingInterceptor } from '@app/shared/interceptors/logging.interceptor';
import { CreateRoleDto } from '@app/shared/dto/create-role.dto';
import { GoogleAuthGuard } from '../utils/google-auth.guard';
import { AddRoleDto } from '@app/shared/dto/add-role.dto';

@UseInterceptors(LoggingInterceptor)
@Controller('/auth')
export class AuthController {
  constructor(@Inject('AUTH') private authService: ClientProxy) {}

  @Post('/login')
  @UsePipes(ValidationPipe)
  async login(@Body() userDto: LoginDto) {
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
  @UseGuards(RolesGuard)
  @Roles(ADMIN)
  @UsePipes(ValidationPipe)
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

  @Get('/roles')
  @UseGuards(RolesGuard)
  @Roles(ADMIN)
  async getRoles() {
    return await this.authService.send(
      {
        cmd: GET_ROLES,
      },
      {},
    );
  }

  @Post('/users/role')
  @UseGuards(RolesGuard)
  @Roles(ADMIN)
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

  @Get('google/login')
  @UseGuards(GoogleAuthGuard)
  handleLogin() {
    return this.authService.send(
      {
        cmd: GOOGLE_LOGIN,
      },
      {},
    );
  }

  @Get('google/redirect')
  @UseGuards(GoogleAuthGuard)
  handleRedirect() {
    return this.authService.send(
      {
        cmd: GOOGLE_REDIRECT,
      },
      {},
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

  @Get()
  getHello(): string {
    return 'Hi';
  }
}

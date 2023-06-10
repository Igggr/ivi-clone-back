import { LoginDto } from '@app/shared/dto/login.dto';
import { LoggingInterceptor } from '@app/shared/interceptors/logging.interceptor';
import {
  ADD_ROLE,
  AUTH,
  CREATE_ROLE,
  GET_ROLES,
  GET_USERS,
  LOGIN,
  GOOGLE_REDIRECT,
  VK_REDIRECT,
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
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { BearerAuth } from '../guards/bearer';
import { GoogleAuthGuard } from '../guards/google-auth.guard';
import { VKAuthGuard } from '../guards/vk-auth.guard';
import { Role, User } from '@app/shared';
import { TokenProfileResponse } from '@app/shared/api-response/token-profileInfo';
import { ExistedRoleException } from '@app/shared/api-response/existed-role-exception';
import { NotFoundRoleOrUserException } from '@app/shared/api-response/not-found-role-user';

@ApiTags('auth')
@UseInterceptors(LoggingInterceptor)
@Controller('/auth')
export class AuthController {
  constructor(@Inject(AUTH) private readonly client: ClientProxy) {}

  @Get('/login')
  @ApiResponse({ status: HttpStatus.OK, type: TokenProfileResponse })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, type: UnauthorizedException })
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
  @ApiResponse({ status: HttpStatus.CREATED, type: Role })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, type: ExistedRoleException })
  @ApiBearerAuth(BearerAuth)
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
  @ApiResponse({ status: HttpStatus.OK, type: [Role] })
  @ApiBearerAuth(BearerAuth)
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

  @Get('/users/role')
  @ApiResponse({ status: HttpStatus.OK, type: User })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    type: NotFoundRoleOrUserException,
  })
  @ApiBearerAuth(BearerAuth)
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
  @ApiResponse({ status: HttpStatus.OK, type: [User] })
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
  async handleGoogleLogin() {
    return { msg: 'Google Authentication' };
  }

  @Get('google/redirect')
  @ApiResponse({ status: HttpStatus.OK, type: TokenProfileResponse })
  @UseGuards(GoogleAuthGuard)
  async handleGoogleRedirect(@Req() request: Request) {
    return await firstValueFrom(
      this.client.send(
        {
          cmd: GOOGLE_REDIRECT,
        },
        request.user,
      ),
    );
  }

  @Get('vk/login')
  @UseGuards(VKAuthGuard)
  async hangleVkLogin() {
    return { msg: 'VK Authentication' };
  }

  @Get('vk/redirect')
  @ApiResponse({ status: HttpStatus.OK, type: TokenProfileResponse })
  @UseGuards(VKAuthGuard)
  async handleVkRedirect(@Req() request: Request) {
    return await firstValueFrom(
      this.client.send(
        {
          cmd: VK_REDIRECT,
        },
        request.user,
      ),
    );
  }
}

import { GOOGLE_LOGIN, GOOGLE_REDIRECT, LOGIN } from '@app/shared';
import { CreateUserDto } from '@app/shared/dto/create-user.dto';
import {
  Body,
  Controller,
  Get,
  Inject,
  Post,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { GoogleAuthGuard } from 'apps/api/src/auth/utils/google-auth.guard';
import { firstValueFrom } from 'rxjs';

@Controller('/auth')
export class AuthController {
  constructor(@Inject('AUTH') private authService: ClientProxy) {}

  @Post('/login')
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
}

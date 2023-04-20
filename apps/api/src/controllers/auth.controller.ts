import { LOGIN } from '@app/shared';
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
}

import { LOGIN } from '@app/rabbit';
import { LoginDto } from '@app/shared/dto/login.dto';
import { LoggingInterceptor } from '@app/shared/interceptors/logging.interceptor';
import {
  Body,
  Controller,
  Inject,
  Post,
  UnauthorizedException,
  UseInterceptors,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@UseInterceptors(LoggingInterceptor)
@Controller('/auth')
export class AuthController {
  constructor(@Inject('AUTH') private authService: ClientProxy) {}

  @Post('/login')
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
}

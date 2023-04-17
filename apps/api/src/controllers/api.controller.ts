import { CreateUserDto } from '@app/shared/dto/create-user.dto';
import { Body, Controller, Inject, Post } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

@Controller('/auth')
export class AuthController {
  constructor(@Inject('AUTH') private authService: ClientProxy) {}

  @Post('/login')
  login(@Body() userDto: CreateUserDto) {
    return this.authService.send(
      {
        cmd: 'login',
      },
      userDto,
    );
  }
}

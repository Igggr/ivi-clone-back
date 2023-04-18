import { CreateUserDto } from '@app/shared/dto/create-user.dto';
import { ValidationPipe } from '@app/shared/pipes/validation-pipe';
import { Body, Controller, Inject, Post, UsePipes } from '@nestjs/common';
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

  @Post('/create')
  @UsePipes(ValidationPipe)
  createUser(@Body() userDto: CreateUserDto) {
    return this.authService.send(
      {
        cmd: 'create-user',
      },
      userDto,
    );
  }
}

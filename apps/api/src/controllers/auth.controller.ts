import { CREATE_USER, LOGIN } from '@app/shared';
import { CreateUserDto } from '@app/shared/dto/create-user.dto';
import { ValidationPipe } from '@app/shared/pipes/validation-pipe';
import { Body, Controller, HttpException, HttpStatus, Inject, Post, UsePipes } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Controller('/auth')
export class AuthController {
  constructor(@Inject('AUTH') private authService: ClientProxy) {}

  @Post('/login')
  async login(@Body() userDto: CreateUserDto) {
    const res = await firstValueFrom(this.authService.send(
      {
        cmd: LOGIN,
      },
      userDto,
    ));
    if (res.status === 'error') {
      throw new HttpException(res.error, HttpStatus.BAD_REQUEST);
    }
    return res;
  }

  @Post('/create')
  @UsePipes(ValidationPipe)
  createUser(@Body() userDto: CreateUserDto) {
    return this.authService.send(
      {
        cmd: CREATE_USER,
      },
      userDto,
    );
  }
}

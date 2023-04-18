import { Body, Controller } from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  Ctx,
  MessagePattern,
  Payload,
  RmqContext,
} from '@nestjs/microservices';
import { CreateUserDto } from '@app/shared/dto/create-user.dto';
import { UsersService } from './users/users.service';
import { CREATE_USER, GET_USER_BY_EMAIL, LOGIN } from '@app/shared';

@Controller()
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UsersService,
  ) {}

  @MessagePattern({ cmd: LOGIN })
  login(@Body() userDto: CreateUserDto, @Ctx() context: RmqContext) {
    const channel = context.getChannelRef();
    const message = context.getMessage();
    channel.ack(message);

    return this.authService.login(userDto);
  }

  @MessagePattern({ cmd: CREATE_USER })
  createUser(@Body() userDto: CreateUserDto, @Ctx() context: RmqContext) {
    const channel = context.getChannelRef();
    const message = context.getMessage();
    channel.ack(message);

    return this.userService.createUser(userDto);
  }

  @MessagePattern({ cmd: GET_USER_BY_EMAIL })
  getUserByEmail(@Payload() email: string, @Ctx() context: RmqContext) {
    const channel = context.getChannelRef();
    const message = context.getMessage();
    channel.ack(message);
    console.log(email);

    return this.userService.getUserByEmail(email);
  }
}

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

@Controller()
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UsersService,
  ) {}

  @MessagePattern({ cmd: 'login' })
  login(@Body() userDto: CreateUserDto, @Ctx() context: RmqContext) {
    const channel = context.getChannelRef();
    const message = context.getMessage();
    channel.ack(message);

    return this.authService.login(userDto);
  }

  @MessagePattern({ cmd: 'create-user' })
  createUser(@Body() userDto: CreateUserDto, @Ctx() context: RmqContext) {
    const channel = context.getChannelRef();
    const message = context.getMessage();
    channel.ack(message);

    return this.userService.createUser(userDto);
  }

  @MessagePattern({ cmd: 'get-user-by-email' })
  getUserByEmail(@Payload() email: string, @Ctx() context: RmqContext) {
    const channel = context.getChannelRef();
    const message = context.getMessage();
    channel.ack(message);
    console.log(email);

    return this.userService.getUserByEmail(email);
  }
}

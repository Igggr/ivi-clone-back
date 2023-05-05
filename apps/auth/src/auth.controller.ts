import { Body, Controller } from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  Ctx,
  MessagePattern,
  Payload,
  RmqContext,
} from '@nestjs/microservices';
import { LoginDto } from '@app/shared/dto/login.dto';
import { UsersService } from './users/users.service';
import { CREATE_USER, GET_TOKEN, GET_USER_BY_EMAIL, LOGIN } from '@app/rabbit';
import { ParsedProfileDTO } from '@app/shared';
import { CreateUserProfileDto } from '@app/shared/dto/create-user-profile.dto';
import { User } from '@app/shared';
import { CREATE_DUMMY_USER } from '@app/rabbit';

@Controller()
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UsersService,
  ) {}

  @MessagePattern({ cmd: LOGIN })
  login(@Body() userDto: LoginDto, @Ctx() context: RmqContext) {
    const channel = context.getChannelRef();
    const message = context.getMessage();
    channel.ack(message);

    return this.authService.login(userDto);
  }

  @MessagePattern({ cmd: CREATE_USER })
  createUser(
    @Payload() userDto: CreateUserProfileDto,
    @Ctx() context: RmqContext,
  ) {
    const channel = context.getChannelRef();
    const message = context.getMessage();
    channel.ack(message);

    return this.userService.createUser(userDto);
  }

  @MessagePattern({ cmd: CREATE_DUMMY_USER })
  createDummyUser(
    @Ctx() context: RmqContext,
    @Payload() dto: ParsedProfileDTO,
  ) {
    const channel = context.getChannelRef();
    const message = context.getMessage();
    channel.ack(message);

    return this.userService.createDummyUser(dto);
  }

  @MessagePattern({ cmd: GET_USER_BY_EMAIL })
  getUserByEmail(@Payload() email: string, @Ctx() context: RmqContext) {
    const channel = context.getChannelRef();
    const message = context.getMessage();
    channel.ack(message);

    return this.userService.getUserByEmail(email);
  }

  @MessagePattern({ cmd: GET_TOKEN })
  getToken(@Payload() user: User, @Ctx() context: RmqContext) {
    const channel = context.getChannelRef();
    const message = context.getMessage();
    channel.ack(message);

    return this.authService.generateToken(user);
  }
}

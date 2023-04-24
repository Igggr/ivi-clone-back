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
import {
  CREATE_USER,
  FIND_GOOGLE_USER,
  GET_TOKEN,
  GET_USER_BY_EMAIL,
  GOOGLE_LOGIN,
  GOOGLE_REDIRECT,
  LOGIN,
  VALIDATE_GOOGLE_USER,
} from '@app/shared';
import { CreateUserProfileDto } from '@app/shared/dto/create-user-profile.dto';
import { User } from '@app/shared/entities/user.entity';
import { CreateGoogleUserDetailsDto } from '@app/shared/dto/create-google-user-details.dto';

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
  createUser(
    @Body() userDto: CreateUserProfileDto,
    @Ctx() context: RmqContext,
  ) {
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

    return this.userService.getUserByEmail(email);
  }

  @MessagePattern({ cmd: GET_TOKEN })
  getToken(@Payload() user: User, @Ctx() context: RmqContext) {
    const channel = context.getChannelRef();
    const message = context.getMessage();
    channel.ack(message);

    return this.authService.generateToken(user);
  }

  @MessagePattern({ cmd: GOOGLE_LOGIN })
  handleLogin(@Ctx() context: RmqContext) {
    const channel = context.getChannelRef();
    const message = context.getMessage();
    channel.ack(message);

    return { msg: 'Google Authentication' };
  }

  @MessagePattern({ cmd: GOOGLE_REDIRECT })
  handleRedirect(@Ctx() context: RmqContext) {
    const channel = context.getChannelRef();
    const message = context.getMessage();
    channel.ack(message);

    return { msg: 'OK' };
  }

  @MessagePattern({ cmd: VALIDATE_GOOGLE_USER })
  validateGoogleUser(
    @Body() details: CreateGoogleUserDetailsDto,
    @Ctx() context: RmqContext,
  ) {
    const channel = context.getChannelRef();
    const message = context.getMessage();
    channel.ack(message);
    console.log('validate');

    return this.authService.validateGoogleUser(details);
  }

  @MessagePattern({ cmd: FIND_GOOGLE_USER })
  findGoogleUser(userId: number, @Ctx() context: RmqContext) {
    const channel = context.getChannelRef();
    const message = context.getMessage();
    channel.ack(message);
    console.log('findGoogle');

    return this.authService.findGoogleUser(userId);
  }
}

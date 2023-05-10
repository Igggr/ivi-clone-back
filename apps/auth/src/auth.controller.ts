import { Controller } from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  Ctx,
  MessagePattern,
  Payload,
  RmqContext,
} from '@nestjs/microservices';
import { LoginDto } from '@app/shared/dto/login.dto';
import { UsersService } from './users/users.service';
import { CreateUserProfileDto } from '@app/shared/dto/create-user-profile.dto';
import { User } from '@app/shared/entities/user.entity';
import {
  ADD_ROLE,
  CREATE_DUMMY_USER,
  CREATE_ROLE,
  CREATE_USER,
  DELETE_USER,
  ENSURE_GOOGLE_USER,
  FIND_GOOGLE_USER,
  GET_ROLES,
  GET_TOKEN,
  GET_USERS,
  GET_USER_BY_EMAIL,
  GOOGLE_LOGIN,
  GOOGLE_REDIRECT,
  LOGIN,
  UPDATE_USER,
  VERIFY_TOKEN,
} from '@app/rabbit';
import { CreateGoogleUserDetailsDto } from '@app/shared/dto/create-google-user-details.dto';
import { AddRoleDto } from '@app/shared/dto/add-role.dto';
import { CreateRoleDto } from '@app/shared/dto/create-role.dto';
import { RolesService } from './roles/roles.service';
import { ParsedProfileDTO } from '@app/shared';

@Controller()
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UsersService,
    private readonly roleService: RolesService,
  ) {}

  @MessagePattern({ cmd: LOGIN })
  login(@Payload() userDto: LoginDto, @Ctx() context: RmqContext) {
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

  @MessagePattern({ cmd: UPDATE_USER })
  updateUser(@Payload() userProfileInfo, @Ctx() context: RmqContext) {
    const channel = context.getChannelRef();
    const message = context.getMessage();
    channel.ack(message);

    return this.userService.updateUser(
      userProfileInfo.userProfileDto,
      userProfileInfo.userId,
    );
  }

  @MessagePattern({ cmd: DELETE_USER })
  deleteUser(@Payload() userId, @Ctx() context: RmqContext) {
    const channel = context.getChannelRef();
    const message = context.getMessage();
    channel.ack(message);

    return this.userService.deleteUser(userId);
  }

  @MessagePattern({ cmd: CREATE_ROLE })
  createRole(@Payload() roleDto: CreateRoleDto, @Ctx() context: RmqContext) {
    const channel = context.getChannelRef();
    const message = context.getMessage();
    channel.ack(message);

    return this.roleService.createRole(roleDto);
  }

  @MessagePattern({ cmd: ADD_ROLE })
  addRole(@Payload() roleDto: AddRoleDto, @Ctx() context: RmqContext) {
    const channel = context.getChannelRef();
    const message = context.getMessage();
    channel.ack(message);

    return this.userService.addRole(roleDto);
  }

  @MessagePattern({ cmd: GET_USERS })
  getUsers(@Ctx() context: RmqContext) {
    const channel = context.getChannelRef();
    const message = context.getMessage();
    channel.ack(message);

    return this.userService.getUsers();
  }

  @MessagePattern({ cmd: GET_ROLES })
  getRoles(@Ctx() context: RmqContext) {
    const channel = context.getChannelRef();
    const message = context.getMessage();
    channel.ack(message);

    return this.roleService.getRoles();
  }

  @MessagePattern({ cmd: VERIFY_TOKEN })
  verifyToken(@Payload() token, @Ctx() context: RmqContext) {
    const channel = context.getChannelRef();
    const message = context.getMessage();
    channel.ack(message);

    return this.authService.verifyToken(token);
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

  @MessagePattern({ cmd: ENSURE_GOOGLE_USER })
  ensureGoogleUser(
    @Payload() details: CreateGoogleUserDetailsDto,
    @Ctx() context: RmqContext,
  ) {
    const channel = context.getChannelRef();
    const message = context.getMessage();
    channel.ack(message);

    return this.authService.ensureGoogleUser(details);
  }

  @MessagePattern({ cmd: FIND_GOOGLE_USER })
  findGoogleUser(userId: number, @Ctx() context: RmqContext) {
    const channel = context.getChannelRef();
    const message = context.getMessage();
    channel.ack(message);

    return this.authService.findGoogleUser(userId);
  }
}

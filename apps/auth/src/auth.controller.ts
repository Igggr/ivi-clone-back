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
  ADD_ROLE,
  CREATE_ROLE,
  CREATE_USER,
  DELETE_USER,
  GET_TOKEN,
  GET_USERS,
  GET_USER_BY_EMAIL,
  LOGIN,
  UPDATE_USER,
} from '@app/shared';
import { CreateUserProfileDto } from '@app/shared/dto/create-user-profile.dto';
import { User } from '@app/shared/entities/user.entity';
import { CreateRoleDto } from '@app/shared/dto/create-role.dto';
import { RolesService } from './roles/roles.service';
import { AddRoleDto } from '@app/shared/dto/add-role.dto';

@Controller()
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UsersService,
    private readonly roleService: RolesService,
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

  @MessagePattern({ cmd: UPDATE_USER })
  updateUser(@Body() userProfileInfo, @Ctx() context: RmqContext) {
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
  createRole(@Body() roleDto: CreateRoleDto, @Ctx() context: RmqContext) {
    const channel = context.getChannelRef();
    const message = context.getMessage();
    channel.ack(message);

    return this.roleService.createRole(roleDto);
  }

  @MessagePattern({ cmd: ADD_ROLE })
  addRole(@Body() roleDto: AddRoleDto, @Ctx() context: RmqContext) {
    const channel = context.getChannelRef();
    const message = context.getMessage();
    channel.ack(message);

    return this.userService.addRole(roleDto);
  }

  @MessagePattern({ cmd: GET_USERS })
  getUsers(@Body() roleDto: AddRoleDto, @Ctx() context: RmqContext) {
    const channel = context.getChannelRef();
    const message = context.getMessage();
    channel.ack(message);

    return this.userService.getUsers();
  }
}

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
import { CreateUserDTO } from '@app/shared';
import { User } from '@app/shared/entities/user.entity';
import {
  ADD_ROLE,
  CREATE_ROLE,
  CREATE_USER,
  DELETE_USER,
  GET_ROLES,
  GET_TOKEN,
  GET_USERS,
  GET_USER_BY_EMAIL,
  GOOGLE_LOGIN,
  GOOGLE_REDIRECT,
  LOGIN,
  UPDATE_USER,
  VERIFY_TOKEN,
  FIND_USER_BY_ID,
  ack,
  VK_REDIRECT,
  ENSURE_OAUTH_USER,
} from '@app/rabbit';
import { AddRoleDto } from '@app/shared/dto/add-role.dto';
import { RolesService } from './roles/roles.service';
import { CreateRoleDto } from '@app/shared/dto/create-role.dto';

@Controller()
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UsersService,
    private readonly roleService: RolesService,
  ) {}

  @MessagePattern({ cmd: LOGIN })
  login(@Payload() userDto: LoginDto, @Ctx() context: RmqContext) {
    ack(context);

    return this.authService.login(userDto);
  }

  @MessagePattern({ cmd: CREATE_USER })
  createUser(@Payload() userDto: CreateUserDTO, @Ctx() context: RmqContext) {
    ack(context);

    return this.userService.createUser(userDto);
  }

  @MessagePattern({ cmd: GET_USER_BY_EMAIL })
  getUserByEmail(@Payload() email: string, @Ctx() context: RmqContext) {
    ack(context);

    return this.userService.getUserByEmail(email);
  }

  @MessagePattern({ cmd: GET_TOKEN })
  getToken(@Payload() user: User, @Ctx() context: RmqContext) {
    ack(context);

    return this.authService.generateToken(user);
  }

  @MessagePattern({ cmd: UPDATE_USER })
  updateUser(@Payload() userProfileInfo, @Ctx() context: RmqContext) {
    ack(context);

    return this.userService.updateUser(
      userProfileInfo.userProfileDto,
      userProfileInfo.userId,
    );
  }

  @MessagePattern({ cmd: DELETE_USER })
  deleteUser(@Payload() userId, @Ctx() context: RmqContext) {
    ack(context);

    return this.userService.deleteUser(userId);
  }

  @MessagePattern({ cmd: CREATE_ROLE })
  createRole(@Payload() roleDto: CreateRoleDto, @Ctx() context: RmqContext) {
    ack(context);

    return this.roleService.createRole(roleDto);
  }

  @MessagePattern({ cmd: ADD_ROLE })
  addRole(@Payload() roleDto: AddRoleDto, @Ctx() context: RmqContext) {
    ack(context);

    return this.userService.addRole(roleDto);
  }

  @MessagePattern({ cmd: GET_USERS })
  getUsers(@Ctx() context: RmqContext) {
    ack(context);

    return this.userService.getUsers();
  }

  @MessagePattern({ cmd: GET_ROLES })
  getRoles(@Ctx() context: RmqContext) {
    ack(context);

    return this.roleService.getRoles();
  }

  @MessagePattern({ cmd: VERIFY_TOKEN })
  verifyToken(@Payload() token, @Ctx() context: RmqContext) {
    ack(context);

    return this.authService.verifyToken(token);
  }

  @MessagePattern({ cmd: GOOGLE_LOGIN })
  handleLogin(@Ctx() context: RmqContext) {
    ack(context);

    return { msg: 'Google Authentication' };
  }

  @MessagePattern({ cmd: GOOGLE_REDIRECT })
  handleGoogleRedirect(@Payload() user: User, @Ctx() context: RmqContext) {
    ack(context);

    return this.authService.redirect(user);
  }

  @MessagePattern({ cmd: VK_REDIRECT })
  handleVkRedirect(@Payload() user: User, @Ctx() context: RmqContext) {
    ack(context);
    console.log('auth control');

    return this.authService.ensureUserAndRedirect({
      email: user.email,
      password: user.password,
    });
  }

  @MessagePattern({ cmd: ENSURE_OAUTH_USER })
  ensureGoogleUser(@Payload() userDto: LoginDto, @Ctx() context: RmqContext) {
    ack(context);

    return this.authService.ensureOauthUser(userDto);
  }

  @MessagePattern({ cmd: FIND_USER_BY_ID })
  findUserById(userId: number, @Ctx() context: RmqContext) {
    ack(context);

    return this.authService.findUserById(userId);
  }
}

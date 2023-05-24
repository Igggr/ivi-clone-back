import { LoginDto } from '@app/shared/dto/login.dto';
import { User } from '@app/shared';
import { Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from './users/users.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RolesService } from './roles/roles.service';
import { USER } from '@app/shared/constants/role.const';
import { GET_PROFILE_BY_USER_ID, PROFILES } from '@app/rabbit';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private userService: UsersService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly roleService: RolesService,
    @Inject(PROFILES) private profileClient: ClientProxy
  ) {}

  async login(userDto: LoginDto) {
    const user = await this.validateUser(userDto);
    if (user instanceof User) {
      return this.googleRedirect(user);
    }
    return user;
  }

  /**
   * Генерирует токен для пользователя
   *
   * @param user Объект пользователя
   * @returns Сгенерированный токен
   */
  async generateToken(user: User) {
    const payload = { email: user.email, id: user.id };
    return {
      token: this.jwtService.sign(payload),
    };
  }

  /**
   * Проверяет правильность написания емэйла и пароля
   *
   * @param userDto Дто пользователя
   * @returns Объект пользователя
   */
  private async validateUser(userDto: LoginDto) {
    const user = await this.userService.getUserByEmail(userDto.email);
    if (user) {
      const passwordEquals = await this.userService.checkPassword(
        userDto.password,
        user.password,
      );
      if (passwordEquals) {
        return user;
      }
    }
    return {
      status: 'error',
      error: 'Неккоректный емэйл или пароль',
    };
  }

  async verifyToken(token) {
    const userInfo = await this.jwtService.verify(token);
    const user = await this.userService.getUserByEmail(userInfo.email);
    if (user) {
      return user;
    }
    return {
      status: 'error',
      error: 'Не удалось проверить токен',
    };
  }

  async ensureGoogleUser(userDto: LoginDto) {
    console.log('Auth Service');
    console.log(userDto);
    const user = await this.userRepository.findOneBy({
      email: userDto.email,
    });
    if (user) {
      return user;
    }
    console.log('User not found');
    const newGoogleUser = await this.userRepository.create(userDto);
    await newGoogleUser.setPassword(userDto.password);
    let role = await this.roleService.getRoleByValue('User');
    if (!role) {
      await this.roleService.createRole(USER);
    }
    role = await this.roleService.getRoleByValue('User');
    newGoogleUser.addRole(role);

    return await this.userRepository.save(newGoogleUser);
  }

  async findUserById(userId: number) {
    const user = await this.userRepository.findOneBy({ id: userId });
    return user;
  }

  async googleRedirect(user: User) {
    const token = await this.generateToken(user);
    const profile = await firstValueFrom(
      this.profileClient.send(
        { cmd: GET_PROFILE_BY_USER_ID },
        user.id,
      ),
    );

    return {token, 'profileInfo': profile};
  }
}

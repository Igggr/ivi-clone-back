import { LoginDto } from '@app/shared/dto/login.dto';
import { User } from '@app/shared';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from './users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private userService: UsersService,
  ) {}

  async login(userDto: LoginDto) {
    const user = await this.validateUser(userDto);
    if (user instanceof User) {
      return this.generateToken(user);
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
}

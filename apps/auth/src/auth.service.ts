import { CreateUserDto } from '@app/shared/dto/create-user.dto';
import { User } from '@app/shared/entities/user.entity';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UsersService } from './users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private userService: UsersService,
  ) {}

  async login(userDto: CreateUserDto) {
    try {
      const user = await this.validateUser(userDto);

      const token = await this.generateToken(user);
      return { status: 'ok', ...token };
    } catch (e) {
      return { status: 'error', error: e.message };
    }
  }

  /**
   * Генерирует токен для пользователя
   *
   * @param user Объект пользователя
   * @returns Сгенерированный токен
   */
  private async generateToken(user: User) {
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
  private async validateUser(userDto: CreateUserDto) {
    try {
      const user = await this.userService.getUserByEmail(userDto.email);
      const passwordEquals = await bcrypt.compare(
        userDto.password,
        user.password,
      );
      if (user && passwordEquals) {
        return user;
      }
      throw new Error();
    } catch (error) {
      throw new UnauthorizedException({
        message: 'Некорректный емэйл или пароль',
      });
    }
  }
}

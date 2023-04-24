import { CreateUserDto } from '@app/shared/dto/create-user.dto';
import { User } from '@app/shared/entities/user.entity';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from './users/users.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GoogleUser } from '@app/shared/entities/google-user.entity';
import { CreateGoogleUserDetailsDto } from '@app/shared/dto/create-google-user-details.dto';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private userService: UsersService,
    @InjectRepository(GoogleUser)
    private readonly googleUserRepository: Repository<GoogleUser>,
  ) {}

  async login(userDto: CreateUserDto) {
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
  private async validateUser(userDto: CreateUserDto) {
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

  async validateGoogleUser(details: CreateGoogleUserDetailsDto) {
    console.log('Auth Service');
    console.log(details);
    const user = this.googleUserRepository.findOneBy({ email: details.email });
    console.log(user);
    if (user) return user;
    const newGoogleUser = this.googleUserRepository.create(details);
    return this.googleUserRepository.save(newGoogleUser);
  }

  async findGoogleUser(userId: number) {
    const user = await this.googleUserRepository.findOneBy({ id: userId });
    return user;
  }
}

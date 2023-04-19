import { CREATE_USER, GET_USER_BY_EMAIL } from '@app/shared';
import { CreateUserProfileDto } from '@app/shared/dto/create-user-profile.dto';
import { CreateUserDto } from '@app/shared/dto/create-user.dto';
import { Profile } from '@app/shared/entities/profile.entity';
import { User } from '@app/shared/entities/user.entity';
import { Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ClientProxy } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { firstValueFrom } from 'rxjs';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class ProfilesService {
  constructor(
    @InjectRepository(Profile)
    private readonly profileRepository: Repository<Profile>,
    @Inject('AUTH') private authService: ClientProxy,
    private jwtService: JwtService,
  ) {}

  /**
   * Получает все профили
   *
   * @returns Массив объектов профиля
   */
  async getAllProfiles() {
    return await this.profileRepository.find();
  }

  async createUserProfile(userProfileDto: CreateUserProfileDto) {
    console.log('Sending:');
    console.log(userProfileDto);
    const user = await firstValueFrom(
      this.authService.send({ cmd: GET_USER_BY_EMAIL }, userProfileDto.email),
    );
    console.log('Return user:');
    console.log(user); // вот здесь возвращает не юзера
    if (user) {
      return {
        status: 'error',
        error: 'Пользователь с таким email уже существует',
      };
    }
    const hashPassword = await bcrypt.hash(userProfileDto.password, 5);
    const newUserDto = new CreateUserDto(userProfileDto.email, hashPassword);
    const newUser = await firstValueFrom(
      this.authService.send({ cmd: CREATE_USER }, newUserDto),
    );
    console.log(newUser);
    const profile = await this.profileRepository.create({
      ...userProfileDto,
      userId: newUser.id,
    });
    await this.profileRepository.save(profile);

    return this.generateToken(newUser);
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
}

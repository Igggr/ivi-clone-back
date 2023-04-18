import { CreateUserProfileDto } from '@app/shared/dto/create-user-profile.dto';
import { Profile } from '@app/shared/entities/profile.entity';
import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class ProfilesService {
  constructor(
    @InjectRepository(Profile)
    private readonly profileRepository: Repository<Profile>,
    @Inject('AUTH') private authService: ClientProxy,
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
    console.log(userProfileDto);
    const user = await this.authService.send(
      'get-user-by-email',
      userProfileDto.email,
    );
    console.log(user); // вот здесь возвращает не юзера
    if (user) {
      throw new HttpException(
        'Пользователь с таким email уже существует',
        HttpStatus.BAD_REQUEST,
      );
    }
    const newUser = await this.authService.send('create-user', userProfileDto);
    console.log(newUser);
    const profile = await this.profileRepository.create({
      ...userProfileDto,
      userId: 5,
    });
    await this.profileRepository.save(profile);

    return profile;
  }
}

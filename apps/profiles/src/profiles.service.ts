import { CREATE_USER, GET_USER_BY_EMAIL } from '@app/shared';
import { CreateUserProfileDto } from '@app/shared/dto/create-user-profile.dto';
import { Profile } from '@app/shared/entities/profile.entity';
import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { firstValueFrom } from 'rxjs';
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
    console.log('Sending:')
    console.log(userProfileDto);
    const user = await firstValueFrom(this.authService.send(
      { cmd: GET_USER_BY_EMAIL },
      userProfileDto.email,
    ));
    console.log('Return user:')
    console.log(user); // вот здесь возвращает не юзера
    if (user) {
      throw new HttpException(
        'Пользователь с таким email уже существует',
        HttpStatus.BAD_REQUEST,
      );
    }
    const newUser = await firstValueFrom(this.authService.send({ cmd: CREATE_USER }, userProfileDto));
    console.log(newUser);
    const profile = await this.profileRepository.create({
      ...userProfileDto,
      userId: 5,
    });
    await this.profileRepository.save(profile);

    return profile;
  }
}

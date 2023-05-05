import {
  CREATE_DUMMY_USER,
  CREATE_USER,
  GET_TOKEN,
  GET_USER_BY_EMAIL,
} from '@app/rabbit';
import { ParsedProfileDTO } from '@app/shared';
import { CreateUserProfileDto } from '@app/shared/dto/create-user-profile.dto';
import { Profile } from '@app/shared/entities/profile.entity';
import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { firstValueFrom } from 'rxjs';
import { Equal, Repository } from 'typeorm';

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
    const user = await firstValueFrom(
      this.authService.send({ cmd: GET_USER_BY_EMAIL }, userProfileDto.email),
    );
    if (user) {
      return {
        status: 'error',
        error: 'Пользователь с таким email уже существует',
      };
    }
    const newUser = await firstValueFrom(
      this.authService.send({ cmd: CREATE_USER }, userProfileDto),
    );
    const profile = await this.profileRepository.create({
      ...userProfileDto,
      userId: newUser.id,
    });
    await this.profileRepository.save(profile);

    return await firstValueFrom(
      this.authService.send({ cmd: GET_TOKEN }, newUser),
    );
  }

  async createProfileForDummyUser(dto: ParsedProfileDTO) {
    console.log('dummy user profile');
    const profile = await this.profileRepository.findOne({
      where: { url: Equal(dto.url) },
    });
    if (profile) {
      // для этого профиля с кинопоиска уже создавали и профиль и юзера
      return profile;
    }

    const phoneNumber = '+7950' + Math.floor(Math.random() * 10000000);
    const user = await firstValueFrom(
      this.authService.send(
        { cmd: CREATE_DUMMY_USER },
        { ...dto, surname: '', phoneNumber },
      ),
    );
    const newProfile = await this.profileRepository.create({
      ...dto,
      surname: '', // на кинопоиске в профиле 1 только ник
      phoneNumber,
      userId: user.id,
    });
    return newProfile;
  }
}

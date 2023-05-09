import {
  CREATE_DUMMY_USER,
  CREATE_USER,
  DELETE_FILE,
  DELETE_USER,
  GET_TOKEN,
  GET_USER_BY_EMAIL,
  RECORD_FILE,
  UPDATE_FILE,
  UPDATE_USER,
} from '@app/rabbit';
import { ParsedProfileDTO } from '@app/shared';
import { CreateUserProfileDto } from '@app/shared/dto/create-user-profile.dto';
import { Profile } from '@app/shared';
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
    @Inject('FILES-RECORD') private fileRecordService: ClientProxy,
  ) {}

  /**
   * Получает все профили
   *
   * @returns Массив объектов профиля
   */
  async getAllProfiles() {
    return await this.profileRepository.find();
  }

  async createUserProfile(userProfileDto: CreateUserProfileDto, photo: any) {
    try {
      let photoName = null;
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
      if (newUser.status === 'error') {
        return newUser;
      }
      const profile = await this.profileRepository.create({
        ...userProfileDto,
        userId: newUser.id,
        url: '',
      });
      await this.profileRepository.save(profile);
      if (photo) {
        photoName = await firstValueFrom(
          this.fileRecordService.send(
            { cmd: RECORD_FILE },
            {
              essenceId: profile.id,
              essenceTable: 'profiles',
              file: photo,
            },
          ),
        );
      }
      profile.photo = photoName;

      return await firstValueFrom(
        this.authService.send({ cmd: GET_TOKEN }, newUser),
      );
    } catch (error) {
      return {
        status: 'error',
        error: 'Ошибка при создании профиля',
      };
    }
  }

  async updateUserProfile(
    profileId: number,
    userProfileDto: CreateUserProfileDto,
    photo: any,
  ) {
    try {
      let photoName;
      const profile = await this.profileRepository.findOneBy({
        id: profileId,
      });
      const userId = profile.userId;
      if (userProfileDto.email || userProfileDto.password) {
        const user = await firstValueFrom(
          this.authService.send(
            { cmd: UPDATE_USER },
            { userProfileDto, userId },
          ),
        );
        if (user.status === 'error') {
          return user;
        }
      }
      if (photo) {
        if (profile.photo) {
          photoName = await firstValueFrom(
            this.fileRecordService.send(
              { cmd: UPDATE_FILE },
              {
                essenceId: profileId,
                fileForCreate: photo,
                fileForDelete: profile.photo,
              },
            ),
          );
        } else {
          photoName = await firstValueFrom(
            this.fileRecordService.send(
              { cmd: RECORD_FILE },
              {
                essenceId: profileId,
                essenceTable: 'profiles',
                file: photo,
              },
            ),
          );
        }
      }
      await this.profileRepository.save({
        ...profile,
        ...userProfileDto,
        photo: photoName,
      });

      return await this.profileRepository.findOneBy({
        id: profileId,
      });
    } catch (error) {
      return {
        status: 'error',
        error: 'Ошибка при обновлении профиля',
      };
    }
  }

  async deleteUserProfile(profileId: number) {
    try {
      const profile = await this.profileRepository.findOneBy({ id: profileId });
      if (!profile) {
        return {
          status: 'error',
          error: 'Профиль не найден',
        };
      }
      const userId = profile.userId;
      const user = await firstValueFrom(
        this.authService.send({ cmd: DELETE_USER }, userId),
      );
      if (user.status === 'error') {
        return user;
      }
      if (profile.photo) {
        await firstValueFrom(
          this.fileRecordService.send(
            { cmd: DELETE_FILE },
            {
              essenceId: profile.id,
              fileName: profile.photo,
            },
          ),
        );
      }
      await this.profileRepository.remove(profile);

      return {
        status: 'Success',
        message: 'Профиль и пользователь успешно удалены',
      };
    } catch (error) {
      return {
        status: 'error',
        error: 'Ошибка при удалении профиля',
      };
    }
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

    // const phoneNumber = '+7950' + Math.floor(Math.random() * 10000000);
    const user = await firstValueFrom(
      this.authService.send(
        { cmd: CREATE_DUMMY_USER },
        { ...dto, surname: '' },
      ),
    );
    const newProfile = await this.profileRepository.create({
      ...dto,
      surname: '', // на кинопоиске в профиле 1 только ник
      // phoneNumber,
      userId: user.id,
    });
    return newProfile;
  }
}

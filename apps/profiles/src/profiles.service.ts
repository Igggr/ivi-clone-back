import {
  AUTH,
  CREATE_USER,
  DELETE_FILE,
  DELETE_USER,
  FILES_RECORD,
  GET_TOKEN,
  GET_USER_BY_EMAIL,
  RECORD_FILE,
  UPDATE_FILE,
  UPDATE_USER,
} from '@app/rabbit';
import { CreateUserDTO, ParsedProfileDTO } from '@app/shared';
import { CreateUserProfileDto } from '@app/shared/dto/create-user-profile.dto';
import { Profile } from '@app/shared';
import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { firstValueFrom } from 'rxjs';
import { Equal, Repository } from 'typeorm';
import * as uuid from 'uuid';

@Injectable()
export class ProfilesService {
  constructor(
    @InjectRepository(Profile)
    private readonly profileRepository: Repository<Profile>,
    @Inject(AUTH) private authClient: ClientProxy,
    @Inject(FILES_RECORD) private fileRecordClient: ClientProxy,
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
        this.authClient.send({ cmd: GET_USER_BY_EMAIL }, userProfileDto.email),
      );
      if (user) {
        return {
          status: 'error',
          error: 'Пользователь с таким email уже существует',
        };
      }
      const foundProfile = await this.profileRepository.findOneBy({
        nickname: userProfileDto.nickname,
      });
      if (foundProfile) {
        return {
          status: 'error',
          error: 'Пользователь с таким никнеймом уже существует',
        };
      }
      const newUser = await firstValueFrom(
        this.authClient.send({ cmd: CREATE_USER }, userProfileDto),
      );
      if (newUser.status === 'error') {
        return newUser;
      }
      const profile = await this.profileRepository.create({
        ...userProfileDto,
        userId: newUser.id,
        url: userProfileDto.url ?? '',
      });
      await this.profileRepository.save(profile);
      if (photo) {
        photoName = await firstValueFrom(
          this.fileRecordClient.send(
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
      const profileInfo = await this.profileRepository.save(profile);
      const token = await firstValueFrom(
        this.authClient.send({ cmd: GET_TOKEN }, newUser),
      );

      return { token, profileInfo: profileInfo };
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
      const profile = await this.profileRepository.findOneBy({
        id: profileId,
      });
      let photoName = profile.photo;
      const userId = profile.userId;
      if (userProfileDto.email || userProfileDto.password) {
        const user = await firstValueFrom(
          this.authClient.send(
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
            this.fileRecordClient.send(
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
            this.fileRecordClient.send(
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
        this.authClient.send({ cmd: DELETE_USER }, userId),
      );
      if (user.status === 'error') {
        return user;
      }
      if (profile.photo) {
        await firstValueFrom(
          this.fileRecordClient.send(
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
    const profile = await this.profileRepository.findOne({
      where: { url: Equal(dto.url) },
    });
    if (profile) {
      // для этого профиля с кинопоиска уже создавали и профиль и юзера
      return profile;
    }

    const profileWithTheSameNickName = await this.profileRepository.findOne({
      where: { nickname: Equal(dto.nickname) },
    });

    if (profileWithTheSameNickName) {
      const double = await this.profileRepository.findOneBy({
        nickname: dto.nickname,
      });
      console.log('Nickname is used by few users:', dto.url, double.url);
    }

    const fakeUserPayload: CreateUserDTO = {
      password: '1111',
      email: uuid.v4() + '@com',
    };
    const fakeProfileData = {
      name: dto.nickname,
      surname: 'Doe',
      city: '',
    };
    const userProfileDto: CreateUserProfileDto = {
      ...dto,
      ...fakeProfileData,
      ...fakeUserPayload,
    };
    const newProfile = await this.createUserProfile(userProfileDto, null);
    return newProfile;
  }

  async getProfileByUserId(userId: number) {
    return await this.profileRepository.findOneBy({ userId: userId });
  }
}

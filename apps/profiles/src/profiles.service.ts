import {
  CREATE_USER,
  DELETE_FILE,
  DELETE_USER,
  GET_TOKEN,
  GET_USER_BY_EMAIL,
  RECORD_FILE,
  UPDATE_FILE,
  UPDATE_USER,
} from '@app/shared';
import { CreateUserProfileDto } from '@app/shared/dto/create-user-profile.dto';
import { Profile } from '@app/shared/entities/profile.entity';
import { FilesService } from 'apps/files-record/src/files.service';
import { Inject, Injectable } from '@nestjs/common';
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
    @Inject('FILES-RECORD') private fileRecordService: ClientProxy,
    private fileService: FilesService,
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
      });
      await this.profileRepository.save(profile);
      if (photo) {
        photoName = await firstValueFrom(
          this.fileRecordService.send(
            { cmd: RECORD_FILE },
            {
              essenceId: profile.id,
              essenceTable: 'profiles',
              fileName: photo,
            },
          ),
        );
      }
      profile.photo = photoName;
      await this.profileRepository.save(profile);

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
          await this.fileService.deleteFile(profile.photo);
          await this.profileRepository.save({
            ...profile,
            ...userProfileDto,
          });
          await firstValueFrom(
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
          await this.profileRepository.save({ ...profile, ...userProfileDto });
          await firstValueFrom(
            this.fileRecordService.send(
              { cmd: RECORD_FILE },
              {
                essenceId: profileId,
                essenceTable: 'profiles',
                fileName: photo,
              },
            ),
          );
        }
      }

      return await this.profileRepository.findOneBy({ id: profileId });
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
        await this.fileService.deleteFile(profile.photo);
        await firstValueFrom(
          this.fileRecordService.send({ cmd: DELETE_FILE }, profileId),
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
}

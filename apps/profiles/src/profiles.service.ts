import {
  CREATE_USER,
  DELETE_USER,
  GET_TOKEN,
  GET_USER_BY_EMAIL,
  UPDATE_USER,
} from '@app/shared';
import { CreateUserProfileDto } from '@app/shared/dto/create-user-profile.dto';
import { Profile } from '@app/shared/entities/profile.entity';
import { FilesService } from '@app/shared/services/files.service';
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

  async createUserProfile(
    userProfileDto: CreateUserProfileDto,
    namePhoto: string,
  ) {
    try {
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
        photo: namePhoto,
        creationDate: new Date(),
      });
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
    namePhoto: string,
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
      if (namePhoto && profile.photo) {
        await this.fileService.deleteFile(profile.photo);
        await this.profileRepository.save({
          ...profile,
          ...userProfileDto,
          photo: namePhoto,
        });
      } else {
        await this.profileRepository.save({ ...profile, ...userProfileDto });
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
      await this.fileService.deleteFile(profile.photo);
      await this.profileRepository.remove(profile);
      return 'Success';
    } catch (error) {
      return {
        status: 'error',
        error: 'Ошибка при удалении профиля',
      };
    }
  }
}

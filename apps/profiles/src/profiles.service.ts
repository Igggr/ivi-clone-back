import { CREATE_USER, GET_TOKEN, GET_USER_BY_EMAIL } from '@app/shared';
import { CreateUserProfileDto } from '@app/shared/dto/create-user-profile.dto';
import { Profile } from '@app/shared/entities/profile.entity';
import { FilesService } from '@app/shared/files.service';
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

  async createUserProfile(userProfileDto: CreateUserProfileDto, photo: any) {
    const user = await firstValueFrom(
      this.authService.send({ cmd: GET_USER_BY_EMAIL }, userProfileDto.email),
    );
    if (user) {
      return {
        status: 'error',
        error: 'Пользователь с таким email уже существует',
      };
    }
    console.log(photo);
    const newUser = await firstValueFrom(
      this.authService.send({ cmd: CREATE_USER }, userProfileDto),
    );
    const namePhoto = await this.fileService.createFile(photo);
    const profile = await this.profileRepository.create({
      ...userProfileDto,
      userId: newUser.id,
      photo: namePhoto,
    });
    await this.profileRepository.save(profile);

    return await firstValueFrom(
      this.authService.send({ cmd: GET_TOKEN }, newUser),
    );
  }
}

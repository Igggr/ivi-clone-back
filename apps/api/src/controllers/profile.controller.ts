import { DELETE_PROFILE, REGISTRATION, UPDATE_PROFILE } from '@app/shared';
import { CreateUserProfileDto } from '@app/shared/dto/create-user-profile.dto';
import { FilesService } from '@app/shared/services/files.service';
import {
  Body,
  Controller,
  Delete,
  HttpException,
  HttpStatus,
  Inject,
  Param,
  Post,
  Put,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { FileInterceptor } from '@nestjs/platform-express';
import { firstValueFrom } from 'rxjs';
import { ProfilesGuard } from '../guards/profile-auth.guard';
import { Roles } from '../guards/roles-auth.decorator';
import { RolesGuard } from '../guards/roles.guard';

@Controller()
export class ProfilesController {
  constructor(
    @Inject('PROFILES') private profileService: ClientProxy,
    private fileService: FilesService,
  ) {}

  @Post('/registration')
  @UseInterceptors(FileInterceptor('photo'))
  async registration(
    @Body() userProfileDto: CreateUserProfileDto,
    @UploadedFile() photo,
  ) {
    const namePhoto = await this.fileService.createFile(photo);
    const res = await firstValueFrom(
      this.profileService.send(
        {
          cmd: REGISTRATION,
        },
        {
          userProfileDto,
          namePhoto,
        },
      ),
    );
    if (res.status === 'error') {
      await this.fileService.deleteFile(namePhoto);
      throw new HttpException(res.error, HttpStatus.BAD_REQUEST);
    }
    return res;
  }

  @Put('/profiles/:id')
  @UseGuards(ProfilesGuard)
  @Roles('ADMIN')
  @UseInterceptors(FileInterceptor('photo'))
  async updateProfile(
    @Param('id') profileId: number,
    @Body() userProfileDto: CreateUserProfileDto,
    @UploadedFile() photo,
  ) {
    let namePhoto;
    if (photo) {
      namePhoto = await this.fileService.createFile(photo);
    }
    const res = await firstValueFrom(
      this.profileService.send(
        {
          cmd: UPDATE_PROFILE,
        },
        {
          profileId,
          userProfileDto,
          namePhoto,
        },
      ),
    );
    if (res.status === 'error') {
      await this.fileService.deleteFile(namePhoto);
      throw new HttpException(res.error, HttpStatus.BAD_REQUEST);
    }
    return res;
  }

  @Delete('/profiles/:id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  async deleteProfile(@Param('id') profileId: number) {
    const res = await firstValueFrom(
      this.profileService.send(
        {
          cmd: DELETE_PROFILE,
        },
        profileId,
      ),
    );
    if (res.status === 'error') {
      throw new HttpException(res.error, HttpStatus.BAD_REQUEST);
    }
    return res;
  }
}

import { REGISTRATION } from '@app/shared';
import { CreateUserProfileDto } from '@app/shared/dto/create-user-profile.dto';
import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Inject,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { FileInterceptor } from '@nestjs/platform-express';
import { firstValueFrom } from 'rxjs';

@Controller()
export class ProfilesController {
  constructor(@Inject('PROFILES') private profileService: ClientProxy) {}

  @Post('/registration')
  @UseInterceptors(FileInterceptor('photo'))
  async registration(
    @Body() userProfileDto: CreateUserProfileDto,
    @UploadedFile() photo,
  ) {
    console.log(userProfileDto);
    const res = await firstValueFrom(
      this.profileService.send(
        {
          cmd: REGISTRATION,
        },
        {
          userProfileDto,
          photo,
        },
      ),
    );
    if (res.status === 'error') {
      throw new HttpException(res.error, HttpStatus.BAD_REQUEST);
    }
    return res;
  }
}

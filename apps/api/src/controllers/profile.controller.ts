import { REGISTRATION } from '@app/shared';
import { CreateUserProfileDto } from '@app/shared/dto/create-user-profile.dto';
import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Inject,
  Post,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Controller()
export class ProfilesController {
  constructor(@Inject('PROFILES') private profileService: ClientProxy) {}

  @Post('/registration')
  async registration(@Body() userProfileDto: CreateUserProfileDto) {
    const res = await firstValueFrom(
      this.profileService.send(
        {
          cmd: REGISTRATION,
        },
        userProfileDto,
      ),
    );
    if (res.status === 'error') {
      throw new HttpException(res.error, HttpStatus.BAD_REQUEST);
    }
    return res;
  }
}

import { REGISTRATION } from '@app/shared';
import { CreateUserProfileDto } from '@app/shared/dto/create-user-profile.dto';
import { Body, Controller, Inject, Post } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

@Controller()
export class ProfilesController {
  constructor(@Inject('PROFILES') private profileService: ClientProxy) {}

  @Post('/registration')
  registration(@Body() userProfileDto: CreateUserProfileDto) {
    return this.profileService.send(
      {
        cmd: REGISTRATION,
      },
      userProfileDto,
    );
  }
}

import { Body, Controller } from '@nestjs/common';
import { ProfilesService } from './profiles.service';
import { Ctx, MessagePattern, RmqContext } from '@nestjs/microservices';
import { REGISTRATION } from '@app/shared';

@Controller()
export class ProfilesController {
  constructor(private readonly profileService: ProfilesService) {}

  @MessagePattern({ cmd: 'get-profiles' })
  getProfiles(@Ctx() context: RmqContext) {
    const channel = context.getChannelRef();
    const message = context.getMessage();
    channel.ack(message);

    return this.profileService.getAllProfiles();
  }

  @MessagePattern({ cmd: REGISTRATION })
  async registration(
    @Body() userProfileDtoAndPhoto,
    @Ctx() context: RmqContext,
  ) {
    const channel = context.getChannelRef();
    const message = context.getMessage();
    channel.ack(message);

    return await this.profileService.createUserProfile(
      userProfileDtoAndPhoto.userProfileDto,
      userProfileDtoAndPhoto.namePhoto,
    );
  }
}

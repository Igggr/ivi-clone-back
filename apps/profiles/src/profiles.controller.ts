import { Body, Controller } from '@nestjs/common';
import { ProfilesService } from './profiles.service';
import {
  Ctx,
  MessagePattern,
  Payload,
  RmqContext,
} from '@nestjs/microservices';
import { DELETE_PROFILE, REGISTRATION, UPDATE_PROFILE } from '@app/shared';

@Controller()
export class ProfilesController {
  constructor(private readonly profileService: ProfilesService) {}

  // @MessagePattern({ cmd: 'get-profiles' })
  // getProfiles(@Ctx() context: RmqContext) {
  //   const channel = context.getChannelRef();
  //   const message = context.getMessage();
  //   channel.ack(message);

  //   return this.profileService.getAllProfiles();
  // }

  @MessagePattern({ cmd: REGISTRATION })
  async registration(@Body() userProfileInfo, @Ctx() context: RmqContext) {
    const channel = context.getChannelRef();
    const message = context.getMessage();
    channel.ack(message);

    return await this.profileService.createUserProfile(
      userProfileInfo.userProfileDto,
      userProfileInfo.namePhoto,
    );
  }

  @MessagePattern({ cmd: UPDATE_PROFILE })
  async updateProfile(@Body() userProfileInfo, @Ctx() context: RmqContext) {
    const channel = context.getChannelRef();
    const message = context.getMessage();
    channel.ack(message);

    return await this.profileService.updateUserProfile(
      userProfileInfo.profileId,
      userProfileInfo.userProfileDto,
      userProfileInfo.namePhoto,
    );
  }

  @MessagePattern({ cmd: DELETE_PROFILE })
  async deleteProfile(
    @Payload() profileId: number,
    @Ctx() context: RmqContext,
  ) {
    const channel = context.getChannelRef();
    const message = context.getMessage();
    channel.ack(message);

    return await this.profileService.deleteUserProfile(profileId);
  }
}

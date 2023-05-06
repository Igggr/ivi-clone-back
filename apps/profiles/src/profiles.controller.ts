import { Controller } from '@nestjs/common';
import { ProfilesService } from './profiles.service';
import {
  Ctx,
  MessagePattern,
  Payload,
  RmqContext,
} from '@nestjs/microservices';
import {
  DELETE_PROFILE,
  GET_PROFILES,
  REGISTRATION,
  UPDATE_PROFILE,
} from '@app/shared';

@Controller()
export class ProfilesController {
  constructor(private readonly profileService: ProfilesService) {}

  @MessagePattern({ cmd: GET_PROFILES })
  getProfiles(@Ctx() context: RmqContext) {
    const channel = context.getChannelRef();
    const message = context.getMessage();
    channel.ack(message);

    return this.profileService.getAllProfiles();
  }

  @MessagePattern({ cmd: REGISTRATION })
  async registration(@Payload() userProfileInfo, @Ctx() context: RmqContext) {
    const channel = context.getChannelRef();
    const message = context.getMessage();
    channel.ack(message);

    return await this.profileService.createUserProfile(
      userProfileInfo.userProfileDto,
      userProfileInfo.photo,
    );
  }

  @MessagePattern({ cmd: UPDATE_PROFILE })
  async updateProfile(@Payload() userProfileInfo, @Ctx() context: RmqContext) {
    const channel = context.getChannelRef();
    const message = context.getMessage();
    channel.ack(message);

    return await this.profileService.updateUserProfile(
      userProfileInfo.profileId,
      userProfileInfo.userProfileDto,
      userProfileInfo.photo,
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

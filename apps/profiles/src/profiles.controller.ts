import { Controller } from '@nestjs/common';
import { ProfilesService } from './profiles.service';
import {
  Ctx,
  MessagePattern,
  Payload,
  RmqContext,
} from '@nestjs/microservices';
import { CreateUserProfileDto } from '@app/shared/dto/create-user-profile.dto';
import { ParsedProfileDTO, REGISTRATION } from '@app/shared';
import { CREATE_PROFILE_WITH_DUMMY_USER } from '@app/rabbit';

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
  registration(
    @Payload() userProfileDto: CreateUserProfileDto,
    @Ctx() context: RmqContext,
  ) {
    const channel = context.getChannelRef();
    const message = context.getMessage();
    channel.ack(message);

    return this.profileService.createUserProfile(userProfileDto);
  }

  @MessagePattern({ cmd: CREATE_PROFILE_WITH_DUMMY_USER })
  createProfileWithDummmyUser(
    @Ctx() context: RmqContext,
    @Payload() dto: ParsedProfileDTO,
  ) {
    console.log('should create dummy profile');
    const channel = context.getChannelRef();
    const message = context.getMessage();
    channel.ack(message);

    this.profileService.createProfileForDummyUser(dto);
  }
}

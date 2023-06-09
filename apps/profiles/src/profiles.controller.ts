import { Controller } from '@nestjs/common';
import { ProfilesService } from './profiles.service';
import {
  Ctx,
  MessagePattern,
  Payload,
  RmqContext,
} from '@nestjs/microservices';
import { ParsedProfileDTO, Profile } from '@app/shared';
import {
  DELETE_PROFILE,
  GET_PROFILES,
  UPDATE_PROFILE,
  REGISTRATION,
  CREATE_PROFILE_WITH_DUMMY_USER,
  ack,
  GET_PROFILE_BY_USER_ID,
  ErrorDTO,
  CREATE_PROFILE,
} from '@app/rabbit';
import { ProfileDetails } from '@app/shared/types/profile-details';

@Controller()
export class ProfilesController {
  constructor(private readonly profileService: ProfilesService) {}

  @MessagePattern({ cmd: GET_PROFILES })
  getProfiles(@Ctx() context: RmqContext) {
    ack(context);

    return this.profileService.getAllProfiles();
  }

  @MessagePattern({ cmd: REGISTRATION })
  async registration(@Payload() userProfileInfo, @Ctx() context: RmqContext) {
    ack(context);

    return await this.profileService.createUserProfile(
      userProfileInfo.userProfileDto,
      userProfileInfo.photo,
    );
  }

  @MessagePattern({ cmd: UPDATE_PROFILE })
  async updateProfile(@Payload() userProfileInfo, @Ctx() context: RmqContext) {
    ack(context);

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
    ack(context);

    return await this.profileService.deleteUserProfile(profileId);
  }

  @MessagePattern({ cmd: CREATE_PROFILE_WITH_DUMMY_USER })
  createProfileWithDummmyUser(
    @Ctx() context: RmqContext,
    @Payload() dto: ParsedProfileDTO,
  ): Promise<
    | ErrorDTO
    | {
        token: string;
        profileInfo: Profile;
      }
  > {
    ack(context);
    return this.profileService.createProfileForDummyUser(dto);
  }

  @MessagePattern({ cmd: GET_PROFILE_BY_USER_ID })
  getProfileByUserId(@Ctx() context: RmqContext, @Payload() userId: number) {
    ack(context);

    return this.profileService.getProfileByUserId(userId);
  }

  @MessagePattern({ cmd: CREATE_PROFILE })
  createProfile(
    @Ctx() context: RmqContext,
    @Payload() profileDetails: ProfileDetails,
  ) {
    ack(context);

    return this.profileService.createProfile(profileDetails);
  }
}

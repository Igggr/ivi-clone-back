import {
  REGISTRATION,
  DELETE_PROFILE,
  GET_PROFILES,
  UPDATE_PROFILE,
  PROFILES,
} from '@app/rabbit';
import { CreateUserProfileDto } from '@app/shared/dto/create-user-profile.dto';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Inject,
  Param,
  Post,
  Put,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  UsePipes,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { FileInterceptor } from '@nestjs/platform-express';
import { firstValueFrom } from 'rxjs';
import { ProfilesGuard } from '../guards/profile-auth.guard';
import { Roles } from '../guards/roles-auth.decorator';
import { ValidationPipe } from '@app/shared/pipes/validation-pipe';
import { ADMIN } from '@app/shared/constants/role-guard.const';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { BearerAuth } from '../guards/bearer';
import { TokenProfileResponse } from '@app/shared/api-response/token-profileInfo';
import { Profile } from '@app/shared';
import { RegisterException } from '@app/shared/api-response/register-exception';
import { UpdateProfileException } from '@app/shared/api-response/update-profile-exception';
import { DeletedProfileUserResponse } from '@app/shared/api-response/deleted-profile-user';
import { DeletedProfileUserException } from '@app/shared/api-response/deleted-profile-user-exception';

@ApiTags('profile')
@Controller()
export class ProfilesController {
  constructor(@Inject(PROFILES) private readonly client: ClientProxy) {}

  @Post('/registration')
  @ApiResponse({ status: HttpStatus.CREATED, type: TokenProfileResponse })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    type: RegisterException,
  })
  @UsePipes(ValidationPipe)
  @ApiOperation({ summary: 'Регистрация пользователя' })
  @UseInterceptors(FileInterceptor('photo'))
  async registration(
    @Body() userProfileDto: CreateUserProfileDto,
    @UploadedFile() photo: Express.Multer.File,
  ) {
    const res = await firstValueFrom(
      this.client.send(
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

  @Put('/profiles/:id')
  @ApiOperation({ summary: 'Обновление информации профиля' })
  @ApiResponse({ status: HttpStatus.OK, type: Profile })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    type: UpdateProfileException,
  })
  @ApiBearerAuth(BearerAuth)
  @UseGuards(ProfilesGuard)
  @Roles(ADMIN)
  @UsePipes(ValidationPipe)
  @UseInterceptors(FileInterceptor('photo'))
  async updateProfile(
    @Param('id') profileId: number,
    @Body() userProfileDto: CreateUserProfileDto,
    @UploadedFile() photo: Express.Multer.File,
  ) {
    const res = await firstValueFrom(
      this.client.send(
        {
          cmd: UPDATE_PROFILE,
        },
        {
          profileId,
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

  @Delete('/profiles/:id')
  @ApiOperation({ summary: 'Удаление профиля' })
  @ApiResponse({ status: HttpStatus.OK, type: DeletedProfileUserResponse })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    type: DeletedProfileUserException,
  })
  @ApiBearerAuth(BearerAuth)
  @UseGuards(ProfilesGuard)
  @Roles(ADMIN)
  async deleteProfile(@Param('id') profileId: number) {
    const res = await firstValueFrom(
      this.client.send(
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

  @Get('/profiles')
  @ApiOperation({ summary: 'Получение информации о профилях' })
  @ApiResponse({ status: HttpStatus.OK, type: [Profile] })
  async getProfiles() {
    return await firstValueFrom(
      this.client.send(
        {
          cmd: GET_PROFILES,
        },
        {},
      ),
    );
  }
}

import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Inject,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { RolesGuard } from '../guards/roles.guard';
import { BearerAuth } from '../guards/bearer';
import {
  CreateCommentDTO,
  CreateReviewDTO,
  NotYours,
  Profile,
  Review,
  SubmitCommentDTO,
  SubmitReviewDTO,
} from '@app/shared';
import { firstValueFrom } from 'rxjs';
import {
  ADD_COMMENT,
  ADD_REVIEW,
  DELETE_COMMENT,
  DELETE_REVIEW,
  FILM,
  GET_PROFILE_BY_USER_ID,
  PROFILES,
  ResponseDTO,
  UPDATE_COMMENT,
  UPDATE_REVIEW,
} from '@app/rabbit';
import { ClientProxy } from '@nestjs/microservices';
import { SubmitUpdateReviewDTO } from '@app/shared/dto/submit-update-review.dto';
import { UpdateReviewDTO } from '@app/shared/dto/update-review.dto';
import { DeleteReviewDTO } from '@app/shared/dto/delete-review.dto';
import { SubmitUpdateCommentDTO } from '@app/shared/dto/submit-update-comment.dto';

// читать отдельное ревью . комментарий не надо - они загрузяться вместе с фильмом (если выбрать один фильм)
@ApiTags('film/review')
@Controller('/film/review')
export class ReviewController {
  constructor(
    @Inject(FILM) private readonly filmClient: ClientProxy,
    @Inject(PROFILES) private readonly profileClient: ClientProxy,
  ) {}

  @ApiOperation({ summary: 'Добавление рецензии на фильм' })
  @UseGuards(RolesGuard)
  @ApiBearerAuth(BearerAuth)
  @Post()
  async addReview(@Body() dto: SubmitReviewDTO, @Req() request: Request) {
    const profile = await this.getProfileId(request.user);
    const payload: CreateReviewDTO = { ...dto, profileId: profile.id };

    return await firstValueFrom(
      this.filmClient.send(
        {
          cmd: ADD_REVIEW,
        },
        payload,
      ),
    );
  }

  @ApiOperation({ summary: 'Обновление рецензии на фильм' })
  @UseGuards(RolesGuard)
  @ApiBearerAuth(BearerAuth)
  @Put()
  async updateReview(
    @Body() dto: SubmitUpdateReviewDTO,
    @Req() request: Request,
  ) {
    const profile = await this.getProfileId(request.user);
    const payload: UpdateReviewDTO = { ...dto, profileId: profile.id };

    const response: ResponseDTO<Review> = await firstValueFrom(
      this.filmClient.send(
        {
          cmd: UPDATE_REVIEW,
        },
        payload,
      ),
    );
    if (response.status === 'error' && response.error === NotYours) {
      throw new ForbiddenException(NotYours);
    }
    if (response.status === 'ok') {
      return response.value;
    }
    return response;
  }

  @Delete('/:id')
  @ApiOperation({ summary: 'Удаление рецензии на фильм' })
  @UseGuards(RolesGuard)
  @ApiBearerAuth(BearerAuth)
  async deleteReview(
    @Req() request: Request,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const profile = await this.getProfileId(request.user);
    const payload: DeleteReviewDTO = { id, profileId: profile.id };
    const response: ResponseDTO<Review> = await firstValueFrom(
      this.filmClient.send(
        {
          cmd: DELETE_REVIEW,
        },
        payload,
      ),
    );
    if (response.status === 'error' && response.error === NotYours) {
      throw new ForbiddenException(NotYours);
    }
    if (response.status === 'ok') {
      return response.value;
    }
    return response;
  }

  // какое-то дублирование
  @ApiOperation({ summary: 'Добавление комментария к рецензии на фильм' })
  @UseGuards(RolesGuard)
  @ApiBearerAuth(BearerAuth)
  @Post('/comment')
  async addComment(@Body() dto: SubmitCommentDTO, @Req() request: Request) {
    const profile = await this.getProfileId(request.user);
    const payload: CreateCommentDTO = { ...dto, profileId: profile.id };

    return await firstValueFrom(
      this.filmClient.send(
        {
          cmd: ADD_COMMENT,
        },
        payload,
      ),
    );
  }

  @ApiOperation({ summary: 'Обновление комметнария к рецензии' })
  @UseGuards(RolesGuard)
  @ApiBearerAuth(BearerAuth)
  @Put('/comment')
  async updateComment(
    @Body() dto: SubmitUpdateCommentDTO,
    @Req() request: Request,
  ) {
    const profile = await this.getProfileId(request.user);
    const payload = { ...dto, profileId: profile.id };

    const response: ResponseDTO<Comment> = await firstValueFrom(
      this.filmClient.send(
        {
          cmd: UPDATE_COMMENT,
        },
        payload,
      ),
    );
    if (response.status === 'error' && response.error === NotYours) {
      console.log('Not his comment');
      throw new ForbiddenException(NotYours);
    }
    if (response.status === 'ok') {
      return response.value;
    }
    return response;
  }

  @Delete('/comment/:id')
  @ApiOperation({ summary: 'Удаление комментария к рецензии' })
  @UseGuards(RolesGuard)
  @ApiBearerAuth(BearerAuth)
  async deleteComment(
    @Req() request: Request,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const profile = await this.getProfileId(request.user);
    const payload: DeleteReviewDTO = { id, profileId: profile.id };
    const response: ResponseDTO<Comment> = await firstValueFrom(
      this.filmClient.send(
        {
          cmd: DELETE_COMMENT,
        },
        payload,
      ),
    );
    if (response.status === 'error' && response.error === NotYours) {
      throw new ForbiddenException(NotYours);
    }
    if (response.status === 'ok') {
      return response.value;
    }
    return response;
  }

  // грязновато. но возможно надо делать новй guard. который сначала получит profileId как здесь
  // а потом сравнит с profileId обхекта
  // но тогда лишнее облащение к БД
  private async getProfileId(user): Promise<Profile> {
    return await firstValueFrom(
      this.profileClient.send({ cmd: GET_PROFILE_BY_USER_ID }, user.id),
    );
  }
}

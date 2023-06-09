import { ResponseDTO } from '@app/rabbit';
import {
  GET_ONE_FILM,
  CREATE_FILM,
  DELETE_FILM,
  GET_FILMS,
  UPDATE_FILM,
  GET_PROFILE_BY_USER_ID,
  ADD_REVIEW,
  ADD_COMMENT,
  UPDATE_REVIEW,
  DELETE_REVIEW,
} from '@app/rabbit/events';
import { FILM, PROFILES } from '@app/rabbit/queues';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Inject,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
  ParseArrayPipe,
  Req,
  Put,
  ForbiddenException,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { firstValueFrom } from 'rxjs';
import { DeleteResult } from 'typeorm';
import { RolesGuard } from '../guards/roles.guard';
import { ADMIN } from '@app/shared/constants/role-guard.const';
import { Roles } from '../guards/roles-auth.decorator';
import {
  CreateFilmDTO,
  CreateReviewDTO,
  Film,
  PaginationDTO,
  SubmitReviewDTO,
  UpdateFilmDTO,
  SubmitCommentDTO,
  CreateCommentDTO,
  Review,
  NotYours,
} from '@app/shared';
import { BearerAuth } from '../guards/bearer';
import { Request } from 'express';
import { UpdateReviewDTO } from '@app/shared/dto/update-review.dto';
import { SubmitUpdateReview } from '@app/shared/dto/submit_update-review.dto';
import { DeleteReviewDTO } from '@app/shared/dto/delete-review.dto';

@ApiTags('film')
@Controller('/film')
export class FilmController {
  constructor(
    @Inject(FILM) private readonly filmClient: ClientProxy,
    @Inject(PROFILES) private readonly profileClient: ClientProxy,
  ) {}

  @UseGuards(RolesGuard)
  @Roles(ADMIN)
  @ApiBearerAuth(BearerAuth)
  @ApiOperation({ summary: 'Создание фильма' })
  @ApiResponse({ status: HttpStatus.CREATED, type: Promise<ResponseDTO<Film>> })
  @Post()
  async createFilm(@Body() dto): Promise<ResponseDTO<Film>> {
    const film = await firstValueFrom(
      this.filmClient.send(
        {
          cmd: CREATE_FILM,
        },
        dto,
      ),
    );
    return film;
  }

  @ApiOperation({ summary: 'Получение информации о всей кинопродукции' })
  @ApiResponse({ status: HttpStatus.ACCEPTED, type: [Film] })
  @Get()
  async getAll(
    @Query('genres', new ParseArrayPipe({ optional: true, items: String }))
    genres: string[] = [],
    @Query('limit') limit = 10,
    @Query('ofset') ofset = 0,
  ) {
    const res = await firstValueFrom(
      this.filmClient.send(
        { cmd: GET_FILMS },
        {
          genres: genres,
          pagination: { limit, ofset },
        },
      ),
    );
    return res;
  }

  @ApiOperation({ summary: 'Получение информации о фильмах' })
  @ApiResponse({ status: HttpStatus.ACCEPTED, type: [Film] })
  @Get('/movies')
  async getAllMovies(
    @Query('genres', new ParseArrayPipe({ optional: true, items: String }))
    genres: string[] = [],
    @Query('limit') limit = 0,
    @Query('ofset') ofset = 10,
  ) {
    return this.dispatch('movie', genres, { limit, ofset });
  }

  @ApiOperation({ summary: 'Получение информации о сериалах' })
  @ApiResponse({ status: HttpStatus.ACCEPTED, type: [Film] })
  @Get('/serials')
  async getAllSerials(
    @Query('genres', new ParseArrayPipe({ optional: true, items: String }))
    genres: string[] = [],
    @Query('limit') limit = 0,
    @Query('ofset') ofset = 10,
  ) {
    return this.dispatch('serial', genres, { limit, ofset });
  }

  @ApiOperation({ summary: 'Получение информации о мультфльмах' })
  @ApiResponse({ status: HttpStatus.ACCEPTED, type: [Film] })
  @Get('/cartoons')
  async getAllCartoons(
    @Query('genres', new ParseArrayPipe({ optional: true, items: String }))
    genres: string[] = [],
    @Query('limit') limit = 0,
    @Query('ofset') ofset = 10,
  ) {
    return this.dispatch('cartoon', genres, { limit, ofset });
  }

  async dispatch(genre: string, genres: string[], pagination: PaginationDTO) {
    const res = await firstValueFrom(
      this.filmClient.send(
        { cmd: GET_FILMS },
        {
          genres: genres.concat(genre),
          pagination,
        },
      ),
    );
    return res;
  }

  @ApiOperation({ summary: 'Получение информации о конкретном фильме' })
  @ApiResponse({ status: HttpStatus.ACCEPTED, type: Film })
  @Get('/:id')
  async getFilm(@Param('id', ParseIntPipe) id: number) {
    return await firstValueFrom(
      this.filmClient.send({ cmd: GET_ONE_FILM }, id),
    );
  }

  @UseGuards(RolesGuard)
  @Roles(ADMIN)
  @ApiBearerAuth(BearerAuth)
  @ApiOperation({ summary: 'Обновление информации о фильме' })
  @ApiResponse({
    status: HttpStatus.ACCEPTED,
    type: Promise<ResponseDTO<Film>>,
  })
  @Patch('/:id')
  async updateFilm(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateFilmDTO,
  ): Promise<ResponseDTO<Film>> {
    const payload: UpdateFilmDTO = { ...dto, id };
    return await firstValueFrom(
      this.filmClient.send({ cmd: UPDATE_FILM }, payload),
    );
  }

  @ApiOperation({ summary: 'Добавление рецензии на фильм' })
  @UseGuards(RolesGuard)
  @ApiBearerAuth(BearerAuth)
  @Post('/review')
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
  @Put('/review')
  async updateReview(@Body() dto: SubmitUpdateReview, @Req() request: Request) {
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

  @Delete('/review/:id')
  @ApiOperation({ summary: 'Удаление рецензии на фильм' })
  @UseGuards(RolesGuard)
  @ApiBearerAuth(BearerAuth)
  async deleteReview(@Req() request: Request, @Param('id') id: number) {
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

  @UseGuards(RolesGuard)
  @Roles(ADMIN)
  @ApiBearerAuth(BearerAuth)
  @ApiOperation({ summary: 'Удаление фильма' })
  @ApiResponse({ status: HttpStatus.ACCEPTED, type: DeleteResult })
  @Delete('/:id')
  async deleteFilm(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<DeleteResult> {
    return await firstValueFrom(
      this.filmClient.send(
        {
          cmd: DELETE_FILM,
        },
        id,
      ),
    );
  }

  private async getProfileId(user) {
    return await firstValueFrom(
      this.profileClient.send({ cmd: GET_PROFILE_BY_USER_ID }, user.id),
    );
  }
}

import { ResponseDTO } from '@app/rabbit';
import {
  GET_ONE_FILM,
  CREATE_FILM,
  DELETE_FILM,
  GET_FILMS,
  UPDATE_FILM,
} from '@app/rabbit/events';
import { FILM } from '@app/rabbit/queues';
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
  Film,
  FilmQueryDTO,
  FilmSort,
  PaginationDTO,
  UpdateFilmDTO,
  Rating,
  FilterDTO,
} from '@app/shared';
import { BearerAuth } from '../guards/bearer';

@ApiTags('film')
@Controller('/film')
export class FilmController {
  constructor(@Inject(FILM) private readonly filmClient: ClientProxy) {}

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
    @Query('country') countryName?,
    @Query('director') directorId?: number,
    @Query('actor') actorId?: number,
    @Query('rating') rating?: Rating,
    @Query('marks') marks?: number,
    @Query('sort') sort?: FilmSort,
  ) {
    return this.dispatch(
      { limit, ofset },
      { genres, countryName, directorId, actorId, rating, marks },
      sort,
    );
  }

  @ApiOperation({ summary: 'Получение информации о фильмах' })
  @ApiResponse({ status: HttpStatus.ACCEPTED, type: [Film] })
  @Get('/movies')
  async getAllMovies(
    @Query('genres', new ParseArrayPipe({ optional: true, items: String }))
    genres: string[] = [],
    @Query('limit') limit = 10,
    @Query('ofset') ofset = 0,
    @Query('country') countryName?,
    @Query('director') directorId?: number,
    @Query('actor') actorId?: number,
    @Query('rating') rating?: Rating,
    @Query('marks') marks?: number,
    @Query('sort') sort?: FilmSort,
  ) {
    return this.dispatch(
      { limit, ofset },
      {
        genres: genres.concat('movie'),
        countryName,
        directorId,
        actorId,
        rating,
        marks,
      },
      sort,
    );
  }

  @ApiOperation({ summary: 'Получение информации о сериалах' })
  @ApiResponse({ status: HttpStatus.ACCEPTED, type: [Film] })
  @Get('/serials')
  async getAllSerials(
    @Query('genres', new ParseArrayPipe({ optional: true, items: String }))
    genres: string[] = [],
    @Query('limit') limit = 10,
    @Query('ofset') ofset = 0,
    @Query('country') countryName?: string,
    @Query('director') directorId?: number,
    @Query('actor') actorId?: number,
    @Query('rating') rating?: Rating,
    @Query('marks') marks?: number,
    @Query('sort') sort?: FilmSort,
  ) {
    return this.dispatch(
      { limit, ofset },
      {
        genres: genres.concat('serial'),
        countryName,
        directorId,
        actorId,
        rating,
        marks,
      },
      sort,
    );
  }

  @ApiOperation({ summary: 'Получение информации о мультфльмах' })
  @ApiResponse({ status: HttpStatus.ACCEPTED, type: [Film] })
  @Get('/cartoons')
  async getAllCartoons(
    @Query('genres', new ParseArrayPipe({ optional: true, items: String }))
    genres: string[] = [],
    @Query('limit') limit = 0,
    @Query('ofset') ofset = 10,
    @Query('country') countryName?,
    @Query('director') directorId?: number,
    @Query('actor') actorId?: number,
    @Query('rating') rating?: Rating,
    @Query('marks') marks?: number,
    @Query('sort') sort?: FilmSort,
  ) {
    return this.dispatch(
      { limit, ofset },
      {
        genres: genres.concat('cartoon'),
        countryName,
        directorId,
        actorId,
        rating,
        marks,
      },
      sort,
    );
  }

  async dispatch(pagination: PaginationDTO, filter: FilterDTO, sort: FilmSort) {
    const payload: FilmQueryDTO = {
      pagination,
      filter,
      sort,
    };
    const res = await firstValueFrom(
      this.filmClient.send({ cmd: GET_FILMS }, payload),
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
}

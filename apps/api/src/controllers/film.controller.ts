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
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { firstValueFrom } from 'rxjs';
import { DeleteResult } from 'typeorm';
import { RolesGuard } from '../guards/roles.guard';
import { ADMIN } from '@app/shared/constants/role-guard.const';
import { Roles } from '../guards/roles-auth.decorator';
import { CreateFilmDTO, Film, PaginationDTO, UpdateFilmDTO } from '@app/shared';


@ApiTags('film')
@Controller('film')
export class FilmController {
  constructor(@Inject(FILM) private readonly client: ClientProxy) {}

  @UseGuards(RolesGuard)
  @Roles(ADMIN)
  @ApiOperation({ summary: 'Создание фильма' })
  @ApiResponse({ status: HttpStatus.CREATED, type: Promise<ResponseDTO<Film>> })
  @Post()
  async createFilm(@Body() dto): Promise<ResponseDTO<Film>> {
    return await firstValueFrom(
      this.client.send(
        {
          cmd: CREATE_FILM,
        },
        dto,
      ),
    );
  }

  @ApiOperation({ summary: 'Получение информации о всей кинопродукции' })
  @ApiResponse({ status: HttpStatus.ACCEPTED, type: [Film] })
  @Get()
  async getAll(
    @Query('genres', new ParseArrayPipe({ optional: true, items: String }))
    genres: string[] = [],
    @Query('limit') limit = 0,
    @Query('ofset') ofset = 10,
  ) {
    const res = await firstValueFrom(
      this.client.send(
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
      this.client.send(
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
    return await firstValueFrom(this.client.send({ cmd: GET_ONE_FILM }, id));
  }

  @UseGuards(RolesGuard)
  @Roles(ADMIN)
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
    return await firstValueFrom(this.client.send({ cmd: UPDATE_FILM }, payload));
  }

  @UseGuards(RolesGuard)
  @Roles(ADMIN)
  @ApiOperation({ summary: 'Удаление фильма' })
  @ApiResponse({ status: HttpStatus.ACCEPTED, type: DeleteResult })
  @Delete('/:id')
  async deleteFilm(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<DeleteResult> {
    return await firstValueFrom(
      this.client.send(
        {
          cmd: DELETE_FILM,
        },
        id,
      ),
    );
  }
}

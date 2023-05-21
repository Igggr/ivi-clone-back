import { ResponseDTO } from '@app/rabbit';
import {
  GET_ONE_FILM,
  CREATE_FILM,
  DELETE_FILM,
  GET_FILMS,
  UPDATE_FILM,
} from '@app/rabbit/events';
import { FILM } from '@app/rabbit/queues';
import { Film } from '@app/shared';
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
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { firstValueFrom } from 'rxjs';
import { DeleteResult } from 'typeorm';
import { RolesGuard } from '../guards/roles.guard';
import { ADMIN } from '@app/shared/constants/role-guard.const';
import { Roles } from '../guards/roles-auth.decorator';

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

  @ApiOperation({ summary: 'Получение информации о фильмах' })
  @ApiResponse({ status: HttpStatus.ACCEPTED, type: [Film] })
  @Get('/movies')
  async getAll(
    @Query('genres') genres: string[],
    @Query('limit') limit: number,
    @Query('ofset') ofset: number,
  ) {
    const res = await firstValueFrom(
      this.client.send(
        { cmd: GET_FILMS },
        { genres, pagination: { limit, ofset } },
      ),
    );
    return res;
  }

  @ApiOperation({ summary: 'Получение информации о фильмах' })
  @ApiResponse({ status: HttpStatus.ACCEPTED, type: [Film] })
  @Get('/movies')
  async getAllMovies(
    @Query('genres') genres: string[],
    @Query('limit') limit: number,
    @Query('ofset') ofset: number,
  ) {
    const res = await firstValueFrom(
      this.client.send(
        { cmd: GET_FILMS },
        { genres: [...genres, 'movie'], pagination: { limit, ofset } },
      ),
    );
    return res;
  }

  @ApiOperation({ summary: 'Получение информации о сериалах' })
  @ApiResponse({ status: HttpStatus.ACCEPTED, type: [Film] })
  @Get('/serials')
  async getAllSerials(
    @Query('genres') genres: string[],
    @Query('limit') limit: number,
    @Query('ofset') ofset: number,
  ) {
    const res = await firstValueFrom(
      this.client.send(
        { cmd: GET_FILMS },
        { genres: [...genres, 'serial'], pagination: { limit, ofset } },
      ),
    );
    return res;
  }

  @ApiOperation({ summary: 'Получение информации о мультфльмах' })
  @ApiResponse({ status: HttpStatus.ACCEPTED, type: [Film] })
  @Get('/cartoons')
  async getAllCartoons(
    @Query('genres') genres: string[],
    @Query('limit') limit: number,
    @Query('ofset') ofset: number,
  ) {
    const res = await firstValueFrom(
      this.client.send(
        { cmd: GET_FILMS },
        { genres: [...genres, 'serial'], pagination: { limit, ofset } },
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
    @Body() dto,
  ): Promise<ResponseDTO<Film>> {
    return await firstValueFrom(this.client.send({ cmd: UPDATE_FILM }, dto));
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

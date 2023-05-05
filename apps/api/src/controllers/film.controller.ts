import { GET_FILMS } from '@app/rabbit/events';
import { FILM } from '@app/rabbit/queues';
import { Film } from '@app/shared';
import { Controller, Get, HttpStatus, Inject, Query } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { firstValueFrom } from 'rxjs';

@ApiTags('film')
@Controller('film')
export class FilmController {
  constructor(@Inject(FILM) private readonly client: ClientProxy) {}

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
}

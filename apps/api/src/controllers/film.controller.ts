import { GET_FILMS } from '@app/rabbit/events';
import { FILM } from '@app/rabbit/queues';
import { Film, PaginationDTO } from '@app/shared';
import { Controller, Get, HttpStatus, Inject, ParseArrayPipe, Query } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { firstValueFrom } from 'rxjs';

@ApiTags('film')
@Controller('film')
export class FilmController {
  constructor(@Inject(FILM) private readonly client: ClientProxy) {}

  @ApiOperation({ summary: 'Получение информации о всей кинопродукции' })
  @ApiResponse({ status: HttpStatus.ACCEPTED, type: [Film] })
  @Get()
  async getAll(
    @Query('genres', ParseArrayPipe) genres?: any,
    @Query('limit') limit?: number,
    @Query('ofset') ofset?: number,
  ) {
    const res = await firstValueFrom(
      this.client.send(
        { cmd: GET_FILMS },
        { 
          genres: genres,
          pagination: { limit, ofset }
         },
      ),
    );
    return res;
  }

  @ApiOperation({ summary: 'Получение информации о фильмах' })
  @ApiResponse({ status: HttpStatus.ACCEPTED, type: [Film] })
  @Get('/movies')
  async getAllMovies(
    @Query('genres', ParseArrayPipe) genres?: string[],
    @Query('limit') limit?: number,
    @Query('ofset') ofset?: number,
  ) {
    return this.dispatch('movie', genres, { limit, ofset });
  }

  @ApiOperation({ summary: 'Получение информации о сериалах' })
  @ApiResponse({ status: HttpStatus.ACCEPTED, type: [Film] })
  @Get('/serials')
  async getAllSerials(
    @Query('genres', ParseArrayPipe) genres?: any,
    @Query('limit') limit?: number,
    @Query('ofset') ofset?: number,
  ) {
    return this.dispatch('serial', genres, { limit, ofset });
  }

  @ApiOperation({ summary: 'Получение информации о мультфльмах' })
  @ApiResponse({ status: HttpStatus.ACCEPTED, type: [Film] })
  @Get('/cartoons')
  async getAllCartoons(
    @Query('genres', ParseArrayPipe) genres: any,
    @Query('limit') limit: number,
    @Query('ofset') ofset: number,
  ) {
    return this.dispatch('cartoon', genres, { limit, ofset });
  }

  async dispatch(genre: string, genres: string[], pagination: PaginationDTO) {
    const res = await firstValueFrom(
      this.client.send(
        { cmd: GET_FILMS },
        {
          genres: genres
            ? genres.concat(genre)
            : [genre],
          pagination
        },
      ),
    );
    return res;
  }
}

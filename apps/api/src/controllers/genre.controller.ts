import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../guards/roles-auth.decorator';
import { ADMIN } from '@app/shared/constants/role-guard.const';
import { GENRE, GET_GENRES, GET_GENRE_BY_ID, UPDATE_GENRE } from '@app/rabbit';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { Genre, UpdateGenreDto } from '@app/shared';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('genre')
@Controller('genre')
export class GenreController {
  constructor(@Inject(GENRE) private client: ClientProxy) {}

  @Get()
  async getAllGenres(): Promise<Genre[]> {
    return await firstValueFrom(
      this.client.send(
        {
          cmd: GET_GENRES,
        },
        {},
      ),
    );
  }

  @Get('/:id')
  async getOneGenre(@Param('id', ParseIntPipe) id: number) {
    return await firstValueFrom(this.client.send({ cmd: GET_GENRE_BY_ID }, id));
  }

  @UseGuards(RolesGuard)
  @Roles(ADMIN)
  @Post('')
  async updateGenre(@Body() dto: UpdateGenreDto): Promise<Genre> {
    return await firstValueFrom(
      this.client.send(
        {
          cmd: UPDATE_GENRE,
        },
        dto,
      ),
    );
  }
}

import { Module } from '@nestjs/common';
import { GenreController } from './genre.controller';
import { GenreService } from './genre.service';
import { DatabaseModule } from '@app/database';
import { Genre } from '@app/shared';

@Module({
  imports: [
    DatabaseModule.forRoot([Genre])
  ],
  controllers: [GenreController],
  providers: [GenreService],
})
export class GenreModule {}

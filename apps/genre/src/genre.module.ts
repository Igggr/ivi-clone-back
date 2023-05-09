import { Module } from '@nestjs/common';
import { GenreController } from './genre.controller';
import { GenreService } from './genre.service';
import { DatabaseModule, db_schema } from '@app/database';
import { Genre } from '@app/shared';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: './apps/genre/.env',
      validationSchema: db_schema,
    }),
    ...DatabaseModule.forRoot([Genre]),
  ],
  controllers: [GenreController],
  providers: [GenreService],
})
export class GenreModule {}

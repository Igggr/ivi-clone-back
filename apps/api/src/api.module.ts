import { Module } from '@nestjs/common';
import { ApiController } from './controllers/api.controller';
import { ApiService } from './api.service';
import { FilmController } from './/controllers/film.controller';
import { ClientsModule } from '@nestjs/microservices';
import { OPTIONS } from '@app/rabbit';
import { FILM } from '@app/rabbit/queues';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: FILM,
        ...OPTIONS(FILM),
      },
    ]),
  ],
  controllers: [ApiController, FilmController],
  providers: [ApiService],
})
export class ApiModule {}

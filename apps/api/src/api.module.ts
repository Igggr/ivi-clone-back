import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { FILM } from '@app/rabbit/queues';
import { RABIT_OPTIONS } from '@app/rabbit';
import { FilmController } from './controllers/film.controller';
import { JwtMiddleware } from './utils/jwt-middleware';
import { AuthController } from './controllers/auth.controller';
import { ClientsModule } from '@nestjs/microservices';
import { ConfigModule } from '@nestjs/config';
import { ProfilesController } from './controllers/profile.controller';
import { PassportModule } from '@nestjs/passport';
import { GoogleStrategy } from './utils/google.strategy';
import { SessionSerializer } from './utils/serializer';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
    }),
    ClientsModule.register([
      {
        name: FILM,
        ...RABIT_OPTIONS(FILM),
      },
    ]),
    ClientsModule.register([
      {
        name: 'AUTH',
        ...RABIT_OPTIONS('auth'),
      },
    ]),
    ClientsModule.register([
      {
        name: 'PROFILES',
        ...RABIT_OPTIONS('profiles'),
      },
    ]),
    PassportModule.register({ session: true }),
  ],
  controllers: [AuthController, ProfilesController, FilmController],
  providers: [GoogleStrategy, SessionSerializer],
})
export class ApiModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(JwtMiddleware).forRoutes(ProfilesController, AuthController);
  }
}

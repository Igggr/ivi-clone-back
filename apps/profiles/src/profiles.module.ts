import { Module } from '@nestjs/common';
import { ProfilesController } from './profiles.controller';
import { ProfilesService } from './profiles.service';
import { Profile } from '@app/shared';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientsModule } from '@nestjs/microservices';
import { ConfigModule } from '@nestjs/config';
import { AUTH, RABIT_OPTIONS } from '@app/rabbit';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5434,
      username: 'admin',
      password: '123456',
      database: 'register_microservice',
      synchronize: true,
      autoLoadEntities: true,
    }),
    ClientsModule.register([
      {
        name: AUTH,
        ...RABIT_OPTIONS(AUTH),
      },
    ]),
    ClientsModule.register([
      {
        name: 'FILES-RECORD',
        ...RABIT_OPTIONS('files'),
      },
    ]),
    TypeOrmModule.forFeature([Profile]),
  ],
  controllers: [ProfilesController],
  providers: [ProfilesService],
})
export class ProfilesModule {}

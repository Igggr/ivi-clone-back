import { Module } from '@nestjs/common';
import { ProfilesController } from './profiles.controller';
import { ProfilesService } from './profiles.service';
import { Profile } from '@app/shared';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientsModule } from '@nestjs/microservices';
import { ConfigModule } from '@nestjs/config';
import { AUTH, FILES_RECORD, RABBIT_OPTIONS } from '@app/rabbit';
import { DatabaseModule, db_schema } from '@app/database';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: './apps/profiles/.env',
      validationSchema: db_schema,
    }),
    ...DatabaseModule.forRoot([Profile]),
    ClientsModule.register([
      {
        name: AUTH,
        ...RABBIT_OPTIONS(AUTH),
      },
    ]),
    ClientsModule.register([
      {
        name: FILES_RECORD,
        ...RABBIT_OPTIONS(FILES_RECORD),
      },
    ]),
    TypeOrmModule.forFeature([Profile]),
  ],
  controllers: [ProfilesController],
  providers: [ProfilesService],
})
export class ProfilesModule {}

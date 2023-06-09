import { Module } from '@nestjs/common';
import { ProfilesController } from './profiles.controller';
import { ProfilesService } from './profiles.service';
import { Profile } from '@app/shared';
import { ClientsModule } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AUTH, FILES_RECORD, RABBIT_OPTIONS } from '@app/rabbit';
import { DatabaseModule, db_schema } from '@app/database';
import { FOR } from '@app/shared/constants/keys';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: './apps/profiles/.env',
      validationSchema: db_schema,
    }),
    ...DatabaseModule.forRoot([Profile]),
    ClientsModule.registerAsync([
      {
        name: AUTH,
        useFactory: (configService: ConfigService) =>
          RABBIT_OPTIONS(AUTH, configService.get<string>(FOR)),
        inject: [ConfigService],
      },
      {
        name: FILES_RECORD,
        useFactory: (configService: ConfigService) =>
          RABBIT_OPTIONS(FILES_RECORD, configService.get<string>(FOR)),
        inject: [ConfigService],
      },
    ]),
  ],
  controllers: [ProfilesController],
  providers: [ProfilesService],
})
export class ProfilesModule {}

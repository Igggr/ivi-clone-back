import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { User } from '@app/shared';
import { JwtModule } from '@nestjs/jwt';
import { UsersService } from './users/users.service';
import { ConfigModule } from '@nestjs/config';
import { Role } from '@app/shared/entities/role.entity';
import { RolesService } from './roles/roles.service';
import { DatabaseModule, db_schema } from '@app/database';
import * as Joi from 'joi';
import { ClientsModule } from '@nestjs/microservices';
import { PROFILES, RABBIT_OPTIONS } from '@app/rabbit';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: './apps/auth/.env',
      validationSchema: Joi.object({
        PRIVATE_KEY: Joi.string().required(),
      }).concat(db_schema),
    }),
    ClientsModule.register([
      {
        name: PROFILES,
        ...RABBIT_OPTIONS(PROFILES),
      },
    ]),
    JwtModule.register({
      secret: process.env.PRIVATE_KEY,
      signOptions: {
        expiresIn: '24h',
      },
    }),
    ...DatabaseModule.forRoot([User, Role]),
  ],
  controllers: [AuthController],
  providers: [AuthService, UsersService, RolesService],
})
export class AuthModule {}

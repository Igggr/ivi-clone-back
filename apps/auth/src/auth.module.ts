import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '@app/shared';
import { JwtModule } from '@nestjs/jwt';
import { UsersService } from './users/users.service';
import { ConfigModule } from '@nestjs/config';
import * as dotenv from 'dotenv';
import { Role } from '@app/shared/entities/role.entity';
import { RolesService } from './roles/roles.service';
import { GoogleUser } from '@app/shared/entities/google-user.entity';
dotenv.config();

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
    }),
    JwtModule.register({
      secret: process.env.PRIVATE_KEY ?? 'SECRET',
      signOptions: {
        expiresIn: '24h',
      },
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5433,
      username: 'admin',
      password: '123456',
      database: 'auth_microservice',
      synchronize: true,
      autoLoadEntities: true,
    }),
    TypeOrmModule.forFeature([User, Role, GoogleUser]),
  ],
  controllers: [AuthController],
  providers: [AuthService, UsersService, RolesService],
})
export class AuthModule {}

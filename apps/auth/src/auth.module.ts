import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '@app/shared/entities/user.entity';
import { JwtModule } from '@nestjs/jwt';
import { UsersService } from './users/users.service';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.PRIVATE_KEY ?? 'SECRET',
      signOptions: {
        expiresIn: '24h',
      },
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'rootroot',
      database: 'auth_microservice',
      synchronize: true,
      autoLoadEntities: true,
    }),
    TypeOrmModule.forFeature([User]),
  ],
  controllers: [AuthController],
  providers: [AuthService, UsersService],
})
export class AuthModule {}

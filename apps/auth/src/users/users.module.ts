import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from '@app/shared/entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [],
  providers: [UsersService],
})
export class AuthModule {}

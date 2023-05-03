import { Module } from '@nestjs/common';
import { FilesRecordController } from './files-record.controller';
import { FilesRecordService } from './files-record.service';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FileRecord } from '@app/shared/entities/file-record.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5435,
      username: 'admin',
      password: '123456',
      database: 'file_microservice',
      synchronize: true,
      autoLoadEntities: true,
    }),
    TypeOrmModule.forFeature([FileRecord]),
  ],
  controllers: [FilesRecordController],
  providers: [FilesRecordService],
})
export class FilesRecordModule {}

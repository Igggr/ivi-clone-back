import { Module } from '@nestjs/common';
import { FilesRecordController } from './files-record.controller';
import { FilesRecordService } from './files-record.service';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FileRecord } from '@app/shared/entities/file-record.entity';
import * as path from 'path';
import { ServeStaticModule } from '@nestjs/serve-static';
import { FilesService } from './files.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
    }),
    ServeStaticModule.forRoot({
      rootPath: path.join(process.cwd(), 'libs', 'static'),
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
  providers: [FilesRecordService, FilesService],
})
export class FilesRecordModule {}

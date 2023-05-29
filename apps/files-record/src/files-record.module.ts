import { Module } from '@nestjs/common';
import { FilesRecordController } from './files-record.controller';
import { FilesRecordService } from './files-record.service';
import { ConfigModule } from '@nestjs/config';
import { FileRecord } from '@app/shared/entities/file-record.entity';
import { FilesService } from './files.service';
import { DatabaseModule, db_schema } from '@app/database';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: './apps/files-record/.env',
      validationSchema: db_schema,
    }),
    ...DatabaseModule.forRoot([FileRecord]),
  ],
  controllers: [FilesRecordController],
  providers: [FilesRecordService, FilesService],
})
export class FilesRecordModule {}

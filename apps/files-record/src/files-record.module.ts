import { Module } from '@nestjs/common';
import { FilesRecordController } from './files-record.controller';
import { FilesRecordService } from './files-record.service';
import { ConfigModule } from '@nestjs/config';
import { FileRecord } from '@app/shared/entities/file-record.entity';
import * as path from 'path';
import { ServeStaticModule } from '@nestjs/serve-static';
import { FilesService } from './files.service';
import { DatabaseModule, db_schema } from '@app/database';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: './apps/files-record/.env',
      validationSchema: db_schema,
    }),
    ServeStaticModule.forRoot({
      rootPath: path.join(
        process.cwd(),
        'apps',
        'files-record',
        'src',
        'static',
      ),
    }),
    ...DatabaseModule.forRoot([FileRecord]),
  ],
  controllers: [FilesRecordController],
  providers: [FilesRecordService, FilesService],
})
export class FilesRecordModule {}

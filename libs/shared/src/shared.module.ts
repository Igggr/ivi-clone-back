import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SharedService } from './shared.service';
import { FilesService } from '../../../apps/files-record/src/files.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
    }),
  ],
  providers: [SharedService, FilesService],
  exports: [SharedService, FilesService],
})
export class SharedModule {}

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SharedService } from './shared.service';
import { FilesService } from './files.service';
import * as path from 'path';
import { ServeStaticModule } from '@nestjs/serve-static';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: './.env',
    }),
    ServeStaticModule.forRoot({
      rootPath: path.join(process.cwd(), '/libs', 'static'),
    }),
  ],
  providers: [SharedService, FilesService],
  exports: [SharedService, FilesService],
})
export class SharedModule {}

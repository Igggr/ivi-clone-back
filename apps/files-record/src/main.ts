import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions } from '@nestjs/microservices';
import { FilesRecordModule } from './files-record.module';
import { FILES_RECORD, RABBIT_OPTIONS } from '@app/rabbit';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    FilesRecordModule,
    RABBIT_OPTIONS(FILES_RECORD, process.env.FOR),
  );
  await app.listen();
}
bootstrap();

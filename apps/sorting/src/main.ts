import { NestFactory } from '@nestjs/core';
import { SortingModule } from './sorting.module';

async function bootstrap() {
  const app = await NestFactory.create(SortingModule);
  await app.listen(3000);
}
bootstrap();

import { NestFactory } from '@nestjs/core';
import { ApiModule } from './api.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(ApiModule);

  const config = new DocumentBuilder()
    .setTitle('Учебный проект')
    .setDescription('Клон kinopoisk-a')
    .setVersion('0.0.0')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'jwt' },
      'defaultBearerAuth',
    )
    .build();

  const documnet = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('/docs', app, documnet);

  app.useGlobalPipes(new ValidationPipe());

  await app.listen(3000);
}
bootstrap();

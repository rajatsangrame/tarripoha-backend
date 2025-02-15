import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as cors from 'cors';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      transformOptions: { enableImplicitConversion: true },
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );
  const config = new DocumentBuilder()
    .setTitle('Tarripoha')
    .setDescription('API description for tarripoha')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('swagger', app, document, {
    jsonDocumentUrl: 'swagger/json',
  });
  SwaggerModule.setup('api', app, document);

  if (process.env.NODE_ENV != 'prod') {
    app.use(
      cors({
        origin: 'http://localhost:3000',
        methods: 'GET,POST,PUT,DELETE',
        allowedHeaders: 'Content-Type, Authorization',
      }),
    );
  }
  await app.listen(3001);
}
bootstrap();

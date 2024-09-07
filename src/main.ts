import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = new DocumentBuilder()
    .setTitle('Tarripoha')
    .setDescription('API description for tarripoha')
    .setVersion('1.0')
    .addTag('tarripoha')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('swagger', app, document, {
    jsonDocumentUrl: 'swagger/json',
  });
  SwaggerModule.setup('api', app, document);
  await app.listen(3001);
}
bootstrap();

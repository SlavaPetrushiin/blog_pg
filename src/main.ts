import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { useContainer } from 'class-validator';
import * as cookieParser from 'cookie-parser';

const optionsValidationPipe = {
  stopAtFirstError: true,
  transform: true,
};

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  useContainer(app.select(AppModule), { fallbackOnErrors: true });
  app.use(cookieParser());
  app.useGlobalPipes(new ValidationPipe(optionsValidationPipe));
  app.enableCors();
  await app.listen(3000);
}
bootstrap();

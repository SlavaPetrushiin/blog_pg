import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { useContainer } from 'class-validator';

const optionsValidationPipe = {
  stopAtFirstError: true,
  transform: true,
};

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  useContainer(app.select(AppModule), { fallbackOnErrors: true });
  app.useGlobalPipes(new ValidationPipe(optionsValidationPipe));
  await app.listen(3000);
}
bootstrap();

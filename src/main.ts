import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

const optionsValidationPipe = {
  stopAtFirstError: true,
  transform: true,
};

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe(optionsValidationPipe));
  await app.listen(3000);
}
bootstrap();

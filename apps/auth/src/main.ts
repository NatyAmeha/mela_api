import { NestFactory } from '@nestjs/core';
import { AuthModule } from './auth/auth.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ValidationPipe } from '@nestjs/common';
import { AppLogger } from '@app/logger';
import { AuthServiceExceptionHandler } from '@app/common/errors/exception_handler';

async function bootstrap() {
  // const app = await NestFactory.createMicroservice<MicroserviceOptions>(AuthModule, {transport : Transport.RMQ , });
  const app = await NestFactory.create(AuthModule, { bufferLogs: true })
  app.useGlobalPipes(new ValidationPipe({
    // whitelist: true,
    // forbidNonWhitelisted: true,
    transform: true,
  }))
  app.useGlobalFilters(new AuthServiceExceptionHandler())
  app.useLogger(app.get(AppLogger))
  await app.listen(3000);
}
bootstrap();

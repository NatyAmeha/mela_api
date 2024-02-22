import { NestFactory } from '@nestjs/core';
import { AuthModule } from './auth/auth.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ValidationPipe } from '@nestjs/common';
import { AppLogger } from '@app/logger';
import { AuthServiceExceptionHandler } from '@app/common/errors/exception_handler';
import { RequestValidationException } from '@app/common/errors/request_validation_exception';

async function bootstrap() {
  // const app = await NestFactory.createMicroservice<MicroserviceOptions>(AuthModule, {transport : Transport.RMQ , });
  const app = await NestFactory.create(AuthModule, { bufferLogs: true })
  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    transformOptions: { enableImplicitConversion: true },

    exceptionFactory: (errors) => {
      throw new RequestValidationException({ validationErrors: errors });
    },
  }))
  app.useGlobalFilters(new AuthServiceExceptionHandler())
  app.useLogger(app.get(AppLogger))
  await app.listen(3000);
}
bootstrap();

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { RequestValidationException } from '@app/common/errors/request_validation_exception';
import { GqlExceptionHandler } from '@app/common/errors/exception_handler';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    transformOptions: { enableImplicitConversion: true },
    exceptionFactory: (errors) => {
      throw new RequestValidationException({ validationErrors: errors });
    },
  }))
  app.useGlobalFilters(new GqlExceptionHandler())
  app.enableCors()
  await app.listen(3000);
}
bootstrap();

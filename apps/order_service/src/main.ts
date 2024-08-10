import { NestFactory } from '@nestjs/core';
import { OrderServiceModule } from './order_service.module';
import { AppLogger } from '@app/logger';
import { RequestValidationException } from '@app/common/errors/request_validation_exception';
import { ValidationPipe } from '@nestjs/common';
import { GqlExceptionHandler } from '@app/common/errors/exception_handler';

async function bootstrap() {
  const app = await NestFactory.create(OrderServiceModule);
  app.useGlobalPipes(new ValidationPipe(
    {
      transform: true,
      transformOptions: { enableImplicitConversion: true },
      exceptionFactory: (errors) => {
        throw new RequestValidationException({ validationErrors: errors });
      },
    }
  ),)
  app.useGlobalFilters(new GqlExceptionHandler())
  app.useLogger(app.get(AppLogger))
  app.enableCors()
  await app.listen(3004);
}
bootstrap();

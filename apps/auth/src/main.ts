import { NestFactory } from '@nestjs/core';
import { AuthModule } from './auth/auth.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ValidationPipe } from '@nestjs/common';
import { AppLogger } from '@app/logger';
import { GqlExceptionHandler } from '@app/common/errors/exception_handler';
import { RequestValidationException } from '@app/common/errors/request_validation_exception';
import { configuration } from '../auth_configuration';
import { ConfigService } from '@nestjs/config';

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
  app.useGlobalFilters(new GqlExceptionHandler())
  app.useLogger(app.get(AppLogger))
  // var rmqService = app.get<RmqService>(RmqService);
  // const config = app.get<ConfigService>(ConfigService);
  // var queueName = config.get<string>("rmq.rmq_config.queue")
  // app.connectMicroservice(rmqService.getOption(queueName));
  // await app.startAllMicroservices();
  await app.listen(3002);
}
bootstrap();

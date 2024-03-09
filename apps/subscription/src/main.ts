import { NestFactory } from "@nestjs/core";
import { SubscriptionModule } from "./subscription.module";
import { ValidationPipe } from "@nestjs/common";
import { RequestValidationException } from "@app/common/errors/request_validation_exception";
import { AppLogger } from "@app/logger";
import { GqlExceptionHandler } from "@app/common/errors/exception_handler";
import { MicroserviceOptions, Transport } from "@nestjs/microservices";
import { Subscriptionconfiguration } from "../subscription_service.config";
import { ConfigService } from "@nestjs/config";

async function bootstrap() {
  // app instance for Subgraph
  const app = await NestFactory.create(SubscriptionModule, { bufferLogs: true })
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
  await app.listen(3001);
}
bootstrap(); 
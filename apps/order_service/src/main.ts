import { NestFactory } from '@nestjs/core';
import { OrderServiceModule } from './order_service.module';

async function bootstrap() {
  const app = await NestFactory.create(OrderServiceModule);
  await app.listen(3000);
}
bootstrap();

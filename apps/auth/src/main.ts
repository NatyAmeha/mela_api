import { NestFactory } from '@nestjs/core';
import { AuthModule } from './auth/auth.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  // const app = await NestFactory.createMicroservice<MicroserviceOptions>(AuthModule, {transport : Transport.RMQ , });
  const app = await NestFactory.create(AuthModule)
  await app.listen(3000);
}
bootstrap();

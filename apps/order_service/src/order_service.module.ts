import { Module } from '@nestjs/common';
import { OrderServiceController } from './order_service.controller';
import { OrderServiceService } from './order_service.service';

@Module({
  imports: [],
  controllers: [OrderServiceController],
  providers: [OrderServiceService],
})
export class OrderServiceModule {}

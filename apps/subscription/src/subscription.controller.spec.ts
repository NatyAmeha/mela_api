import { Test, TestingModule } from '@nestjs/testing';
import { SubscriptionResolver } from './subscription.resolver';
import { SubscriptionService } from './subscription.service';

describe('SubscriptionController', () => {
  let subscriptionController: SubscriptionResolver;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [SubscriptionResolver],
      providers: [SubscriptionService],
    }).compile();

    subscriptionController = app.get<SubscriptionResolver>(SubscriptionResolver);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(subscriptionController.getHello()).toBe('Hello World!');
    });
  });
});

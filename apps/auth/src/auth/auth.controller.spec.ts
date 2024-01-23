import { Test, TestingModule } from '@nestjs/testing';
import { AuthResolver } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let authController: AuthResolver;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AuthResolver],
      providers: [AuthService],
    }).compile();

    authController = app.get<AuthResolver>(AuthResolver);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      // expect(authController.getUser()).toBe('Hello World!');
    });
  });
});

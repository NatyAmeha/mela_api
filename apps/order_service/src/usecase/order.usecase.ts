import { Inject, Injectable } from "@nestjs/common";
import { IOrderRepository, OrderRepository } from "../repo/order_repository";
import { CartRepository, ICartRepository } from "../repo/cart.repository";
import { CreateOrderItemInput } from "../dto/order_item.input";
import { ClassDecoratorValidator } from "@app/common/validation_utils/class_decorator.validator";
import { IValidator } from "@app/common/validation_utils/validator.interface";
import { CreateCartInput } from "../dto/cart.input";
import { Cart } from "../model/cart.model";
import { OrderResponse, OrderResponseBuilder } from "../dto/response/order.reponse";

@Injectable()
export class OrderService {
    constructor(
        @Inject(OrderRepository.injectName) private orderRepo: IOrderRepository,
        @Inject(CartRepository.injectName) private cartRepo: ICartRepository,
        @Inject(ClassDecoratorValidator.injectName) private inputValidator: IValidator,
    ) { }


    async getUserCarts(userId: string): Promise<OrderResponse> {
        const result = await this.cartRepo.getUserCarts(userId);
        return new OrderResponseBuilder().withCarts(result).build();
    }

    async addToBusinessCart(businessId: string, userId: string, cartInput: CreateCartInput): Promise<OrderResponse> {
        await this.inputValidator.validateArrayInput(cartInput.items, CreateOrderItemInput);
        const cartInfo = Cart.createCartInfo(businessId, userId, cartInput);
        const result = await this.cartRepo.addOrUpdateProductToCart(cartInfo);
        return new OrderResponseBuilder().withCart(result).build();
    }

    async removeItemsFromCart(cartId: string, userId: string, productIds: string[]): Promise<OrderResponse> {
        const result = await this.cartRepo.removeItemsFromCart(cartId, userId, productIds);
        return new OrderResponseBuilder().withCart(result).build();
    }

}
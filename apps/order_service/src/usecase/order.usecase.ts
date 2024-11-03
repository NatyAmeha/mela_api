import { Inject, Injectable } from "@nestjs/common";
import { IOrderRepository, OrderRepository } from "../repo/order_repository";
import { CartRepository, ICartRepository } from "../repo/cart.repository";
import { CreateOrderItemInput } from "../dto/order_item.input";
import { ClassDecoratorValidator } from "@app/common/validation_utils/class_decorator.validator";
import { IValidator } from "@app/common/validation_utils/validator.interface";
import { CreateCartInput } from "../dto/cart.input";
import { Cart } from "../model/cart.model";
import { OrderResponse, OrderResponseBuilder } from "../model/response/order.reponse";
import { CreateOrderInput } from "../dto/order.input";
import { Order, OrderBuilder, OrderStatus } from "../model/order.model";
import { PrismaTransaction } from "@app/common/datasource_helper/transaction_manager.interface";
import { Customer } from "../customer/model/customer.model";
import { User } from "apps/auth/src/auth/model/user.model";
import { CustomerRepository, ICustomerRepository } from "../customer/repo/customer.repository";
import { LoyaltyRepository, ILoyaltyRepository } from "../loyalty/repo/loyalty.repository";

@Injectable()
export class OrderService {
    constructor(
        @Inject(OrderRepository.injectName) private orderRepo: IOrderRepository,
        @Inject(CartRepository.injectName) private cartRepo: ICartRepository,
        @Inject(CustomerRepository.injectName) private customerRepository: ICustomerRepository,
        @Inject(ClassDecoratorValidator.injectName) private inputValidator: IValidator,
        @Inject(LoyaltyRepository.injectName) private loyaltyRepository: ILoyaltyRepository,
        private transactionManager: PrismaTransaction
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

    async placeOrderFromPOS(businessId: string, orderInput: CreateOrderInput, customerId: string): Promise<OrderResponse> {
        await this.inputValidator.validateArrayInput(orderInput.items, CreateOrderItemInput);
        let customerInfo
        if (customerId) {
            customerInfo = await this.customerRepository.getCustomer(customerId)
        }
        else if (orderInput.customerPhoneNumber && orderInput.customerName) {
            customerInfo = Customer.newCustomerInfo(orderInput.customerName, orderInput.customerPhoneNumber, businessId)
            customerInfo = await this.customerRepository.addOrGetCustomer(customerInfo)
        }
        const orderInfo = new OrderBuilder()
            .createOrderFromPOS(businessId, customerInfo)
            .withItems(orderInput.items)
            .withPaymentInfo(orderInput.paymentType, { remainingAmount: orderInput.remainingAmount, subtotal: orderInput.subTotal, totalAmount: orderInput.totalAmount, paidAmount: orderInput.paidAmount, paymentMethods: orderInput.paymentMethods })
            .withAdditionalInfo({ note: orderInput.note }).build();

        const orderCreateResult = await this.transactionManager.execute(this.orderRepo, async (transactionContext) => {
            this.orderRepo.addTransactionClient(transactionContext);
            this.customerRepository.addTransactionClient(transactionContext);
            this.loyaltyRepository.addTransactionClient(transactionContext);
            const orderCreateResult = await this.orderRepo.createOrderInfo(orderInfo);
            // handle customer loyalty

            const businessId = orderCreateResult.businessId[0]
            customerInfo = await this.customerRepository.addOrGetCustomer(customerInfo)
            // deduct loyalty points from customer
            const appliedRewards = orderCreateResult.getAppliedRewards()
            if (appliedRewards?.length > 0) {
                const usedRewardPoints = await this.loyaltyRepository.getRewardsPoints(appliedRewards)
                const customerLoyaltyInfo = await this.loyaltyRepository.deductLoayltyPoints(customerInfo.id, customerInfo.businessId, usedRewardPoints)
            }

            // apply loyalty points to customer
            const totalEarnedPoints = orderCreateResult.getPoints()
            if (totalEarnedPoints > 0) {
                const customerLoyaltyName = 'default'
                const customerLoyaltyInfo = await this.loyaltyRepository.addOrGetCustomerLoyalty(customerInfo.id, customerInfo.businessId)
                await this.loyaltyRepository.addPointsToCustomerLoyalty(customerLoyaltyInfo.customerId, customerLoyaltyInfo.businessId, totalEarnedPoints)
            }
            console.log('totalEarnedPoints', totalEarnedPoints)
            return new OrderResponseBuilder().withOrder(orderCreateResult).build();
        });

        return orderCreateResult;
    }

    async placeOrderForBusiness(currentUser: User, businessIds: string[], orderInput: CreateOrderInput): Promise<OrderResponse> {
        await this.inputValidator.validateArrayInput(orderInput.items, CreateOrderItemInput);
        const orderInfo = new OrderBuilder()
            .createOrderFromOnlineStore(currentUser.id, businessIds)
            .withItems(orderInput.items, orderInput.config)
            .withPaymentInfo(orderInput.paymentType, { remainingAmount: orderInput.remainingAmount, subtotal: orderInput.subTotal, totalAmount: orderInput.totalAmount, paidAmount: orderInput.paidAmount, paymentMethods: orderInput.paymentMethods })
            .withAdditionalInfo({ note: orderInput.note }).build();

        console.log('payment methods', orderInfo.paymentMethods)

        const orderCreateResult = await this.transactionManager.execute(this.orderRepo, async (transactionContext) => {
            this.orderRepo.addTransactionClient(transactionContext);
            this.customerRepository.addTransactionClient(transactionContext);
            this.loyaltyRepository.addTransactionClient(transactionContext);
            const orderCreateResult = await this.orderRepo.createOrderInfo(orderInfo);
            // handle customer loyalty

            const businessId = orderCreateResult.businessId[0]
            let customerInfo = Customer.getCurrentUserAsCustomer(currentUser, businessId)
            customerInfo = await this.customerRepository.addOrGetCustomer(customerInfo)
            console.log('customerInfo', customerInfo)
            // deduct loyalty points from customer
            const appliedRewards = orderCreateResult.getAppliedRewards()
            if (appliedRewards?.length > 0) {
                const usedRewardPoints = await this.loyaltyRepository.getRewardsPoints(appliedRewards)
                const customerLoyaltyInfo = await this.loyaltyRepository.deductLoayltyPoints(customerInfo.id, customerInfo.businessId, usedRewardPoints)
            }

            // apply loyalty points to customer
            const totalEarnedPoints = orderCreateResult.getPoints()
            if (totalEarnedPoints > 0) {
                const customerLoyaltyName = 'default'
                const customerLoyaltyInfo = await this.loyaltyRepository.addOrGetCustomerLoyalty(customerInfo.id, customerInfo.businessId)
                await this.loyaltyRepository.addPointsToCustomerLoyalty(customerLoyaltyInfo.customerId, customerLoyaltyInfo.businessId, totalEarnedPoints)
            }
            console.log('totalEarnedPoints', totalEarnedPoints)
            return new OrderResponseBuilder().withOrder(orderCreateResult).build();
        });

        return orderCreateResult;
    }

    async getUserOrders(userId: string): Promise<OrderResponse> {
        const result = await this.orderRepo.getUserOrders(userId);
        return new OrderResponseBuilder().withOrders(result).build();
    }

    async getBranchOrders(branchId: string): Promise<OrderResponse> {
        const result = await this.orderRepo.getBranchOrders(branchId);
        return new OrderResponseBuilder().withOrders(result).build();
    }

    async getOrderDetails(orderId: string): Promise<OrderResponse> {
        const result = await this.orderRepo.getOrderById(orderId);
        return new OrderResponseBuilder().withOrder(result).build();
    }

    async updateOrderStatus(orderId: string, status: string): Promise<OrderResponse> {
        const result = await this.orderRepo.updateOrderStatus(orderId, status as OrderStatus);
        return new OrderResponseBuilder().withOrder(result).build();
    }




}
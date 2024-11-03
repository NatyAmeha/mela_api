import { Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { Order, OrderStatus } from "../model/order.model";
import { PrismaClient } from "apps/order_service/prisma/generated/prisma_order_client";
import { PrismaException } from "@app/common/errors/prisma_exception";
import { RequestValidationException } from "@app/common/errors/request_validation_exception";

export interface IOrderRepository {
    addTransactionClient: (client: PrismaClient) => void
    createOrderInfo(orderIInfo: Order): Promise<Order>
    getUserOrders(userId: string): Promise<Order[]>
    getBranchOrders(branchId: string): Promise<Order[]>
    getOrderById(orderId: string): Promise<Order>
    updateOrderStatus(orderId: string, status: OrderStatus): Promise<Order>

}

@Injectable()
export class OrderRepository extends PrismaClient implements OnModuleInit, OnModuleDestroy, IOrderRepository {
    static injectName = 'ORDER_REPOSITORY'


    transactionClient: PrismaClient | null

    addTransactionClient(client: PrismaClient): void {
        this.transactionClient = client;
    }

    async onModuleInit() {
        await this.$connect()
    }



    async createOrderInfo(orderInfo: Order): Promise<Order> {
        try {
            const { paymentMethods, ...orderData } = orderInfo
            const orderCreateResult = await (this.transactionClient ?? this).order.create({ data: { ...orderData, paymentMethods: paymentMethods } })
            this.transactionClient?.$disconnect()
            return new Order({ ...orderCreateResult })
        } catch (ex) {
            console.log(ex)
            throw new PrismaException({ message: ex.message, code: ex.code, meta: ex.meta })
        }
    }


    async getUserOrders(userId: string): Promise<Order[]> {
        try {

            const orders = await (this.transactionClient || this).order.findMany({ where: { userId: userId } })
            return orders.map(order => new Order({ ...order }))
        } catch (error) {
            throw new PrismaException({ message: error.message, code: error.code, meta: error.meta })
        }
    }

    async getOrderById(orderId: string): Promise<Order> {
        try {
            const order = await (this.transactionClient || this).order.findUnique({ where: { id: orderId } })
            return new Order({ ...order })
        } catch (error) {
            throw new PrismaException({ message: error.message, code: error.code, meta: error.meta })
        }
    }

    async getBranchOrders(branchId: string): Promise<Order[]> {
        try {
            const orders = await this.order.findMany({ where: { branchId: branchId } })
            return orders.map(order => new Order({ ...order }))
        } catch (error) {
            throw new PrismaException({ message: error.message, code: error.code, meta: error.meta })
        }
    }


    async updateOrderStatus(orderId: string, status: OrderStatus): Promise<Order> {
        try {
            const orderInfo = await this.order.findFirst({ where: { id: orderId } })
            if (!orderInfo.id) {
                throw new RequestValidationException({ message: "Order not found" })
            }
            const updatedOrder = await this.order.update({ where: { id: orderId }, data: { status: status } })
            return new Order({ ...updatedOrder })
        } catch (error) {
            throw new PrismaException({ message: error.message, code: error.code, meta: error.meta })
        }
    }

    async onModuleDestroy() {
        await this.$disconnect()
    }

}
import { Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { Order } from "../model/order.model";
import { PrismaClient } from "apps/order_service/prisma/generated/prisma_order_client";
import { PrismaException } from "@app/common/errors/prisma_exception";

export interface IOrderRepository {
    createOrderInfo(orderIInfo: Order): Promise<Order>
    getUserOrders(userId: string): Promise<Order[]>
    getOrderById(orderId: string): Promise<Order>

}

@Injectable()
export class OrderRepository extends PrismaClient implements OnModuleInit, OnModuleDestroy, IOrderRepository {
    static injectName = 'ORDER_REPOSITORY'

    async onModuleInit() {
        await this.$connect()
    }

    async createOrderInfo(orderInfo: Order): Promise<Order> {
        try {
            const orderCreateResult = await this.order.create({ data: { ...orderInfo } })
            return new Order({ ...orderCreateResult })
        } catch (ex) {
            console.log(ex)
            throw new PrismaException({ message: ex.message, code: ex.code, meta: ex.meta })
        }
    }


    async getUserOrders(userId: string): Promise<Order[]> {
        try {
            const orders = await this.order.findMany({ where: { userId: userId } })
            return orders.map(order => new Order({ ...order }))
        } catch (error) {
            throw new PrismaException({ message: error.message, code: error.code, meta: error.meta })
        }
    }

    async getOrderById(orderId: string): Promise<Order> {
        try {
            const order = await this.order.findUnique({ where: { id: orderId } })
            return new Order({ ...order })
        } catch (error) {
            throw new PrismaException({ message: error.message, code: error.code, meta: error.meta })
        }
    }

    async onModuleDestroy() {
        await this.$disconnect()
    }

}
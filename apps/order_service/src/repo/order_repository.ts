import { Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { Order } from "../model/order.model";
import { PrismaClient } from "apps/order_service/prisma/generated/prisma_order_client";
import { PrismaException } from "@app/common/errors/prisma_exception";

export interface IOrderRepository {
    createOrderInfo(orderIInfo: Order): Promise<Order>

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

    async onModuleDestroy() {
        await this.$disconnect()
    }

}
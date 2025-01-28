import { Injectable, OnModuleDestroy, OnModuleInit, Scope } from "@nestjs/common";
import { Order, OrderPaymentMethod, OrderStatus } from "../model/order.model";
import { PrismaClient } from "apps/order_service/prisma/generated/prisma_order_client";
import { PrismaException } from "@app/common/errors/prisma_exception";
import { RequestValidationException } from "@app/common/errors/request_validation_exception";
import { AddonUsage, OrderIdInfo } from "../model/addon_usage.model";
import { first, groupBy } from "lodash";

export interface IOrderRepository {
    createOrderInfo(orderIInfo: Order, { transactionClient }: { transactionClient?: PrismaClient | undefined }): Promise<Order>
    getUserOrders(userId: string): Promise<Order[]>
    getBranchOrders(branchId: string): Promise<Order[]>
    getOrderById(orderId: string): Promise<Order>
    payRemainingOrderPayment(orderId: string, paymentMethod: OrderPaymentMethod): Promise<Order>
    updateOrderStatus(orderId: string, status: OrderStatus): Promise<Order>

    getAddonUsage(addonIds: string[], { startDate, endDate }: { startDate?: Date, endDate?: Date }): Promise<AddonUsage[]>



}

@Injectable()
export class OrderRepository extends PrismaClient implements OnModuleInit, OnModuleDestroy, IOrderRepository {
    static injectName = 'ORDER_REPOSITORY'


    async onModuleInit() {
        await this.$connect()
    }



    async createOrderInfo(orderInfo: Order, { transactionClient }: { transactionClient?: PrismaClient } = {}): Promise<Order> {
        try {
            const { paymentMethods, schedules, ...orderData } = orderInfo
            const orderCreateResult = await (transactionClient ?? this).order.create({ data: { ...orderData, paymentMethods: paymentMethods } })
            return new Order({ ...orderCreateResult })
        } catch (ex) {
            console.log(ex)
            throw new PrismaException({ message: ex.message, code: ex.code, meta: ex.meta })
        }
    }


    async getUserOrders(userId: string): Promise<Order[]> {
        try {

            const orders = await (this).order.findMany({ where: { userId: userId } })
            return orders.map(order => new Order({ ...order }))
        } catch (error) {
            throw new PrismaException({ message: error.message, code: error.code, meta: error.meta })
        }
    }

    async getOrderById(orderId: string): Promise<Order> {
        try {
            const order = await (this).order.findUnique({ where: { id: orderId } })
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

    async payRemainingOrderPayment(orderId: string, paymentMethod: OrderPaymentMethod): Promise<Order> {
        try {
            const orderInfo = await this.order.findFirst({ where: { id: orderId } })
            if (!orderInfo.id) {
                throw new RequestValidationException({ message: "Order not found" })
            }
            if (paymentMethod.amount.amount < orderInfo.remainingAmount) {
                throw new RequestValidationException({ message: "amount is less than the remaining amount" })
            }
            const updatedOrder = await this.order.update({
                where: { id: orderId }, data: {
                    remainingAmount: orderInfo.remainingAmount - paymentMethod.amount.amount,
                    paidAmount: orderInfo.paidAmount + paymentMethod.amount.amount,
                    paymentMethods: { push: paymentMethod }
                }
            })
            return new Order({ ...updatedOrder })
        } catch (error) {
            if (error instanceof RequestValidationException) {
                throw error
            }
            throw new PrismaException({ message: error.message, code: error.code, meta: error.meta })
        }
    }

    async getAddonUsage(addonIds: string[], { startDate, endDate }: { startDate?: Date, endDate?: Date }): Promise<AddonUsage[]> {
        try {
            const result = await Promise.all(addonIds.map(async (addonId) => {
                const whereOrQuery = [{ items: { some: { config: { some: { addonId: addonId } } } } }, { config: { some: { addonId: addonId } } }]
                const orderResult = await this.order.findMany({ where: { OR: whereOrQuery, status: { notIn: [OrderStatus.COMPLETED, OrderStatus.CANCELLED] }, createdAt: { gte: startDate, lte: endDate } } })
                if (orderResult.length === 0) {
                    return;
                }
                const orderResultModel = orderResult.map(order => new Order({ ...order }))
                const groupbyAddonId = groupBy(orderResultModel, order => (order.config.find(config => config.addonId === addonId) || order.items?.find(item => item.config?.some(config => config.addonId == addonId))?.config.find(config => config.addonId == addonId)))
                const addonUsage = Object.keys(groupbyAddonId).map(addonGroupINfo => {
                    const groupedOrder = groupbyAddonId[addonGroupINfo]
                    const count = groupbyAddonId[addonGroupINfo].length

                    return new AddonUsage({
                        addonId: addonId,
                        count: count,
                        orderIdInfo: groupedOrder.map(order => new OrderIdInfo({
                            orderId: order.id,
                            config: order.items?.find(item => item.config?.some(config => config.addonId == addonId))?.config?.find(config => config.addonId == addonId) ?? order.config.find(config => config.addonId === addonId),
                            dateCreated: order.createdAt
                        }))
                    })
                })
                return first(addonUsage)

            }))

            return result.filter(addonUsage => addonUsage !== undefined)

        } catch (error) {
            console.log(error)
            throw new PrismaException({ message: error.message, code: error.code, meta: error.meta })
        }
    }

    async onModuleDestroy() {
        await this.$disconnect()
    }

}
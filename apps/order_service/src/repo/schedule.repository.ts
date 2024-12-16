import { PrismaException } from "@app/common/errors/prisma_exception";
import { OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { Injectable } from "@nestjs/common";
import { PrismaClient } from "apps/order_service/prisma/generated/prisma_order_client";
import { OrderSchedule } from "../model/order_schedule.model";
import { plainToClass, plainToInstance } from "class-transformer";

export interface IOrderScheduleRepository {
    addTransactionClient: (client: PrismaClient) => void
    removeTransactionClient: () => void
    createSchedule: (schedule: OrderSchedule[]) => Promise<boolean>
    updateSchedule: (scheduleId: string, schedule: OrderSchedule) => Promise<OrderSchedule>
    getSchedules: (orderId: string) => Promise<OrderSchedule[]>
    getOrdersSchedules: (orderIds: string[]) => Promise<OrderSchedule[]>
    getScheduleByCalendar: (calendarId: string) => Promise<OrderSchedule[]>
    getSchedule: (scheduleId: string) => Promise<OrderSchedule>
    deleteSchedule: (scheduleId: string) => Promise<OrderSchedule>
}

@Injectable()
export class OrderScheduleRepository extends PrismaClient implements OnModuleInit, OnModuleDestroy, IOrderScheduleRepository {

    static injectName = 'SCHEDULE_REPOSITORY'

    transactionClient: PrismaClient | null

    addTransactionClient(client: PrismaClient): void {
        this.transactionClient = client;
    }

    removeTransactionClient(): void {
        this.transactionClient = null;
    }

    async onModuleInit() {
        await this.$connect();
    }

    async createSchedule(schedule: OrderSchedule[]): Promise<boolean> {
        try {
            const scheduleCreateResult = await (this.transactionClient ?? this).orderSchedule.createMany({ data: schedule })
            return scheduleCreateResult.count > 0
        } catch (ex) {
            console.log(ex)
            throw new PrismaException({ message: ex.message, code: ex.code, meta: ex.meta })
        }
    }

    async updateSchedule(scheduleId: string, schedule: OrderSchedule): Promise<OrderSchedule> {
        try {
            const scheduleUpdateResult = await (this.transactionClient ?? this).orderSchedule.update({ where: { id: scheduleId }, data: schedule })
            return plainToClass(OrderSchedule, scheduleUpdateResult)
        } catch (ex) {
            console.log(ex)
            throw new PrismaException({ message: ex.message, code: ex.code, meta: ex.meta })
        }
    }

    async getSchedules(orderId: string): Promise<OrderSchedule[]> {
        try {
            const scheduleGetResult = await this.orderSchedule.findMany({ where: { orderId } })
            return plainToClass(OrderSchedule, scheduleGetResult)
        } catch (ex) {
            console.log(ex)
            throw new PrismaException({ message: ex.message, code: ex.code, meta: ex.meta })
        }
    }

    async getOrdersSchedules(orderIds: string[]): Promise<OrderSchedule[]> {
        try {
            const scheduleGetResult = await this.orderSchedule.findMany({ where: { orderId: { in: orderIds } } })
            return plainToClass(OrderSchedule, scheduleGetResult)
        } catch (ex) {
            console.log(ex)
            throw new PrismaException({ message: ex.message, code: ex.code, meta: ex.meta })
        }
    }

    async getScheduleByCalendar(calendarId: string): Promise<OrderSchedule[]> {
        try {
            const scheduleGetResult = await this.orderSchedule.findMany({ where: { calendarId } })
            return plainToClass(OrderSchedule, scheduleGetResult)
        } catch (ex) {
            console.log(ex)
            throw new PrismaException({ message: ex.message, code: ex.code, meta: ex.meta })
        }
    }

    async getSchedule(scheduleId: string): Promise<OrderSchedule> {
        try {
            const scheduleGetResult = await this.orderSchedule.findUnique({ where: { id: scheduleId } })
            return plainToClass(OrderSchedule, scheduleGetResult)
        } catch (ex) {
            console.log(ex)
            throw new PrismaException({ message: ex.message, code: ex.code, meta: ex.meta })
        }
    }

    async deleteSchedule(scheduleId: string): Promise<OrderSchedule> {
        try {
            const scheduleDeleteResult = await (this.transactionClient ?? this).orderSchedule.delete({ where: { id: scheduleId } })
            return plainToClass(OrderSchedule, scheduleDeleteResult)
        } catch (ex) {
            console.log(ex)
            throw new PrismaException({ message: ex.message, code: ex.code, meta: ex.meta })
        }
    }



    async onModuleDestroy() {
        await this.$disconnect();
    }

}

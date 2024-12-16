import { Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { PrismaClient } from "apps/core/prisma/generated/prisma_core_client";
import { Calendar } from "../model/calendar.model";
import { PrismaException } from "@app/common/errors/prisma_exception";
import { CommonCalendarErrorMessages } from "apps/core/src/utils/const/error_constants";
import { plainToClass, plainToInstance } from "class-transformer";

export interface ICalendarRepository {
    createCalendar(data: Calendar): Promise<Calendar>;
    getProductCalendars(productId: string): Promise<Calendar[]>;
    getCalendar(calendarId: string): Promise<Calendar>;
    getProductsCalendar(productIds: string[]): Promise<Calendar[]>;
    updateCalendar(productId: string, data: Partial<Calendar>): Promise<Calendar>;
}

@Injectable()
export class CalendarRepository extends PrismaClient implements OnModuleInit, OnModuleDestroy, ICalendarRepository {
    static injectName = "CalendarRepository";

    async onModuleInit() {
        this.$connect();
    }

    async createCalendar(data: Calendar): Promise<Calendar> {
        try {
            const { productId, product, businessId, ...rest } = data;
            const calendar = await this.calendar.create({ data: { ...rest, product: { connect: { id: productId } }, business: { connect: { id: businessId } } } });
            return plainToClass(Calendar, calendar);
        } catch (ex) {
            console.log(ex)
            throw new PrismaException({
                message: CommonCalendarErrorMessages.CREATE_CALENDAR_FAILED,
                exception: ex
            });
        }
    }

    async getProductCalendars(productId: string): Promise<Calendar[]> {
        try {
            const calendars = await this.calendar.findMany({ where: { productId } });
            return plainToInstance(Calendar, calendars);
        } catch (ex) {
            throw new PrismaException({
                message: "Get product calendars failed",
                exception: ex
            });
        }
    }

    async getCalendar(calendarId: string): Promise<Calendar> {
        try {
            const calendar = await this.calendar.findUnique({ where: { id: calendarId } });
            return plainToClass(Calendar, calendar);
        } catch (ex) {
            throw new PrismaException({
                message: "Get calendar failed",
                exception: ex
            });
        }
    }

    async getProductsCalendar(productIds: string[]): Promise<Calendar[]> {
        try {
            const calendars = await this.calendar.findMany({ where: { productId: { in: productIds } } });
            return plainToInstance(Calendar, calendars);
        } catch (ex) {
            throw new PrismaException({
                message: "Get products calendars failed",
                exception: ex
            });
        }
    }

    async updateCalendar(calendarId: string, data: Partial<Calendar>): Promise<Calendar> {
        try {
            const { productId, product, businessId, ...rest } = data;
            const calendar = await this.calendar.update({ where: { id: calendarId }, data: { ...rest, product: { connect: { id: productId } } } });
            return plainToClass(Calendar, calendar);
        } catch (ex) {
            throw new PrismaException({
                message: "Update calendar failed",
                exception: ex
            });
        }
    }


    async onModuleDestroy() {
        this.$disconnect();
    }
}
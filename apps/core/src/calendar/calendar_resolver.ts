import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { Calendar } from "./model/calendar.model";
import { CalendarUsecase } from "./calendar.usecase";
import { CreateCalendarInput, UpdateCalendarInput } from "./dto/calendar.input";
import { CalendarResponse } from "./dto/calendar_response";

@Resolver(of => Calendar)
export class CalendarResolver {
    constructor(private readonly calendarUsecase: CalendarUsecase) { }


    @Mutation(returns => CalendarResponse)
    async createCalendar(@Args('input') input: CreateCalendarInput) {
        const result = await this.calendarUsecase.createCalendar(input);
        return result;
    }

    @Mutation(returns => CalendarResponse)
    async updateCalendar(@Args('calendarId') calendarId: string, @Args('input') input: UpdateCalendarInput) {
        const result = await this.calendarUsecase.updateCalendar(calendarId, input);
        return result;
    }


    @Query(returns => CalendarResponse)
    async getCalendar(@Args('calendarId') calendarId: string) {
        const result = await this.calendarUsecase.getCalendar(calendarId);
        return result;
    }

    @Query(returns => CalendarResponse)
    async getProductsCalendar(@Args('businessId') businessId: string, @Args('branchId') branchId: string, @Args({ name: "productIds", type: () => [String] }) productIds: string[]): Promise<CalendarResponse> {
        const result = await this.calendarUsecase.getProductsCalendar(productIds);
        return result;
    }

}
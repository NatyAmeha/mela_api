import { Inject, Injectable } from "@nestjs/common";
import { CalendarRepository, ICalendarRepository } from "./repo/calendar.repository";
import { Calendar } from "./model/calendar.model";
import { CalendarResponseBuilder } from "./dto/calendar_response";
import { CreateCalendarInput, UpdateCalendarInput } from "./dto/calendar.input";


@Injectable()
export class CalendarUsecase {

    constructor(@Inject(CalendarRepository.injectName) private calendarRepo: ICalendarRepository) { }


    async createCalendar(input: CreateCalendarInput) {
        const calendar = Calendar.fromCalendarInput(input);
        const createdCalendar = await this.calendarRepo.createCalendar(calendar);
        return new CalendarResponseBuilder().withSuccess<CalendarResponseBuilder>().withCalendar(createdCalendar).build();
    }

    async updateCalendar(calendarId: string, input: UpdateCalendarInput) {
        const calendar = Calendar.fromCalendarInput(input);
        const updatedCalendar = await this.calendarRepo.updateCalendar(calendarId, calendar);
        return new CalendarResponseBuilder().withSuccess<CalendarResponseBuilder>().withCalendar(updatedCalendar).build();
    }

    async getCalendar(calendarId: string) {
        const calendarInfo = await this.calendarRepo.getCalendar(calendarId);
        return new CalendarResponseBuilder().withCalendar(calendarInfo).build();
    }

    async getProductsCalendar(productIds: string[]) {
        const calendars = await this.calendarRepo.getProductsCalendar(productIds);
        const response = new CalendarResponseBuilder().withCalendars(calendars).build();
        return response;
    }
}
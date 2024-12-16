import { Field } from "@nestjs/graphql";
import { Calendar } from "../model/calendar.model";
import { BaseResponse, BaseResponseBuilder } from "@app/common/model/base.response";
import { ObjectType } from "@nestjs/graphql";

@ObjectType()
export class CalendarResponse extends BaseResponse {
    @Field(type => Calendar)
    calendar?: Calendar;
    @Field(type => [Calendar])
    calendars?: Calendar[];



    @Field(type => [Date], { nullable: true })
    disabledDatesForBooking?: Date[];

    constructor(data: Partial<CalendarResponse>) {
        super();
        Object.assign(this, data);
    }


}

export class CalendarResponseBuilder extends BaseResponseBuilder {

    constructor(private response: CalendarResponse = new CalendarResponse({})) {
        super(response);
        this.response = new CalendarResponse({});
    }

    withCalendar(calendar: Calendar): CalendarResponseBuilder {
        this.response.success = true;
        this.response.calendar = calendar;
        return this;
    }

    withCalendars(calendars: Calendar[]): CalendarResponseBuilder {
        this.response.success = true;
        this.response.calendars = calendars;
        return this;
    }

    build(): CalendarResponse {
        return this.response;
    }

}


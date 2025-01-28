import { Field, InputType, Int } from "@nestjs/graphql";
import { Type } from "class-transformer";

@InputType()
export class CreateCalendarInput {
    @Field()
    productId: string;

    @Field(() => Date)
    fromDate: Date;

    @Field(() => Date)
    toDate: Date;

    @Field(() => [Date], { defaultValue: [] })
    disabledDays: Date[];

    @Field(() => [Date], { defaultValue: [] })
    disabledHours: Date[];

    @Field(() => [CalendarOrderInfoInput])
    @Type(() => CalendarOrderInfoInput)
    orderInfo: CalendarOrderInfoInput[];
}

@InputType()
export class UpdateCalendarInput extends CreateCalendarInput { }

@InputType()
export class CalendarOrderInfoInput {
    @Field(() => Int)
    dayOfWeek: number;  // Day of week (0: Sunday, 1: Monday, ..., 6: Saturday)

    @Field(() => Int, { defaultValue: 12 })
    maxOrderPerDay: number;

    @Field(() => Int, { defaultValue: 1 })
    maxOrderPerHour: number;
}

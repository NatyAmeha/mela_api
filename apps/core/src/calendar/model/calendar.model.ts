import { Product } from "../../product/model/product.model"

import { ObjectType, Field, ID, Int, Directive } from '@nestjs/graphql';
import { CreateCalendarInput, UpdateCalendarInput } from "../dto/calendar.input";
import { LocalizedField } from "@app/common/model/localized_model";


@ObjectType()
@Directive('@shareable')
export class CalendarOrderInfo {
    @Field(() => ID)
    id?: string;

    @Field(() => Int)
    dayOfWeek: number;  // Day of week (0: Sunday, 1: Monday, ..., 6: Saturday)

    @Field(() => Int, { defaultValue: 12 })
    maxOrderPerDay: number;

    @Field(() => Int, { defaultValue: 1 })
    maxOrderPerHour: number;

    constructor(partial: Partial<CalendarOrderInfo>) {
        Object.assign(this, partial);
    }
}


export enum CalendarType {
    PRODUCT = "PRODUCT",
    SECTION = "SECTION"
}



@ObjectType()
@Directive('@shareable')
export class Calendar {
    @Field(() => ID)
    id?: string;

    @Field(() => String)
    type?: string;

    @Field()
    productId?: string;

    @Field()
    sectionId?: string;

    @Field()
    businessId: string;

    @Field(() => Date)
    fromDate: Date;

    @Field(() => Date)
    toDate: Date;

    @Field(() => [Date], { defaultValue: [] })
    disabledDays: Date[];

    @Field(() => [Date], { defaultValue: [] })
    disabledHours: Date[];

    @Field(() => [CalendarOrderInfo])
    orderInfo: CalendarOrderInfo[];

    @Field(() => Product, { nullable: true })
    product?: Product;

    constructor(partial: Partial<Calendar>) {
        Object.assign(this, partial);
    }

    static fromCalendarInput(input: CreateCalendarInput | UpdateCalendarInput): Calendar {
        return new Calendar({ ...input });
    }
}




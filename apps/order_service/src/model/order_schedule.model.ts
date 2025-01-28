import { LocalizedField } from "@app/common/model/localized_model";
import { Directive, Field, ID, ObjectType } from "@nestjs/graphql";
import { AddOrderSchedulesInput } from "../dto/schedule.input";

@ObjectType()
@Directive('@shareable')
export class OrderSchedule {
    @Field(() => ID)
    id?: string;

    @Field()
    calendarId?: string;

    @Field(() => [Date])
    bookedTimes: Date[];

    @Field(() => String)
    productId?: string;

    @Field(() => String)
    orderId: string;

    @Field(() => String)
    status?: string;

    @Field(types => [LocalizedField], { nullable: true })
    note?: LocalizedField[];

    @Field(() => Date)
    createdAt: Date;

    @Field(() => Date)
    updatedAt: Date;

    constructor(partial: Partial<OrderSchedule>) {
        Object.assign(this, partial);
    }

    static fromInput(input: AddOrderSchedulesInput, { orderId }: { orderId: string }): OrderSchedule {
        return new OrderSchedule({ ...input, orderId });
    }
}
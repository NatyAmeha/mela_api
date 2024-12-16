import { LocalizedField, LocalizedFieldInput } from "@app/common/model/localized_model";
import { Field, InputType } from "@nestjs/graphql";
import { Type } from "class-transformer";

@InputType()
export class AddOrderSchedulesInput {

    @Field(() => String)
    calendarId: string;

    @Field(() => [Date])
    bookedTimes: Date[];


    @Field(() => String)
    productId?: string;

    @Field(() => String)
    status?: string;

    @Field(types => [LocalizedFieldInput], { nullable: true })
    @Type(() => LocalizedFieldInput)
    note?: LocalizedFieldInput[];
}
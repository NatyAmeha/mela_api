import { LocalizedField } from "@app/common/model/localized_model";
import { Directive, Field, ID, Int, ObjectType } from "@nestjs/graphql";

@ObjectType()
@Directive('@shareable')
export class BusinessOrderStatus {
    @Field(type => ID)
    id: string
    @Field(type => [LocalizedField])
    status: LocalizedField[]
    @Field(type => [LocalizedField], { nullable: true })
    description?: LocalizedField[]
    @Field(type => Boolean, { nullable: true, defaultValue: false })
    isDefault?: boolean
    @Field(type => Int, { nullable: true, defaultValue: 0 })
    sequence?: number

    constructor(partial?: Partial<BusinessOrderStatus>) {
        Object.assign(this, partial);
    }

    static defaultOrderStatuses: BusinessOrderStatus[] = [
        new BusinessOrderStatus({ id: "PENDING", status: [{ key: "ENGLISH", value: "Pending" }, { key: "AMHARIC", value: "በመካሄድ ላይ" }] }),
        new BusinessOrderStatus({ id: "PAYMENT_CONFIRMED", status: [{ key: "ENGLISH", value: "Payment Confirmed" }, { key: "AMHARIC", value: "ከፈያ ተቀባይነት" }] }),
        new BusinessOrderStatus({ id: "CONFIRMED", status: [{ key: "ENGLISH", value: "Confirmed" }, { key: "AMHARIC", value: "መረጃ መመዝ ላይ" }] }),
        new BusinessOrderStatus({ id: "CANCELLED", status: [{ key: "ENGLISH", value: "Cancelled" }, { key: "AMHARIC", value: "ተሰርዟል" }] }),
        new BusinessOrderStatus({ id: "COMPLETED", status: [{ key: "ENGLISH", value: "Completed" }, { key: "AMHARIC", value: "ተጠናቋል" }] }),
    ]
} 
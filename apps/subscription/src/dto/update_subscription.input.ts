import { Field, InputType, ObjectType } from "@nestjs/graphql";
import { CreatePlatformServiceSubscriptionInput, UpdatePlatformSubscriptionInput } from "./subscription.input";



@InputType()
export class SubscriptionUpgradeInput {
    @Field()
    businessId: string;
    @Field(types => [UpdatePlatformSubscriptionInput])
    addedServices?: UpdatePlatformSubscriptionInput[];

    @Field(types => [UpdatePlatformSubscriptionInput])
    removedServices?: UpdatePlatformSubscriptionInput[];


}   
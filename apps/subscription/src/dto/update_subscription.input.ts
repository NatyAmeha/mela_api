import { Field, InputType, ObjectType } from "@nestjs/graphql";
import { SelectedPlatformServiceForSubscription, UpdatePlatformSubscriptionInput } from "./platform_service_subscription.input";



@InputType()
export class SubscriptionUpgradeInput {
    @Field()
    businessId: string;
    @Field(types => [UpdatePlatformSubscriptionInput])
    addedServices?: UpdatePlatformSubscriptionInput[];

    @Field(types => [UpdatePlatformSubscriptionInput])
    removedServices?: UpdatePlatformSubscriptionInput[];


}   
import { Field, InputType } from "@nestjs/graphql";
import { SubscriptionInput } from "./platform_service_subscription.input";

@InputType()
export class CreateBusinessSubscriptionInput implements SubscriptionInput {
    @Field()
    planId: string;
}
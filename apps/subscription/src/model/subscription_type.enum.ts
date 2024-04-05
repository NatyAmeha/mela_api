import { registerEnumType } from "@nestjs/graphql";

export enum SubscriptionType {
    PLATFORM = "PLATFORM",
    BUSINESS = "BUSINESS",
    PRODUCT = "PRODUCT",
}

registerEnumType(SubscriptionType, { name: "SubscriptionType" })
import { registerEnumType } from "@nestjs/graphql";

export enum SubscriptionType {
    PLATFORM = "PLATFORM",
    BUSINESS = "BUSINESS",
    PRODUCT = "PRODUCT",
    MEMBERSHIP = "MEMBERSHIP",
}

registerEnumType(SubscriptionType, { name: "SubscriptionType" })
import { registerEnumType } from "@nestjs/graphql";

export enum SubscriptionType {
    PLATFORM = "PLATFORM",
    BUSINESS = "BUSINESS",
    SERVICE = "SERVICE",
    PRODUCT = "PRODUCT",
}

registerEnumType(SubscriptionType, { name: "SubscriptionType" })
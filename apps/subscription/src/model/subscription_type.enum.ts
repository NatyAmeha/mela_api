import { registerEnumType } from "@nestjs/graphql";

export enum SubscriptionType {
    PLATFORM = "PLATFORM",
    BUSINES = "BUSINES",
    SERVICE = "SERVICE",
    PRODUCT = "PRODUCT",
}

registerEnumType(SubscriptionType, { name: "SubscriptionType" })
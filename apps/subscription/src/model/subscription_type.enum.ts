import { registerEnumType } from "@nestjs/graphql";

export enum SubscriptionType {
    PLATFORM,
    BUSINESS,
    SERVICE,
    PRODUCT,
}

registerEnumType(SubscriptionType, { name: "SubscriptionType" })
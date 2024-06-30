import { OmitType } from "@nestjs/graphql";
import { Customization, PlatformService } from "apps/subscription/src/model/platform_service.model";
import { Subscription } from "apps/subscription/src/model/subscription.model";
import { classToPlain, instanceToPlain } from "class-transformer";

export class SubscriptionGateway extends OmitType(Subscription, [] as const) {
    constructor(data) {
        super({});
        Object.assign(this, instanceToPlain(data, { strategy: "exposeAll" }));
    }
}

export class PlatformServiceGateway extends OmitType(PlatformService, [] as const) {
    constructor(data) {
        super({});
        Object.assign(this, instanceToPlain(data, { strategy: "exposeAll" }));
    }
}

export class CustomizationGateway extends OmitType(Customization, [] as const) {
    constructor(data) {
        super({});
        Object.assign(this, instanceToPlain(data, { strategy: "exposeAll" }));
    }
}
import { Controller, Get, Query } from "@nestjs/common";
import { SubscriptionService } from "./usecase/subscription.usecase";

@Controller('subscription')
export class SubscriptionController {
    constructor(private subscriptionService: SubscriptionService) {

    }
    @Get('business')
    async getBusinessSubscription(@Query("id") businessId: string) {
        let result = await this.subscriptionService.getBusinessSubscription(businessId);
        return result;
    }
}
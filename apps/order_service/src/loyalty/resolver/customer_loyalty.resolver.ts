import { Parent, ResolveField, Resolver } from "@nestjs/graphql";
import { CustomerLoyalty } from "../model/customer_loyalty.model";
import { first } from "lodash";

@Resolver(of => CustomerLoyalty)
export class CustomerLoyaltyResolver {

    constructor() { }

    // @ResolveField("currentTier", type => LoyaltyTier)
    // async currentTier(@Parent() customerLoyalty: CustomerLoyalty): Promise<LoyaltyTier> {
    //     const customerTiers = await this.loyaltyTierService.getCustomerLoyaltyTiers(customerLoyalty.customerId, [customerLoyalty.businessId]);
    //     return first(customerTiers);
    // }
}

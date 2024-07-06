import { BaseResponse, BaseResponseBuilder } from "@app/common/model/base.response";
import { Field, ObjectType } from "@nestjs/graphql";
import { Business } from "./business.model";
import { Branch } from "../../branch/model/branch.model";
import { Product } from "../../product/model/product.model";
import { Access } from "apps/auth/src/authorization/model/access.model";
import { CommonBusinessErrorMessages } from "../../utils/const/error_constants";
import { PaymentOption } from "./payment_option.model";
import { BusinessMembership } from "./business_memership.model";

@ObjectType()
export class BusinessResponse extends BaseResponse {
    @Field(type => Business)
    business?: Business;
    @Field(type => [Business])
    businesses?: Business[]
    @Field(type => [Product])
    products?: Product[]
    @Field(type => [Branch])
    branches?: Branch[]
    @Field(type => [Branch])
    branchAdded?: Branch[]
    @Field(type => [Branch])
    branchUpdated?: Branch[]

    @Field(type => [])

    @Field(type => [PaymentOption])
    paymentOptions?: PaymentOption[]
    @Field(type => [BusinessMembership])
    memberships?: BusinessMembership[]

    accesses?: Access[]

    constructor(data: Partial<BusinessResponse>) {
        super()
        Object.assign(this, data)
    }

    isSafeErrorIfExist(): boolean {
        if (this.success == true) {
            return true
        }
        if (this.message) {
            switch (this.message) {
                case CommonBusinessErrorMessages.BUSINESS_ALREADY_IN_PAYMENT_STAGE:
                    return true;
                default:
                    return false;
            }
        }
        return false;
    }
}

export class BusinessResponseBuilder extends BaseResponseBuilder {

    constructor(private response: BusinessResponse = new BusinessResponse({})) {
        super(response);
        this.response = new BusinessResponse({});
    }


    withError(error: string): BusinessResponse {
        this.response.success = false;
        this.response.message = error;
        return this.response;
    }

    withBusiness(business: Business): BusinessResponseBuilder {
        this.response.success = true;
        this.response.message = "Business found successfully"
        this.response.business = business;
        return this;
    }

    withBusinesses(businesses: Business[]): BusinessResponseBuilder {
        this.response.success = true;
        this.response.businesses = businesses;
        return this;
    }

    withProducts(products: Product[]): BusinessResponseBuilder {
        this.response.success = true;
        this.response.products = products;
        return this;
    }

    withBranches(branches: Branch[]): BusinessResponseBuilder {
        this.response.success = true;
        this.response.branches = branches;
        return this;
    }

    withBranchAdded(branch: Branch): BusinessResponseBuilder {
        this.response.success = true;
        if (!this.response.branchAdded) {
            this.response.branchAdded = [];
        }
        this.response.branchAdded.push(branch);
        return this;
    }

    withBranchUpdated(...branch: Branch[]): BusinessResponseBuilder {
        this.response.success = true
        if (!this.response.branchUpdated) {
            this.response.branchUpdated = [];
        }
        this.response.branchUpdated.push(...branch);
        return this;
    }

    withAccesses(accesses: Access[]): BusinessResponseBuilder {
        this.response.success = true;
        this.response.accesses = accesses;
        return this;
    }

    withMemberships(memberships: BusinessMembership[]): BusinessResponseBuilder {
        this.response.success = true;
        this.response.memberships = memberships;
        return this;
    }

    withPaymentOptions(paymentOptions: PaymentOption[]): BusinessResponseBuilder {
        this.response.success = true;
        this.response.paymentOptions = paymentOptions;
        return this;
    }

    build(): BusinessResponse {
        return this.response;
    }
}


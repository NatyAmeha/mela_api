import { BaseResponse, BaseResponseBuilder } from "@app/common/model/base.response";
import { Membership } from "../model/memberhip.model";
import { Field, ObjectType } from "@nestjs/graphql";
import { Product } from "apps/core/src/product/model/product.model";
import { MembershipProduct } from "../model/membership_product.model";

@ObjectType()
export class MembershipResponse extends BaseResponse {
    @Field(type => Membership)
    membership?: Membership
    @Field(type => [Membership])
    memberships?: Membership[]
    @Field(type => [MembershipProduct])
    products?: MembershipProduct[]

    constructor(data: Partial<MembershipResponse>) {
        super()
        Object.assign(this, data)
    }
}

export class MembershipResponseBuilder extends BaseResponseBuilder {
    constructor(private response: MembershipResponse = new MembershipResponse({})) {
        super(response);
    }

    withMembership(membership: Membership): MembershipResponseBuilder {
        this.response.success = true;
        this.response.membership = membership;
        return this;
    }

    withMemberships(memberships: Membership[]): MembershipResponseBuilder {
        this.response.success = true;
        this.response.memberships = memberships;
        return this;
    }

    build(): MembershipResponse {
        return this.response;
    }
}
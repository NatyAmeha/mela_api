import { BaseResponse, BaseResponseBuilder } from "@app/common/model/base.response";
import { Branch } from "./branch.model";
import { Field, ObjectType } from "@nestjs/graphql";
import { Product } from "../../product/model/product.model";

@ObjectType()
export class BranchResponse extends BaseResponse {
    @Field(types => Branch)
    branch?: Branch;
    @Field(types => [Product])
    products?: Product[]
    @Field(types => [Branch])
    branches?: Branch[];
}

export class BranchResponseBuilder extends BaseResponseBuilder {

    constructor(private branchResponse = new BranchResponse()) {
        super(branchResponse);
    }

    withBranch(branch: Branch): BranchResponseBuilder {
        this.branchResponse.branch = branch;
        return this;
    }

    withProducts(products: Product[]): BranchResponseBuilder {
        this.branchResponse.products = products;
        return this;
    }

    withBranches(branches: Branch[]): BranchResponseBuilder {
        this.branchResponse.branches = branches;
        return this;
    }

    build(): BranchResponse {
        return this.branchResponse;
    }

}
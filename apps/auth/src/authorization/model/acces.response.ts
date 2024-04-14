import { Field } from "@nestjs/graphql";
import { Access } from "./access.model";
import { BaseResponse } from "@app/common/model/base.response";

export class AccessResponse extends BaseResponse {
    @Field(type => [Access])
    accesses?: Access[]

    isSafeErrorIfExist(): boolean {
        if (this.success == true) {
            return true
        }
        if (this.message) {
            switch (this.message) {
                default:
                    return false;
            }
        }
        return false;
    }
}

export class AccessResponseBuilder {
    private accessResponse: AccessResponse = new AccessResponse();
    withSuccess(): AccessResponseBuilder {
        this.accessResponse.success = true;
        return this;
    }
    withAccesses(accesses: Access[]): AccessResponseBuilder {
        this.accessResponse.success = true;;
        this.accessResponse.accesses = accesses;
        return this;
    }

    withError(message: string, code?: number): AccessResponse {
        this.accessResponse.success = false;
        this.accessResponse.message = message;
        return this.accessResponse;

    }

    withMessage(message: string): AccessResponseBuilder {
        this.accessResponse.message = message;
        return this;
    }
    build(): AccessResponse {
        return this.accessResponse;
    }
}
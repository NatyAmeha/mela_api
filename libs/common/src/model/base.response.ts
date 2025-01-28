import { Field, Int, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class BaseResponse {
    @Field()
    success: boolean
    @Field()
    message?: string
    @Field(types => Int)
    code?: number
}

export class BaseResponseBuilder {
    constructor(protected baseResponse: BaseResponse) {

    }

    basicResponse(success: boolean, message?: string): BaseResponse {
        this.baseResponse.success = success
        this.baseResponse.message = message
        return this.baseResponse;
    }

    withSuccess<T extends BaseResponseBuilder>(): T {
        this.baseResponse.success = true;
        return this as unknown as T;
    }
}
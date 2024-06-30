import { BaseResponse } from "@app/common/model/base.response";
import { ObjectType } from "@nestjs/graphql";
import { PlatformService } from "../platform_service.model";

@ObjectType()
export class PlatformServiceResponse extends BaseResponse {
    service: PlatformService

    constructor(data: Partial<PlatformServiceResponse>) {
        super()
        Object.assign(this, data)
    }
}

export class PlatformSErviceResponseBuilder {
    private response: PlatformServiceResponse
    constructor() {
        this.response = new PlatformServiceResponse({})
    }

    withError(error: string): PlatformSErviceResponseBuilder {
        this.response.success = false
        this.response.message = error
        return this
    }

    withService(service: PlatformService): PlatformSErviceResponseBuilder {
        this.response.success = true
        this.response.service = service
        return this
    }

    build(): PlatformServiceResponse {
        return this.response
    }
}
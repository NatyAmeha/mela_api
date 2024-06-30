import { Controller, Get, Query } from "@nestjs/common";
import { AuthService } from "./usecase/auth.service";
import { AuthorizationService } from "../authorization";
import { UserResponse } from "./dto/user.response";

@Controller()
export class AuthController {
    constructor(private authservice: AuthService, private authorizationService: AuthorizationService) {

    }
    @Get("/access/user")
    async getUserAccess(@Query("id") userId: string): Promise<UserResponse | undefined> {
        var userResult = await this.authservice.getUserInfo(userId)
        let userAccesses = await this.authorizationService.getAllUserAccesses(userId)

        return new UserResponse({ user: userResult, accesses: userAccesses })
    }

    // @Get("/access/business")
    // async getBusinessAccess(@Query("id") businessId: string): Promise<BusinessResponse | undefined> {
    //     let businessAccesses = await this.authorizationService.getAllBusinessAccesses(businessId)
    //     var response = new BusinessResponseBuilder().withAccesses(businessAccesses).build();
    //     return response;
    // }


}  
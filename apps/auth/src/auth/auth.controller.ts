import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { AuthService } from "./usecase/auth.service";
import { Access } from "../authorization/model/access.model";
import { User } from "./model/user.model";
import { CurrentUser } from "./service/guard/get_user_decorator";
import { userInfo } from "os";

@Controller()
export class AuthController {
    constructor(private authservice: AuthService,) {

    }
    @Get("/access")
    async getUserAccess(@Query("user") userId: string): Promise<User | undefined> {
        var userResult = await this.authservice.getUserInfo(userId)
        return userResult
    }
}  
import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { AuthService } from "./usecase/auth.service";
import { Access } from "../authorization/model/access.model";
import { JwtGuard } from "./service/guard/jwt.gurad";
import { User } from "./model/user.model";
import { CurrentUser } from "./service/guard/get_user_decorator";
import { userInfo } from "os";

@Controller()
export class AuthController {
    constructor(private authservice: AuthService,) {

    }
    // @UseGuards(JwtGuard)
    @Get("/access")
    async getUserAccess(@Query("user") userId: string): Promise<User | undefined> {
        // // this.authservice.
        var userResult = await this.authservice.getUserInfo(userId)
        return userResult
    }
}  
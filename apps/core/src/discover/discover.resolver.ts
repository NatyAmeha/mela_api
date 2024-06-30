import { Query, Resolver } from "@nestjs/graphql";
import { DiscoverService } from "./discover.service";
import { ForYouResponse } from "./model/foryou.model";
import { CurrentUser } from "libs/common/get_user_decorator";
import { User } from "apps/auth/src/auth/model/user.model";
import { AuthzGuard } from "libs/common/authorization.guard";
import { UseGuards } from "@nestjs/common";

@Resolver()
export class DiscoverResolver {

    constructor(private discoverService: DiscoverService) { }


    @UseGuards(AuthzGuard)
    @Query(returns => ForYouResponse)
    async getForYouData(@CurrentUser() user: User): Promise<ForYouResponse> {
        const response = await this.discoverService.getForYouData(user.getFavoriteBusinessIds(), 10);
        return response;
    }

}
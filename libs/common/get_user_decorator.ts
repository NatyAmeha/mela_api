import { createParamDecorator } from "@nestjs/common";
import { GqlExecutionContext } from "@nestjs/graphql";
import { User } from "apps/auth/src/auth/model/user.model";
import { ExecException } from "child_process";

export const CurrentUser = createParamDecorator((data: any, context: GqlExecutionContext) => {
    var gqlContext = GqlExecutionContext.create(context)
    var request = gqlContext.getContext().req;
    var userHeaderValue = request.headers.user ?? "";
    if (userHeaderValue && userHeaderValue !== "undefined") {
        var userInfo = JSON.parse(userHeaderValue) as User;
        if (userInfo.id != undefined) {
            return userInfo
        }
        return undefined

    }
})
import { createParamDecorator } from "@nestjs/common";
import { GqlExecutionContext } from "@nestjs/graphql";
import { ExecException } from "child_process";

export const CurrentUser = createParamDecorator((data: any, context: GqlExecutionContext) => {
    var ctx = GqlExecutionContext.create(context);
    return ctx.getContext().req.user
})
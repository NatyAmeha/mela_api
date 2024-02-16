import { ArgumentsHost, Catch } from "@nestjs/common";
import { GqlArgumentsHost, GqlExceptionFilter } from "@nestjs/graphql";
import { DbException } from "./db_exception";
import { RequestValidationException } from "./request_validation_exception";
import { AppException } from "./exception.model";
import { ErrorResponse } from "./error_response";
import { SecurityException } from "./security_exception";
import { GraphQLError } from "graphql";

@Catch()
export class AuthServiceExceptionHandler implements GqlExceptionFilter {
    catch(exception: any, host: ArgumentsHost) {
        var gqlhost = GqlArgumentsHost.create(host);
        var errorResponse = new ErrorResponse([{ message: "Unkown error occured, please try again", statusCode: 400 } as AppException])
        if (exception instanceof DbException) {
            errorResponse = exception.serializeError();
            // throw exception;
        }
        else if (exception instanceof RequestValidationException) {
            errorResponse = exception.serializeError()
            // throw exception;
        }
        else if (exception instanceof SecurityException) {
            errorResponse = exception.serializeError();
            // throw exception;
        }
        console.log("error", errorResponse)
        exception = errorResponse
        var error = new GraphQLError(errorResponse.errors.map(e => e.message).join(","), {
            extensions: { code: 400 },
            nodes: []
        },)

        return error;
    }

}
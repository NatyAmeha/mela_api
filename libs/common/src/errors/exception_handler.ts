import { ArgumentsHost, Catch } from "@nestjs/common";
import { GqlArgumentsHost, GqlExceptionFilter } from "@nestjs/graphql";
import { DbException } from "./db_exception";
import { RequestValidationException } from "./request_validation_exception";
import { AppException } from "./exception.model";
import { ErrorResponse } from "./error_response";

@Catch()
export class AuthServiceExceptionHandler implements GqlExceptionFilter {
    catch(exception: any, host: ArgumentsHost) {
        var gqlhost = GqlArgumentsHost.create(host);
        var errorResponse: ErrorResponse;
        if (exception instanceof DbException) {
            console.log("error insde serialize", exception.error)
            errorResponse = exception.serializeError();
        }
        else if (exception instanceof RequestValidationException) {

        }

        return errorResponse;
    }

}
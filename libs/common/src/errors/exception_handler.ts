import { ArgumentsHost, BadRequestException, Catch, ForbiddenException, HttpException, UnauthorizedException } from "@nestjs/common";
import { GqlArgumentsHost, GqlExceptionFilter } from "@nestjs/graphql";
import { DbException } from "./db_exception";
import { RequestValidationException } from "./request_validation_exception";
import { AppException } from "./app_exception.model";
import { ErrorResponse } from "./error_response";
import { SecurityException } from "./security_exception";
import { GraphQLError } from "graphql";
import { first } from "lodash";
import { Prisma } from "@prisma/client";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { PrismaException } from "./prisma_exception";

@Catch()
export class GqlExceptionHandler implements GqlExceptionFilter {
    catch(exception: any, host: ArgumentsHost) {
        var gqlhost = GqlArgumentsHost.create(host);
        var errorResponse = new ErrorResponse([{ message: "Unkown error occured, please try again", statusCode: 400 } as AppException])
        if (exception instanceof DbException) {
            errorResponse = exception.serializeError();
            // throw exception;
        }
        else if (exception instanceof RequestValidationException) {
            console.log("request validation exception", exception.exception)
            errorResponse = exception.serializeError()
            // throw exception;
        }
        else if (exception instanceof SecurityException) {
            errorResponse = exception.serializeError();
            // throw exception;
        }
        else if (exception instanceof PrismaException) {
            errorResponse = exception.serializeError();
        }
        else if (exception instanceof UnauthorizedException) {
            console.log("unauthorized  error message unauthorized")
            errorResponse = {
                errors: [{ message: "UnAuthorized exception", statusCode: 401 } as AppException,]
            }
        }
        else if (exception instanceof ForbiddenException) {
            console.log("forbidden error message unauthorized")
            errorResponse = {
                errors: [{ message: "UnAuthorized Access Exception", statusCode: 401 } as AppException,]
            }
        }
        else if (exception instanceof HttpException) {
            errorResponse = {
                errors: [{ message: exception.message, statusCode: exception.getStatus() } as AppException]
            }
        }
        else if (exception instanceof BadRequestException) {
            errorResponse = {
                errors: [
                    { message: `${exception.message ?? 'Bad request'}`, statusCode: exception.getStatus() } as AppException,
                ]
            }
        }
        console.log("error error", exception)
        exception = errorResponse
        var error = new GraphQLError(errorResponse.errors.map(e => e.message).join(","), {
            extensions: { code: first(errorResponse.errors)?.statusCode ?? 400 },
            nodes: []
        },)

        return error;
    }

}
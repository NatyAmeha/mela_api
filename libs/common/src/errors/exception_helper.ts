import { CommonCustomerErrorMessages } from "apps/core/src/utils/const/error_constants";
import { AppException } from "./app_exception.model";
import { ErrorTypes } from "./error_types";
import { RequestValidationException } from "./request_validation_exception";

export class ExceptionHelper {
    static getErrorType(error: any): number | undefined {
        try {
            var exception = error as AppException;
            return exception.errorType;
        } catch (ex) {
            return undefined
        }
    }

    static isUserRegisteredBeforeException(error: any): boolean {
        var errorType = this.getErrorType(error)
        return errorType != undefined && errorType == ErrorTypes.USER_ALREADY_EXIST
    }

    static isCustomerAlreadyExistError(error: any): boolean {
        if (error instanceof RequestValidationException && error.message == CommonCustomerErrorMessages.CUSTOMER_ALREADY_EXIST) {
            return true;
        }
        return false;
    }
}
import { AppException } from "./app_exception.model";
import { ErrorTypes } from "./error_types";

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
}
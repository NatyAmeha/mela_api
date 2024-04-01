import { object } from "joi";
import { ErrorResponse } from "./error_response";
import { AppException } from "./app_exception.model";

export class SecurityException implements AppException {
    source?: string;
    message: string;
    statusCode?: number;
    errorType?: number;
    exception?: any;
    name: string;

    constructor(data: Partial<SecurityException>) {
        Object.assign(this, data);
    }

    serializeError(): ErrorResponse {
        return new ErrorResponse([<AppException>{ message: this.message, statusCode: 500 }])
    }

}
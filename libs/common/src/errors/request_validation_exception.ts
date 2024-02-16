import { ErrorResponse } from "./error_response";
import { AppException } from "./exception.model";

export class RequestValidationException implements AppException {
    source?: String;
    message: string;
    statusCode?: number;
    stack?: string;
    exception?: any;
    name: string;

    constructor(data: Partial<RequestValidationException>) {
        Object.assign(this, data);
    }

    serializeError(): ErrorResponse {
        return new ErrorResponse([<AppException>{ message: `${this.message}` }])
    }


}
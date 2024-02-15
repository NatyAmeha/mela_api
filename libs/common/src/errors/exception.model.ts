import { ErrorResponse } from "./error_response";

export class AppException extends Error {
    source?: String;
    message: string
    statusCode?: number
    stack?: string;
    constructor(data: Partial<AppException>) {
        super();
        Object.assign(this, data);
        Object.setPrototypeOf(this, AppException.prototype)
    }

    serializeError(): ErrorResponse {
        return {};
    }

}
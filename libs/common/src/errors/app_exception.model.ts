import { ErrorResponse } from "./error_response";

export class AppException extends Error {
    source?: String;
    message: string
    statusCode?: number
    errorType?: number;
    exception?: any;

    serializeError(): ErrorResponse {
        return { errors: [] };
    }
}
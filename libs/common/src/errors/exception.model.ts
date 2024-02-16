import { ErrorResponse } from "./error_response";

export interface AppException extends Error {
    source?: String;
    message: string
    statusCode?: number
    stack?: string;
    exception?: any;

    serializeError(): ErrorResponse

}
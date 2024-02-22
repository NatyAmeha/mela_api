import { ErrorResponse } from "./error_response";
import { AppException } from "./app_exception.model";
import { ValidationError } from "class-validator";
import { get, mapValues, values } from "lodash";

export class RequestValidationException implements AppException {
    source?: String;
    message: string;
    statusCode?: number;
    errorType?: number;
    exception?: any;
    name: string;
    validationErrors?: ValidationError[]

    constructor(data: Partial<RequestValidationException>) {
        Object.assign(this, data);
    }

    serializeError(): ErrorResponse {
        var errorMsg: String[] = [];
        this.validationErrors?.forEach(error => {
            errorMsg.push(...values(error.constraints))
        })
        var finalMessage = errorMsg.length > 0 ? `${errorMsg.join(", ")}` : this.message;
        return new ErrorResponse([<AppException>{ message: finalMessage }])
    }


}
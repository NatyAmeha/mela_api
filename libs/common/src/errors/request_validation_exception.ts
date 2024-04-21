import { ErrorResponse } from "./error_response";
import { AppException } from "./app_exception.model";
import { ValidationError } from "class-validator";
import _, { get, mapValues, values } from "lodash";

export class RequestValidationException implements AppException {
    source?: string;
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
        var validationErrorMsg = []
        this.validationErrors?.forEach(e => {
            var mainError = values(e.constraints)
            if (mainError.length > 0) validationErrorMsg.push(...mainError)
            var errors = e.children?.forEach(c => {
                var errors = values(c.constraints)
                validationErrorMsg.push(...errors)
            })
        })
        console.log(this.validationErrors)
        var finalMessage = validationErrorMsg.length > 0 ? `${validationErrorMsg.join(", ")}` : this.message;
        return new ErrorResponse([<AppException>{ message: finalMessage }])
    }


}
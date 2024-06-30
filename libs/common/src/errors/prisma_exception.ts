import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { AppException } from "./app_exception.model";
import { ErrorResponse } from "./error_response";

export class PrismaException implements AppException {
    source?: string;
    name: string;
    message: string
    statusCode?: number
    errorType?: number;
    exception?: any;
    meta?: { modelName?: string, message?: string };
    code?: string;

    constructor(data: Partial<PrismaException>) {

        Object.assign(this, data);
    }
    serializeError() {
        var errorMsg: String[] = [];
        errorMsg.push(this.meta.message);
        errorMsg.push(this.message);
        var finalMessage = errorMsg.length > 0 ? `${errorMsg.join(", ")}` : this?.message;
        return new ErrorResponse([<AppException>{ message: finalMessage }])
    }
}
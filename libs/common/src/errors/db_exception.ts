import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { ErrorResponse } from "./error_response";
import { AppException } from "./app_exception.model";

export class DbException implements AppException {
    defaultSTatusCode = 500;
    constructor(data: Partial<DbException>) {
        Object.assign(this, data);
    }
    source?: String;
    message: string;
    statusCode?: number;
    errorType?: number;
    exception?: any;
    name: string;

    serializeError(): ErrorResponse {
        if (this.exception instanceof PrismaClientKnownRequestError) {
            const message = this.exception.message.replace(/\n/g, '');
            switch (this.exception.code) {
                case 'P2002': {
                    // process the message
                }
                default:
                    // default 500 error code

                    break;
            }
            return new ErrorResponse([<AppException>{ message: message, statusCode: 500 }])

        }
        else {
            return new ErrorResponse([<AppException>{ message: "Error occured in database", statusCode: 500 }])
        }
    }
}
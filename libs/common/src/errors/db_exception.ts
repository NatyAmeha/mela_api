import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { ErrorResponse } from "./error_response";
import { AppException } from "./exception.model";

export class DbException implements AppException {
    defaultSTatusCode = 500;
    constructor(data: Partial<DbException>) {
        Object.assign(this, data);
    }
    source?: String;
    message: string;
    statusCode?: number;
    stack?: string;
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
            return new ErrorResponse([{ message, statusCode: this.defaultSTatusCode } as AppException])

        }
        else {
            return new ErrorResponse([{ message: "Error occured in database", statusCode: this.defaultSTatusCode } as AppException])
        }
    }
}
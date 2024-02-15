import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { ErrorResponse } from "./error_response";
import { AppException } from "./exception.model";

export class DbException extends AppException {
    defaultSTatusCode = 500;
    constructor(private error: any) {
        super({});
    }

    serializeError(): ErrorResponse {
        if (this.error instanceof PrismaClientKnownRequestError) {
            const message = this.error.message.replace(/\n/g, '');
            switch (this.error.code) {
                case 'P2002': {
                    // process the message
                }
                default:
                    // default 500 error code

                    break;
            }
            return {
                errors: [new AppException({ message, statusCode: this.defaultSTatusCode })]
            }
        }
        else {
            return {
                errors: [new AppException({ message: "Error occured on database", source: this.source, statusCode: this.defaultSTatusCode })]
            }
        }
    }
}
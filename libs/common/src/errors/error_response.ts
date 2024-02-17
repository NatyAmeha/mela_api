import { AppException } from "./app_exception.model";

export class ErrorResponse {
    constructor(public errors: AppException[]) { }
}
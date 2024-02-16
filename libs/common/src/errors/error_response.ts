import { AppException } from "./exception.model";

export class ErrorResponse {
    constructor(public errors: AppException[]) { }
}
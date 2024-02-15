import { AppException } from "./exception.model";

export interface ErrorResponse {
    errors?: AppException[]
}
import { plainToClass } from "class-transformer";
import { IValidator } from "./validator.interface";
import { validate } from "class-validator";
import { RequestValidationException } from "../errors/request_validation_exception";
import { Injectable } from "@nestjs/common";

@Injectable()
export class ClassDecoratorValidator implements IValidator {
    static injectName = "ClassValidator"
    async validateArrayInput<T extends Object>(arrayInputs: Array<any>, classConstructor: new () => T): Promise<any> {
        const productInputs = arrayInputs.map(obj => plainToClass(classConstructor, obj));
        const errors = (await Promise.all(productInputs.map(input => validate(input)))).flat();
        console.log("validation errors", errors)
        if (errors.length > 0) {
            throw new RequestValidationException({ validationErrors: errors })
        }
    }
}
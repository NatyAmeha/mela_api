import { classToPlain, instanceToPlain } from "class-transformer";

export class BaseModel {

    removeNullFromObject() {
        const plainObject = classToPlain(this);
        Object.keys(plainObject).forEach(key => plainObject[key] === null && delete plainObject[key]);
        return plainObject;
    }
}
export interface IValidator {
    validateArrayInput<T extends Object>(arrayInputs: Array<any>, classConstructor: new () => T): Promise<any>
}
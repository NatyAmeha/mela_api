export interface IValidator {
    validateArrayInput<T extends Object>(arrayInputs: Array<any>, classConstructor: new ({ }) => T): Promise<any>
    isObjectAreEqual<T extends Object>(obj1: T, obj2: T): boolean
}
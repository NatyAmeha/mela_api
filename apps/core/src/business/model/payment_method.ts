export class PaymentMethod {
    id?: string;
    name: string;
    type: string;
    constructor(partial?: Partial<PaymentMethod>) {
        Object.assign(this, partial);
    }
}
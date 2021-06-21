export interface IEvent {
    sku: string;
    qty: number;
    datetime: number;
    reason?: string;
}

class ProductEvent {
    constructor(public sku: string, public qty: number, public datetime: number) {}
}

export class ProductReceivedEvent extends ProductEvent {}

export class ProductShippedEvent extends ProductEvent {}

export class InvetoryAdjustedEvent extends ProductEvent {
    reason: string;

    constructor(sku: string, qty: number, datetime: number, reason: string) {
        super(sku, qty, datetime);

        this.reason = reason;
    }
}

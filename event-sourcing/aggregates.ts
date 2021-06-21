
import {ProductShippedEvent, ProductReceivedEvent, InvetoryAdjustedEvent, IEvent} from "./events";

interface ICurrentStateProjection {
    qty: number;
    reason?: string;
}

export class ProductAggregate {
    sku: string;
    private _events: IEvent[];
    private _currentState: ICurrentStateProjection; 

    constructor(sku: string) {
        this.sku = sku;
        this._events = [];
        this._currentState = {qty: 0};
    }

    get projectedQty(): number {
        return this._currentState.qty;
    }

    get projectedReason(): string {
        return this._currentState.reason || 'NA';
    }

    shippedProduct(qty: number): void {
       if(qty > this._currentState.qty) {
           throw new Error('Request product quantity exceeds stock');
       } 

       this.addEvent(new ProductShippedEvent(this.sku, qty, Date.now()));
    } 

    receivedProduct(qty: number): void {
       this.addEvent(new ProductReceivedEvent(this.sku, qty, Date.now()));
    } 

    adjustedInventory(qty: number, reason: string): void {
       this.addEvent(new InvetoryAdjustedEvent(this.sku, qty, Date.now(), reason))
    }

    private applyEvent(event: IEvent) {
        const applyAction = {
            ProductReceivedEvent: () => { this._currentState.qty+=event.qty; },
            ProductShippedEvent: () => { this._currentState.qty-=event.qty; },
            InvetoryAdjustedEvent: () => { this._currentState.qty=event.qty; },
        }[event.constructor.name] || (() => { 
            throw new Error('Invalid ProductEvent'); 
        });

        applyAction();
    }

    addEvent(event: IEvent): void { 
        this.applyEvent(event);
        this._events.push(event);
    }

    getEvents(): IEvent[] {
        return this._events;
    }
}

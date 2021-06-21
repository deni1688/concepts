import {IEvent} from "./events";
import {ProductAggregate} from "./aggregates";



export class ProductRepo {
   _inMemDBStore: Map<string,IEvent[]>;

   constructor() {
       this._inMemDBStore = new Map<string, IEvent[]>();
   }

    getProduct(sku: string): ProductAggregate {
        const productAggregate = new ProductAggregate(sku);
        
        this._inMemDBStore.get(sku)?.forEach(event => productAggregate.addEvent(event));

        return productAggregate;
    }

    save(sku: string, Product: ProductAggregate): void {
        this._inMemDBStore.set(sku, Product.getEvents());
    }
}

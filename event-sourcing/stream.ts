import {ProductAggregate} from "./aggregates";
import {ProductRepo} from "./repositories";

import {createInterface} from "readline";

const readline = createInterface({input: process.stdin, output: process.stdout});

function getSkuArgs() {
    const skuArgs: string[] = []; 

    for (let index = 2; index < process.argv.length; index++) {
        skuArgs.push(process.argv[index]);     
    }

    if(skuArgs.length < 1) {
        throw new Error('Enter SKUs ex: stream.ts sku1 sku2 sku3');
    }

    return skuArgs;
}

function run() {
    const skuArgs = getSkuArgs();

    const repo = new ProductRepo();

    for (const sku of skuArgs) {
        const p = new ProductAggregate(sku);
        repo.save(sku, p);
    }

    const events = `
r:sku:qty: ProductReceivedEvent
s:sku:qty: ProductShippedEvent
x: CloseStream

> `

    function loop() {
        readline.question(events, action => {
            if(action !== 'x') {
                const inputs = action.split(":");
                const event = inputs[0];
                const sku  = inputs[1]; 
                const qty  = parseInt(inputs[2]); 
        
                let p = repo.getProduct(sku);

                if(event === 'r') {
                    p.receivedProduct(qty);
                }

                if(event === 's') {
                    try {
                        p.shippedProduct(qty);
                    } catch(e) {
                        console.log(e.message)
                    }
                }

                console.log("Sku:",sku,"Qty:",p.projectedQty);
                repo.save(sku, p);

                loop();
            } else {
                console.log('Shutting down event stream');
                readline.close();
            }
        }); 
    }

    loop();
}

run();

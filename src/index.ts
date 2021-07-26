import Big from 'big.js';
import {dinero, Dinero, toSnapshot, toUnit as dineroToUnit} from 'dinero.js';
import { createDinero, Calculator} from '@dinero.js/core';

import {Currency} from "@dinero.js/currencies/dist/esm/types";
import {USD} from "@dinero.js/currencies";

declare type Formatter<TInput> = {
    readonly toUnit: (amount: TInput) => string;
    readonly toDecimalUnit: (amount: TInput) => string;
};


type DineroWithFormatter<TAmount> = {
    dinero: Dinero<TAmount>,
    formatter: Formatter<Dinero<TAmount>>
}

const calculator: Calculator<Big> = {
    add: (a, b) => a.plus(b),
    // @ts-ignore
    compare: (a, b) => a.cmp(b),
    decrement: (v) => v.minus(Big(1)),
    increment: (v) => v.plus(Big(1)),
    integerDivide: (a, b) => a.div(b).round(0),
    modulo: (a, b) => a.mod(b),
    multiply: (a, b) => a.times(b),
    // @ts-ignore
    power: (a, b) => a.pow(b),
    subtract: (a, b) => a.minus(b),
    toNumber: (v) => v.toNumber(),
    zero: () => Big(0),
};

const bigJSformatter: Formatter<Dinero<Big>> = {
    toUnit: (money) => {
        const {amount, currency} = toSnapshot(money)

        return `${amount.toString()} ${currency.code}`
    },
    toDecimalUnit: (money) => {
        const {amount, currency} = toSnapshot(money)

        // https://en.wikipedia.org/wiki/ISO_4217#cite_note-divby5-13
        if(['MGA', 'MRU'].includes(currency.code)) {
            return `${amount.div(currency.base.pow(currency.exponent.toNumber())).toString()} ${currency.code}`
        }

        if(!currency.base.eq(Big(10))) {
            throw new Error(`"${currency.code}" currency is not in base 10 so it can't reliably have a decimal representation`)
        }

        return `${amount.div(currency.base.pow(currency.exponent.toNumber())).toFixed(currency.exponent.toNumber())} ${currency.code}`
    },
};

const USDbigJs: Currency<Big> = {
    code: 'USD',
    base: Big(10),
    exponent: Big(2),
}

const MGAbigJs: Currency<Big> = {
    code: 'MGA',
    base: Big(5),
    exponent: Big(1),
}

const dineroBigJs = createDinero({ calculator });

const dineroUSDBigJsWithFormatter: DineroWithFormatter<Big> = {
    dinero: dineroBigJs({amount: Big('1000000000000000050'), currency: USDbigJs}),
    formatter: bigJSformatter
}
const dineroMAGBigJsWithFormatter: DineroWithFormatter<Big> = {
    dinero: dineroBigJs({amount: Big('1'), currency: MGAbigJs}),
    formatter: bigJSformatter
}


const toUnit: (dineroWithFormatter: DineroWithFormatter<any>) => string = (dineroWithFormatter) => {
    return dineroWithFormatter.formatter.toUnit(dineroWithFormatter.dinero);
}
const toDecimalUnit: (dineroWithFormatter: DineroWithFormatter<any>) => string = (dineroWithFormatter) => {
    return dineroWithFormatter.formatter.toDecimalUnit(dineroWithFormatter.dinero);
}

console.log(toUnit(dineroUSDBigJsWithFormatter));
console.log(toDecimalUnit(dineroUSDBigJsWithFormatter));
console.log(dineroToUnit(dinero({amount: 1000000000000000050, currency: USD})));

console.log(toUnit(dineroMAGBigJsWithFormatter));
console.log(toDecimalUnit(dineroMAGBigJsWithFormatter));




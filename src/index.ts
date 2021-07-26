import Big from 'big.js';
import {Calculator, createDinero, dinero, Dinero, toSnapshot} from 'dinero.js';
import {
    BinaryOperation,
    DineroOptions,
    DineroSnapshot,
    TransformOperation,
    UnaryOperation
} from "@dinero.js/core/dist/esm/types";
import {CreateDineroOptions} from "@dinero.js/core/dist/esm/helpers/createDinero";
import {Currency} from "@dinero.js/currencies/dist/esm/types";

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

        if(!currency.base.eq(Big(10))) {
            throw new Error(`${currency} currency is not in base 10 so it can't reliably have a decimal representation`)
        }

        return `${amount.div(currency.exponent.mul(currency.base))} ${currency.code}`
    },
};

const USDbigJs: Currency<Big> = {
    code: 'USD',
    base: Big(10),
    exponent: Big(2),
}
const dineroBigJs = createDinero({ calculator });

const dineroBigJsWithFormatter: DineroWithFormatter<Big> = {
    dinero: dineroBigJs({amount: Big('1000'), currency: USDbigJs}),
    formatter: bigJSformatter
}

const toUnit: (dineroWithFormatter: DineroWithFormatter<any>) => string = (dineroWithFormatter) => {
    return dineroWithFormatter.formatter.toUnit(dineroWithFormatter.dinero);
}

toUnit(dineroBigJsWithFormatter)



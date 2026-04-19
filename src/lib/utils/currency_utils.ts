import { CURRENCY_CRC, CURRENCY_USD, type Transaction } from "../models/transaction";

/**
 * Converts an array of transactions from CRC to USD using a fixed exchange rate.
 */
export function CRC2USD(transactions: Transaction[]) {
    for (const t of transactions) {
        if(t.currency !== CURRENCY_CRC) {
            console.warn(`Skipping transaction ${t.id} with currency ${t.currency} because it is not CRC.`);
            continue;
        }
        t.amount = t.amount * 0.002;
        t.currency = CURRENCY_USD;
    }
}
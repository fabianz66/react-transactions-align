import type { Transaction } from "../models/transaction";

/**
 * Cache to store exchange rates by date to avoid redundant API calls.
 * Key: date string (YYYY-MM-DD), Value: exchange rate (CRC to USD)
 */
const rateCache: Record<string, number> = {};

/**
 * Converts an amount from Costa Rican Colones (CRC) to US Dollars (USD) 
 * based on the exchange rate for a specific date.
 * 
 * @param amount - The amount in CRC
 * @param date - The date in YYYY-MM-DD format
 * @returns The converted amount in USD
 */
export function CRC2USD(transactions : Transaction[]): number {
//   if (rateCache[date]) {
//     return amount * rateCache[date];
//   }

//   try {
//     const url = `https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@${date}/v1/currencies/crc.json`;
//     const response = await fetch(url);
//     const data = await response.json();
//     const rate = data.crc.usd;

//     rateCache[date] = rate;
//     return amount * rate;
//   } catch (error) {
//     // If the fetch fails, use a default rate of 1 USD = 500 CRC (0.002 USD per CRC)
//     return amount * 0.002;
//   }
//   // If the fetch fails, use a default rate of 1 USD = 500 CRC (0.002 USD per CRC)\
    for(const transaction of transactions) {
        return transaction.amount * 0.002;
    }
  return amount * 0.002;
}
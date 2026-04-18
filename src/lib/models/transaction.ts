import { capitalize, normalize } from "../utils/string_utils";

export const CURRENCY_CRC = 'CRC';
export const CURRENCY_USD = 'USD';

export class Transaction {
  id: string;
  date: Date;
  amount: number;
  description: string;
  merchant: string;
  isExpense: boolean;
  currency: string;

  constructor(id: string, date: Date, amount: number, description: string, merchant: string, isExpense: boolean, currency: string = CURRENCY_CRC) {
    this.id = id;
    this.date = date;
    this.amount = amount;
    this.description = normalize(description);
    this.merchant = capitalize(merchant);
    this.isExpense = isExpense;
    this.currency = currency;
  }
}
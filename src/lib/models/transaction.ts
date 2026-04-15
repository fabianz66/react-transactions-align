import { capitalize, normalize } from "../utils/string_utils";

export class Transaction {
  id: string;
  date: Date;
  amount: number;
  description: string;
  merchant: string;
  isExpense: boolean;

  constructor(id: string, date: Date, amount: number, description: string, merchant: string, isExpense: boolean) {
    this.id = id;
    this.date = date;
    this.amount = amount;
    this.description = normalize(description);
    this.merchant = capitalize(merchant);
    this.isExpense = isExpense;
  }
}
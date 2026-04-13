export class Transaction {
  id: string;
  date: Date;
  amount: number;
  description: string;
  isExpense: boolean;

  constructor(id: string, date: Date, amount: number, description: string, isExpense: boolean) {
    this.id = id;
    this.date = date;
    this.amount = amount;
    this.description = description;
    this.isExpense = isExpense;
  }
}
import { Transaction } from './transaction';

export class Parser {
  static async parse(file: File): Promise<Transaction[]> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const csv = e.target?.result as string;
          const transactions = this.parseCsv(csv);
          resolve(transactions);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  }

  private static parseCsv(csv: string): Transaction[] {
    const lines = csv.split('\n').filter(line => line.trim());
    const transactions: Transaction[] = [];

    for (let i = 1; i < lines.length; i++) { // Skip header
      const columns = lines[i].split(',');
      if (columns.length >= 5) {
        const id = columns[0].trim();
        const date = new Date(columns[1].trim());
        const amount = parseFloat(columns[2].trim());
        const description = columns[3].trim();
        const isExpense = columns[4].trim().toLowerCase() === 'true';

        transactions.push(new Transaction(id, date, amount, description, isExpense));
      }
    }

    return transactions;
  }
}
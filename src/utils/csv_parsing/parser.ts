import { Transaction } from './transaction';

export class Parser {
  public static async getCSVTransactions(file: File): Promise<Transaction[]> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const csv = e.target?.result as string;
          const csvLines: string[] = csv.split(/\r?\n/).filter(line => line.trim().length > 0);
          let result : Transaction[] = [];
          if (this.isBNCRv1(csvLines)) {
            result = this.getBNCRv1Transactions(csvLines);
          } else if (this.isBACv1(csvLines)) {
            result = this.getBACv1Transactions(csvLines);
          } else {
            throw new Error('Unsupported CSV format: ' + csv);
          }        
          resolve(result);  
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  }

  private static getBACv1Transactions(csvLines: string[]): Transaction[] {    
    const transactions: Transaction[] = [];

    // BAC CSV has 4 header lines, data starts at line 5 (0-based index).
    const FIRST_DATA_LINE_INDEX = 5; 

    for (let i = FIRST_DATA_LINE_INDEX; i < csvLines.length; i++) { // Skip headers
      const columns = csvLines[i].split(';');
      if (columns.length >= 5) {
        const tDate = columns[0].trim(); 
        const tID = columns[1].trim(); 
        const tDebit = columns[4].trim().replace(/,/g, ''); 
        const tCredit = columns[5].trim().replace(/,/g, ''); 
        const tDescription = columns[3].trim(); 

        // Stop when we reach empty lines at the end of the file.
        if(tDate.length === 0 || tID.length === 0 || tDescription.length === 0) break; 

        const isExpense = tDebit.length > 0 && !isNaN(parseFloat(tDebit));
        const date = this.parseDate(tDate);
        const amount = isExpense ? parseFloat(tDebit) : (parseFloat(tCredit) || 0);

        transactions.push(new Transaction(tID, date, amount, tDescription, isExpense));
      }
    }
    return transactions;
  }

  private static getBNCRv1Transactions(csvLines: string[]): Transaction[] {
    const transactions: Transaction[] = [];

    // BNCR CSV has 1 header line, data starts at line 1 (0-based index)    
    // It also has one additional line at the end with totals, so we stop before the last line.
    const FIRST_DATA_LINE_INDEX = 1; 

    for (let i = FIRST_DATA_LINE_INDEX; i < csvLines.length - 1 ; i++) {
      const columns = csvLines[i].split(';');
      if (columns.length >= 6) {
        
        const tDate = columns[1].trim(); // fechaMovimiento
        const tID = columns[2].trim(); // numeroDocumento
        const tDebit = columns[3].trim().replace(/,/g, '');  // debito
        const tCredit = columns[4].trim().replace(/,/g, ''); // credito
        const tDescription = columns[5].trim(); // descripcion
        
        const isExpense = tDebit.length > 0 && !isNaN(parseFloat(tDebit));
        const date = this.parseDate(tDate);
        const amount = isExpense ? parseFloat(tDebit) : (parseFloat(tCredit) || 0);
        
        transactions.push(new Transaction(tID, date, amount, tDescription, isExpense));
      }
    }
    return transactions;
  }

  private static isBNCRv1(csvLines: string[]): boolean {
    const header = csvLines[0]?.trim();
    return header === 'oficina;fechaMovimiento;numeroDocumento;debito;credito;descripcion;';
  }

  private static isBACv1(csvLines: string[]): boolean {
    const header = csvLines[4];
    if (!header) return false;

    const columns: string[] = header.split(';').map(c => c.trim());    
    return columns.length >= 6 &&
      columns[0] === 'Fecha de Transacción' && 
      columns[1] === 'Referencia de Transacción' && 
      columns[2] === 'Código de Transacción' && 
      columns[3] === 'Descripción de Transacción' && 
      columns[4] === 'Débito de Transacción' && 
      columns[5] === 'Balance de Transacción';
  }

  // Parses a date string in the format "DD/MM/YYYY" and returns a Date object.
  private static parseDate(dateStr: string): Date {
    // Costa Rican Format: DD/MM/YYYY.
    // Date constructor expects: (YYYY, MM-1, DD) because months are 0-indexed.
    const parts = dateStr.split('/');
    if (parts.length === 3) {
      return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
    }
    return new Date(dateStr);
  }
}
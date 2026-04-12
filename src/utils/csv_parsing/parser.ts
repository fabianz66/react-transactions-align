import { Transaction } from './transaction';
import { diffStringsUnified } from '@vitest/utils/diff';

export class Parser {

  // Index removing empty lines and trimming whitespace.
  private static readonly BNCR_V1_HEADER_INDEX = 0;
  private static readonly BNCR_V1_HEADER = 'oficina;fechaMovimiento;numeroDocumento;debito;credito;descripcion;';

  // Index removing empty lines and trimming whitespace.
  private static readonly BAC_V1_HEADER_INDEX = 3;
  private static readonly BAC_V1_HEADER = 'Fecha de Transaccin, Referencia de Transaccin, Cdigo de Transaccin, Descripcin de Transaccin, Dbito de Transaccin, Crdito de Transaccin, Balance de Transaccin';

  public static async getCSVTransactions(file: File): Promise<Transaction[]> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const csv = e.target?.result as string;          
          const result = this.getCSVTransactionsAux(csv);                  
          resolve(result);  
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file, 'UTF-8');
    });
  }

  private static getCSVTransactionsAux(csv: string): Transaction[] {
    // Remove any replacement characters that may have been introduced during file reading.
    csv = csv.replace(/\uFFFD/g, ""); 
    const csvLines = csv.split(/\r?\n/).filter(line => line.trim().length > 0);

    if (this.isBNCRv1(csvLines)) {
      return this.getBNCRv1Transactions(csvLines);
    } else if (this.isBACv1(csvLines)) {
      return this.getBACv1Transactions(csvLines);
    }    

    // Generate a helpful diff for debugging why the header didn't match.
    const bncrHeader = csvLines[this.BNCR_V1_HEADER_INDEX]?.trim();
    const bacHeader = csvLines[this.BAC_V1_HEADER_INDEX]?.trim();
    const bncrDiff = diffStringsUnified(this.BNCR_V1_HEADER, bncrHeader);
    const bacDiff = diffStringsUnified(this.BAC_V1_HEADER, bacHeader);
    throw new Error(`Unsupported CSV format.\n\nBNCR Check:\n${bncrDiff}\n\nBAC Check:\n${bacDiff}`);
  }

  private static getBACv1Transactions(csvLines: string[]): Transaction[] {    
    const transactions: Transaction[] = [];

    for (let i = this.BAC_V1_HEADER_INDEX + 1; i < csvLines.length; i++) {
      const columns = csvLines[i].split(',');
      if (columns.length == 7) {
        const tDate = columns[0]?.trim(); 
        const tID = columns[1]?.trim(); 
        const tDebit = parseFloat(columns[4]?.trim().replace(/,/g, '')); 
        const tCredit = parseFloat(columns[5]?.trim().replace(/,/g, '')); 
        const tDescription = columns[3]?.trim(); 
        const isExpense = tDebit > 0;
        const date = this.parseDate(tDate);
        const amount = isExpense ? tDebit : tCredit;

        transactions.push(new Transaction(tID, date, amount, tDescription, isExpense));
      } else {
        // Stop when we reach lines that don't match the expected format, which likely means we've hit the totals or malformed lines.
        break; 
      }
    }
    return transactions;
  }

  private static getBNCRv1Transactions(csvLines: string[]): Transaction[] {
    const transactions: Transaction[] = [];

    // BNCR CSV has 1 header line, data starts at line 1 (0-based index)    
    // It also has one additional line at the end with totals, so we stop before the last line.
    for (let i = this.BNCR_V1_HEADER_INDEX + 1; i < csvLines.length - 1 ; i++) {
      const columns = csvLines[i].split(';');
      if (columns.length == 7) {
        const tDate = columns[1]?.trim(); // fechaMovimiento
        const tID = columns[2]?.trim(); // numeroDocumento
        const tDebit = parseFloat(columns[3]?.trim().replace(/,/g, ''));  // debito
        const tCredit = parseFloat(columns[4]?.trim().replace(/,/g, '')); // credito
        const tDescription = columns[5]?.trim(); // descripcion
        const isExpense = tDebit > 0;
        const date = this.parseDate(tDate);
        const amount = isExpense ? tDebit : tCredit;
        
        transactions.push(new Transaction(tID, date, amount, tDescription, isExpense));
      } else {
        // Stop when we reach lines that don't match the expected format, which likely means we've hit the totals or malformed lines.
        break; 
      }
    }
    return transactions;
  }

  private static isBNCRv1(csvLines: string[]): boolean {
    const header = csvLines[this.BNCR_V1_HEADER_INDEX]?.trim();
    return header === this.BNCR_V1_HEADER;
  }

  private static isBACv1(csvLines: string[]): boolean {
    const header = csvLines[this.BAC_V1_HEADER_INDEX]?.trim();
    return header === this.BAC_V1_HEADER;
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
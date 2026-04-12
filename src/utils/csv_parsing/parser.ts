import { Transaction } from './transaction';
import { diffStringsUnified } from '@vitest/utils/diff';

// Constants are kept at the module level (not exported if only used here)
const BNCR_V1_HEADER_INDEX = 0;
const BNCR_V1_HEADER = 'oficina;fechaMovimiento;numeroDocumento;debito;credito;descripcion;';

const BAC_V1_HEADER_INDEX = 3;
const BAC_V1_HEADER = 'Fecha de Transaccin, Referencia de Transaccin, Cdigo de Transaccin, Descripcin de Transaccin, Dbito de Transaccin, Crdito de Transaccin, Balance de Transaccin';

/**
 * Publicly exported function to handle the file reading and parsing.
 */
export async function getCSVTransactions(file: File): Promise<Transaction[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const csv = e.target?.result as string;          
        const result = getCSVTransactionsAux(csv);                  
        resolve(result);  
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file, 'UTF-8');
  });
}

function getCSVTransactionsAux(csv: string): Transaction[] {
  // Remove any replacement characters
  csv = csv.replace(/\uFFFD/g, ""); 
  const csvLines = csv.split(/\r?\n/).filter(line => line.trim().length > 0);

  if (isBNCRv1(csvLines)) {
    return getBNCRv1Transactions(csvLines);
  } else if (isBACv1(csvLines)) {
    return getBACv1Transactions(csvLines);
  }    

  const bncrHeader = csvLines[BNCR_V1_HEADER_INDEX]?.trim();
  const bacHeader = csvLines[BAC_V1_HEADER_INDEX]?.trim();
  const bncrDiff = diffStringsUnified(BNCR_V1_HEADER, bncrHeader);
  const bacDiff = diffStringsUnified(BAC_V1_HEADER, bacHeader);
  throw new Error(`Unsupported CSV format.\n\nBNCR Check:\n${bncrDiff}\n\nBAC Check:\n${bacDiff}`);
}

function getBACv1Transactions(csvLines: string[]): Transaction[] {    
  const transactions: Transaction[] = [];

  for (let i = BAC_V1_HEADER_INDEX + 1; i < csvLines.length; i++) {
    const columns = csvLines[i].split(',');
    if (columns.length == 7) {
      const tDate = columns[0]?.trim(); 
      const tID = columns[1]?.trim(); 
      const tDebit = parseFloat(columns[4]?.trim().replace(/,/g, '')); 
      const tCredit = parseFloat(columns[5]?.trim().replace(/,/g, '')); 
      const tDescription = columns[3]?.trim(); 
      const isExpense = tDebit > 0;
      const date = parseDate(tDate);
      const amount = isExpense ? tDebit : tCredit;

      transactions.push(new Transaction(tID, date, amount, tDescription, isExpense));
    } else {
      break; 
    }
  }
  return transactions;
}

function getBNCRv1Transactions(csvLines: string[]): Transaction[] {
  const transactions: Transaction[] = [];

  for (let i = BNCR_V1_HEADER_INDEX + 1; i < csvLines.length - 1 ; i++) {
    const columns = csvLines[i].split(';');
    if (columns.length == 7) {
      const tDate = columns[1].trim();
      const tID = columns[2].trim();
      const tDebit = parseFloat(columns[3].trim().replace(/,/g, ''));
      const tCredit = parseFloat(columns[4].trim().replace(/,/g, ''));
      const tDescription = columns[5].trim();
      const isExpense = tDebit > 0;
      const date = parseDate(tDate);
      const amount = isExpense ? tDebit : tCredit;
      
      transactions.push(new Transaction(tID, date, amount, tDescription, isExpense));
    } else {
      break; 
    }
  }
  return transactions;
}

function isBNCRv1(csvLines: string[]): boolean {
  const header = csvLines[BNCR_V1_HEADER_INDEX]?.trim();
  return header === BNCR_V1_HEADER;
}

function isBACv1(csvLines: string[]): boolean {
  const header = csvLines[BAC_V1_HEADER_INDEX]?.trim();
  return header === BAC_V1_HEADER;
}

function parseDate(dateStr: string): Date {
  const parts = dateStr.split('/');
  if (parts.length === 3) {
    return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
  }
  return new Date(dateStr);
}
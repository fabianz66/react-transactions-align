import { Transaction } from '../models/transaction';

/**
 * Exports an array of Transactions to a CSV string compatible with Monarch Money.
 * Format: Date,Merchant,Category,Original Statement,Amount
 */
export function exportToMonarch(transactions: Transaction[]): string {
  const header = 'Date,Merchant,Category,Original Statement,Amount';
  
  const rows = transactions.map(t => {
    const date = t.date.toISOString().split('T')[0];
    const rawMerchant = getMerchant(t);
    const merchant = `"${rawMerchant.replace(/"/g, '""')}"`;
    const category = categorize(t);
    // Escapes double quotes in the description and wraps it in double quotes for CSV.
    const originalStatement = `"${t.description.replace(/"/g, '""')}"`;
    const amount = t.isExpense ? -t.amount : t.amount;

    return [date, merchant, category, originalStatement, amount].join(',');
  });

  return [header, ...rows].join('\n');
}

/**
 * Default categorization logic based on common keywords for Costa Rican banks
 * and Monarch Money default categories.
 */
export function categorize(t : Transaction): string {
  const desc = t.description.toUpperCase();

  if (!t.isExpense) {
    if (desc.includes('NOMINA') || desc.includes('PLANILLA') || desc.includes('INTERES')) return 'Income';
    return 'Transfer';
  }

  if (desc.includes('AMAZON') || desc.includes('APPLE') || desc.includes('MARKET')) return 'Shopping';
  if (desc.includes('UBER') || desc.includes('DIDI') || desc.includes('GASOLIN') || desc.includes('PEAJE')) return 'Auto & Transport';
  if (desc.includes('RESTAURANTE') || desc.includes('CAFE') || desc.includes('SPOON') || desc.includes('MCDONALDS')) return 'Restaurants';
  if (desc.includes('SUPER') || desc.includes('AUTO MERCADO') || desc.includes('VINDI') || desc.includes('GROCERY') || desc.includes('MASXMENOS') || desc.includes('PALI')) return 'Groceries';
  if (desc.includes('ALQUILER') || desc.includes('RENT') || desc.includes('CONDOMINIO')) return 'Housing';
  if (desc.includes('SERVICIO') || desc.includes('TELEFONO') || desc.includes('ICE ') || desc.includes('AYA ') || desc.includes('SUSCRIPCION')) return 'Bills & Utilities';
  
  return 'Uncategorized';
}

/**
 * Guesses the merchant name from the transaction description.
 */
export function getMerchant(t: Transaction): string {
  const desc = t.description.toUpperCase();

  if (desc.includes('AMAZON')) return 'Amazon';
  if (desc.includes('APPLE')) return 'Apple';
  if (desc.includes('UBER')) return 'Uber';
  if (desc.includes('DIDI')) return 'Didi';
  if (desc.includes('MCDONALDS')) return "McDonald";
  if (desc.includes('SPOON')) return 'Spoon';
  if (desc.includes('AUTO MERCADO')) return 'Auto Mercado';
  if (desc.includes('VINDI')) return 'Vindi';
  if (desc.includes('MASXMENOS')) return 'Mas x Menos';
  if (desc.includes('PALI')) return 'Pali';
  if (desc.includes('ICE ')) return 'ICE';
  if (desc.includes('AYA ')) return 'AyA';

  return t.description;
}

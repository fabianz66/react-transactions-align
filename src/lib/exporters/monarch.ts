import { Transaction } from '../models/transaction';
import { includesAny, includesAnyWord } from '../utils/string_utils';

/**
 * Exports an array of Transactions to a CSV string compatible with Monarch Money.
 * Format: Date,Merchant,Category,Original Statement,Amount
 */
export function exportToMonarch(transactions: Transaction[]): string {
  const header = 'Date,Merchant,Category,Original Statement,Amount';
  
  const rows = transactions.map(t => {
    const date = t.date.toISOString().split('T')[0];
    const category = categorize(t);
    const originalStatement = t.description.trim();
    const amount = t.isExpense ? -t.amount : t.amount;

    return [date, t.merchant, category, originalStatement, amount].join(',');
  });

  return [header, ...rows].join('\n');
}

/**
 * Default categorization logic based on common keywords for Costa Rican banks
 * and Monarch Money default categories.
 */
function categorize(t : Transaction): string {
  const desc = t.description.toUpperCase();

  if (includesAnyWord(desc, ['NOMINA', 'PLANILLA'])) return 'Income';
  if (includesAnyWord(desc, ['INTERES', 'INTERESES'])) return 'Interest';
  if (includesAnyWord(desc, ['COMISION'])) return 'Financial Fees';
  if (includesAnyWord(desc, ['IVA'])) return 'Taxes';
  if (includesAnyWord(desc, ['ARIPAGOCAMBIODEDIVISA', 'ARI-DEBITO', 'TRANSFER', 'ATM', 'TRANSFERENCIA'])) return 'Transfer';  
  if (includesAnyWord(desc, ['ICELEC', 'ELECTRICIDAD', 'LUZ', 'SERVICIOS'])) return 'Gas & Electric';
  if (includesAnyWord(desc, ['AGUA'])) return 'Water';
  if (includesAnyWord(desc, ['LIBERTY'])) return 'Internet & Cable';
  if (includesAnyWord(desc, ['ICETEL', 'TELEFONO', 'CELULAR'])) return 'Phone';  
  if (includesAnyWord(desc, ['COMIDA', 'GROCERIES', 'SUPER', 'AUTO MERCADO', 'VINDI', 'GROCERY', 'MASXMENOS', 'PALI', 'FERIA'])) return 'Groceries';
  if (includesAnyWord(desc, ['FERRETERIA'])) return 'Home Improvement';
  if (includesAnyWord(desc, ['CCSS'])) return 'Medical';
  if (includesAnyWord(desc, ['DENTISTA', 'DENTIST'])) return 'Dentist'; 
  if (includesAnyWord(desc, ['PELO', 'CABELLO'])) return 'Personal';
  if (includesAnyWord(desc, ['AMAZON', 'APPLE', 'MARKET'])) return 'Shopping';
  if (includesAnyWord(desc, ['UBER', 'GASOLINA', 'PEAJE'])) return 'Auto & Transport';
  if (includesAnyWord(desc, ['RESTAURANTE', 'CAFE', 'SPOON', 'MCDONALDS', 'DIDI'])) return 'Restaurants';
  if (includesAnyWord(desc, ['ALQUILER', 'RENTA', 'RENT'])) return 'Rent';
  if (includesAnyWord(desc, ['LAVACAR', 'CARRO'])) return 'Auto Maintenance';
  if (includesAnyWord(desc, ['COMPASS','QUICKPASS','PARKING', 'PARQUEO'])) return 'Parking & Tolls';
  if (includesAnyWord(desc, ['GASOLINERA', 'SERVICENTRO'])) return 'Gas';
  if (includesAnyWord(desc, ['REGALO'])) return 'Gifts';
  if (includesAnyWord(desc, ['MATERNO','MATERNAL','ESCUELA'])) return 'Child Care';
  if (includesAnyWord(desc, ['POLIZA'])) return 'Insurance';
  if (includesAny(desc, ['DISNEY', 'NETFLIX', 'HBO', 'MAX', 'YOUTUBE', 'SPOTIFY', 'HULU', 'PARAMOUNT', 'PRIME VIDEO', 'APPLE TV', 'PEACOCK', 'TIDAL', 'PANDORA', 'CRUNCHYROLL', 'APPLE MUSIC'])) return 'Entertainment & Recreation';
  
  return 'Uncategorized';
}

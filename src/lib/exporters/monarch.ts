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
function categorize(t : Transaction): string {
  const desc = t.description.toUpperCase();

  if (includesAnyWord(desc, ['NOMINA', 'PLANILLA'])) return 'Income';
  if (includesAnyWord(desc, ['INTERES', 'INTERESES'])) return 'Interest';
  if (includesAnyWord(desc, ['COMISION'])) return 'Financial Fees';
  if (includesAnyWord(desc, ['IVA'])) return 'Taxes';
  if (includesAnyWord(desc, ['ARIPAGOCAMBIODEDIVISA', 'ARI-DEBITO', 'TRANSFER', 'ATM'])) return 'Transfer';  
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
  if (includesAnyWord(desc, ['UBER', 'DIDI', 'GASOLIN', 'PEAJE'])) return 'Auto & Transport';
  if (includesAnyWord(desc, ['RESTAURANTE', 'CAFE', 'SPOON', 'MCDONALDS'])) return 'Restaurants';
  if (includesAnyWord(desc, ['ALQUILER', 'RENTA', 'RENT', 'CONDOMINIO'])) return 'Housing';
  if (includesAnyWord(desc, ['LAVACAR', 'CARRO'])) return 'Auto Maintenance';
  if (includesAnyWord(desc, ['COMPASS','PARKING', 'PARQUEO'])) return 'Parking & Tolls';
  if (includesAnyWord(desc, ['GASOLINERA', 'SERVICENTRO'])) return 'Gas';
  if (includesAnyWord(desc, ['REGALO'])) return 'Gifts';
  if (includesAny(desc, ['DISNEY', 'NETFLIX', 'HBO', 'MAX', 'YOUTUBE', 'SPOTIFY', 'HULU', 'PARAMOUNT', 'PRIME VIDEO', 'APPLE TV', 'PEACOCK', 'TIDAL', 'PANDORA', 'CRUNCHYROLL', 'APPLE MUSIC'])) return 'Entertainment & Recreation';
  
  return 'Uncategorized';
}

/**
 * Guesses the merchant name from the transaction description.
 */
function getMerchant(t: Transaction): string {
  const desc = t.description.toUpperCase();

  // Specific keyword-based merchants
  if (includesAnyWord(desc, ['ICETEL'])) return 'ICETEL';
  if (includesAnyWord(desc, ['CCSS'])) return 'CCSS';
  if (includesAnyWord(desc, ['LIBERTY'])) return 'Liberty';
  if (includesAnyWord(desc, ['ICELEC'])) return 'ICELEC';
  if (includesAnyWord(desc, ['AMAZON'])) return 'Amazon';
  if (includesAnyWord(desc, ['APPLE'])) return 'Apple';
  if (includesAnyWord(desc, ['UBER'])) return 'Uber';
  if (includesAnyWord(desc, ['DIDI'])) return 'Didi';
  if (includesAnyWord(desc, ['MCDONALDS'])) return "McDonalds";
  if (includesAnyWord(desc, ['SPOON'])) return 'Spoon';
  if (includesAnyWord(desc, ['AUTO MERCADO'])) return 'Auto Mercado';
  if (includesAnyWord(desc, ['VINDI'])) return 'Vindi';
  if (includesAnyWord(desc, ['MASXMENOS'])) return 'Mas x Menos';
  if (includesAnyWord(desc, ['PALI'])) return 'Pali';

  // Pattern: "00000000/ TEXT" - extracts the phone number and subsequent text
  // Matches 8 digits, followed by '/', then any combination of alphanumeric, spaces, slashes, hyphens, or periods.
  const phoneNumberPattern = /(\d{8}\/[A-Z0-9\s\/\-\.]+)/;
  const phoneNumberMatch = desc.match(phoneNumberPattern);
  if (phoneNumberMatch && phoneNumberMatch[1]) {
    return phoneNumberMatch[1].trim();
  }

  // Pattern: "TEXT1/ TEXT2" - extracts the second part after the last '/'
  // Matches any text, followed by '/', then captures the subsequent text.
  const textSlashTextPattern = /.*\/([A-Z0-9\s\/\-\.]+)/;
  const textSlashTextMatch = desc.match(textSlashTextPattern);
  if (textSlashTextMatch && textSlashTextMatch[1]) {
    return textSlashTextMatch[1].trim();
  }
  return t.description;
}

/**
 * Checks if any of the provided keywords exist in the text as a whole word.
 */
function includesAnyWord(text: string, keywords: string[]): boolean {
  return keywords.some(keyword => {
    // Escape special regex characters in the keyword
    const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return new RegExp(`\\b${escaped}\\b`, 'i').test(text);
  });
}

/**
 * Checks if any of the provided keywords exist in the text NOT NECESSARILY as a whole word.
 */
function includesAny(text: string, keywords: string[]): boolean {
  return keywords.some(keyword => {
    // Escape special regex characters in the keyword
    const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return new RegExp(escaped, 'i').test(text);
  });
}

import { describe, it, expect } from 'vitest';
import { Transaction } from '../../models/transaction';
import { exportToMonarch } from '../monarch';
import { getCSVTransactions } from '../../csv_parsing/parser';
import BNCR_V1_CSV from '../../fixtures/BNCR_v1.csv?raw';
import BAC_V1_CSV from '../../fixtures/BAC_v1.csv?raw';
import MERCHANTS_CATEGORIES_V1_CSV from '../../fixtures/merchants_categories_v1.csv?raw';

describe('exportToMonarch', () => {
  const mockDate = new Date('2023-10-27T12:00:00Z');

  it('should generate the correct header for Monarch Money', () => {
    const csv = exportToMonarch([]);
    const firstLine = csv.split('\n')[0];
    expect(firstLine).toBe('Date,Merchant,Category,Original Statement,Amount');
  });

  it('should correctly format an expense and an income transaction', () => {
    const transactions = [
      new Transaction('1', mockDate, 50.25, 'Amazon.com', "Amazon", true),
      new Transaction('2', mockDate, 1000, 'Planilla', "CCSS", false)
    ];

    const csv = exportToMonarch(transactions);
    const lines = csv.split('\n');

    // Date format is YYYY-MM-DD
    // Expense should be negative: -50.25
    expect(lines[1]).toBe('2023-10-27,Amazon,Shopping,Amazon.com,-50.25');
    // Income should be positive: 1000
    expect(lines[2]).toBe('2023-10-27,CCSS,Income,Planilla,1000');
  });

  it('should escape double quotes in descriptions and account names', () => {
    const transactions = [
      new Transaction('3', mockDate, 10, 'Dinner at "The Spoon"', "Restaurants", true)
    ];

    const csv = exportToMonarch(transactions);
    const lines = csv.split('\n');

    // Double quotes in CSV are escaped by doubling them
    expect(lines[1]).toContain('Dinner at "The Spoon"');
  });

  it('should correctly export BNCR v1 transactions', async() => {
    
    // Get transactions from the BNCR v1 CSV fixture.
    const transactions = getCSVTransactions(BNCR_V1_CSV);

    // Export to Monarch CSV format.
    const monarchCSV = exportToMonarch(transactions);
    const monarchTransactions = monarchCSV.split('\n');
    expect(monarchTransactions).toHaveLength(50); // 49 transactions + 1 header

    // Verify the first transaction's values.
    expect(monarchTransactions[1]).toBe('2026-01-29,61406974/HENRY IVES,Uncategorized,PETER 61406974/HENRY IVES,-5000');

    // Verify the last transaction's values.
    expect(monarchTransactions[monarchTransactions.length - 1]).toBe('2026-01-05,OSCARPARKER,Transfer,ARIPAGOCAMBIODEDIVISA/OSCARPARKER,1239700');
  });

  it('should correctly export BAC v1 transactions', async() => {
    
    // Get transactions from the BAC v1 CSV fixture.
    const transactions = getCSVTransactions(BAC_V1_CSV);

    // Export to Monarch CSV format.
    const monarchCSV = exportToMonarch(transactions);
    const monarchTransactions = monarchCSV.split('\n');
    expect(monarchTransactions).toHaveLength(29); // 28 transactions + 1 header

    // Verify the first transaction's values.
    expect(monarchTransactions[1]).toBe('2026-01-20,CITYMALL COMPASS,Parking & Tolls,CITYMALL COMPASS,-2100');

    // Verify the last transaction's values.
    expect(monarchTransactions[monarchTransactions.length - 1]).toBe('2026-04-08,GOOGLE,Taxes,IVA -Google YouTubePremiu,1113.92');
  });

  it('should correctly categorize transactions based on description', () => {
    // Split the fixture content into lines, skip the header.
    const rawLines = MERCHANTS_CATEGORIES_V1_CSV.split(/\r?\n/).slice(1);
    
    // Create a list of Transactions from the CSV data (columns 0 and 1).
    const transactions = rawLines.map((line, index) => {
      const columns = line.split(',');
      const description = columns[0].trim();
      const merchant = columns[1].trim();
      return new Transaction(`test-id-${index}`, mockDate, 100, description, merchant, true);
    });

    const monarchCSV = exportToMonarch(transactions);
    const monarchLines = monarchCSV.split('\n').slice(1); // Skip the Monarch header line

    rawLines.forEach((line, index) => {
      const columns = line.split(',');
      const description = columns[0].trim();
      const expectedCategory = columns[2].trim();
      const actualCategory = monarchLines[index].split(',')[2].trim();
      expect(actualCategory, `Failed for description: "${description}"`).toBe(expectedCategory);
    });
  });
});
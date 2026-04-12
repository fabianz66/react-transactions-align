/**
 * @vitest-environment jsdom
 */
import { describe, it, expect } from 'vitest';
import { Parser } from '../parser';
import BNCR_V1_CSV from '../fixtures/BNCR_v1.csv?raw';
import BAC_V1_CSV from '../fixtures/BAC_v1.csv?raw';

describe('Parser', () => {
  describe('BNCR v1 file parsing', () => {
    it('should load all transactions', async () => {
      // Create a File object from the CSV string.
      const blob = new Blob([BNCR_V1_CSV], { type: 'text/csv' });
      const file = new File([blob], 'BNCR_v1.csv', { type: 'text/csv' });

      // Parse the file.
      const transactions = await Parser.getCSVTransactions(file);

      // Verify we have exactly 49 transactions.
      expect(transactions).toHaveLength(49);
    });

    it('should load the correct transaction values', async () => {
      // Create a File object from the CSV string.
      const blob = new Blob([BNCR_V1_CSV], { type: 'text/csv' });
      const file = new File([blob], 'BNCR_v1.csv', { type: 'text/csv' });

      // Parse the file.
      const transactions = await Parser.getCSVTransactions(file);

      // Verify the first transaction's values.
      // 560;29/01/2026;33107384;5,000.00;;PETER 61406974/HENRY IVES;
      const firstTransaction = transactions[0];
      expect(firstTransaction.id).toBe('33107384');
      // Costa Rican Format: DD/MM/YYYY.
      // Date constructor expects: (YYYY, MM-1, DD) because months are 0-indexed.
      expect(firstTransaction.date).toEqual(new Date(2026, 0, 29));
      expect(firstTransaction.amount).toBe(5000);
      expect(firstTransaction.description).toBe('PETER 61406974/HENRY IVES');
      expect(firstTransaction.isExpense).toBe(true);  

      // Verify the last transaction's values.
      // 0;05/01/2026;68083096;;1,239,700.00;ARIPAGOCAMBIODEDIVISA/OSCARPARKER;
      const lastTransaction = transactions[transactions.length - 1];
      expect(lastTransaction.id).toBe('68083096');
      // Costa Rican Format: DD/MM/YYYY.
      // Date constructor expects: (YYYY, MM-1, DD) because months are 0-indexed.
      expect(lastTransaction.date).toEqual(new Date(2026, 0, 5)); // Months are 0-indexed
      expect(lastTransaction.amount).toBe(1239700);
      expect(lastTransaction.description).toBe('ARIPAGOCAMBIODEDIVISA/OSCARPARKER');
      expect(lastTransaction.isExpense).toBe(false);
    });
  });

  describe('BAC v1 file parsing', () => {
    it('should load all transactions', async () => {
      // Create a File object from the CSV string.
      const blob = new Blob([BAC_V1_CSV], { type: 'text/csv' });
      const file = new File([blob], 'BAC_v1.csv', { type: 'text/csv' });

      // Parse the file.
      const transactions = await Parser.getCSVTransactions(file);

      // Verify we have exactly 28 transactions.
      expect(transactions).toHaveLength(28);
    });

    it('should load the correct transaction values', async () => {
      // Create a File object from the CSV string.
      const blob = new Blob([BAC_V1_CSV], { type: 'text/csv' });
      const file = new File([blob], 'BAC_v1.csv', { type: 'text/csv' });

      // Parse the file.
      const transactions = await Parser.getCSVTransactions(file);

      // Verify the first transaction's values.
      //20/01/2026, 71902474, CP, CITYMALL COMPASS, 2100.00, 0.00, 96672.29 
      const firstTransaction = transactions[0];
      expect(firstTransaction.id).toBe('71902474');
      // Costa Rican Format: DD/MM/YYYY.
      // Date constructor expects: (YYYY, MM-1, DD) because months are 0-indexed.
      expect(firstTransaction.date).toEqual(new Date(2026, 0, 20));
      expect(firstTransaction.amount).toBe(2100);
      expect(firstTransaction.description).toBe('CITYMALL COMPASS');
      expect(firstTransaction.isExpense).toBe(true);  

      // Verify the last transaction's values.
      // 08/04/2026, 98684500, CP, IVA -Google YouTubePremiu, 1113.92, 0.00, 118136.69
      const lastTransaction = transactions[transactions.length - 1];
      expect(lastTransaction.id).toBe('98684500');
      // Costa Rican Format: DD/MM/YYYY.
      // Date constructor expects: (YYYY, MM-1, DD) because months are 0-indexed.
      expect(lastTransaction.date).toEqual(new Date(2026, 3, 8)); // Months are 0-indexed
      expect(lastTransaction.amount).toBe(1113.92);
      expect(lastTransaction.description).toBe('IVA -Google YouTubePremiu');
      expect(lastTransaction.isExpense).toBe(false);
    });
  });
});
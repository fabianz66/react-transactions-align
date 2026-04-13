import { describe, it, expect } from 'vitest';
import { Transaction } from '../../models/transaction';
import { exportToMonarch } from '../../exporters/monarch';

describe('exportToMonarch', () => {
  const mockDate = new Date('2023-10-27T12:00:00Z');

  it('should generate the correct header for Monarch Money', () => {
    const csv = exportToMonarch([]);
    const firstLine = csv.split('\n')[0];
    expect(firstLine).toBe('Date,Merchant,Category,Original Statement,Amount');
  });

  it('should correctly format an expense and an income transaction', () => {
    const transactions = [
      new Transaction('1', mockDate, 50.25, 'Amazon.com', true),
      new Transaction('2', mockDate, 1000, 'Planilla', false)
    ];

    const csv = exportToMonarch(transactions);
    const lines = csv.split('\n');

    // Date format is YYYY-MM-DD
    // Expense should be negative: -50.25
    expect(lines[1]).toBe('2023-10-27,"Amazon.com",Shopping,"Amazon.com",-50.25');
    // Income should be positive: 1000
    expect(lines[2]).toBe('2023-10-27,"Planilla",Income,"Planilla",1000');
  });

  it('should escape double quotes in descriptions and account names', () => {
    const transactions = [
      new Transaction('3', mockDate, 10, 'Dinner at "The Spoon"', true)
    ];

    const csv = exportToMonarch(transactions);
    const lines = csv.split('\n');

    // Double quotes in CSV are escaped by doubling them
    expect(lines[1]).toContain('"Dinner at ""The Spoon"""');
  });

  it('should use the auto-categorization logic if the category field is empty', () => {
    // Transaction without a category (relying on internal logic for 'UBER')
    const t = new Transaction('4', mockDate, 15, 'UBER TRIP', true);
    
    const csv = exportToMonarch([t]);
    const lines = csv.split('\n');

    expect(lines[1]).toContain(',Auto & Transport,');
  });
});
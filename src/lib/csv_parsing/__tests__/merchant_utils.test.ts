import { describe, it, expect } from 'vitest';
import { getMerchant } from '../../utils/merchant_utils';
import MERCHANTS_CATEGORIES_V1_CSV from '../../fixtures/MERCHANTS_CATEGORIES_V1.csv?raw';

describe('getMerchant', () => {
  it('should correctly extract merchants from various descriptions', () => {
    // Slice(1) to skip the header line in the CSV fixture.
    const lines = MERCHANTS_CATEGORIES_V1_CSV.split(/\r?\n/).slice(1);

    for (const line of lines) {
        const columns = line.split(',');
        const description = columns[0].trim();
        const expectedMerchant = columns[1].trim();
        expect(getMerchant(description)).toBe(expectedMerchant);
    }
  });
});
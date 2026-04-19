import React, { useState, ChangeEvent, FormEvent } from 'react';
import { getCSVTransactions } from './lib/csv_parsing/parser';
import { exportToMonarch } from './lib/exporters/monarch';
import { CURRENCY_CRC, CURRENCY_USD } from './lib/models/transaction';
import { CRC2USD } from './lib/utils/currency_utils';

/**
 * App component that allows a user to upload a CSV file and 
 * converts it to Monarch format with a selected currency.
 */
const App: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [currency, setCurrency] = useState<string>(CURRENCY_CRC);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSelectedFile(event.target.files?.[0] || null);
    setError(null);
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!selectedFile) {
      setError('Please select a CSV file.');
      return;
    }

    if (!selectedFile.name.toLowerCase().endsWith('.csv')) {
      setError('Please upload a valid .csv file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const originalCSV = e.target?.result;
      if (typeof originalCSV !== 'string') return;

      // Parse transactions.
      const transactions = getCSVTransactions(originalCSV, currency);
      console.log('Parsed transactions:', transactions);

      if (currency === CURRENCY_CRC) {
        CRC2USD(transactions);
      }

      const monarchCSV = exportToMonarch(transactions);
      console.log('Monarch CSV:', monarchCSV);   

      

      // Create a new Blob for the output file
      const blob = new Blob([monarchCSV], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);

      // Create a temporary link to trigger the download
      const link = document.createElement('a');
      link.href = url;
      link.download = `monarch_${selectedFile.name}`;
      document.body.appendChild(link);
      link.click();

      // Clean up the DOM and memory
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    };

    reader.onerror = (e) => {
      console.error('FileReader error:', e);
      setError('Error reading file. Please try again.');
    };
    reader.readAsText(selectedFile);
  };

  return (
    <main style={{ padding: '2rem', textAlign: 'center', fontFamily: 'system-ui, sans-serif' }}>
      <h1>Transaction Aligner</h1>
      <p>Upload your bank CSV and convert it to Monarch Money format.</p>
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem', marginTop: '2rem' }}>
        <div>
          <label htmlFor="file-upload" style={{ display: 'block', marginBottom: '0.5rem' }}>Select CSV File:</label>
          <input 
            id="file-upload"
            type="file" 
            accept=".csv" 
            onChange={handleFileChange} 
            style={{ fontSize: '1rem' }}
          />
        </div>

        <div>
          <label htmlFor="currency-select" style={{ display: 'block', marginBottom: '0.5rem' }}>Currency:</label>
          <select id="currency-select" value={currency} onChange={(e) => setCurrency(e.target.value)} style={{ padding: '0.4rem', fontSize: '1rem' }}>
            <option value={CURRENCY_CRC}>CRC (Colones)</option>
            <option value={CURRENCY_USD}>USD (Dollars)</option>
          </select>
        </div>

        <button type="submit" style={{ padding: '0.6rem 1.2rem', fontSize: '1rem', cursor: 'pointer' }}>
          Convert and Download
        </button>
      </form>

      {error && (
        <p style={{ color: '#d32f2f', marginTop: '1rem' }} role="alert">
          {error}
        </p>
      )}
    </main>
  );
};

export default App;
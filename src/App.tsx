import React, { useState, ChangeEvent, FormEvent } from 'react';
import { getCSVTransactions } from './lib/csv_parsing/parser';
import { exportToMonarch } from './lib/exporters/monarch';
import { CURRENCY_CRC, CURRENCY_USD, Transaction } from './lib/models/transaction';
import { CRC2USD } from './lib/utils/currency_utils';

/**
 * App component that allows a user to upload a CSV file and 
 * converts it to Monarch format with a selected currency.
 */
const App: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedMergeFiles, setSelectedMergeFiles] = useState<FileList | null>(null);
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
        CRC2USD(transactions as Transaction[]); // Cast to Transaction[] as CRC2USD expects it
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

  const handleMergeFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSelectedMergeFiles(event.target.files);
    setError(null);
  };

  const handleMergeSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!selectedMergeFiles || selectedMergeFiles.length === 0) {
      setError('Please select at least one CSV file to merge.');
      return;
    }

    const fileReaders: Promise<string>[] = [];
    for (let i = 0; i < selectedMergeFiles.length; i++) {
      const file = selectedMergeFiles[i];
      if (!file.name.toLowerCase().endsWith('.csv')) {
        setError(`File "${file.name}" is not a valid .csv file.`);
        return;
      }
      fileReaders.push(new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.onerror = (e) => reject(`Error reading file "${file.name}": ${e}`);
        reader.readAsText(file);
      }));
    }

    try {
      const allFileContents = await Promise.all(fileReaders);
      let mergedCSV = '';
      let header = '';

      allFileContents.forEach((content, index) => {
        const lines = content.split(/\r?\n/).filter(line => line.trim().length > 0);
        if (lines.length === 0) return;

        if (index === 0) {
          header = lines[0]; // Take header from the first file
          mergedCSV += lines.join('\n'); // Include all lines from the first file
        } else {
          // Append body (skip header) from subsequent files
          mergedCSV += '\n' + lines.slice(1).join('\n');
        }
      });

      const blob = new Blob([mergedCSV], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `merged_transactions.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (e) {
      setError(`Failed to merge files: ${e}`);
    }
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

      <hr style={{ margin: '3rem 0', borderColor: '#ccc' }} />

      <h2>Merge Multiple CSV Files</h2>
      <p>Select 1 or more CSV files to merge them into a single file.</p>

      <form onSubmit={handleMergeSubmit} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem', marginTop: '2rem' }}>
        <div>
          <label htmlFor="merge-file-upload" style={{ display: 'block', marginBottom: '0.5rem' }}>Select CSV Files:</label>
          <input 
            id="merge-file-upload"
            type="file" 
            accept=".csv" 
            multiple 
            onChange={handleMergeFileChange} 
            style={{ fontSize: '1rem' }}
          />
        </div>
        <button type="submit" style={{ padding: '0.6rem 1.2rem', fontSize: '1rem', cursor: 'pointer' }}>
          Merge and Download
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
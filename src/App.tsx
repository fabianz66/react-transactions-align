import React, { useState, ChangeEvent } from 'react';

/**
 * App component that allows a user to upload a CSV file and 
 * automatically downloads a new CSV containing only the first line.
 */
const App: React.FC = () => {
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    console.log('File selected:', file?.name);
    setError(null);

    if (!file) return;

    // Basic validation to ensure the file is a CSV
    if (!file.name.toLowerCase().endsWith('.csv')) {
      setError('Please upload a valid .csv file.');
      return;
    }

    const reader = new FileReader();

    reader.onload = (e) => {
      const content = e.target?.result;
      if (typeof content !== 'string') return;

      // Extract the first line (typically the CSV header)
      const firstLine = content.split(/\r?\n/)[0];
      console.log('Extracted header:', firstLine);

      if (firstLine === undefined || content.trim() === '') {
        setError('The uploaded file appears to be empty.');
        return;
      }

      // Create a new Blob for the output file
      const blob = new Blob([firstLine], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);

      // Create a temporary link to trigger the download
      const link = document.createElement('a');
      link.href = url;
      link.download = `header_${file.name}`;
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
    reader.readAsText(file);
  };

  return (
    <main style={{ padding: '2rem', textAlign: 'center', fontFamily: 'system-ui, sans-serif' }}>
      <h1>CSV Header Extractor</h1>
      <p>Select a CSV file to download a version containing only its first line.</p>
      
      <div style={{ marginTop: '2rem' }}>
        <input 
          type="file" 
          accept=".csv" 
          onChange={handleFileUpload} 
          style={{ fontSize: '1rem' }}
        />
      </div>

      {error && (
        <p style={{ color: '#d32f2f', marginTop: '1rem' }} role="alert">
          {error}
        </p>
      )}
    </main>
  );
};

export default App;
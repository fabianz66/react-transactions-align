import React, { useState, type ChangeEvent, type FormEvent, useEffect } from 'react';
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

  useEffect(() => {
    document.title = "Transaction Align";
  }, []);

  // Shared Styles
  const cardStyle: React.CSSProperties = {
    backgroundColor: '#fff',
    borderRadius: '12px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    padding: '2rem',
    marginBottom: '2rem',
    width: '100%',
    maxWidth: '600px',
    textAlign: 'left',
  };

  const inputGroupStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    width: '100%',
  };

  const labelStyle: React.CSSProperties = {
    fontWeight: 600,
    color: '#374151',
    fontSize: '0.9rem',
  };

  const buttonStyle: React.CSSProperties = {
    backgroundColor: '#2563eb',
    color: 'white',
    padding: '0.75rem 1.5rem',
    borderRadius: '8px',
    border: 'none',
    fontSize: '1rem',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'background-color 0.2s',
    marginTop: '1rem',
  };

  const inputFieldStyle: React.CSSProperties = {
    padding: '0.6rem',
    borderRadius: '6px',
    border: '1px solid #d1d5db',
    fontSize: '1rem',
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSelectedFile(event.target.files?.[0] || null);
    setError(null);
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!selectedFile) {
      setError('Por favor, selecciona un archivo CSV.');
      return;
    }

    if (!selectedFile.name.toLowerCase().endsWith('.csv')) {
      setError('Por favor, sube un archivo .csv válido.');
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
      setError('Error al leer el archivo. Por favor, intenta de nuevo.');
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
      setError('Por favor, selecciona al menos un archivo CSV para unir.');
      return;
    }

    const fileReaders: Promise<string>[] = [];
    for (let i = 0; i < selectedMergeFiles.length; i++) {
      const file = selectedMergeFiles[i];
      if (!file.name.toLowerCase().endsWith('.csv')) {
        setError(`El archivo "${file.name}" no es un archivo .csv válido.`);
        return;
      }
      fileReaders.push(new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.onerror = (e) => reject(`Error al leer el archivo "${file.name}": ${e}`);
        reader.readAsText(file);
      }));
    }

    try {
      const allFileContents = await Promise.all(fileReaders);
      let mergedCSV = '';

      allFileContents.forEach((content, index) => {
        const lines = content.split(/\r?\n/).filter(line => line.trim().length > 0);
        if (lines.length === 0) return;

        if (index === 0) {
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
      setError(`Error al unir los archivos: ${e}`);
    }
  };

  return (
    <div style={{ backgroundColor: '#f9fafb', minHeight: '100vh', padding: '3rem 1rem', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <main style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <header style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h1 style={{ fontSize: '2.5rem', color: '#111827', marginBottom: '1rem', fontWeight: 800 }}>Alineador de Transacciones</h1>
          <p style={{ color: '#4b5563', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto 1rem', lineHeight: '1.6' }}>
            Exporta tus movimientos desde <strong>BNCR</strong> o <strong>BAC</strong> en línea y usa esta herramienta para generar el archivo CSV compatible con <strong>monarch.com</strong>.
          </p>
          <div style={{ backgroundColor: '#ecfdf5', color: '#065f46', padding: '0.75rem 1rem', borderRadius: '8px', fontSize: '0.9rem', display: 'inline-block', border: '1px solid #a7f3d0' }}>
            <span style={{ marginRight: '0.5rem' }}>🔒</span>
            <strong>Privacidad total:</strong> Tus datos nunca salen del navegador; todo el procesamiento se realiza localmente en tu computadora.
          </div>
        </header>
      
        {error && (
          <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fee2e2', color: '#b91c1c', padding: '1rem', borderRadius: '8px', marginBottom: '2rem', width: '100%', maxWidth: '600px', display: 'flex', alignItems: 'center', gap: '0.5rem' }} role="alert">
            <strong>Error:</strong> {error}
          </div>
        )}

        <section style={cardStyle}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', color: '#1f2937' }}>Exportar a Monarch</h2>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={inputGroupStyle}>
              <label htmlFor="file-upload" style={labelStyle}>Archivo de Movimientos (CSV)</label>
              <input 
                id="file-upload"
                type="file" 
                accept=".csv" 
                onChange={handleFileChange} 
                style={inputFieldStyle}
              />
            </div>

            <div style={inputGroupStyle}>
              <label htmlFor="currency-select" style={labelStyle}>Moneda de Origen</label>
              <select 
                id="currency-select" 
                value={currency} 
                onChange={(e) => setCurrency(e.target.value)} 
                style={inputFieldStyle}
              >
                <option value={CURRENCY_CRC}>CRC (Colones) - Conversión Automática</option>
                <option value={CURRENCY_USD}>USD (Dólares)</option>
              </select>
            </div>

            <button type="submit" style={buttonStyle}>
              Convertir y Descargar
            </button>
          </form>
        </section>

        <section style={cardStyle}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: '#1f2937' }}>Herramienta de Unión</h2>
          <p style={{ color: '#6b7280', fontSize: '0.9rem', marginBottom: '1.5rem' }}>Combina múltiples archivos generados en el paso anterior en un solo archivo CSV.</p>

          <form onSubmit={handleMergeSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={inputGroupStyle}>
              <label htmlFor="merge-file-upload" style={labelStyle}>Seleccionar Archivos</label>
              <input 
                id="merge-file-upload"
                type="file" 
                accept=".csv" 
                multiple 
                onChange={handleMergeFileChange} 
                style={inputFieldStyle}
              />
            </div>
            <button type="submit" style={{ ...buttonStyle, backgroundColor: '#4b5563' }}>
              Unir y Descargar
            </button>
          </form>
        </section>
      </main>
    </div>
  );
};

export default App;
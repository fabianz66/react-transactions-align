import { useState } from 'react';
import { Parser } from './utils/csv_parsing/parser';
import { Transaction } from './utils/csv_parsing/transaction';
import './App.css';

function App() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError(null);

    try {
      const parsedTransactions = await Parser.parse(file);
      setTransactions(parsedTransactions);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse file');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <h1>CSV Transaction Parser</h1>
      <input type="file" accept=".csv" onChange={handleFileUpload} />
      {loading && <p>Loading...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {transactions.length > 0 && (
        <div>
          <h2>Parsed Transactions</h2>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Date</th>
                <th>Amount</th>
                <th>Description</th>
                <th>Is Expense</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx, index) => (
                <tr key={index}>
                  <td>{tx.id}</td>
                  <td>{tx.date.toDateString()}</td>
                  <td>{tx.amount}</td>
                  <td>{tx.description}</td>
                  <td>{tx.isExpense ? 'Yes' : 'No'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default App;

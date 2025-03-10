import React, { useState } from 'react';
import Papa from 'papaparse';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const CustomMetricExplorer = () => {
  const [csvData, setCsvData] = useState([]);
  const [formula, setFormula] = useState('((HR + BB) / PA) * 100');
  const [metricName, setMetricName] = useState('Custom Stat');
  const [parsedData, setParsedData] = useState([]);
  const [error, setError] = useState('');

  const parseCSV = async (file) => {
    Papa.parse(file, {
      header: true,
      dynamicTyping: true,
      complete: (results) => {
        setCsvData(results.data);
        calculateMetric(results.data);
      },
      error: (err) => setError(`CSV parsing failed: ${err.message}`)
    });
  };

  const calculateMetric = (data) => {
    try {
      const calculated = data.map(player => {
        const formulaFn = new Function(
          ...Object.keys(player),
          `return ${formula}`
        );

        const metricValue = formulaFn(...Object.values(player));

        return {
          ...player,
          [metricName]: Number.isFinite(metricValue) ? metricValue.toFixed(2) : 0
        };
      });
      setParsedData(calculated);
      setError('');
    } catch (e) {
      setError(`Invalid formula: ${e.message}`);
      setParsedData([]);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold text-center">🧮 Custom Metric Explorer</h1>

      <div className="space-y-2">
        <input
          type="file"
          accept=".csv"
          onChange={(e) => e.target.files?.[0] && parseCSV(e.target.files[0])}
          className="block w-full border p-2 rounded"
        />
        <input
          type="text"
          placeholder="Custom Metric Name"
          value={metricName}
          onChange={(e) => setMetricName(e.target.value)}
          className="w-full border p-2 rounded"
        />
        <input
          type="text"
          placeholder="Enter custom formula (e.g., (HR + BB) / PA) * 100)"
          value={formula}
          onChange={(e) => setFormula(e.target.value)}
          className="w-full border p-2 rounded"
        />
        <button
          onClick={() => calculateMetric(csvData)}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Calculate Metric
        </button>
      </div>

      {error && <div className="text-red-600">{error}</div>}

      {parsedData.length > 0 && (
        <div className="overflow-x-auto">
          <table className="min-w-full mt-4 border">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 border">Name</th>
                <th className="p-2 border">POS</th>
                <th className="p-2 border">{metricName}</th>
              </tr>
            </thead>
            <tbody>
              {parsedData.map((player, idx) => (
                <tr key={idx} className="border-t">
                  <td className="p-2 border">{player.Name}</td>
                  <td className="p-2 border">{player.POS}</td>
                  <td className="p-2 border">{player[metricName]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {parsedData.length > 0 && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-2">Visualize Metric</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={parsedData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="Name" hide />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey={metricName} stroke="#8884d8" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default CustomMetricExplorer;

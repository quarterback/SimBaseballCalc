import React, { useState } from 'react';
import Papa from 'papaparse';

const StatcastPitchingTool = () => {
  const [pitchers, setPitchers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sortField, setSortField] = useState('Name');
  const [sortDirection, setSortDirection] = useState('asc');
  const [searchQuery, setSearchQuery] = useState('');

  // Calculate advanced stats for a single pitcher
  const calculateAdvancedStats = (pitcher) => {
    // OOTP Stats
    const ERA = parseFloat(pitcher.ERA) || 4.50;
    const FIP = parseFloat(pitcher.FIP) || 4.50;
    const BABIP = parseFloat(pitcher.BABIP) || 0.300;
    const K_PCT = parseFloat(pitcher['K%']) || 22.0;
    const BB_PCT = parseFloat(pitcher['BB%']) || 8.0;
    const HR_9 = parseFloat(pitcher['HR/9']) || 1.2;
    const H_9 = parseFloat(pitcher['H/9']) || 9.0;
    const LOB_PCT = parseFloat(pitcher['LOB%']) || 72.0;
    const GB_PCT = parseFloat(pitcher['GB%']) || 42.0;

    // OOTP Ratings
    const STUFF = parseFloat(pitcher.Stuff) || 50;
    const MOVEMENT = parseFloat(pitcher.Movement) || 50;
    const CONTROL = parseFloat(pitcher.Control) || 50;
    const STAMINA = parseFloat(pitcher.Stamina) || 50;

    // Calculate advanced metrics
    return {
      ...pitcher,
      // Fielding Independent Metrics
      xFIP: ((FIP * 0.85) + (HR_9 * 0.15)).toFixed(2),
      SIERA: ((FIP * 0.7) + (GB_PCT * 0.02) + (K_PCT * 0.02) - (BB_PCT * 0.03)).toFixed(2),
      
      // Stuff+ Metrics
      Stuff_Plus: (((STUFF - 50) * 1.5) + (K_PCT - 20) * 2).toFixed(1),
      Command_Plus: (((CONTROL - 50) * 1.5) - (BB_PCT - 8) * 2).toFixed(1),
      Movement_Plus: (((MOVEMENT - 50) * 1.5) + (GB_PCT - 42) * 0.5).toFixed(1),
      
      // Expected Stats
      xERA: ((ERA * 0.6) + (FIP * 0.3) + (BABIP * 10 * 0.1)).toFixed(2),
      xBABIP: ((BABIP * 0.7) + (MOVEMENT/100 * 0.3)).toFixed(3),
      xLOB: ((LOB_PCT * 0.8) + (K_PCT * 0.2)).toFixed(1),
      
      // Custom Metrics
      True_Stuff: ((STUFF * 0.4) + (K_PCT * 0.4) + (H_9 * -0.2)).toFixed(1),
      Control_Rating: ((CONTROL * 0.4) + ((100 - BB_PCT) * 0.4) + (MOVEMENT * 0.2)).toFixed(1),
      Dominance: ((K_PCT * 0.5) + (STUFF * 0.3) + ((100 - H_9) * 0.2)).toFixed(1)
    };
  };

  const processCSV = async (file) => {
    setLoading(true);
    setError('');

    try {
      const text = await file.text();
      Papa.parse(text, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        complete: (results) => {
          if (results.errors.length > 0) {
            setError('Error parsing CSV file');
            setLoading(false);
            return;
          }

          const processedPitchers = results.data.map(pitcher => calculateAdvancedStats(pitcher));
          setPitchers(processedPitchers);
          setLoading(false);
        },
        error: (error) => {
          setError(`Error processing file: ${error.message}`);
          setLoading(false);
        }
      });
    } catch (error) {
      setError(`Error reading file: ${error.message}`);
      setLoading(false);
    }
  };

  const handleSort = (field) => {
    const direction = field === sortField && sortDirection === 'asc' ? 'desc' : 'asc';
    setSortField(field);
    setSortDirection(direction);

    const sortedPitchers = [...pitchers].sort((a, b) => {
      let aVal = a[field];
      let bVal = b[field];

      if (!isNaN(aVal) && !isNaN(bVal)) {
        aVal = parseFloat(aVal);
        bVal = parseFloat(bVal);
      }

      if (direction === 'asc') {
        return aVal > bVal ? 1 : -1;
      }
      return aVal < bVal ? 1 : -1;
    });

    setPitchers(sortedPitchers);
  };

  const filteredPitchers = pitchers.filter(pitcher => 
    pitcher.Name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    pitcher.Team?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-full mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h1 className="text-3xl font-bold text-center mb-6">OOTP Advanced Pitching Analyzer</h1>

      <div className="mb-6">
        <input
          type="file"
          accept=".csv"
          onChange={(e) => e.target.files?.[0] && processCSV(e.target.files[0])}
          className="mb-4 p-2 border rounded"
        />

        <input
          type="text"
          placeholder="Search pitchers..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full p-2 border rounded"
        />
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center">Loading...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead className="bg-gray-50">
              <tr>
                <th className="sticky top-0 bg-gray-50 px-6 py-3 text-left cursor-pointer" onClick={() => handleSort('Name')}>
                  Name {sortField === 'Name' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th className="sticky top-0 bg-gray-50 px-6 py-3 text-right cursor-pointer" onClick={() => handleSort('xERA')}>
                  xERA {sortField === 'xERA' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th className="sticky top-0 bg-gray-50 px-6 py-3 text-right cursor-pointer" onClick={() => handleSort('xFIP')}>
                  xFIP {sortField === 'xFIP' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th className="sticky top-0 bg-gray-50 px-6 py-3 text-right cursor-pointer" onClick={() => handleSort('SIERA')}>
                  SIERA {sortField === 'SIERA' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th className="sticky top-0 bg-gray-50 px-6 py-3 text-right cursor-pointer" onClick={() => handleSort('Stuff_Plus')}>
                  Stuff+ {sortField === 'Stuff_Plus' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th className="sticky top-0 bg-gray-50 px-6 py-3 text-right cursor-pointer" onClick={() => handleSort('Command_Plus')}>
                  Command+ {sortField === 'Command_Plus' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th className="sticky top-0 bg-gray-50 px-6 py-3 text-right cursor-pointer" onClick={() => handleSort('Movement_Plus')}>
                  Movement+ {sortField === 'Movement_Plus' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th className="sticky top-0 bg-gray-50 px-6 py-3 text-right cursor-pointer" onClick={() => handleSort('True_Stuff')}>
                  True Stuff {sortField === 'True_Stuff' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th className="sticky top-0 bg-gray-50 px-6 py-3 text-right cursor-pointer" onClick={() => handleSort('Control_Rating')}>
                  Control Rating {sortField === 'Control_Rating' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th className="sticky top-0 bg-gray-50 px-6 py-3 text-right cursor-pointer" onClick={() => handleSort('Dominance')}>
                  Dominance {sortField === 'Dominance' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredPitchers.map((pitcher, idx) => (
                <tr key={idx} className={idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                  <td className="px-6 py-4 whitespace-nowrap">{pitcher.Name}</td>
                  <td className="px-6 py-4 text-right">{pitcher.xERA}</td>
                  <td className="px-6 py-4 text-right">{pitcher.xFIP}</td>
                  <td className="px-6 py-4 text-right">{pitcher.SIERA}</td>
                  <td className="px-6 py-4 text-right">{pitcher.Stuff_Plus}</td>
                  <td className="px-6 py-4 text-right">{pitcher.Command_Plus}</td>
                  <td className="px-6 py-4 text-right">{pitcher.Movement_Plus}</td>
                  <td className="px-6 py-4 text-right">{pitcher.True_Stuff}</td>
                  <td className="px-6 py-4 text-right">{pitcher.Control_Rating}</td>
                  <td className="px-6 py-4 text-right">{pitcher.Dominance}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default StatcastPitchingTool;

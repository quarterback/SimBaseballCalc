import React, { useState } from 'react';
import Papa from 'papaparse';

const StatcastHittingTool = () => {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  const [searchQuery, setSearchQuery] = useState('');

  // Calculate advanced stats for a single player
  const calculateAdvancedStats = (player) => {
    const AVG = parseFloat(player.AVG) || 0.260;
    const OBP = parseFloat(player.OBP) || 0.330;
    const SLG = parseFloat(player.SLG) || 0.430;
    const ISO = parseFloat(player.ISO) || 0.140;
    const BABIP = parseFloat(player.BABIP) || 0.300;
    const HR_PA = parseFloat(player.HR) / parseFloat(player.PA) || 0.040;
    const BB_PCT = parseFloat(player['BB%'] || player.BB_PCT) || 8.0;
    const K_PCT = parseFloat(player['SO%'] || player.K_PCT) || 22.0;
    const OPS_PLUS = parseFloat(player['OPS+'] || player.OPS_PLUS) || 100;
    const WRC_PLUS = parseFloat(player['wRC+'] || player.wRC_PLUS) || 100;
    const CONTACT = parseFloat(player.Contact) || 50;
    const POWER = parseFloat(player.Power) || 50;
    const EYE = parseFloat(player.Eye) || 50;

    return {
      ...player,
      xBA: ((BABIP * 0.85) + (AVG * 0.15)).toFixed(3),
      xSLG: ((SLG * 0.9) + (ISO * 0.1)).toFixed(3),
      xWOBA: ((OBP * 0.6) + (SLG * 0.3) + (HR_PA * 0.1)).toFixed(3),
      BIP_PCT: (100 - (BB_PCT + K_PCT)).toFixed(1),
      xOPS_PLUS: ((OPS_PLUS * 0.9) + (ISO * 100 * 0.1)).toFixed(1),
      Contact_Plus: (((CONTACT - 50) * 1.5) + ((100 - (BB_PCT + K_PCT) - 70) * 2)).toFixed(1),
      Chase_PCT: ((EYE * 0.4) - (K_PCT * 0.6)).toFixed(1),
      True_ISO: ((ISO * 0.8) + (POWER/100 * 0.2)).toFixed(3),
      Plate_Skills: ((OBP * 0.4) + (EYE/100 * 0.3) + ((100-K_PCT)/100 * 0.3)).toFixed(3)
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

          const processedPlayers = results.data.map(player => calculateAdvancedStats(player));
          setPlayers(processedPlayers);
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

    const sortedPlayers = [...players].sort((a, b) => {
      let aVal = a[field];
      let bVal = b[field];

      // Handle numeric sorting
      if (!isNaN(aVal) && !isNaN(bVal)) {
        aVal = parseFloat(aVal);
        bVal = parseFloat(bVal);
      }

      if (direction === 'asc') {
        return aVal > bVal ? 1 : -1;
      }
      return aVal < bVal ? 1 : -1;
    });

    setPlayers(sortedPlayers);
  };

  const filteredPlayers = players.filter(player => 
    player.Name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    player.Team?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-full mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h1 className="text-3xl font-bold text-center mb-6">OOTP Advanced Stats Analyzer</h1>

      <div className="mb-6">
        <input
          type="file"
          accept=".csv"
          onChange={(e) => e.target.files?.[0] && processCSV(e.target.files[0])}
          className="mb-4 p-2 border rounded"
        />

        <input
          type="text"
          placeholder="Search players..."
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
                <th className="sticky top-0 bg-gray-50 px-6 py-3 text-right cursor-pointer" onClick={() => handleSort('xBA')}>
                  xBA {sortField === 'xBA' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th className="sticky top-0 bg-gray-50 px-6 py-3 text-right cursor-pointer" onClick={() => handleSort('xSLG')}>
                  xSLG {sortField === 'xSLG' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th className="sticky top-0 bg-gray-50 px-6 py-3 text-right cursor-pointer" onClick={() => handleSort('xWOBA')}>
                  xwOBA {sortField === 'xWOBA' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th className="sticky top-0 bg-gray-50 px-6 py-3 text-right cursor-pointer" onClick={() => handleSort('xOPS_PLUS')}>
                  xOPS+ {sortField === 'xOPS_PLUS' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th className="sticky top-0 bg-gray-50 px-6 py-3 text-right cursor-pointer" onClick={() => handleSort('Contact_Plus')}>
                  Contact+ {sortField === 'Contact_Plus' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th className="sticky top-0 bg-gray-50 px-6 py-3 text-right cursor-pointer" onClick={() => handleSort('True_ISO')}>
                  True ISO {sortField === 'True_ISO' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th className="sticky top-0 bg-gray-50 px-6 py-3 text-right cursor-pointer" onClick={() => handleSort('Plate_Skills')}>
                  Plate Skills {sortField === 'Plate_Skills' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th className="sticky top-0 bg-gray-50 px-6 py-3 text-right cursor-pointer" onClick={() => handleSort('Chase_PCT')}>
                  Chase% {sortField === 'Chase_PCT' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th className="sticky top-0 bg-gray-50 px-6 py-3 text-right cursor-pointer" onClick={() => handleSort('BIP_PCT')}>
                  BIP% {sortField === 'BIP_PCT' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredPlayers.map((player, idx) => (
                <tr key={idx} className={idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                  <td className="px-6 py-4 whitespace-nowrap">{player.Name}</td>
                  <td className="px-6 py-4 text-right">{player.xBA}</td>
                  <td className="px-6 py-4 text-right">{player.xSLG}</td>
                  <td className="px-6 py-4 text-right">{player.xWOBA}</td>
                  <td className="px-6 py-4 text-right">{player.xOPS_PLUS}</td>
                  <td className="px-6 py-4 text-right">{player.Contact_Plus}</td>
                  <td className="px-6 py-4 text-right">{player.True_ISO}</td>
                  <td className="px-6 py-4 text-right">{player.Plate_Skills}</td>
                  <td className="px-6 py-4 text-right">{player.Chase_PCT}</td>
                  <td className="px-6 py-4 text-right">{player.BIP_PCT}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default StatcastHittingTool;

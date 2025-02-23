import React, { useState } from 'react';
import Papa from 'papaparse';

const StatcastPitchingTool = () => {
  const [pitchers, setPitchers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sortField, setSortField] = useState('Name');
  const [sortDirection, setSortDirection] = useState('asc');
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');

  const REQUIRED_HEADERS = [
    'Name',
    'Team',
    'POS',
    'IP',
    'ERA',
    'FIP',
    'BABIP',
    'K%',
    'BB%',
    'HR/9',
    'H/9',
    'LOB%',
    'GO%',
    'Stuff',
    'Movement',
    'Control',
    'Stamina',
    'BF',           // Added these to ensure they're tracked
    'IBB',
    'WPA',
    'pLI',
    'GS'
  ];

    const calculateAdvancedStats = (pitcher) => {
    // Identify the correct role
    const isSP = pitcher.POS.includes('SP');
    const isCL = pitcher.POS.includes('CL');
    const isRP = pitcher.POS.includes('RP') && !isCL;  // Ensure RP is not mistakenly classified as CL

    // OOTP Stats - Using default values if missing
    const ERA = parseFloat(pitcher.ERA) || 4.50;
    const FIP = parseFloat(pitcher.FIP) || 4.50;
    const BABIP = parseFloat(pitcher.BABIP) || 0.300;
    const K_PCT = parseFloat(pitcher['K%']) || 22.0;
    const BB_PCT = parseFloat(pitcher['BB%']) || 8.0;
    const HR_9 = parseFloat(pitcher['HR/9']) || 1.2;
    const H_9 = parseFloat(pitcher['H/9']) || 9.0;
    const LOB_PCT = parseFloat(pitcher['LOB%']) || 72.0;
    const GB_PCT = parseFloat(pitcher['GO%']) || 42.0;
    const IP = parseFloat(pitcher.IP) || 0;
    const BF = parseFloat(pitcher.BF) || (IP * 3 + H_9 * (IP / 9)); // Approximate if missing
    const BB = (BB_PCT / 100) * BF;
    const K = (K_PCT / 100) * BF;
    const IBB = parseFloat(pitcher.IBB) || 0;
    const WPA = parseFloat(pitcher.WPA) || 0;
    const pLI = parseFloat(pitcher.pLI) || 1;
    const GS = parseFloat(pitcher.GS) || (isSP ? 10 : 0);
    const ER = (ERA / 9) * IP;
    const H = (H_9 / 9) * IP;

    // OOTP Ratings
    const STUFF = parseFloat(pitcher.Stuff) || 50;
    const MOVEMENT = parseFloat(pitcher.Movement) || 50;
    const CONTROL = parseFloat(pitcher.Control) || 50;
    const STAMINA = parseFloat(pitcher.Stamina) || 50;

    // Expected Stats
    const xERA = ((ERA * 0.6) + (FIP * 0.3) + (BABIP * 10 * 0.1)).toFixed(2);
    const xFIP = ((FIP * 0.85) + (HR_9 * 0.15)).toFixed(2);

    // Advanced Metrics
    const DOMS = ((K_PCT - BB_PCT) + ((K / 9) * 1.5)).toFixed(1);
    const ChaseEfficiency = ((K / (K + BB)) * 100).toFixed(1);
    const tWHIP = (((BB - IBB) + H) / IP).toFixed(2);
    const HLPI = ((WPA * 50) + (LOB_PCT * 0.5) - ((BB / 9) * 5)).toFixed(1);
    const PutawayRate = ((K / (K + (BF - K - BB))) * 100).toFixed(1);
    const SwStr = ((K / (BF - BB)) * 100).toFixed(1);
    const TrueKBB = ((K_PCT - (BB_PCT - (IBB / BF) * 100)) + (pLI * 5)).toFixed(1);
    const LIE = ((ERA * 0.6) + (LOB_PCT * 0.4)).toFixed(1);
    const DQS = ((ER >= 5 && IP < 5 ? 1 : 0) / GS * 100).toFixed(1);

    return {
      ...pitcher,
      Role: pitcher.POS,
      IP,
      xERA,
      xFIP,
      DOMS,
      ChaseEfficiency,
      tWHIP,
      HLPI,
      PutawayRate,
      SwStr,
      TrueKBB,
      LIE,
      DQS
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
        transformHeader: (header) => header.trim(),
        complete: (results) => {
          const missingHeaders = REQUIRED_HEADERS.filter(
            header => !results.meta.fields.includes(header)
          );

          if (missingHeaders.length > 0) {
            setError(`Missing required columns: ${missingHeaders.join(', ')}`);
            setLoading(false);
            return;
          }

          const qualifiedPitchers = results.data.filter(pitcher => 
            parseFloat(pitcher.IP) >= (pitcher.POS === 'SP' ? 20 : 10)
          );

          const processedPitchers = qualifiedPitchers.map(pitcher => calculateAdvancedStats(pitcher));
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

  const exportToCSV = () => {
    if (filteredPitchers.length === 0) return;

    const headers = Object.keys(filteredPitchers[0]).join(',');
    const csvContent = [
      headers,
      ...filteredPitchers.map(pitcher => 
        Object.values(pitcher).map(val => 
          `"${val}"`.replace(/"/g, '""')
        ).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'pitching_analysis.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredPitchers = pitchers.filter(pitcher => {
    const matchesSearch = pitcher.Name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         pitcher.Team?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'ALL' || pitcher.Role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="max-w-full mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h1 className="text-3xl font-bold text-center mb-6">OOTP Advanced Pitching Analyzer</h1>

      <div className="mb-6 space-y-4">
        <div className="flex gap-4">
          <input
            type="file"
            accept=".csv"
            onChange={(e) => e.target.files?.[0] && processCSV(e.target.files[0])}
            className="flex-grow p-2 border rounded"
          />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="p-2 border rounded min-w-[100px]"
          >
            <option value="ALL">All Roles</option>
            <option value="SP">Starters</option>
            <option value="RP">Relievers</option>
          </select>
        </div>

        <input
          type="text"
          placeholder="Search pitchers..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full p-2 border rounded"
        />
  
        <button
          onClick={exportToCSV}
          disabled={pitchers.length === 0}
          className="w-full p-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Export to CSV
        </button>
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
                <th className="sticky top-0 bg-gray-50 px-6 py-3 text-right cursor-pointer" onClick={() => handleSort('POS')}>
                  POS {sortField === 'POS' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th className="sticky top-0 bg-gray-50 px-6 py-3 text-right cursor-pointer" onClick={() => handleSort('IP')}>
                  IP {sortField === 'IP' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th className="sticky top-0 bg-gray-50 px-6 py-3 text-right cursor-pointer" onClick={() => handleSort('xERA')}>
                  xERA {sortField === 'xERA' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th className="sticky top-0 bg-gray-50 px-6 py-3 text-right cursor-pointer" onClick={() => handleSort('xFIP')}>
                  xFIP {sortField === 'xFIP' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th className="sticky top-0 bg-gray-50 px-6 py-3 text-right cursor-pointer" onClick={() => handleSort('DOMS')}>
                  DOMS {sortField === 'DOMS' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th className="sticky top-0 bg-gray-50 px-6 py-3 text-right cursor-pointer" onClick={() => handleSort('ChaseEfficiency')}>
                  ChE% {sortField === 'ChaseEfficiency' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th className="sticky top-0 bg-gray-50 px-6 py-3 text-right cursor-pointer" onClick={() => handleSort('tWHIP')}>
                  True WHIP {sortField === 'tWHIP' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th className="sticky top-0 bg-gray-50 px-6 py-3 text-right cursor-pointer" onClick={() => handleSort('HLPI')}>
                  High Lev {sortField === 'HLPI' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th className="sticky top-0 bg-gray-50 px-6 py-3 text-right cursor-pointer" onClick={() => handleSort('PutawayRate')}>
                  PWR% {sortField === 'PutawayRate' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th className="sticky top-0 bg-gray-50 px-6 py-3 text-right cursor-pointer" onClick={() => handleSort('SwStr')}>
                  SwStr% {sortField === 'SwStr' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th className="sticky top-0 bg-gray-50 px-6 py-3 text-right cursor-pointer" onClick={() => handleSort('TrueKBB')}>
                  tK-BB% {sortField === 'TrueKBB' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th className="sticky top-0 bg-gray-50 px-6 py-3 text-right cursor-pointer" onClick={() => handleSort('LIE')}>
                  LIE {sortField === 'LIE' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th className="sticky top-0 bg-gray-50 px-6 py-3 text-right cursor-pointer" onClick={() => handleSort('DQS')}>
                  DQS% {sortField === 'DQS' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredPitchers.map((pitcher, idx) => (
                <tr key={idx} className={idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                  <td className="px-6 py-4 whitespace-nowrap">{pitcher.Name}</td>
                  <td className="px-6 py-4 text-right">{pitcher.POS}</td>
                  <td className="px-6 py-4 text-right">{pitcher.IP}</td>
                  <td className="px-6 py-4 text-right">{pitcher.xERA}</td>
                  <td className="px-6 py-4 text-right">{pitcher.xFIP}</td>
                  <td className="px-6 py-4 text-right">{pitcher.DOMS}</td>
                  <td className="px-6 py-4 text-right">{pitcher.ChaseEfficiency}</td>
                  <td className="px-6 py-4 text-right">{pitcher.tWHIP}</td>
                  <td className="px-6 py-4 text-right">{pitcher.HLPI}</td>
                  <td className="px-6 py-4 text-right">{pitcher.PutawayRate}</td>
                  <td className="px-6 py-4 text-right">{pitcher.SwStr}</td>
                  <td className="px-6 py-4 text-right">{pitcher.TrueKBB}</td>
                  <td className="px-6 py-4 text-right">{pitcher.LIE}</td>
                  <td className="px-6 py-4 text-right">{pitcher.DQS}</td>
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

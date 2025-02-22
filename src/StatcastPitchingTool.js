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
    'GB%',
    'Stuff',
    'Movement',
    'Control',
    'Stamina'
  ];

  const calculateAdvancedStats = (pitcher) => {
    const isSP = pitcher.POS === 'SP';
    
    // OOTP Stats - using exact header names
    const ERA = parseFloat(pitcher.ERA) || 4.50;
    const FIP = parseFloat(pitcher.FIP) || 4.50;
    const BABIP = parseFloat(pitcher.BABIP) || 0.300;
    const K_PCT = parseFloat(pitcher['K%']) || 22.0;
    const BB_PCT = parseFloat(pitcher['BB%']) || 8.0;
    const HR_9 = parseFloat(pitcher['HR/9']) || 1.2;
    const H_9 = parseFloat(pitcher['H/9']) || 9.0;
    const LOB_PCT = parseFloat(pitcher['LOB%']) || 72.0;
    const GB_PCT = parseFloat(pitcher['GB%']) || 42.0;
    const IP = parseFloat(pitcher.IP) || 0;

    // OOTP Ratings
    const STUFF = parseFloat(pitcher.Stuff) || 50;
    const MOVEMENT = parseFloat(pitcher.Movement) || 50;
    const CONTROL = parseFloat(pitcher.Control) || 50;
    const STAMINA = parseFloat(pitcher.Stamina) || 50;

    // Expected Stats
    const xERA = ((ERA * 0.6) + (FIP * 0.3) + (BABIP * 10 * 0.1)).toFixed(2);
    const xFIP = ((FIP * 0.85) + (HR_9 * 0.15)).toFixed(2);

    // New Advanced Metrics
    const deceptionRating = (
      (MOVEMENT * 0.4) + 
      ((1 - BABIP) * 100 * 0.3) + 
      (K_PCT * 0.3)
    ).toFixed(1);

    const staminaEfficiency = isSP 
      ? (100 - ((ERA - (STAMINA/20)) * 10)).toFixed(1)
      : (100 - (ERA * 12) + (STUFF * 0.2)).toFixed(1);

    const pitchEconomy = (
      (GB_PCT * 0.4) + 
      ((100 - BB_PCT) * 0.4) + 
      (K_PCT * 0.2)
    ).toFixed(1);

    const highLeverageIndex = (
      (LOB_PCT * 0.4) + 
      (K_PCT * 0.4) + 
      ((20 - HR_9) * 3)
    ).toFixed(1);

    const consistencyRating = (
      (CONTROL * 0.4) + 
      ((100 - BB_PCT) * 0.4) + 
      ((10 - HR_9) * 2)
    ).toFixed(1);

    const arsenalEffectiveness = (
      (STUFF * 0.3) + 
      (MOVEMENT * 0.3) + 
      (K_PCT * 0.2) + 
      (GB_PCT * 0.2)
    ).toFixed(1);

    const contactManagement = (
      ((20 - H_9) * 3) + 
      ((1 - BABIP) * 100) + 
      (GB_PCT * 0.5)
    ).toFixed(1);

    const durabilityScore = isSP
      ? (STAMINA * 0.5) + (CONTROL * 0.3) + ((100 - BB_PCT) * 0.2)
      : (STUFF * 0.4) + (CONTROL * 0.3) + ((100 - BB_PCT) * 0.3);

    const overallEffectiveness = (
      (100 - parseFloat(xERA) * 10) * 0.3 +
      parseFloat(arsenalEffectiveness) * 0.2 +
      parseFloat(contactManagement) * 0.2 +
      parseFloat(consistencyRating) * 0.2 +
      parseFloat(durabilityScore) * 0.1
    ).toFixed(1);

    return {
      ...pitcher,
      Role: pitcher.POS,
      IP,
      xERA,
      xFIP,
      Deception: deceptionRating,
      StaminaEfficiency: staminaEfficiency,
      PitchEconomy: pitchEconomy,
      HighLeverage: highLeverageIndex,
      Consistency: consistencyRating,
      ArsenalScore: arsenalEffectiveness,
      ContactQuality: contactManagement,
      Durability: durabilityScore.toFixed(1),
      Effectiveness: overallEffectiveness
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
                <th className="sticky top-0 bg-gray-50 px-6 py-3 text-right cursor-pointer" onClick={() => handleSort('Role')}>
                  Role {sortField === 'Role' && (sortDirection === 'asc' ? '↑' : '↓')}
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
                <th className="sticky top-0 bg-gray-50 px-6 py-3 text-right cursor-pointer" onClick={() => handleSort('Deception')}>
                  Deception {sortField === 'Deception' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th className="sticky top-0 bg-gray-50 px-6 py-3 text-right cursor-pointer" onClick={() => handleSort('StaminaEfficiency')}>
                  Stamina Eff {sortField === 'StaminaEfficiency' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th className="sticky top-0 bg-gray-50 px-6 py-3 text-right cursor-pointer" onClick={() => handleSort('PitchEconomy')}>
                  Economy {sortField === 'PitchEconomy' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th className="sticky top-0 bg-gray-50 px-6 py-3 text-right cursor-pointer" onClick={() => handleSort('HighLeverage')}>
                  High Lev {sortField === 'HighLeverage' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th className="sticky top-0 bg-gray-50 px-6 py-3 text-right cursor-pointer" onClick={() => handleSort('Consistency')}>
                  Consist {sortField === 'Consistency' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th className="sticky top-0 bg-gray-50 px-6 py-3 text-right cursor-pointer" onClick={() => handleSort('ArsenalScore')}>
                  Arsenal {sortField === 'ArsenalScore' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th className="sticky top-0 bg-gray-50 px-6 py-3 text-right cursor-pointer" onClick={() => handleSort('ContactQuality')}>
                  Contact {sortField === 'ContactQuality' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th className="sticky top-0 bg-gray-50 px-6 py-3 text-right cursor-pointer" onClick={() => handleSort('Durability')}>
                  Durability {sortField === 'Durability' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th className="sticky top-0 bg-gray-50 px-6 py-3 text-right cursor-pointer" onClick={() => handleSort('Effectiveness')}>
                  Effect {sortField === 'Effectiveness' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredPitchers.map((pitcher, idx) => (
                <tr key={idx} className={idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                  <td className="px-6 py-4 whitespace-nowrap">{pitcher.Name}</td>
                  <td className="px-6 py-4 text-right">{pitcher.Role}</td>
                  <td className="px-6 py-4 text-right">{pitcher.IP}</td>
                  <td className="px-6 py-4 text-right">{pitcher.xERA}</td>
                  <td className="px-6 py-4 text-right">{pitcher.xFIP}</td>
                  <td className="px-6 py-4 text-right">{pitcher.Deception}</td>
                  <td className="px-6 py-4 text-right">{pitcher.StaminaEfficiency}</td>
                  <td className="px-6 py-4 text-right">{pitcher.PitchEconomy}</td>
                  <td className="px-6 py-4 text-right">{pitcher.HighLeverage}</td>
                  <td className="px-6 py-4 text-right">{pitcher.Consistency}</td>
                  <td className="px-6 py-4 text-right">{pitcher.ArsenalScore}</td>
                  <td className="px-6 py-4 text-right">{pitcher.ContactQuality}</td>
                  <td className="px-6 py-4 text-right">{pitcher.Durability}</td>
                  <td className="px-6 py-4 text-right">{pitcher.Effectiveness}</td>
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

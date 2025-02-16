import React, { useState } from 'react';
import Papa from 'papaparse';

const FantasyCalculator = () => {
  const [hittingStats, setHittingStats] = useState([]);
  const [pitchingStats, setPitchingStats] = useState([]);
  const [hittingSearchQuery, setHittingSearchQuery] = useState('');
  const [pitchingSearchQuery, setPitchingSearchQuery] = useState('');
  const [scoringSystem, setScoringSystem] = useState('draftKingsDFS');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const scoringSystems = {
    draftKingsDFS: {
      name: 'DraftKings DFS',
      hitting: {
        '1B': 3,
        '2B': 5,
        '3B': 8,
        'HR': 10,
        'R': 2,
        'RBI': 2,
        'BB': 2,
        'SB': 5,
        'CS': -2,
        'HBP': 2
      },
      pitching: {
        'IP': 2.25,
        'K': 2,
        'W': 4,
        'ER': -2,
        'H': -0.6,
        'BB': -0.6,
        'HBP': -0.6,
        'CG': 2.5,
        'CGSO': 2.5,
        'NH': 5
      }
    },
    fanduelDFS: {
      name: 'FanDuel DFS',
      hitting: {
        '1B': 3,
        '2B': 6,
        '3B': 9,
        'HR': 12,
        'R': 3.2,
        'RBI': 3.5,
        'BB': 3,
        'SB': 6,
        'CS': -3,
        'HBP': 3
      },
      pitching: {
        'IP': 3,
        'K': 3,
        'W': 6,
        'ER': -3,
        'H': -0.6,
        'BB': -0.6,
        'HBP': -0.6,
        'CG': 3,
        'CGSO': 3,
        'NH': 6
      }
    }
  };

  const calculatePoints = (player, type) => {
    const scoring = scoringSystems[scoringSystem][type];
    return Object.entries(scoring).reduce((total, [stat, points]) => {
      if (player[stat]) return total + player[stat] * points;
      return total;
    }, 0);
  };

  const getPlayerScores = (type) => {
    const stats = type === 'hitting' ? hittingStats : pitchingStats;
    return stats
      .map((player) => ({
        ...player,
        FantasyPoints: calculatePoints(player, type),
      }))
      .sort((a, b) => b.FantasyPoints - a.FantasyPoints);
  };

  const processFile = async (file, type) => {
    setIsLoading(true);
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
            setIsLoading(false);
            return;
          }

          const stats = results.data.map((player) => ({
            ...player,
            '1B': type === 'hitting' ? player.H - (player['2B'] + player['3B'] + player.HR) : undefined,
          }));
          
          if (type === 'hitting') {
            setHittingStats(stats);
          } else {
            setPitchingStats(stats);
          }
          setIsLoading(false);
        },
        error: (parseError) => {
          setError(`Error processing file: ${parseError.message}`);
          setIsLoading(false);
        }
      });
    } catch (fileError) {
      setError(`Error reading file: ${fileError.message}`);
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-center text-gray-800">
        OOTP Fantasy Calculator
      </h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          {error}
        </div>
      )}

      {isLoading && (
        <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded relative">
          Processing file...
        </div>
      )}

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Scoring System:
        </label>
        <select
          value={scoringSystem}
          onChange={(e) => setScoringSystem(e.target.value)}
          disabled={isLoading}
          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {Object.entries(scoringSystems).map(([key, system]) => (
            <option key={key} value={key}>
              {system.name}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hitting Stats */}
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-xl font-bold mb-4">Hitting Stats</h2>
          <input
            type="text"
            placeholder="Search hitting stats..."
            value={hittingSearchQuery}
            onChange={(e) => setHittingSearchQuery(e.target.value)}
            disabled={isLoading}
            className="w-full p-2 mb-4 border border-gray-300 rounded-lg disabled:opacity-50"
          />
          <input
            type="file"
            accept=".csv"
            onChange={(e) => e.target.files?.[0] && processFile(e.target.files[0], 'hitting')}
            disabled={isLoading}
            className="block w-full p-2 border rounded-lg mb-4 disabled:opacity-50"
          />
          {hittingStats.length > 0 ? (
            <div className={`transition-opacity ${isLoading ? 'opacity-50' : 'opacity-100'}`}>
              <table className="min-w-full border border-gray-200 rounded-lg">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-2">Name</th>
                    <th className="p-2">Position</th>
                    <th className="p-2">Points</th>
                  </tr>
                </thead>
                <tbody>
                  {getPlayerScores('hitting')
                    .filter(player => 
                      player.Name?.toLowerCase().includes(hittingSearchQuery.toLowerCase()) ||
                      player.POS?.toLowerCase().includes(hittingSearchQuery.toLowerCase())
                    )
                    .map((player, idx) => (
                      <tr key={idx} className={idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                        <td className="p-2">{player.Name}</td>
                        <td className="p-2">{player.POS}</td>
                        <td className="p-2 text-right">
                          {player.FantasyPoints.toFixed(1)}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 mt-4">No hitting stats uploaded yet.</p>
          )}
        </div>

        {/* Pitching Stats */}
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-xl font-bold mb-4">Pitching Stats</h2>
          <input
            type="text"
            placeholder="Search pitching stats..."
            value={pitchingSearchQuery}
            onChange={(e) => setPitchingSearchQuery(e.target.value)}
            disabled={isLoading}
            className="w-full p-2 mb-4 border border-gray-300 rounded-lg disabled:opacity-50"
          />
          <input
            type="file"
            accept=".csv"
            onChange={(e) => e.target.files?.[0] && processFile(e.target.files[0], 'pitching')}
            disabled={isLoading}
            className="block w-full p-2 border rounded-lg mb-4 disabled:opacity-50"
          />
          {pitchingStats.length > 0 ? (
            <div className={`transition-opacity ${isLoading ? 'opacity-50' : 'opacity-100'}`}>
              <table className="min-w-full border border-gray-200 rounded-lg">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-2">Name</th>
                    <th className="p-2">Position</th>
                    <th className="p-2">Points</th>
                  </tr>
                </thead>
                <tbody>
                  {getPlayerScores('pitching')
                    .filter(player => 
                      player.Name?.toLowerCase().includes(pitchingSearchQuery.toLowerCase()) ||
                      player.POS?.toLowerCase().includes(pitchingSearchQuery.toLowerCase())
                    )
                    .map((player, idx) => (
                      <tr key={idx} className={idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                        <td className="p-2">{player.Name}</td>
                        <td className="p-2">{player.POS}</td>
                        <td className="p-2 text-right">
                          {player.FantasyPoints.toFixed(1)}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 mt-4">No pitching stats uploaded yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default FantasyCalculator;

import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';

const SoloDFS = () => {
  const [roster, setRoster] = useState([]);
  const [availablePlayers, setAvailablePlayers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [personalBest, setPersonalBest] = useState(null);
  const [currentScore, setCurrentScore] = useState(0);
  const [loadingStats, setLoadingStats] = useState(false);
  const [error, setError] = useState('');
  
  useEffect(() => {
    const savedBest = localStorage.getItem('soloDFS_personalBest');
    if (savedBest) {
      setPersonalBest(JSON.parse(savedBest));
    }
  }, []);

  const rosterLimits = {
    'C': { min: 1, max: 1 },
    '1B': { min: 1, max: 1 },
    '2B': { min: 1, max: 1 },
    '3B': { min: 1, max: 1 },
    'SS': { min: 1, max: 1 },
    'OF': { min: 3, max: 3 },
    'SP': { min: 2, max: 2 },
    'RP': { min: 1, max: 1 }
  };

  const calculatePoints = (player) => {
    if (!player) return 0;
    
    const scoringSystem = {
      hitting: {
        '1B': 3,
        '2B': 5,
        '3B': 8,
        'HR': 10,
        'R': 2,
        'RBI': 2,
        'BB': 2,
        'SB': 5,
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
        'CGSO': 2.5
      }
    };

    const isPitcher = player.POS?.includes('P');
    const scoring = isPitcher ? scoringSystem.pitching : scoringSystem.hitting;
    
    return Object.entries(scoring).reduce((total, [stat, points]) => {
      const value = player[stat] || 0;
      return total + (value * points);
    }, 0);
  };

  const processFile = async (file) => {
    setLoadingStats(true);
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
            return;
          }

          const processedPlayers = results.data.map(player => ({
            ...player,
            '1B': player.H - ((player['2B'] || 0) + (player['3B'] || 0) + (player.HR || 0)),
            points: 0
          }));

          setAvailablePlayers(processedPlayers);
          setLoadingStats(false);
        },
        error: (error) => {
          setError(`Error processing file: ${error.message}`);
          setLoadingStats(false);
        }
      });
    } catch (error) {
      setError(`Error reading file: ${error.message}`);
      setLoadingStats(false);
    }
  };

  const addToRoster = (player) => {
    if (roster.length >= 11) {
      setError('Roster is full (11 players maximum)');
      return;
    }

    const position = player.POS;
    const currentPositionCount = roster.filter(p => p.POS === position).length;
    const limit = rosterLimits[position]?.max || 0;

    if (currentPositionCount >= limit) {
      setError(`Maximum ${position} players (${limit}) reached`);
      return;
    }

    const updatedRoster = [...roster, { ...player, points: calculatePoints(player) }];
    setRoster(updatedRoster);
    updateScore(updatedRoster);
  };

  const removeFromRoster = (playerIndex) => {
    const updatedRoster = roster.filter((_, index) => index !== playerIndex);
    setRoster(updatedRoster);
    updateScore(updatedRoster);
  };

  const updateScore = (currentRoster) => {
    const score = currentRoster.reduce((total, player) => total + player.points, 0);
    setCurrentScore(score);

    if (!personalBest || score > personalBest.score) {
      const newBest = {
        score,
        roster: currentRoster,
        date: new Date().toISOString()
      };
      setPersonalBest(newBest);
      localStorage.setItem('soloDFS_personalBest', JSON.stringify(newBest));
    }
  };

  const filteredPlayers = availablePlayers.filter(player => 
    player.Name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    player.POS?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-4">
        Beat Your Best DFS
      </h2>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <h3 className="text-lg font-semibold mb-2">Import Players</h3>
        <input
          type="file"
          accept=".csv"
          onChange={(e) => processFile(e.target.files[0])}
          className="block w-full p-2 border rounded-lg"
          disabled={loadingStats}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Available Players */}
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-semibold mb-4">Available Players</h3>
          <input
            type="text"
            placeholder="Search players..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full p-2 mb-4 border rounded-lg"
          />
          <div className="h-96 overflow-y-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="p-2 text-left">Name</th>
                  <th className="p-2 text-left">POS</th>
                  <th className="p-2 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredPlayers.map((player, idx) => (
                  <tr key={idx} className="border-t">
                    <td className="p-2">{player.Name}</td>
                    <td className="p-2">{player.POS}</td>
                    <td className="p-2 text-right">
                      <button
                        onClick={() => addToRoster(player)}
                        className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                      >
                        Add
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Current Roster */}
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-semibold mb-2">Your Roster</h3>
          <div className="mb-4">
            <p className="text-lg font-semibold">
              Current Score: {currentScore.toFixed(1)}
            </p>
            {personalBest && (
              <p className="text-sm text-gray-600">
                Personal Best: {personalBest.score.toFixed(1)} 
                (Set on {new Date(personalBest.date).toLocaleDateString()})
              </p>
            )}
          </div>
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-2 text-left">Name</th>
                <th className="p-2 text-left">POS</th>
                <th className="p-2 text-right">Points</th>
                <th className="p-2 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {roster.map((player, idx) => (
                <tr key={idx} className="border-t">
                  <td className="p-2">{player.Name}</td>
                  <td className="p-2">{player.POS}</td>
                  <td className="p-2 text-right">{player.points.toFixed(1)}</td>
                  <td className="p-2 text-right">
                    <button
                      onClick={() => removeFromRoster(idx)}
                      className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SoloDFS;

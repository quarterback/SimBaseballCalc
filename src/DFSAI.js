import React, { useState } from 'react';
import Papa from 'papaparse';

const DFSAI = () => {
  const [availablePlayers, setAvailablePlayers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [roster, setRoster] = useState([]);
  const [currentScore, setCurrentScore] = useState(0);
  const [loadingStats, setLoadingStats] = useState(false);
  const [error, setError] = useState('');
  const [scoringSystem, setScoringSystem] = useState('draftKingsDFS');
  const [statType, setStatType] = useState('hitting');
  const [aiTeams, setAiTeams] = useState([]);
  const [gameLocked, setGameLocked] = useState(false);
  const [difficulty, setDifficulty] = useState('balanced');

  const scoringSystems = {
    draftKingsDFS: {
      name: 'DraftKings DFS',
      hitting: { '1B': 3, '2B': 5, '3B': 8, 'HR': 10, 'R': 2, 'RBI': 2, 'BB': 2, 'SB': 5, 'CS': -2, 'HP': 2 },
      pitching: { 'IP': 2.25, 'K': 2, 'W': 4, 'ER': -2, 'H': -0.6, 'BB': -0.6, 'HP': -0.6, 'CG': 2.5 }
    }
  };

  const processFile = (file) => {
    setLoadingStats(true);
    setError('');

    const reader = new FileReader();
    reader.onload = ({ target }) => {
      Papa.parse(target.result, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        complete: (results) => {
          if (results.errors.length > 0) {
            setError('Error parsing CSV file.');
            setLoadingStats(false);
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
    };
    reader.readAsText(file);
  };

  const calculatePoints = (player) => {
    const scoring = scoringSystems[scoringSystem][statType];
    return Object.entries(scoring).reduce((total, [stat, value]) => total + (player[stat] || 0) * value, 0);
  };

  const addToRoster = (player) => {
    if (roster.length >= 9) {
      setError('Roster is full (9 players maximum)');
      return;
    }

    const updatedRoster = [...roster, {
      ...player,
      points: calculatePoints(player)
    }];
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
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-center">Weekly DFS Challenge</h2>

      {error && <div className="text-red-500">{error}</div>}
      {loadingStats && <div className="text-gray-500">Loading player data...</div>}

      {/* File Upload */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <h3 className="text-lg font-semibold mb-2">Upload CSV</h3>
        <input
          type="file"
          accept=".csv"
          onChange={(e) => e.target.files?.[0] && processFile(e.target.files[0])}
          className="block w-full p-2 border rounded-lg"
          disabled={loadingStats}
        />
      </div>

      {/* Player Selection */}
      {availablePlayers.length > 0 && (
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
                {availablePlayers
                  .filter(player => player.Name.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map((player, idx) => (
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
      )}

      {/* Current Roster */}
      {roster.length > 0 && (
        <div className="bg-white rounded-lg shadow p-4 mt-4">
          <h3 className="text-lg font-semibold mb-2">Your Roster</h3>
          <p className="text-lg font-semibold">Current Score: {currentScore.toFixed(1)}</p>
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
      )}
    </div>
  );
};

export default DFSAI;

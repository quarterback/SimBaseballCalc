import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';
import _ from 'lodash';

const SoloDFS = () => {
  const [roster, setRoster] = useState([]);
  const [availablePlayers, setAvailablePlayers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [personalBests, setPersonalBests] = useState({});
  const [currentScore, setCurrentScore] = useState(0);
  const [loadingStats, setLoadingStats] = useState(false);
  const [error, setError] = useState('');
  const [scoringSystem, setScoringSystem] = useState('draftKingsDFS');
  const [statType, setStatType] = useState('hitting');

  const scoringSystems = {
    draftKingsDFS: {
      name: 'DraftKings DFS',
      hitting: {
        '1B': 3, '2B': 5, '3B': 8, 'HR': 10,
        'R': 2, 'RBI': 2, 'BB': 2, 'SB': 5,
        'CS': -2, 'HBP': 2
      },
      pitching: {
        'IP': 2.25, 'K': 2, 'W': 4, 'ER': -2,
        'H': -0.6, 'BB': -0.6, 'HBP': -0.6,
        'CG': 2.5, 'CGSO': 2.5, 'NH': 5
      }
    },
    fanduelDFS: {
      name: 'FanDuel DFS',
      hitting: {
        '1B': 3, '2B': 6, '3B': 9, 'HR': 12,
        'R': 3.2, 'RBI': 3.5, 'BB': 3, 'SB': 6,
        'CS': -3, 'HBP': 3
      },
      pitching: {
        'IP': 3, 'K': 3, 'W': 6, 'ER': -3,
        'H': -0.6, 'BB': -0.6, 'HBP': -0.6,
        'CG': 3, 'CGSO': 3, 'NH': 6
      }
    },
    statcastEra: {
      name: 'Statcast Era',
      hitting: {
        'HR': 4, 'BB': 3, 'K': -2, 'OBP': 15,
        'SLG': 10, 'ISO': 8, 'BABIP': 5, 'OPS': 12,
        'WAR': 10
      },
      pitching: {
        'K/9': 5, 'BB/9': -3, 'HR/9': -5,
        'WHIP': -8, 'FIP': -6, 'ERA+': 4,
        'WAR': 8
      }
    },
    backwardsBaseball: {
      name: 'Backwards Baseball',
      hitting: {
        'AB': 1, 'H': -2, 'HR': -10, 'RBI': -2,
        'BB': -3, 'K': 3, 'GIDP': 5, 'CS': 4
      },
      pitching: {
        'IP': 2, 'ER': 3, 'H': 1, 'BB': 2,
        'K': -2, 'HR': 5, 'L': 10
      }
    }
  };

  useEffect(() => {
    const savedBests = localStorage.getItem('soloDFS_personalBests');
    if (savedBests) {
      setPersonalBests(JSON.parse(savedBests));
    }
  }, []);

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

          const processedPlayers = results.data.map(player => {
            // Calculate derived stats
            const singles = (player.H || 0) - ((player['2B'] || 0) + (player['3B'] || 0) + (player.HR || 0));
            return {
              ...player,
              '1B': singles,
              'ISO': ((player['2B'] || 0) + 2 * (player['3B'] || 0) + 3 * (player.HR || 0)) / (player.AB || 1),
              'K/9': (player.K || 0) * 9 / (player.IP || 1),
              'BB/9': (player.BB || 0) * 9 / (player.IP || 1),
              'HR/9': (player.HR || 0) * 9 / (player.IP || 1),
              points: 0
            };
          });

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

  const calculatePoints = (player, system = scoringSystem, type = statType) => {
    if (!player) return 0;
    const scoring = scoringSystems[system][type];
    return Object.entries(scoring).reduce((total, [stat, points]) => {
      const value = player[stat] || 0;
      return total + (value * points);
    }, 0);
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

    const bestKey = `${scoringSystem}_${statType}`;
    if (!personalBests[bestKey] || score > personalBests[bestKey].score) {
      const newBests = {
        ...personalBests,
        [bestKey]: {
          score,
          roster: currentRoster,
          date: new Date().toISOString()
        }
      };
      setPersonalBests(newBests);
      localStorage.setItem('soloDFS_personalBests', JSON.stringify(newBests));
    }
  };

  const handleScoringChange = (newSystem) => {
    setScoringSystem(newSystem);
    const updatedRoster = roster.map(player => ({
      ...player,
      points: calculatePoints(player, newSystem, statType)
    }));
    setRoster(updatedRoster);
    updateScore(updatedRoster);
  };

  const handleStatTypeChange = (newType) => {
    setStatType(newType);
    setRoster([]); // Clear roster when switching between hitting/pitching
    setCurrentScore(0);
  };

  const filteredPlayers = availablePlayers.filter(player => {
    const searchLower = searchQuery.toLowerCase();
    const isPitcher = player.POS?.includes('P');
    const matchesType = (statType === 'pitching') === isPitcher;
    
    return matchesType && (
      player.Name?.toLowerCase().includes(searchLower) ||
      player.POS?.toLowerCase().includes(searchLower)
    );
  });

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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Scoring System:
          </label>
          <select
            value={scoringSystem}
            onChange={(e) => handleScoringChange(e.target.value)}
            className="w-full p-2 border rounded-lg"
          >
            {Object.entries(scoringSystems).map(([key, system]) => (
              <option key={key} value={key}>{system.name}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Stats Type:
          </label>
          <select
            value={statType}
            onChange={(e) => handleStatTypeChange(e.target.value)}
            className="w-full p-2 border rounded-lg"
          >
            <option value="hitting">Hitting</option>
            <option value="pitching">Pitching</option>
          </select>
        </div>
      </div>

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
            {personalBests[`${scoringSystem}_${statType}`] && (
              <p className="text-sm text-gray-600">
                Personal Best: {personalBests[`${scoringSystem}_${statType}`].score.toFixed(1)} 
                (Set on {new Date(personalBests[`${scoringSystem}_${statType}`].date).toLocaleDateString()})
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

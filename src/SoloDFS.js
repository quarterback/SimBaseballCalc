import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';

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
  const [bonuses, setBonuses] = useState({});

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
        'CG': 2.5
      }
    },
    sabermetricMode: {
      name: "Sabermetric Mode",
      hitting: {
        'AVG': 10,
        'OBP': 15,
        'SLG': 12,
        'WAR': 25,
        'BABIP': 5
      },
      pitching: {
        'ERA': -5,
        'WHIP': -8,
        'FIP': -5,
        'K/9': 3,
        'WAR': 20
      }
    },
    defensiveSpecialist: {
      name: "Defensive Specialist Mode",
      hitting: {
        'ZR': 15,
        'Range': 10,
        'Error': -5,
        'DP': 10
      },
      pitching: {
        'GB%': 10,
        'WP': -5,
        'PB': -5,
        'CS%': 10
      }
    },
    hotStreakBonus: {
      name: "Hot Streak Bonus",
      hitting: {
        'HR': 10,
        'RBI': 3,
        'R': 3,
        'Streak': 15
      },
      pitching: {
        'IP': 2,
        'K': 3,
        'W': 5,
        'SHO': 20,
        'Streak': 15
      }
    },
    vintageLeague: {
      name: "Vintage League",
      hitting: {
        'AVG': 15,
        'RBI': 3,
        'H': 2,
        'CS': -5
      },
      pitching: {
        'ERA': -10,
        'CG': 10,
        'IP': 3,
        'BB': -3
      }
    },
    boomOrBust: {
      name: "Boom or Bust",
      hitting: {
        'HR': 20,
        'K': -5,
        'SLG': 8,
        'TB': 5
      },
      pitching: {
        'K': 10,
        'BB': -10,
        'HR': -15,
        'IP': 2
      }
    }
  };

  useEffect(() => {
    const savedBests = localStorage.getItem('soloDFS_personalBests');
    if (savedBests) {
      setPersonalBests(JSON.parse(savedBests));
    }
  }, []);

  const calculatePoints = (player, playerBonuses = {}) => {
    if (!player) return 0;

    const scoring = scoringSystems[scoringSystem][statType];
    let points = Object.entries(scoring).reduce((total, [stat, value]) => {
      // Get base stat value
      const statValue = player[stat] || 0;
      return total + (statValue * value);
    }, 0);

    // Add bonus points for pitchers
    if (player.POS?.includes('P')) {
      if (playerBonuses.CGSO) {
        points += scoringSystem === 'draftKingsDFS' ? 2.5 : 3;
      }
      if (playerBonuses.NH) {
        points += scoringSystem === 'draftKingsDFS' ? 5 : 6;
      }
    }

    return points;
  };

  const toggleBonus = (playerId, bonusType) => {
    const updatedBonuses = {
      ...bonuses,
      [playerId]: {
        ...(bonuses[playerId] || {}),
        [bonusType]: !(bonuses[playerId]?.[bonusType])
      }
    };
    setBonuses(updatedBonuses);

    // Recalculate roster points
    const updatedRoster = roster.map(player => ({
      ...player,
      points: calculatePoints(
        player, 
        updatedBonuses[player.id] || {}
      )
    }));
    setRoster(updatedRoster);
    updateScore(updatedRoster);
  };

  const addToRoster = (player) => {
    if (roster.length >= 9) {
      setError('Roster is full (9 players maximum)');
      return;
    }

    const playerId = `${player.Name}-${player.Team || 'unknown'}`;
    const updatedRoster = [...roster, {
      ...player,
      id: playerId,
      points: calculatePoints(player, bonuses[playerId] || {})
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
            // Calculate singles for hitting stats
            const singles = (player.H || 0) - ((player['2B'] || 0) + (player['3B'] || 0) + (player.HR || 0));
            return {
              ...player,
              '1B': singles,
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
            onChange={(e) => setScoringSystem(e.target.value)}
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
            onChange={(e) => setStatType(e.target.value)}
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
          onChange={(e) => e.target.files?.[0] && processFile(e.target.files[0])}
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
                <th className="p-2 text-center">Bonuses</th>
                <th className="p-2 text-right">Points</th>
                <th className="p-2 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {roster.map((player, idx) => (
                <tr key={idx} className="border-t">
                  <td className="p-2">{player.Name}</td>
                  <td className="p-2">{player.POS}</td>
                  <td className="p-2 text-center">
                    {player.POS?.includes('P') && (
                      <div className="flex justify-center space-x-2">
                        <label className="flex items-center space-x-1">
                          <input
                            type="checkbox"
                            checked={bonuses[player.id]?.CGSO || false}
                            onChange={() => toggleBonus(player.id, 'CGSO')}
                            className="rounded"
                          />
                          <span className="text-sm">CGSO</span>
                        </label>
                        <label className="flex items-center space-x-1">
                          <input
                            type="checkbox"
                            checked={bonuses[player.id]?.NH || false}
                            onChange={() => toggleBonus(player.id, 'NH')}
                            className="rounded"
                          />
                          <span className="text-sm">NH</span>
                        </label>
                      </div>
                    )}
                  </td>
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

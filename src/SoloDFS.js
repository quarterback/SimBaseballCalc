import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';

const SoloDFS = () => {
  // ... (previous state variables) ...
  const [bonuses, setBonuses] = useState({});  // Store bonuses by player ID

  // Updated addToRoster function
  const addToRoster = (player) => {
    if (roster.length >= 9) {
      setError('Roster is full (9 players maximum)');
      return;
    }

    const playerId = `${player.Name}-${player.Team}`;
    const updatedRoster = [...roster, {
      ...player,
      id: playerId,
      points: calculatePoints(player, bonuses[playerId] || {})
    }];
    setRoster(updatedRoster);
    updateScore(updatedRoster);
  };

  // Updated calculatePoints function
  const calculatePoints = (player, playerBonuses = {}) => {
    if (!player) return 0;
    
    const scoring = scoringSystems[scoringSystem][statType];
    let points = Object.entries(scoring).reduce((total, [stat, value]) => {
      if (stat === 'CGSO' || stat === 'NH') return total;
      const statValue = player[stat] || 0;
      return total + (statValue * value);
    }, 0);

    // Add bonus points
    if (playerBonuses.CGSO) {
      points += (scoringSystem === 'draftKingsDFS' ? 2.5 : 3);
    }
    if (playerBonuses.NH) {
      points += (scoringSystem === 'draftKingsDFS' ? 5 : 6);
    }

    return points;
  };

  // Function to toggle bonus for a player
  const toggleBonus = (playerId, bonusType) => {
    const updatedBonuses = {
      ...bonuses,
      [playerId]: {
        ...(bonuses[playerId] || {}),
        [bonusType]: !(bonuses[playerId]?.[bonusType])
      }
    };
    setBonuses(updatedBonuses);

    // Recalculate points for the roster
    const updatedRoster = roster.map(player => ({
      ...player,
      points: calculatePoints(player, updatedBonuses[player.id] || {})
    }));
    setRoster(updatedRoster);
    updateScore(updatedRoster);
  };

  // Render function (focusing on the roster table part)
  return (
    <div className="space-y-6">
      {/* ... (previous JSX) ... */}

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

      {/* ... (remaining JSX) ... */}
    </div>
  );
};

export default SoloDFS;

import React, { useState } from 'react';
import Papa from 'papaparse';

const DFSAI = () => {
  const [availablePlayers, setAvailablePlayers] = useState([]);
  const [userRoster, setUserRoster] = useState([]);
  const [currentScore, setCurrentScore] = useState(0);
  const [loadingStats, setLoadingStats] = useState(false);
  const [error, setError] = useState('');
  const [gameLocked, setGameLocked] = useState(false);
  const [difficulty, setDifficulty] = useState('balanced');
  const [aiTeams, setAiTeams] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  const aiPersonalities = [
    { name: 'KateParkfactor', strategy: 'venueAnalytics' },
    { name: 'xWOBA_Warrior', strategy: 'advancedStats' },
    { name: 'Sarah_Numbers', strategy: 'probabilityBased' },
    { name: 'TomTheStacker', strategy: 'stackLineups' },
    { name: 'AceHunter_Mike', strategy: 'elitePitcher' },
    { name: 'ValueJohn_DFS', strategy: 'valueHunting' }
  ];

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
            const singles = (player.H || 0) - ((player['2B'] || 0) + (player['3B'] || 0) + (player.HR || 0));
            return {
              ...player,
              '1B': singles,
              points: calculateFantasyPoints(player)
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

  const calculateFantasyPoints = (player) => {
    // Basic DraftKings scoring
    const scoring = {
      '1B': 3, '2B': 5, '3B': 8, 'HR': 10,
      'R': 2, 'RBI': 2, 'BB': 2, 'SB': 5,
      'CS': -2, 'HBP': 2,
      'IP': 2.25, 'K': 2, 'W': 4, 'ER': -2,
      'H': -0.6, 'BB': -0.6
    };

    return Object.entries(scoring).reduce((total, [stat, points]) => {
      const value = player[stat] || 0;
      return total + (value * points);
    }, 0);
  };

  const addToRoster = (player) => {
    if (userRoster.length >= 9) {
      setError('Roster is full (9 players maximum)');
      return;
    }

    const updatedRoster = [...userRoster, player];
    setUserRoster(updatedRoster);
    updateScore(updatedRoster);
  };

  const removeFromRoster = (playerIndex) => {
    const updatedRoster = userRoster.filter((_, index) => index !== playerIndex);
    setUserRoster(updatedRoster);
    updateScore(updatedRoster);
  };

  const updateScore = (roster) => {
    const score = roster.reduce((total, player) => total + (player.points || 0), 0);
    setCurrentScore(score);
  };

  const lockGame = () => {
    if (userRoster.length !== 9) {
      setError('Please select exactly 9 players before locking your lineup');
      return;
    }
    setGameLocked(true);
    generateAiTeams();
  };
const generateAiTeams = () => {
  if (availablePlayers.length === 0) {
    setError('No player data available.');
    return;
  }

  const selectPlayersForStrategy = (strategy, players) => {
    // Helper function to filter players by position
    const getPlayersByPosition = (pos, count) => {
      return players
        .filter(p => p.POS?.includes(pos))
        .sort((a, b) => {
          switch(strategy) {
            case 'venueAnalytics':
              return (b.ParkFactor || 0) - (a.ParkFactor || 0);
            case 'advancedStats':
              return (b.points || 0) - (a.points || 0);
            case 'powerUpside':
              return (b.HR || 0) - (a.HR || 0);
            case 'strikeoutHeavy':
              return (b.K || 0) - (a.K || 0);
            case 'random':
              return Math.random() - 0.5;
            default:
              return (b.points || 0) - (a.points || 0);
          }
        })
        .slice(0, count);
    };

    // Standard roster construction
    const roster = [
      ...getPlayersByPosition('P', 2),  // 2 Pitchers
      ...getPlayersByPosition('C', 1),  // 1 Catcher
      ...getPlayersByPosition('1B', 1), // 1 First Baseman
      ...getPlayersByPosition('2B', 1), // 1 Second Baseman
      ...getPlayersByPosition('3B', 1), // 1 Third Baseman
      ...getPlayersByPosition('SS', 1), // 1 Shortstop
      ...getPlayersByPosition('OF', 2)  // 2 Outfielders
    ];

    return roster;
  };

  let teams = aiPersonalities.map(personality => {
    const selectedPlayers = selectPlayersForStrategy(personality.strategy, [...availablePlayers]);
    const totalPoints = selectedPlayers.reduce((sum, player) => sum + (player.points || 0), 0);
    
    // Apply difficulty modifier
    let adjustedPoints = totalPoints;
    if (difficulty === 'hard') {
      adjustedPoints *= 1.1;  // 10% increase for hard mode
    } else if (difficulty === 'easy') {
      adjustedPoints *= 0.9;  // 10% decrease for easy mode
    }

    return {
      name: personality.name,
      strategy: personality.strategy,
      score: adjustedPoints,
      roster: selectedPlayers
    };
  });

  // Sort teams by score
  teams.sort((a, b) => b.score - a.score);
  
  setAiTeams(teams);
};

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-center">Weekly DFS Challenge</h2>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Difficulty:
          </label>
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            disabled={gameLocked}
            className="w-full p-2 border rounded-lg"
          >
            <option value="easy">Easy</option>
            <option value="balanced">Balanced</option>
            <option value="hard">Hard</option>
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
          disabled={loadingStats || gameLocked}
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
            disabled={gameLocked}
          />
          <div className="h-96 overflow-y-auto">
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
                {availablePlayers
                  .filter(player => 
                    player.Name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    player.POS?.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                  .map((player, idx) => (
                    <tr key={idx} className="border-t">
                      <td className="p-2">{player.Name}</td>
                      <td className="p-2">{player.POS}</td>
                      <td className="p-2 text-right">{player.points?.toFixed(1)}</td>
                      <td className="p-2 text-right">
                        <button
                          onClick={() => addToRoster(player)}
                          disabled={gameLocked}
                          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
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

        {/* User's Roster */}
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-semibold mb-2">Your Roster</h3>
          <div className="mb-4">
            <p className="text-lg font-semibold">
              Current Score: {currentScore.toFixed(1)}
            </p>
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
              {userRoster.map((player, idx) => (
                <tr key={idx} className="border-t">
                  <td className="p-2">{player.Name}</td>
                  <td className="p-2">{player.POS}</td>
                  <td className="p-2 text-right">{player.points?.toFixed(1)}</td>
                  <td className="p-2 text-right">
                    <button
                      onClick={() => removeFromRoster(idx)}
                      disabled={gameLocked}
                      className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <button
            onClick={lockGame}
            disabled={gameLocked || userRoster.length !== 9}
            className="mt-4 w-full bg-green-500 text-white p-2 rounded hover:bg-green-600 disabled:opacity-50"
          >
            Lock Lineup & Generate AI Teams
          </button>
        </div>
      </div>

      {/* Leaderboard */}
      {gameLocked && aiTeams.length > 0 && (
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-xl font-bold mb-4">Leaderboard</h3>
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-2 text-left">User/AI</th>
                <th className="p-2 text-left">Strategy</th>
                <th className="p-2 text-right">Score</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t">
                <td className="p-2">You</td>
                <td className="p-2">User</td>
                <td className="p-2 text-right">{currentScore.toFixed(1)}</td>
              </tr>
              {aiTeams.map((team, idx) => (
                <tr key={idx} className="border-t">
                  <td className="p-2">{team.name}</td>
                  <td className="p-2">{team.strategy}</td>
                  <td className="p-2 text-right">{team.score.toFixed(1)}</td>
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

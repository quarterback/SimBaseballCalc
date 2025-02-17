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

  const SALARY_CAP = 50000;
  const MIN_SALARY = 3000; // Minimum player salary
  
  // Position requirements for all teams
  const ROSTER_REQUIREMENTS = {
    'P': 2,    // 2 Pitchers
    'C': 1,    // 1 Catcher
    '1B': 1,   // 1 First Baseman
    '2B': 1,   // 1 Second Baseman
    '3B': 1,   // 1 Third Baseman
    'SS': 1,   // 1 Shortstop
    'OF': 2    // 2 Outfielders
  };

  // Generate player salaries if they don't exist
  const playersWithSalaries = availablePlayers.map(player => {
    if (!player.salary) {
      // Base salary on recent performance and position scarcity
      let baseSalary = (player.points || 0) * 100;
      
      // Position premium
      const positionMultiplier = {
        'P': 1.4,   // Premium for pitchers
        'C': 1.2,   // Premium for scarce positions
        'SS': 1.15,
        'OF': 0.9   // Discount for abundant positions
      };

      // Apply position multiplier
      const multiplier = positionMultiplier[player.POS] || 1;
      baseSalary *= multiplier;

      // Add some randomness (±20%)
      baseSalary *= (0.8 + Math.random() * 0.4);

      // Ensure minimum salary
      baseSalary = Math.max(MIN_SALARY, baseSalary);

      return { ...player, salary: Math.round(baseSalary) };
    }
    return player;
  });

  const generateRandomStrategy = () => {
    return {
      powerWeight: Math.random(),
      avgWeight: Math.random(),
      speedWeight: Math.random(),
      kWeight: Math.random(),
      recentFormWeight: Math.random(),
      stackingPreference: Math.random() > 0.7,
      riskTolerance: Math.random(),
      valueHunting: Math.random(), // New: preference for value picks
      starHunting: Math.random()   // New: preference for expensive stars
    };
  };

  const selectPlayersWithStrategy = (strategy) => {
    let roster = [];
    let totalSalary = 0;
    let availablePlayersCopy = [...playersWithSalaries];
    let selectedTeams = new Set();

    const getPlayerValue = (player) => {
      let value = 0;
      
      // Performance value
      value += (player.HR || 0) * strategy.powerWeight * (0.8 + Math.random() * 0.4);
      value += (player.AVG || 0) * strategy.avgWeight * (0.8 + Math.random() * 0.4);
      value += (player.SB || 0) * strategy.speedWeight * (0.8 + Math.random() * 0.4);
      value += (player.K || 0) * strategy.kWeight * (0.8 + Math.random() * 0.4);

      // Value hunting: points per salary dollar
      if (strategy.valueHunting > 0.5) {
        value *= (player.points || 0) / (player.salary || MIN_SALARY);
      }

      // Star hunting: preference for expensive players
      if (strategy.starHunting > 0.5) {
        value *= (player.salary || MIN_SALARY) / 10000;
      }

      // Stacking bonus
      if (strategy.stackingPreference && selectedTeams.has(player.Team)) {
        value *= 1.2;
      }

      // Risk adjustment
      if (strategy.riskTolerance > 0.5) {
        value *= (0.8 + Math.random() * 0.4);
      }

      return value;
    };

    // First pass: select high-priority positions (P, C, SS)
    const priorityPositions = ['P', 'C', 'SS'];
    for (const pos of priorityPositions) {
      const count = ROSTER_REQUIREMENTS[pos];
      const positionPlayers = availablePlayersCopy.filter(p => p.POS?.includes(pos));
      
      positionPlayers.sort((a, b) => getPlayerValue(b) - getPlayerValue(a));
      
      for (let i = 0; i < count; i++) {
        if (positionPlayers[i] && totalSalary + positionPlayers[i].salary <= SALARY_CAP) {
          roster.push(positionPlayers[i]);
          totalSalary += positionPlayers[i].salary;
          selectedTeams.add(positionPlayers[i].Team);
          availablePlayersCopy = availablePlayersCopy.filter(p => p !== positionPlayers[i]);
        }
      }
    }

    // Second pass: fill remaining positions while respecting salary cap
    const remainingPositions = Object.entries(ROSTER_REQUIREMENTS)
      .filter(([pos]) => !priorityPositions.includes(pos));

    for (const [pos, count] of remainingPositions) {
      const positionPlayers = availablePlayersCopy.filter(p => p.POS?.includes(pos));
      positionPlayers.sort((a, b) => getPlayerValue(b) - getPlayerValue(a));
      
      let filledCount = 0;
      let playerIndex = 0;
      
      while (filledCount < count && playerIndex < positionPlayers.length) {
        const player = positionPlayers[playerIndex];
        if (totalSalary + player.salary <= SALARY_CAP) {
          roster.push(player);
          totalSalary += player.salary;
          selectedTeams.add(player.Team);
          filledCount++;
          availablePlayersCopy = availablePlayersCopy.filter(p => p !== player);
        }
        playerIndex++;
      }
    }

    return { roster, totalSalary };
  };

  // Generate teams with random strategies
  let teams = aiPersonalities.map(personality => {
    const randomStrategy = generateRandomStrategy();
    const { roster: selectedPlayers, totalSalary } = selectPlayersWithStrategy(randomStrategy);
    const totalPoints = selectedPlayers.reduce((sum, player) => sum + (player.points || 0), 0);
    
    let adjustedPoints = totalPoints * (0.95 + Math.random() * 0.1);
    
    if (difficulty === 'hard') {
      adjustedPoints *= 1.1;
    } else if (difficulty === 'easy') {
      adjustedPoints *= 0.9;
    }

    return {
      name: personality.name,
      strategy: personality.strategy,
      score: adjustedPoints,
      roster: selectedPlayers,
      salary: totalSalary,
      remainingSalary: SALARY_CAP - totalSalary
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

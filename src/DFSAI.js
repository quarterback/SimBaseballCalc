import React, { useState } from 'react';
import Papa from 'papaparse';

const DFSAI = () => {
  const [availablePlayers, setAvailablePlayers] = useState([]);
  const [userRoster, setUserRoster] = useState([]);
  const [currentSalary, setCurrentSalary] = useState(0);
  const [currentScore, setCurrentScore] = useState(0);
  const [loadingStats, setLoadingStats] = useState(false);
  const [error, setError] = useState('');
  const [gameLocked, setGameLocked] = useState(false);
  const [difficulty, setDifficulty] = useState('balanced');
  const [aiTeams, setAiTeams] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [winner, setWinner] = useState(null);

  const SALARY_CAP = 50000;
  const MIN_SALARY = 3000;

  const ROSTER_REQUIREMENTS = {
    'P': 2,
    'C': 1,
    '1B': 1,
    '2B': 1,
    '3B': 1,
    'SS': 1,
    'OF': 2,
    'UTIL': 1
  };

  // Random username generation
  const generateRandomUser = () => {
    const prefixes = ['DFS', 'Fantasy', 'Ball', 'Base', 'Diamond', 'Stats', 'Money', 'Pro', 'Grinder', 'Daily'];
    const suffixes = ['King', 'Queen', 'Champ', 'Master', 'Guru', 'Wizard', 'Beast', 'Expert', 'Boss', 'Shark'];
    const numbers = () => Math.floor(Math.random() * 999).toString().padStart(2, '0');
    const symbols = ['_', '', '.'];
    
    const patterns = [
      () => `${prefixes[Math.floor(Math.random() * prefixes.length)]}${symbols[Math.floor(Math.random() * symbols.length)]}${numbers()}`,
      () => `${suffixes[Math.floor(Math.random() * suffixes.length)]}${symbols[Math.floor(Math.random() * symbols.length)]}${numbers()}`,
      () => `${prefixes[Math.floor(Math.random() * prefixes.length)]}${suffixes[Math.floor(Math.random() * suffixes.length)]}`,
      () => `The${suffixes[Math.floor(Math.random() * suffixes.length)]}${numbers()}`
    ];

    return patterns[Math.floor(Math.random() * patterns.length)]();
  };

  const generateCompetitorPool = (count = 20) => {
    return Array(count).fill(null).map(() => ({
      name: generateRandomUser(),
      isRegular: false
    }));
  };

  // Regular competitors (small pool that's always included)
  const regularCompetitors = [
    { name: 'DailyGrinder', isRegular: true },
    { name: 'StatShark', isRegular: true },
    { name: 'BaseballGuru', isRegular: true },
    { name: 'MoneyMaker', isRegular: true },
    { name: 'ProPlayer', isRegular: true }
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
            const points = calculateFantasyPoints(player);
            const salary = generateSalary(points, player.POS);

            return {
              ...player,
              '1B': singles,
              points,
              salary
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

  const generateSalary = (points, position) => {
    const positionMultiplier = {
      'P': 1.4,
      'C': 1.2,
      'SS': 1.15,
      'OF': 0.9
    }[position] || 1;

    const baseSalary = points * 100 * positionMultiplier;
    const randomizedSalary = baseSalary * (0.8 + Math.random() * 0.4);
    return Math.max(MIN_SALARY, Math.round(randomizedSalary));
  };

  const validateRoster = (roster) => {
    const positionCounts = roster.reduce((counts, player) => {
      const pos = player.POS;
      counts[pos] = (counts[pos] || 0) + 1;
      return counts;
    }, {});

    // Check each position requirement except UTIL
    for (const [pos, required] of Object.entries(ROSTER_REQUIREMENTS)) {
      if (pos === 'UTIL') continue;
      if ((positionCounts[pos] || 0) < required) {
        return `Need ${required} ${pos} player${required > 1 ? 's' : ''}. Have ${positionCounts[pos] || 0}`;
      }
    }

    // Validate total roster size accounts for UTIL
    const requiredTotal = Object.values(ROSTER_REQUIREMENTS).reduce((a, b) => a + b, 0);
    if (roster.length < requiredTotal) {
      return `Need ${requiredTotal} total players (including 1 UTIL)`;
    }

    return null;
  };

  const addToRoster = (player) => {
    if (userRoster.length >= 10) {
      setError('Roster is full (10 players maximum)');
      return;
    }

    const newSalary = currentSalary + player.salary;
    if (newSalary > SALARY_CAP) {
      setError(`Cannot add ${player.Name} - would exceed salary cap by $${(newSalary - SALARY_CAP).toLocaleString()}`);
      return;
    }

    const positionError = validateRoster([...userRoster, player]);
    if (positionError) {
      setError(positionError);
      return;
    }

    const updatedRoster = [...userRoster, player];
    setUserRoster(updatedRoster);
    setCurrentSalary(newSalary);
    updateScore(updatedRoster);
  };

  const removeFromRoster = (playerIndex) => {
    const updatedRoster = userRoster.filter((_, index) => index !== playerIndex);
    const newSalary = updatedRoster.reduce((total, player) => total + player.salary, 0);
    setUserRoster(updatedRoster);
    setCurrentSalary(newSalary);
    updateScore(updatedRoster);
  };

  const updateScore = (roster) => {
    const score = roster.reduce((total, player) => total + player.points, 0);
    setCurrentScore(score);
  };

  const generateAiTeam = (competitor) => {
    const strategy = {
      powerFocus: Math.random(),
      contactFocus: Math.random(),
      pitchingFocus: Math.random(),
      stackingPreference: Math.random() > 0.7,
      valueHunting: Math.random() > 0.5,
      riskTolerance: Math.random()
    };

    let roster = [];
    let totalSalary = 0;
    let availablePool = [...availablePlayers];

    const evaluatePlayer = (player) => {
      let value = player.points;
      
      if (player.POS?.includes('P')) {
        value *= (1 + strategy.pitchingFocus);
      } else {
        value *= (1 + (player.HR || 0) * strategy.powerFocus);
        value *= (1 + (player.AVG || 0) * strategy.contactFocus);
      }

      if (strategy.valueHunting) {
        value = value / player.salary;
      }

      value *= (1 - strategy.riskTolerance/2 + Math.random() * strategy.riskTolerance);

      return value;
    };

    // Fill required positions
    for (const [pos, count] of Object.entries(ROSTER_REQUIREMENTS)) {
      if (pos === 'UTIL') continue; // Handle UTIL separately

      const positionPlayers = availablePool
        .filter(p => p.POS?.includes(pos))
        .filter(p => p.salary <= SALARY_CAP - totalSalary)
        .sort((a, b) => evaluatePlayer(b) - evaluatePlayer(a));

      for (let i = 0; i < count && i < positionPlayers.length; i++) {
        const player = positionPlayers[i];
        roster.push(player);
        totalSalary += player.salary;
        availablePool = availablePool.filter(p => p !== player);
      }
    }

    // Add UTIL player
    const utilPlayers = availablePool
      .filter(p => !p.POS?.includes('P'))
      .filter(p => p.salary <= SALARY_CAP - totalSalary)
      .sort((a, b) => evaluatePlayer(b) - evaluatePlayer(a));

    if (utilPlayers.length > 0) {
      roster.push(utilPlayers[0]);
      totalSalary += utilPlayers[0].salary;
    }

    const totalPoints = roster.reduce((sum, player) => sum + player.points, 0);
    let adjustedPoints = totalPoints;

    if (difficulty === 'hard') {
      adjustedPoints *= 1.1;
    } else if (difficulty === 'easy') {
      adjustedPoints *= 0.9;
    }

    return {
      name: competitor.name,
      score: adjustedPoints,
      roster: roster,
      salary: totalSalary,
      remainingSalary: SALARY_CAP - totalSalary
    };
  };

  const lockGame = () => {
    if (userRoster.length !== 10) {
      setError('Must have exactly 10 players (including UTIL) to lock lineup');
      return;
    }

    const positionError = validateRoster(userRoster);
    if (positionError) {
      setError(positionError);
      return;
    }

    // Generate AI teams
    const competitors = [
      ...regularCompetitors.slice(0, 5),
      ...generateCompetitorPool(15)
    ].sort(() => Math.random() - 0.5).slice(0, 15);

    const aiResults = competitors.map(competitor => generateAiTeam(competitor));
    
    // Add user to results
    const allResults = [
      { name: 'You', score: currentScore, roster: userRoster, salary: currentSalary },
      ...aiResults
    ].sort((a, b) => b.score - a.score);

    setAiTeams(allResults);
    setWinner(allResults[0]);
    setGameLocked(true);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-4">
        Weekly DFS Challenge
      </h2>

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

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Salary Cap: ${SALARY_CAP.toLocaleString()}
          </label>
          <div className="text-lg font-medium">
            Remaining: ${(SALARY_CAP - currentSalary).toLocaleString()}
          </div>
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
                  <th className="p-2 text-right">Salary</th>
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
                      <td className="p-2 text-right">${player.salary?.toLocaleString()}</td>
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
            <p className="text-sm text-gray-600">
              Total Salary: ${currentSalary.toLocaleString()}
            </p>
          </div>
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-2 text-left">Name</th>
                <th className="p-2 text-left">POS</th>
                <th className="p-2 text-right">Salary</th>
                <th className="p-2 text-right">Points</th>
                <th className="p-2 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {userRoster.map((player, idx) => (
                <tr key={idx} className="border-t">
                  <td className="p-2">{player.Name}</td>
                  <td className="p-2">{player.POS}</td>
                  <td className="p-2 text-right">${player.salary?.toLocaleString()}</td>
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
            disabled={gameLocked || userRoster.length !== 10}
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
                <th className="p-2 text-left">Rank</th>
                <th className="p-2 text-left">User</th>
                <th className="p-2 text-right">Score</th>
              </tr>
            </thead>
            <tbody>
              {aiTeams.map((team, idx) => (
                <tr key={idx} className={`border-t ${team.name === 'You' ? 'bg-blue-50' : ''}`}>
                  <td className="p-2">{idx + 1}</td>
                  <td className="p-2">{team.name}</td>
                  <td className="p-2 text-right">{team.score.toFixed(1)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Winner Display */}
      {winner && (
        <div className="bg-green-50 p-4 rounded-lg mt-4">
          <h3 className="text-lg font-bold">🏆 Winning Lineup - {winner.name}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
            {winner.roster.map((player, idx) => (
              <div key={idx} className="flex justify-between">
                <span>{player.Name} ({player.POS})</span>
                <span>${player.salary?.toLocaleString()}</span>
              </div>
            ))}
          </div>
          <div className="mt-2 text-right">
            <span className="font-bold">Total Score: {winner.score.toFixed(1)}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default DFSAI;

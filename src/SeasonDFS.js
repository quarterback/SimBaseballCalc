import React, { useState } from 'react';
import Papa from 'papaparse';

const SeasonDFS = () => {
  // Original DFS states
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
  const [positionFilter, setPositionFilter] = useState('ALL');

  // Season-specific states
  const [seasonWeek, setSeasonWeek] = useState(1);
  const [seasonPoints, setSeasonPoints] = useState(0);
  const [seasonHistory, setSeasonHistory] = useState([]);
  const [streaks, setStreaks] = useState({
    userStreak: 0,
    weeklyRanks: []
  });

  // Constants
  const SALARY_CAP = 50000;
  const MIN_SALARY = 3000;
  const POSITIONS = ['ALL', 'SP', 'CL', 'RP', 'C', '1B', '2B', '3B', 'SS', 'LF', 'CF', 'RF'];

  const ROSTER_REQUIREMENTS = {
    'SP': { min: 1, max: 2 },
    'CL': { min: 0, max: 1 },  // Allow 0-1 closers
    'RP': { min: 1, max: 2 },
    'C': { min: 1, max: 1 },
    '1B': { min: 1, max: 1 },
    '2B': { min: 1, max: 1 },
    '3B': { min: 1, max: 1 },
    'SS': { min: 1, max: 1 },
    'LF': { min: 1, max: 1 },
    'CF': { min: 1, max: 1 },
    'RF': { min: 1, max: 1 },
    'UTIL': { min: 0, max: 1 }
};

  // Username generation for AI opponents
  const generateRandomUser = () => {
    const prefixes = [
      'DFS', 'Fantasy', 'Ball', 'Base', 'Diamond', 'Stats', 'Money', 'Pro', 'Grinder', 'Daily',
      'MLB', 'Pitcher', 'Slugger', 'Hitter', 'Closer', 'Ace', 'Heater', 'Knuckle', 'Curveball', 
      'LaunchAngle', 'ExitVelo', 'xStats', 'WARlord', 'Sabermetric', 'BigFly', 'Moonshot', 
      'Roto', 'CashGame', 'Steals', 'OBP', 'OPS', 'Barrels', 'NoHitter', 'PowerBat', 'GPP', 
      'SpinRate', 'OutfieldCannon', 'DingerDealer', 'WalkOff', 'CyYoung', 'MVP', 'GoldGlove'
    ];

    const suffixes = [
      'King', 'Queen', 'Champ', 'Master', 'Guru', 'Wizard', 'Beast', 'Expert', 'Boss', 'Shark', 
      'Warrior', 'Destroyer', 'Legend', 'Savage', 'Clutch', 'GOAT', 'Cannon', 'Swingman', 'Whiff', 
      'Slugger', 'Killer', 'Dinger', 'Velocity', 'Cleanup', 'HotStreak', 'Stealer', 'RBI', 'Boomer', 
      'Splitter', 'Heater', 'Cutter', 'Sinker', 'Slurve', 'Perfecto', 'ClutchHit', 'TripleCrown', 
      'LaunchPad', 'HOF', 'Fastball', 'OverTheFence', 'WarningTrack', 'Lumberjack'
    ];

    const symbols = ['_', '', '.', '-', '#'];
    
    return `${prefixes[Math.floor(Math.random() * prefixes.length)]}${symbols[Math.floor(Math.random() * symbols.length)]}${suffixes[Math.floor(Math.random() * suffixes.length)]}${Math.floor(Math.random() * 999).toString().padStart(2, '0')}`;
  };

  const generateCompetitorPool = (count = 20) => {
    return Array(count).fill(null).map(() => ({
      name: generateRandomUser(),
      isRegular: false
    }));
  };

  const regularCompetitors = [
    { 
      name: 'NikkiKnuckles',
      isRegular: true,
      strategy: {
        powerFocus: 0.7,
        contactFocus: 0.4,
        pitchingFocus: 0.8,
        riskTolerance: 0.6,
        valueHunting: true
      }
    },
    { 
      name: 'MarioTheBarber',
      isRegular: true,
      strategy: {
        powerFocus: 0.3,
        contactFocus: 0.9,
        pitchingFocus: 0.6,
        riskTolerance: 0.4,
        valueHunting: false
      }
    },
    { 
      name: 'LahdeeenLegend',
      isRegular: true,
      strategy: {
        powerFocus: 0.9,
        contactFocus: 0.3,
        pitchingFocus: 0.5,
        riskTolerance: 0.8,
        valueHunting: true
      }
    },
    { 
      name: 'DionGiantsBucs',
      isRegular: true,
      strategy: {
        powerFocus: 0.6,
        contactFocus: 0.6,
        pitchingFocus: 0.7,
        riskTolerance: 0.5,
        valueHunting: true
      }
    },
    { 
      name: 'xWARlord420',
      isRegular: true,
      strategy: {
        powerFocus: 0.8,
        contactFocus: 0.5,
        pitchingFocus: 0.4,
        riskTolerance: 0.7,
        valueHunting: false
      }
    },
    {
      name: 'ChaosTheory',
      isRegular: true,
      strategy: {
        powerFocus: () => Math.random() * 2,
        contactFocus: () => Math.random() * 2,
        pitchingFocus: () => Math.random() * 2,
        riskTolerance: 1.0,
        valueHunting: () => Math.random() > 0.5,
        stackingPreference: () => Math.random() > 0.3,
        maxSalaryPerPlayer: () => 3000 + Math.random() * 47000,
        favorPosition: () => {
          const positions = ['SP', 'RP', 'C', '1B', '2B', '3B', 'SS', 'OF'];
          return positions[Math.floor(Math.random() * positions.length)];
        },
        willingToOverpay: () => Math.random() > 0.7
      }
    }
  ];

  const calculateWeeklyBonuses = (rank, score) => {
    let bonus = 0;
    
    if (rank === 1) bonus += 1000;
    else if (rank <= 3) bonus += 500;
    else if (rank <= 10) bonus += 250;
    
    if (streaks.userStreak >= 3) bonus *= 1.1;
    if (streaks.userStreak >= 5) bonus *= 1.25;
    
    return bonus;
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
              const singles = (player.H || 0) - ((player['2B'] || 0) + (player['3B'] || 0) + (player.HR || 0));
              const points = calculateFantasyPoints(player);
              return { ...player, '1B': singles, points };
            });
            
            // Apply salary scaling to prevent busting the salary cap
            const playersWithSalaries = generateSalary(processedPlayers);
            setAvailablePlayers(playersWithSalaries);
          
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

  let totalPoints = 0;
  
  for (const [stat, points] of Object.entries(scoring)) {
    const value = parseFloat(player[stat]) || 0; // Ensure valid number
    totalPoints += value * points;
  }

  return isNaN(totalPoints) ? 0 : totalPoints; // Prevent NaN
};
  
const generateSalary = (players) => {
  const positionMultipliers = {
    'SP': 1.4,
    'CL': 1.35,
    'RP': 1.05,
    'C': 1.2,
    '1B': 1.1,
    '2B': 1.2,
    '3B': 1.2,
    'SS': 1.2,
    'LF': 0.9,
    'CF': 1.0,
    'RF': 0.9
  };

  let totalSalary = 0;
  let scaledSalaries = players.map(player => {
    const multiplier = positionMultipliers[player.POS] || 1;
    let baseSalary = player.points * 100 * multiplier;
    let salary = Math.max(MIN_SALARY, Math.round(baseSalary));
    totalSalary += salary;
    return { ...player, salary };
  });

  // If total salaries exceed SALARY_CAP, scale down
  if (totalSalary > SALARY_CAP * players.length) {
    const scaleFactor = (SALARY_CAP * players.length) / totalSalary;
    scaledSalaries = scaledSalaries.map(player => ({
      ...player,
      salary: Math.max(MIN_SALARY, Math.round(player.salary * scaleFactor))
    }));
  }

  return scaledSalaries;
};



const validateRoster = (roster) => {
  const positionCounts = roster.reduce((counts, player) => {
    const pos = player.POS;
    counts[pos] = (counts[pos] || 0) + 1;
    return counts;
  }, {});

  const totalPitchers = (positionCounts['SP'] || 0) + (positionCounts['RP'] || 0);
  if (totalPitchers < 2) {
    return `Need 2 pitchers (SP/RP). Currently have ${totalPitchers}`;
  }

  for (const [pos, requirement] of Object.entries(ROSTER_REQUIREMENTS)) {
    if (pos === 'UTIL') {
      // UTIL can be any non-pitcher position
      const nonPitchers = roster.filter(p => !['SP', 'RP', 'CL'].includes(p.POS));
      if (nonPitchers.length < 1) {
        return `UTIL must be filled with a non-pitcher`;
      }
      continue;
    }

    const count = positionCounts[pos] || 0;
    if (count < requirement.min) {
      return `Need at least ${requirement.min} ${pos} player${requirement.min > 1 ? 's' : ''}. Have ${count}`;
    }
    if (count > requirement.max) {
      return `Maximum ${requirement.max} ${pos} players allowed. Have ${count}`;
    }
  }

  return null;
};

  const addToRoster = (player) => {
    if (userRoster.length >= 11) {
      setError('Roster is full (11 players maximum)');
      return;
    }

    const newSalary = currentSalary + player.salary;
    if (newSalary > SALARY_CAP) {
      setError(`Cannot add ${player.Name} - would exceed salary cap by $${(newSalary - SALARY_CAP).toLocaleString()}`);
      return;
    }

    const updatedRoster = [...userRoster, player];
    const positionCounts = updatedRoster.reduce((counts, p) => {
      const pos = p.POS;
      counts[pos] = (counts[pos] || 0) + 1;
      return counts;
    }, {});

    const requirement = ROSTER_REQUIREMENTS[player.POS];
    if (requirement && positionCounts[player.POS] > requirement.max) {
      setError(`Maximum ${requirement.max} ${player.POS} players allowed`);
      return;
    }

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
    const strategy = competitor.strategy || {
      powerFocus: Math.random(),
      contactFocus: Math.random(),
      pitchingFocus: Math.random(),
      stackingPreference: Math.random() > 0.7,
      valueHunting: Math.random() > 0.5,
      riskTolerance: Math.random()
    };

    const evaluatePlayer = (player) => {
      let value = player.points;
      
      const getStrategyValue = (strategyProp) => {
        return typeof strategyProp === 'function' ? strategyProp() : strategyProp;
      };
      
      if (player.POS?.includes('SP') || player.POS?.includes('RP')) {
        value *= (1 + getStrategyValue(strategy.pitchingFocus));
      } else {
        value *= (1 + (player.HR || 0) * getStrategyValue(strategy.powerFocus));
        value *= (1 + (player.AVG || 0) * getStrategyValue(strategy.contactFocus));
      }

      if (strategy.favorPosition && getStrategyValue(strategy.favorPosition) === player.POS) {
        value *= 1.5;
      }

      if (strategy.willingToOverpay && getStrategyValue(strategy.willingToOverpay)) {
        value *= 1 + Math.random();
      }

      if (getStrategyValue(strategy.valueHunting)) {
        value = value / player.salary;
      }

      const riskTolerance = getStrategyValue(strategy.riskTolerance);
      value *= (1 - riskTolerance/2 + Math.random() * riskTolerance);

      return value;
    };

    let roster = [];
    let totalSalary = 0;
    let availablePool = [...availablePlayers];

    // Fill required positions
    for (const [pos, requirement] of Object.entries(ROSTER_REQUIREMENTS)) {
      if (pos === 'UTIL') continue;

      const count = requirement.min;
      const positionPlayers = availablePool
        .filter(p => p.POS === pos)
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
      .filter(p => !p.POS?.includes('SP') && !p.POS?.includes('RP'))
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
    if (userRoster.length !== 11) {
      setError('Must have exactly 11 players (including UTIL) to lock lineup');
      return;
    }

    const positionError = validateRoster(userRoster);
    if (positionError) {
      setError(positionError);
      return;
    }

    const competitors = [
      ...regularCompetitors,
      ...generateCompetitorPool(15 - regularCompetitors.length)
    ].sort(() => Math.random() - 0.5).slice(0, 15);

    const aiResults = competitors.map(competitor => generateAiTeam(competitor));

    const allResults = [
      { name: 'You', score: currentScore, roster: userRoster, salary: currentSalary },
      ...aiResults
    ].sort((a, b) => b.score - a.score);

    const userRank = allResults.findIndex(result => result.name === 'You') + 1;

    const weekResult = {
      week: seasonWeek,
      score: currentScore,
      rank: userRank,
      earnings: calculateWeeklyBonuses(userRank, currentScore)
    };

    setSeasonHistory(prev => [...prev, weekResult]);

    setStreaks(prev => ({
      userStreak: userRank <= 3 ? prev.userStreak + 1 : 0,
      weeklyRanks: [...prev.weeklyRanks, userRank]
    }));

    setSeasonPoints(prev => prev + currentScore);
    setAiTeams(allResults);
    setWinner(allResults[0]);
    setGameLocked(true);
  };

  const advanceWeek = () => {
    setUserRoster([]);
    setCurrentSalary(0);
    setCurrentScore(0);
    setGameLocked(false);
    setSeasonWeek(prev => prev + 1);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-4">
        Season-Long DFS Challenge
      </h2>

      {/* Season Dashboard */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <h3 className="text-lg font-semibold">Season Progress</h3>
            <p>Week {seasonWeek} of 26</p>
            <p>Season Points: {seasonPoints}</p>
            <p>Current Streak: {streaks.userStreak}</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold">Weekly Budget</h3>
            <p>Base: ${SALARY_CAP.toLocaleString()}</p>
            <p>Bonus: ${(seasonWeek * 5000).toLocaleString()}</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold">Season Stats</h3>
            <p>Best Finish: {streaks.weeklyRanks.length > 0 ? Math.min(...streaks.weeklyRanks) : '-'}</p>
            <p>Avg Finish: {streaks.weeklyRanks.length > 0 ? 
              (streaks.weeklyRanks.reduce((a,b) => a+b, 0) / streaks.weeklyRanks.length).toFixed(1) : '-'}</p>
          </div>
        </div>
      </div>

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

<div className="flex gap-4 mb-4">
        <input
          type="text"
          placeholder="Search players..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full p-2 border rounded-lg"
          disabled={gameLocked}
        />
        <select
          value={positionFilter}
          onChange={(e) => setPositionFilter(e.target.value)}
          className="p-2 border rounded-lg min-w-[100px]"
          disabled={gameLocked}
        >
          <option value="ALL">All</option>
          <option value="WAR">WAR Leaders</option>
          <option value="SALARY">Highest Salary</option>
          {POSITIONS.map(pos => (
            <option key={pos} value={pos}>
              {pos}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Available Players */}
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-semibold mb-4">Available Players</h3>
          <div className="h-96 overflow-y-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="p-2 text-left">Name</th>
                  <th className="p-2 text-left">POS</th>
                  <th className="p-2 text-right">WAR</th>
                  <th className="p-2 text-right">Salary</th>
                  <th className="p-2 text-right">Points</th>
                  <th className="p-2 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {availablePlayers
                  .filter(player => {
                    const matchesSearch = 
                      player.Name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      player.POS?.toLowerCase().includes(searchQuery.toLowerCase());
                    
                    if (positionFilter === 'WAR') {
                      return parseFloat(player.WAR || 0) > 2.0;
                    } else if (positionFilter === 'SALARY') {
                      return player.salary > 8000;
                    } else {
                      return matchesSearch && (positionFilter === 'ALL' || player.POS === positionFilter);
                    }
                  })
                  .sort((a, b) => {
                    if (positionFilter === 'WAR') {
                      return parseFloat(b.WAR || 0) - parseFloat(a.WAR || 0);
                    } else if (positionFilter === 'SALARY') {
                      return b.salary - a.salary;
                    }
                    return 0;
                  })
                  .map((player, idx) => (
                    <tr key={idx} className="border-t">
                      <td className="p-2">{player.Name}</td>
                      <td className="p-2">{player.POS}</td>
                      <td className="p-2 text-right">{player.WAR?.toFixed(1) || '0.0'}</td>
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
                  <td className="p-2 text-right">${isNaN(player.salary) ? MIN_SALARY.toLocaleString() : player.salary.toLocaleString()}</td>
                  <td className="p-2 text-right">{player.points?.toFixed(1)}</td>
                  <td className="p-2 text-right">
                    <button
                      onClick={() => removeFromRoster(idx)}
                      disabled={gameLocked}
                      className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50">
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
{gameLocked && (
        <button
          onClick={advanceWeek}
          className="mt-4 w-full bg-purple-500 text-white p-2 rounded hover:bg-purple-600"
        >
          Advance to Week {seasonWeek + 1}
        </button>
      )}

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

      {/* Season History */}
      {seasonHistory.length > 0 && (
        <div className="bg-white rounded-lg shadow p-4 mt-6">
          <h3 className="text-xl font-bold mb-4">Season History</h3>
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-2 text-left">Week</th>
                <th className="p-2 text-right">Score</th>
                <th className="p-2 text-right">Rank</th>
                <th className="p-2 text-right">Earnings</th>
              </tr>
            </thead>
            <tbody>
              {seasonHistory.map((week, idx) => (
                <tr key={idx} className="border-t">
                  <td className="p-2">{week.week}</td>
                  <td className="p-2 text-right">{week.score.toFixed(1)}</td>
                  <td className="p-2 text-right">{week.rank}</td>
                  <td className="p-2 text-right">${week.earnings.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default SeasonDFS;

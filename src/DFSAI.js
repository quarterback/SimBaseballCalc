import React, { useState } from 'react';
import Papa from 'papaparse';

const DFSAI = () => {
  // State declarations
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


  // Constants
  const SALARY_CAP = 50000;
  const MIN_SALARY = 3000;
  const symbols = ['_', '', '.'];
  const numbers = () => Math.floor(Math.random() * 999).toString().padStart(2, '0');
  const POSITIONS = ['ALL', 'SP', 'RP', 'C', '1B', '2B', '3B', 'SS', 'LF', 'CF', 'RF'];

  const ROSTER_REQUIREMENTS = {
    'SP': { min: 1, max: 2 },
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

    const middleParts = [
        '42', '27', '99', '360', 'xBA', '95MPH', 'ExitVelo', 'Barrels', 'LaunchAngle', '125Power', 
        'StealKing', 'WalkRate', 'WhiffRate', 'KRate', 'DoublePlay', 'GoldGlove', 'WAR', 'OBP900', 
        'OPSplus', 'BABIP', '260ISO', '345wOBA', 'SpinRate4500', 'MoundMaster', 'Fireballer', 'Slugging'
    ];

    const symbols = ['_', '', '.', '-', '#'];

    // Constructing a username with more variation
    return `${prefixes[Math.floor(Math.random() * prefixes.length)]}${symbols[Math.floor(Math.random() * symbols.length)]}${middleParts[Math.floor(Math.random() * middleParts.length)]}${symbols[Math.floor(Math.random() * symbols.length)]}${suffixes[Math.floor(Math.random() * suffixes.length)]}${Math.floor(Math.random() * 999).toString().padStart(2, '0')}`;
};

const generateCompetitorPool = (count = 50) => {
    return Array(count).fill(null).map(() => ({
        name: generateRandomUser(),
        isRegular: false
    }));
};

  const regularCompetitors = [
    { name: 'PaperboyMario', isRegular: true },
    { name: 'RamzavailDuo', isRegular: true },
    { name: 'BostonRed4423', isRegular: true },
    { name: 'DominoMatteo', isRegular: true },
    { name: 'BobbyWhite39', isRegular: true },
    { name: 'BarberIsHere', isRegular: true },
    { name: 'Generik2U23', isRegular: true },
    { name: 'TimexTommi', isRegular: true },
    { name: 'SkyDawg', isRegular: true }
  ];

  // File processing and stat calculations
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

// Replace the existing calculateFantasyPoints function in DFSAI.js with:

const calculateFantasyPoints = (player) => {
  const isPitcher = player.POS?.includes('P');
  
  // Base scoring system
  const baseScoring = {
    // Hitting
    '1B': 3,
    '2B': 5,
    '3B': 8,
    'HR': 10,
    'R': 2,
    'RBI': 2,
    'BB': 2,
    'SB': 5,
    'CS': -2,
    'HBP': 2,
    
    // Pitching
    'IP': 3,
    'K': 2,
    'BB': -2,
    'H': -1,
    'ER': -3
  };

  // Calculate base points
  let points = Object.entries(baseScoring).reduce((total, [stat, value]) => {
    return total + (player[stat] || 0) * value;
  }, 0);

  // Add performance bonuses
  if (isPitcher) {
    // Dominant pitching performance bonuses
    if (player.IP >= 9) {
      if (player.H === 0 && player.BB === 0 && player.HBP === 0) {
        points += 50;  // Perfect game bonus
      } else if (player.H === 0) {
        points += 40;  // No-hitter bonus
      } else if (player.ER === 0) {
        points += 25;  // Shutout bonus
      }
    } else if (player.IP >= 7 && player.H === 0) {
      points += 25;  // 7+ no-hit innings
    }

    // K/9 bonus
    const kRate = player.K / player.IP;
    if (kRate >= 2.0) points += 15;
    else if (kRate >= 1.5) points += 10;
    else if (kRate >= 1.0) points += 5;

    // WHIP bonus
    const whip = (player.H + player.BB) / player.IP;
    if (whip <= 0.5) points += 20;
    else if (whip <= 0.8) points += 15;
    else if (whip <= 1.0) points += 10;
  } else {
    // Hitting performance bonuses
    if (player.HR >= 2) {
      points += (player.HR - 1) * 15;  // Multi-homer bonus
    }

    if (player.AB >= 3 && player.H >= 3 && player.AB === player.H) {
      points += 25;  // Perfect day bonus
    }

    if (player.SB >= 2 || player['3B'] >= 1) {
      points += 10;  // Speed bonus
    }

    // ISO bonus (if AB > 0)
    if (player.AB > 0) {
      const iso = (player['2B'] + player['3B'] * 2 + player.HR * 3) / player.AB;
      if (iso >= 0.250) points += 12;
      else if (iso >= 0.200) points += 8;
      else if (iso >= 0.150) points += 4;
    }
  }

  return points;
};

// The rest of DFSAI.js remains the same

  const generateSalary = (points, position) => {
    const positionMultiplier = {
      'SP': 1.4,
      'RP': 1.3,
      'C': 1.2,
      'SS': 1.15,
      'LF': 0.9,
      'CF': 0.9, 
      'RF': 0.9
    }[position] || 1;

    const baseSalary = points * 100 * positionMultiplier;
    const randomizedSalary = baseSalary * (0.8 + Math.random() * 0.4);
    return Math.max(MIN_SALARY, Math.round(randomizedSalary));
  };

  // Roster management
  const validateRoster = (roster) => {
    const positionCounts = roster.reduce((counts, player) => {
      const pos = player.POS;
      counts[pos] = (counts[pos] || 0) + 1;
      return counts;
    }, {});

    // Check if we have enough pitchers total (SP + RP)
    const totalPitchers = (positionCounts['SP'] || 0) + (positionCounts['RP'] || 0);
    if (totalPitchers < 2) {
      return `Need 2 pitchers (SP/RP). Currently have ${totalPitchers}`;
    }

    // Check each position's min/max requirements
    for (const [pos, requirement] of Object.entries(ROSTER_REQUIREMENTS)) {
      if (pos === 'UTIL') continue;
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
    if (userRoster.length >= 10) {
      setError('Roster is full (10 players maximum)');
      return;
    }

    const newSalary = currentSalary + player.salary;
    if (newSalary > SALARY_CAP) {
      setError(`Cannot add ${player.Name} - would exceed salary cap by $${(newSalary - SALARY_CAP).toLocaleString()}`);
      return;
    }

    // Check if adding this player would exceed position limits
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

  // AI team generation
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
      
      if (player.POS?.includes('SP') || player.POS?.includes('RP')) {
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
  .filter(player => {
    const matchesSearch = 
      player.Name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      player.POS?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPosition = positionFilter === 'ALL' || player.POS === positionFilter;
    return matchesSearch && matchesPosition;
  })
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

// ✅ The very last line:
export default DFSAI;

import React, { useState } from 'react';
import Papa from 'papaparse';

const DFSAI = () => {
  const [availablePlayers, setAvailablePlayers] = useState([]);
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

  // AI Personalities & Strategies
  const aiPersonalities = [
    { name: 'KateParkfactor', strategy: 'venueAnalytics' },
    { name: 'xWOBA_Warrior', strategy: 'advancedStats' },
    { name: 'Sarah_Numbers', strategy: 'probabilityBased' },
    { name: 'TomTheStacker', strategy: 'stackLineups' },
    { name: 'AceHunter_Mike', strategy: 'elitePitcher' },
    { name: 'ValueJohn_DFS', strategy: 'valueHunting' },
    { name: 'CindyContact', strategy: 'highFloor' },
    { name: 'Dave_LaunchAngle', strategy: 'powerUpside' },
    { name: 'RobertsonK9', strategy: 'strikeoutHeavy' },
    { name: 'JenStreakSpotter', strategy: 'hotHands' },
    { name: 'WeatherWatcherAl', strategy: 'weatherBased' },
    { name: 'MariaMatchups', strategy: 'matchupBased' },
    { name: 'FadeTheChalk_Sam', strategy: 'contrarian' },
    { name: 'LowOwned_Lisa', strategy: 'lowOwnership' },
    { name: 'ReversePublic', strategy: 'antiConsensus' },
    { name: 'BallparkBetty', strategy: 'homeTeamStack' },
    { name: 'SpeedsterSteve', strategy: 'baserunning' },
    { name: 'DefensiveDiana', strategy: 'runPrevention' },
    { name: 'FavoriteTeamFred', strategy: 'biased' },
    { name: 'DartThrowDan', strategy: 'random' },
    { name: 'GutFeelGrace', strategy: 'emotional' },
    { name: 'YesterdayHero', strategy: 'chasePast' },
    { name: 'TiltedTony', strategy: 'tiltChasing' },
    { name: 'FOMO_Frank', strategy: 'fomo' }
  ];

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
            console.error('CSV Parse Errors:', results.errors);
            setError('Error parsing CSV file.');
            setLoadingStats(false);
            return;
          }

          if (!results.data || results.data.length === 0) {
            setError('CSV file is empty or incorrectly formatted.');
            setLoadingStats(false);
            return;
          }

          // Ensure required columns exist
          const requiredColumns = ['Name', 'TM', 'POS', 'AB', 'H', '1B', '2B', '3B', 'HR', 'R', 'RBI', 'BB', 'SB', 'CS', 'HP', 'IP', 'K', 'HA', 'W', 'ER', 'BB', 'HP', 'CG'];
          const fileColumns = Object.keys(results.data[0]);

          const missingColumns = requiredColumns.filter(col => !fileColumns.includes(col));
          if (missingColumns.length > 0) {
            setError(`Missing required columns: ${missingColumns.join(', ')}`);
            setLoadingStats(false);
            return;
          }

          const processedPlayers = results.data.map(player => ({
            Name: player.Name,
            TM: player.TM,
            POS: player.POS,
            AB: player.AB || 0,
            H: player.H || 0,
            '1B': (player.H || 0) - ((player['2B'] || 0) + (player['3B'] || 0) + (player.HR || 0)),
            '2B': player['2B'] || 0,
            '3B': player['3B'] || 0,
            HR: player.HR || 0,
            R: player.R || 0,
            RBI: player.RBI || 0,
            BB: player.BB || 0,
            SB: player.SB || 0,
            CS: player.CS || 0,
            HP: player.HP || 0,
            IP: player.IP || 0,
            K: player.K || 0,
            HA: player.HA || 0,
            W: player.W || 0,
            ER: player.ER || 0,
            HP: player.HP || 0,
            CG: player.CG || 0,
            points: calculatePoints(player)
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

  const generateAiTeams = () => {
    if (availablePlayers.length === 0) {
      setError('No player data available.');
      return;
    }

    let teams = aiPersonalities.map(personality => {
      let selectedPlayers = [...availablePlayers]
        .sort(() => Math.random() - 0.5)
        .slice(0, 9);

      let totalPoints = selectedPlayers.reduce((sum, player) => sum + calculatePoints(player), 0);

      return { name: personality.name, score: totalPoints, roster: selectedPlayers };
    });

    if (difficulty === 'hard') {
      teams.forEach(team => (team.score *= 1.1));
    } else if (difficulty === 'easy') {
      teams.forEach(team => (team.score *= 0.9));
    }

    setAiTeams(teams);
  };

  const lockGame = () => {
    if (roster.length === 0) {
      setError('Select players before locking the game.');
      return;
    }

    setGameLocked(true);
    generateAiTeams();
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

      {/* Lock Lineup & Generate AI Teams */}
      <button
        onClick={lockGame}
        disabled={gameLocked || availablePlayers.length === 0}
        className="bg-blue-500 text-white p-2 rounded mt-2"
      >
        Lock Lineup & Generate AI Teams
      </button>

      {/* Leaderboard */}
      {gameLocked && (
        <div>
          <h3 className="text-xl font-bold mt-4">Leaderboard</h3>
          <table className="table-auto w-full border">
            <thead>
              <tr>
                <th>User/AI</th>
                <th>Score</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>You</td>
                <td>{currentScore.toFixed(1)}</td>
              </tr>
              {aiTeams.map((team, idx) => (
                <tr key={idx}>
                  <td>{team.name}</td>
                  <td>{team.score.toFixed(1)}</td>
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

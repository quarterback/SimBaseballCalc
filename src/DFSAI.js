import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';

const DFSAI = () => {
  const [roster, setRoster] = useState([]);
  const [availablePlayers, setAvailablePlayers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [personalBests, setPersonalBests] = useState({});
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
      hitting: { '1B': 3, '2B': 5, '3B': 8, 'HR': 10, 'R': 2, 'RBI': 2, 'BB': 2, 'SB': 5, 'CS': -2, 'HBP': 2 },
      pitching: { 'IP': 2.25, 'K': 2, 'W': 4, 'ER': -2, 'H': -0.6, 'BB': -0.6, 'HBP': -0.6, 'CG': 2.5 }
    }
  };

  const aiPersonalities = [
    { name: 'BigBankHank', strategy: 'highVariance' },
    { name: 'StackKing88', strategy: 'stackTeams' },
    { name: 'RotoWiz', strategy: 'balanced' },
    { name: 'BuntQueen', strategy: 'contactHitter' },
    { name: 'CheeseThrow', strategy: 'strikeoutPitcher' },
    { name: 'DingersOnly', strategy: 'powerHitter' },
    { name: 'SabermetricSue', strategy: 'advancedStats' },
    { name: 'The Gambler', strategy: 'random' },
    { name: 'StatCruncherX', strategy: 'optimal' },
    { name: 'BoomBustBob', strategy: 'hotStreaks' }
  ];

  const generateAiTeams = () => {
    let teams = aiPersonalities.map(personality => {
      let selectedPlayers = availablePlayers.sort(() => 0.5 - Math.random()).slice(0, 9);
      let totalPoints = selectedPlayers.reduce((sum, player) => sum + calculatePoints(player), 0);
      return { name: personality.name, score: totalPoints, roster: selectedPlayers };
    });

    if (difficulty === 'hard') {
      teams.forEach(team => team.score *= 1.1); // Slight boost to AI scores
    } else if (difficulty === 'easy') {
      teams.forEach(team => team.score *= 0.9); // Slight reduction in AI scores
    }
    
    setAiTeams(teams);
  };

  const calculatePoints = (player) => {
    const scoring = scoringSystems[scoringSystem][statType];
    return Object.entries(scoring).reduce((total, [stat, value]) => total + (player[stat] || 0) * value, 0);
  };

  const lockGame = () => {
    setGameLocked(true);
    generateAiTeams();
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-center">Weekly DFS Challenge</h2>
      <label className="block mb-2">Select Difficulty:</label>
      <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} disabled={gameLocked}>
        <option value="easy">Easy</option>
        <option value="balanced">Balanced</option>
        <option value="hard">Hard</option>
      </select>
      <button onClick={lockGame} disabled={gameLocked} className="bg-blue-500 text-white p-2 rounded">
        Lock Lineup & Generate AI Teams
      </button>
      {gameLocked && (
        <div>
          <h3 className="text-xl font-bold mt-4">Leaderboard</h3>
          <table className="table-auto w-full border">
            <thead>
              <tr><th>User/AI</th><th>Score</th></tr>
            </thead>
            <tbody>
              <tr><td>You</td><td>{currentScore.toFixed(1)}</td></tr>
              {aiTeams.map((team, idx) => (
                <tr key={idx}><td>{team.name}</td><td>{team.score.toFixed(1)}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default DFSAI;

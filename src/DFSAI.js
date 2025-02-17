import React, { useState } from 'react';
import Papa from 'papaparse';

const DFSAI = () => {
  const [availablePlayers, setAvailablePlayers] = useState([]);
  const [currentScore, setCurrentScore] = useState(0);
  const [loadingStats, setLoadingStats] = useState(false);
  const [error, setError] = useState('');
  const [scoringSystem, setScoringSystem] = useState('draftKingsDFS');
  const [statType, setStatType] = useState('hitting');
  const [aiTeams, setAiTeams] = useState([]);
  const [gameLocked, setGameLocked] = useState(false);
  const [difficulty, setDifficulty] = useState('balanced');
  const [csvUrl, setCsvUrl] = useState('');

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

  // Parse uploaded CSV file
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setLoadingStats(true);
    setError('');

    const reader = new FileReader();
    reader.onload = ({ target }) => {
      Papa.parse(target.result, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        complete: results => {
          if (results.errors.length > 0) {
            setError("Error parsing CSV file.");
          } else {
            setAvailablePlayers(results.data);
          }
          setLoadingStats(false);
        }
      });
    };
    reader.readAsText(file);
  };

  // Fetch CSV from URL
  const fetchCsvData = () => {
    if (!csvUrl) {
      setError('Please enter a valid CSV URL.');
      return;
    }

    setLoadingStats(true);
    setError('');

    fetch(csvUrl)
      .then(response => {
        if (!response.ok) {
          throw new Error(`Failed to fetch CSV: ${response.statusText}`);
        }
        return response.text();
      })
      .then(csv => {
        Papa.parse(csv, {
          header: true,
          dynamicTyping: true,
          skipEmptyLines: true,
          complete: results => {
            if (results.errors.length > 0) {
              setError("Error parsing CSV file.");
            } else {
              setAvailablePlayers(results.data);
            }
            setLoadingStats(false);
          }
        });
      })
      .catch(error => {
        console.error("Error fetching CSV:", error);
        setError("Failed to load player data.");
        setLoadingStats(false);
      });
  };

  const generateAiTeams = () => {
    if (availablePlayers.length === 0) {
      setError('No player data available.');
      return;
    }

    let teams = aiPersonalities.map(personality => {
      let selectedPlayers = availablePlayers.sort(() => 0.5 - Math.random()).slice(0, 9);
      let totalPoints = selectedPlayers.reduce((sum, player) => sum + calculatePoints(player), 0);
      return { name: personality.name, score: totalPoints, roster: selectedPlayers };
    });

    if (difficulty === 'hard') {
      teams.forEach(team => team.score *= 1.1);
    } else if (difficulty === 'easy') {
      teams.forEach(team => team.score *= 0.9);
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

      {error && <div className="text-red-500">{error}</div>}
      {loadingStats && <div className="text-gray-500">Loading player data...</div>}

      {/* CSV File Upload */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <h3 className="text-lg font-semibold mb-2">Upload CSV File</h3>
        <input
          type="file"
          accept=".csv"
          onChange={handleFileUpload}
          className="block w-full p-2 border rounded-lg"
        />
      </div>

      {/* CSV URL Input */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <h3 className="text-lg font-semibold mb-2">Import Players from URL</h3>
        <input
          type="text"
          placeholder="Paste CSV URL here..."
          value={csvUrl}
          onChange={(e) => setCsvUrl(e.target.value)}
          className="block w-full p-2 border rounded-lg"
        />
        <button onClick={fetchCsvData} className="bg-green-500 text-white p-2 rounded mt-2">
          Load Players
        </button>
      </div>

      {/* Difficulty Selection */}
      <label className="block mb-2">Select Difficulty:</label>
      <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} disabled={gameLocked} className="p-2 border rounded">
        <option value="easy">Easy</option>
        <option value="balanced">Balanced</option>
        <option value="hard">Hard</option>
      </select>

      {/* Lock Lineup & Generate AI Teams */}
      <button onClick={lockGame} disabled={gameLocked || availablePlayers.length === 0} className="bg-blue-500 text-white p-2 rounded mt-2">
        Lock Lineup & Generate AI Teams
      </button>

      {/* Leaderboard */}
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

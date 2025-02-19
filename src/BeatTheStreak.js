import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';

const BeatTheStreak = () => {
  const [availablePlayers, setAvailablePlayers] = useState([]);
  const [selectedPlayers, setSelectedPlayers] = useState([]);
  const [round, setRound] = useState(1);
  const [totalHits, setTotalHits] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [jackpot, setJackpot] = useState(0);
  const [eitherOrUsed, setEitherOrUsed] = useState(false);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [gameOver, setGameOver] = useState(false);

  const HITS_TARGET = 99;
  const JACKPOT_RANGE = { min: 3000000, max: 7000000 };
  const MAX_ROUNDS = 3;

  // Load best record
  useEffect(() => {
    const savedBest = localStorage.getItem('hitsChallenge_best');
    if (savedBest) {
      setBestScore(Number(savedBest));
    }

    // Generate a jackpot for this game session
    setJackpot(Math.floor(Math.random() * (JACKPOT_RANGE.max - JACKPOT_RANGE.min) + JACKPOT_RANGE.min));
  }, []);

  // Process CSV file and populate available players
  const processFile = async (file) => {
    setError('');
    try {
      const text = await file.text();
      Papa.parse(text, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        complete: (results) => {
          if (results.errors.length > 0) {
            setError('Error parsing CSV file.');
            return;
          }

          const processedPlayers = results.data.map(player => ({
            name: player.Name || 'Unknown',
            pos: player.POS || 'Unknown',
            team: player.Team || 'Unknown',
            hits: player.H || 0
          }));

          setAvailablePlayers(processedPlayers);
        },
        error: (error) => setError(`Error processing file: ${error.message}`)
      });
    } catch (error) {
      setError(`Error reading file: ${error.message}`);
    }
  };

  // Select a player for the round
  const makePick = (player) => {
    if (round > MAX_ROUNDS) return;

    if (eitherOrUsed || selectedPlayers.length < 1) {
      setSelectedPlayers([player]);
    } else {
      setSelectedPlayers(prev => [...prev, player]);
    }
  };

  // Submit the pick for the round
  const submitPick = () => {
    if (selectedPlayers.length === 0) {
      setError('You must select at least one player.');
      return;
    }

    setError('');
    let hitsGained = 0;

    if (selectedPlayers.length === 1) {
      hitsGained = selectedPlayers[0].hits;
    } else if (selectedPlayers.length === 2) {
      // Either/Or round: take the higher of the two selected players' hits
      hitsGained = Math.max(selectedPlayers[0].hits, selectedPlayers[1].hits);
      setEitherOrUsed(true);
    }

    setTotalHits(prev => prev + hitsGained);
    setSelectedPlayers([]);
    setRound(prev => prev + 1);

    if (round >= MAX_ROUNDS) {
      setGameOver(true);
    }
  };

  // Reset the game
  const resetGame = () => {
    if (totalHits > bestScore) {
      setBestScore(totalHits);
      localStorage.setItem('hitsChallenge_best', totalHits);
    }

    setTotalHits(0);
    setRound(1);
    setGameOver(false);
    setEitherOrUsed(false);
    setSelectedPlayers([]);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-4">
        99 Hits Challenge
      </h2>

      <div className="grid grid-cols-2 gap-4 text-center bg-white shadow p-4 rounded-lg">
        <div>
          <h3 className="text-lg font-semibold">Current Hits</h3>
          <p className="text-3xl font-bold">{totalHits} / {HITS_TARGET}</p>
        </div>
        <div>
          <h3 className="text-lg font-semibold">Best Record</h3>
          <p className="text-3xl font-bold">{bestScore}</p>
        </div>
      </div>

      <div className="bg-yellow-100 p-4 rounded text-center">
        <h3 className="text-lg font-semibold">💰 Jackpot: ${jackpot.toLocaleString()} 💰</h3>
      </div>

      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded">
          {error}
        </div>
      )}

      {!gameOver && (
        <>
          <div className="bg-white shadow p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Upload Players CSV</h3>
            <input
              type="file"
              accept=".csv"
              onChange={(e) => e.target.files?.[0] && processFile(e.target.files[0])}
              className="block w-full p-2 border rounded-lg"
            />
          </div>

          <input
            type="text"
            placeholder="Search players..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full p-2 border rounded-lg"
          />

          <div className="bg-white shadow p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Available Players</h3>
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="p-2 text-left">Name</th>
                  <th className="p-2 text-left">POS</th>
                  <th className="p-2 text-left">Team</th>
                  <th className="p-2 text-right">Hits</th>
                  <th className="p-2 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {availablePlayers
                  .filter(player => player.name.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map((player, idx) => (
                    <tr key={idx} className="border-t">
                      <td className="p-2">{player.name}</td>
                      <td className="p-2">{player.pos}</td>
                      <td className="p-2">{player.team}</td>
                      <td className="p-2 text-right">{player.hits}</td>
                      <td className="p-2 text-right">
                        <button
                          onClick={() => makePick(player)}
                          className={`px-3 py-1 rounded ${selectedPlayers.includes(player) ? 'bg-red-500' : 'bg-blue-500'} text-white`}
                        >
                          {selectedPlayers.includes(player) ? 'Remove' : 'Pick'}
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          {selectedPlayers.length > 0 && (
            <button
              onClick={submitPick}
              className="w-full bg-green-500 text-white p-2 rounded mt-4"
            >
              Submit Pick
            </button>
          )}
        </>
      )}

      {gameOver && (
        <div className="bg-red-100 p-4 rounded text-center">
          <h3 className="text-lg font-bold text-red-700">Game Over</h3>
          <p>You finished with {totalHits} hits.</p>
          {totalHits >= HITS_TARGET && <p className="text-green-600 font-bold">🎉 You won the jackpot! 🎉</p>}
          <button
            onClick={resetGame}
            className="mt-4 bg-blue-500 text-white p-2 rounded"
          >
            Play Again
          </button>
        </div>
      )}
    </div>
  );
};

export default BeatTheStreak;

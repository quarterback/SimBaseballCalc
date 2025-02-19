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

  // Pagination & Sorting
  const [currentPage, setCurrentPage] = useState(1);
  const playersPerPage = 10;
  const [sortField, setSortField] = useState(null);
  const [sortOrder, setSortOrder] = useState('asc');

  const HITS_TARGET = 99;
  const JACKPOT_RANGE = { min: 3000000, max: 7000000 };
  const MAX_ROUNDS = 3;

  useEffect(() => {
    const savedBest = localStorage.getItem('hitsChallenge_best');
    if (savedBest) {
      setBestScore(Number(savedBest));
    }
    setJackpot(Math.floor(Math.random() * (JACKPOT_RANGE.max - JACKPOT_RANGE.min) + JACKPOT_RANGE.min));
  }, []);

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
            id: `${player.Name}-${player.TM}`,
            name: player.Name || 'Unknown',
            pos: player.POS || 'Unknown',
            team: player.TM || 'Unknown',
            games: player.G || 0,
            obp: player.OBP || 0,
            war: player.WAR || 0,
            hits: player.H || 0
          }));

          setAvailablePlayers(processedPlayers);
          setCurrentPage(1);
        },
        error: (error) => setError(`Error processing file: ${error.message}`)
      });
    } catch (error) {
      setError(`Error reading file: ${error.message}`);
    }
  };

  const makePick = (player) => {
    setError('');
    setSelectedPlayers((prev) => {
      if (prev.some(p => p.id === player.id)) {
        return prev.filter(p => p.id !== player.id);
      }

      if (prev.length >= 1 && !eitherOrUsed) {
        return [...prev, player].slice(-2);
      }

      return [player];
    });
  };

  const submitPick = () => {
    if (selectedPlayers.length === 0) {
      setError('You must select at least one player.');
      return;
    }

    let hitsGained = 0;
    if (selectedPlayers.length === 1) {
      hitsGained = selectedPlayers[0].hits;
    } else if (selectedPlayers.length === 2) {
      hitsGained = Math.max(selectedPlayers[0].hits, selectedPlayers[1].hits);
      setEitherOrUsed(true);
    }

    setTotalHits(prev => prev + hitsGained);
    setSelectedPlayers([]);

    setRound(prev => {
      if (prev + 1 > MAX_ROUNDS) {
        setGameOver(true);
      }
      return prev + 1;
    });
  };

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

  // Sorting Logic
  const toggleSort = (field) => {
    const order = sortField === field && sortOrder === 'asc' ? 'desc' : 'asc';
    setSortField(field);
    setSortOrder(order);

    const sortedPlayers = [...availablePlayers].sort((a, b) => {
      return order === 'asc' ? a[field] - b[field] : b[field] - a[field];
    });

    setAvailablePlayers(sortedPlayers);
  };

  // Pagination Logic
  const filteredPlayers = availablePlayers.filter(player =>
    player.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const indexOfLastPlayer = currentPage * playersPerPage;
  const indexOfFirstPlayer = indexOfLastPlayer - playersPerPage;
  const currentPlayers = filteredPlayers.slice(indexOfFirstPlayer, indexOfLastPlayer);

  const nextPage = () => {
    if (indexOfLastPlayer < filteredPlayers.length) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-4">99 Hits Challenge</h2>

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

      {error && <div className="bg-red-100 text-red-700 p-3 rounded">{error}</div>}

      {!gameOver && (
        <>
          <div className="bg-white shadow p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Upload Players CSV</h3>
            <input type="file" accept=".csv" onChange={(e) => e.target.files?.[0] && processFile(e.target.files[0])} className="block w-full p-2 border rounded-lg" />
          </div>

          <input type="text" placeholder="Search players..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full p-2 border rounded-lg" />

          <div className="bg-white shadow p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Available Players</h3>

            <table className="min-w-full">
              <tbody>
                {currentPlayers.map(player => (
                  <tr key={player.id} className="border-t">
                    <td className="p-2">{player.name}</td>
                    <td className="p-2">
                      <button 
                        onClick={() => makePick(player)} 
                        className={`px-3 py-1 rounded ${
                          selectedPlayers.some(p => p.id === player.id) ? 'bg-red-500' : 'bg-blue-500'
                        } text-white`}
                      >
                        {selectedPlayers.some(p => p.id === player.id) ? 'Remove' : 'Pick'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button onClick={submitPick} className="mt-4 bg-green-500 text-white p-2 rounded">Submit Pick</button>
        </>
      )}
    </div>
  );
};

export default BeatTheStreak;

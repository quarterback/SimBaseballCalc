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

  // Pagination and Sorting
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
      if (prev.includes(player)) {
        return prev.filter(p => p !== player);
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

  // Pagination Logic
  const indexOfLastPlayer = currentPage * playersPerPage;
  const indexOfFirstPlayer = indexOfLastPlayer - playersPerPage;
  const currentPlayers = availablePlayers.slice(indexOfFirstPlayer, indexOfLastPlayer);

  const nextPage = () => {
    if (indexOfLastPlayer < availablePlayers.length) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };

  // Sorting Logic
  const toggleSort = (field) => {
    const order = sortField === field && sortOrder === 'asc' ? 'desc' : 'asc';
    setSortField(field);
    setSortOrder(order);

    const sortedPlayers = [...availablePlayers].sort((a, b) => {
      if (order === 'asc') {
        return a[field] - b[field];
      } else {
        return b[field] - a[field];
      }
    });

    setAvailablePlayers(sortedPlayers);
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

            {/* Sorting Buttons */}
            <div className="flex space-x-2 mb-4">
              <button onClick={() => toggleSort('games')} className="px-3 py-1 bg-gray-300 rounded">Sort by Games</button>
              <button onClick={() => toggleSort('obp')} className="px-3 py-1 bg-gray-300 rounded">Sort by OBP</button>
              <button onClick={() => toggleSort('war')} className="px-3 py-1 bg-gray-300 rounded">Sort by WAR</button>
            </div>

            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="p-2 text-left">Name</th>
                  <th className="p-2 text-left">POS</th>
                  <th className="p-2 text-left">Team</th>
                  <th className="p-2 text-right">G</th>
                  <th className="p-2 text-right">OBP</th>
                  <th className="p-2 text-right">WAR</th>
                  <th className="p-2 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {currentPlayers.map((player, idx) => (
                  <tr key={idx} className="border-t">
                    <td className="p-2">{player.name}</td>
                    <td className="p-2">{player.pos}</td>
                    <td className="p-2">{player.team}</td>
                    <td className="p-2 text-right">{player.games}</td>
                    <td className="p-2 text-right">{player.obp.toFixed(3)}</td>
                    <td className="p-2 text-right">{player.war}</td>
                    <td className="p-2 text-right">
                      <button onClick={() => makePick(player)} className="px-3 py-1 bg-blue-500 text-white rounded">Pick</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default BeatTheStreak;

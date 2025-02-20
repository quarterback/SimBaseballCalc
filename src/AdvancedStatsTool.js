import React, { useState } from 'react';
import { Bar, Radar, Scatter } from 'recharts';

const AdvancedStatsTool = () => {
  const [players, setPlayers] = useState([]);
  const [playerData, setPlayerData] = useState({});
  const [selectedPlayers, setSelectedPlayers] = useState([]);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPlayerData({ ...playerData, [name]: value });
  };

  const addPlayer = () => {
    if (!playerData.name || !playerData.obp || !playerData.war) {
      setError('Please fill in at least Name, OBP, and WAR');
      return;
    }
    setPlayers([...players, playerData]);
    setPlayerData({});
    setError('');
  };

  const selectPlayer = (player) => {
    setSelectedPlayers((prev) => {
      if (prev.includes(player)) {
        return prev.filter((p) => p !== player);
      }
      return [...prev, player];
    });
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold text-center">OOTP Advanced Stats Tool</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        {/* Input Form */}
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-lg font-semibold mb-3">Enter Player Stats</h2>
          {error && <p className="text-red-500">{error}</p>}
          <input
            type="text"
            name="name"
            placeholder="Player Name"
            value={playerData.name || ''}
            onChange={handleInputChange}
            className="block w-full p-2 border rounded mb-2"
          />
          <input
            type="number"
            name="obp"
            placeholder="OBP"
            value={playerData.obp || ''}
            onChange={handleInputChange}
            className="block w-full p-2 border rounded mb-2"
          />
          <input
            type="number"
            name="war"
            placeholder="WAR"
            value={playerData.war || ''}
            onChange={handleInputChange}
            className="block w-full p-2 border rounded mb-2"
          />
          <button
            onClick={addPlayer}
            className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
          >
            Add Player
          </button>
        </div>

        {/* Player List */}
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-lg font-semibold mb-3">Players</h2>
          <ul>
            {players.map((player, index) => (
              <li
                key={index}
                className={`p-2 cursor-pointer ${selectedPlayers.includes(player) ? 'bg-blue-200' : 'hover:bg-gray-200'}`}
                onClick={() => selectPlayer(player)}
              >
                {player.name} - OBP: {player.obp} - WAR: {player.war}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Placeholder for Graphs */}
      <div className="mt-6 p-4 bg-white rounded shadow">
        <h2 className="text-lg font-semibold mb-3">Visualizations (Coming Soon)</h2>
        <p>Select at least one player to generate visuals.</p>
      </div>
    </div>
  );
};

export default AdvancedStatsTool;

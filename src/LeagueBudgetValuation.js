import React, { useState } from 'react';
import Papa from 'papaparse';

const LeagueBudgetValuation = () => {
  const [playerData, setPlayerData] = useState([]);
  const [totalBudget, setTotalBudget] = useState(260); // Default budget
  const [ageImpact, setAgeImpact] = useState(-0.1); // Default age impact
  const [sortBy, setSortBy] = useState('OVR'); // Default sorting by OVR
  const [sortOrder, setSortOrder] = useState('desc'); // Default descending order

  const processPlayerFile = async (file) => {
    const text = await file.text();
    Papa.parse(text, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: (results) => {
        const players = results.data.map((player) => ({
          ...player,
          OVR: parseFloat(player.OVR) || 0,
          POT: parseFloat(player.POT) || 0,
          Age: parseInt(player.Age, 10) || 0,
        }));

        const updatedPlayers = calculateDollarValue(players, totalBudget, ageImpact);
        setPlayerData(updatedPlayers);
      },
    });
  };

  const calculateDollarValue = (players, totalBudget, ageImpact) => {
    const totalOVR = players.reduce((sum, player) => sum + player.OVR, 0); // Sum of all OVRs
    const remainingBudget = totalBudget - players.length; // $1 baseline per player

    return players.map((player) => {
      const ageMultiplier = 1 + ageImpact * (player.Age - 27); // Neutral age is 27
      const proportionalValue = (player.OVR / totalOVR) * remainingBudget;
      const dollarValue = Math.max(1, proportionalValue * ageMultiplier); // At least $1
      return {
        ...player,
        DollarValue: parseFloat(dollarValue.toFixed(2)), // Format to 2 decimal places
      };
    });
  };

  const sortPlayerData = (field) => {
    const order = sortBy === field && sortOrder === 'desc' ? 'asc' : 'desc';
    const sortedData = [...playerData].sort((a, b) => {
      if (order === 'asc') return a[field] - b[field];
      return b[field] - a[field];
    });
    setSortBy(field);
    setSortOrder(order);
    setPlayerData(sortedData);
  };

  return (
    <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-center text-gray-800">League Budget Valuation</h1>

      {/* File Upload */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Upload Player Data:</label>
        <input
          type="file"
          accept=".csv"
          onChange={(e) => processPlayerFile(e.target.files[0])}
          className="block w-full p-2 border rounded-lg"
        />
      </div>

      {/* Settings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">League Budget ($):</label>
          <input
            type="number"
            value={totalBudget}
            onChange={(e) => setTotalBudget(parseInt(e.target.value, 10))}
            className="p-2 border rounded-lg w-full"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Age Impact:</label>
          <input
            type="number"
            step="0.01"
            value={ageImpact}
            onChange={(e) => setAgeImpact(parseFloat(e.target.value))}
            className="p-2 border rounded-lg w-full"
          />
        </div>
      </div>

      {/* Player Table */}
      <div className="overflow-x-auto">
        <table className="w-full table-auto border border-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th
                className="p-2 text-left cursor-pointer"
                onClick={() => sortPlayerData('Name')}
              >
                Name
              </th>
              <th
                className="p-2 text-left cursor-pointer"
                onClick={() => sortPlayerData('Position')}
              >
                Position
              </th>
              <th
                className="p-2 text-right cursor-pointer"
                onClick={() => sortPlayerData('Age')}
              >
                Age
              </th>
              <th
                className="p-2 text-right cursor-pointer"
                onClick={() => sortPlayerData('OVR')}
              >
                OVR
              </th>
              <th
                className="p-2 text-right cursor-pointer"
                onClick={() => sortPlayerData('POT')}
              >
                POT
              </th>
              <th
                className="p-2 text-right cursor-pointer"
                onClick={() => sortPlayerData('DollarValue')}
              >
                Dollar Value
              </th>
            </tr>
          </thead>
          <tbody>
            {playerData.map((player, idx) => (
              <tr
                key={idx}
                className={`${idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'} hover:bg-gray-100`}
              >
                <td className="p-2">{player.Name}</td>
                <td className="p-2">{player.Position}</td>
                <td className="p-2 text-right">{player.Age}</td>
                <td className="p-2 text-right">{player.OVR}</td>
                <td className="p-2 text-right">{player.POT}</td>
                <td className="p-2 text-right">${player.DollarValue}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LeagueBudgetValuation;

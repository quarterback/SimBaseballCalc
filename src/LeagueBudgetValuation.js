import React, { useState } from 'react';
import Papa from 'papaparse';

const LeagueBudgetValuation = () => {
  const [playerData, setPlayerData] = useState([]);
  const [leagueBudget, setLeagueBudget] = useState(260); // Default league budget
  const [ageImpact, setAgeImpact] = useState(-0.1); // Default age impact

  // Process CSV file upload
  const handleFileUpload = (file) => {
    Papa.parse(file, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: (results) => {
        setPlayerData(results.data);
      },
    });
  };

  // Calculate dollar values based on OVR, POT, Age
  const calculateDollarValues = (players) => {
    const ovrWeight = 0.5;
    const potWeight = 0.4;

    // Calculate raw dollar values
    const rawValues = players.map((player) => ({
      ...player,
      rawDollarValue:
        player.OVR * ovrWeight +
        player.POT * potWeight +
        player.Age * ageImpact,
    }));

    // Calculate scaling factor based on the league budget
    const totalRawValue = rawValues.reduce(
      (sum, player) => sum + player.rawDollarValue,
      0
    );
    const scalingFactor = leagueBudget / totalRawValue;

    // Apply scaling factor to calculate final dollar value
    return rawValues.map((player) => ({
      ...player,
      DollarValue: (player.rawDollarValue * scalingFactor).toFixed(2),
    }));
  };

  // Generate player list with dollar values
  const playersWithValues = calculateDollarValues(playerData);

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">League Budget Valuation</h1>
      
      {/* File Upload */}
      <div className="space-y-4">
        <label className="block text-sm font-medium text-gray-700">
          Upload Player Data:
        </label>
        <input
          type="file"
          accept=".csv"
          onChange={(e) => handleFileUpload(e.target.files[0])}
          className="p-2 border border-gray-300 rounded-lg"
        />

        {/* League Budget Input */}
        <label className="block text-sm font-medium text-gray-700 mt-4">
          League Budget ($):
        </label>
        <input
          type="number"
          value={leagueBudget}
          onChange={(e) => setLeagueBudget(Number(e.target.value))}
          className="p-2 border border-gray-300 rounded-lg"
        />

        {/* Age Impact Input */}
        <label className="block text-sm font-medium text-gray-700 mt-4">
          Age Impact:
        </label>
        <input
          type="number"
          step="0.01"
          value={ageImpact}
          onChange={(e) => setAgeImpact(Number(e.target.value))}
          className="p-2 border border-gray-300 rounded-lg"
        />
      </div>

      {/* Player Table */}
      {playersWithValues.length > 0 && (
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-300 mt-4">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 text-left">Name</th>
                <th className="p-2 text-left">Position</th>
                <th className="p-2 text-right">Age</th>
                <th className="p-2 text-right">OVR</th>
                <th className="p-2 text-right">POT</th>
                <th className="p-2 text-right">Dollar Value</th>
              </tr>
            </thead>
            <tbody>
              {playersWithValues.map((player, idx) => (
                <tr
                  key={idx}
                  className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                >
                  <td className="p-2">{player.Name}</td>
                  <td className="p-2">{player.POS}</td>
                  <td className="p-2 text-right">{player.Age}</td>
                  <td className="p-2 text-right">{player.OVR}</td>
                  <td className="p-2 text-right">{player.POT}</td>
                  <td className="p-2 text-right">${player.DollarValue}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default LeagueBudgetValuation;

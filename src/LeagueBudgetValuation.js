import React, { useState } from 'react';
import Papa from 'papaparse';

const LeagueBudgetValuation = () => {
  const [playerData, setPlayerData] = useState([]);
  const [totalBudget, setTotalBudget] = useState(260);
  const [ageImpact, setAgeImpact] = useState(-0.1);
  const [sortBy, setSortBy] = useState('OVR');
  const [sortOrder, setSortOrder] = useState('desc');
  const [error, setError] = useState('');

  const processPlayerFile = async (file) => {
    try {
      const text = await file.text();
      Papa.parse(text, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        transformHeader: header => header.trim(), // Handle whitespace in headers
        complete: (results) => {
          if (results.errors.length > 0) {
            setError(`CSV parsing error: ${results.errors[0].message}`);
            return;
          }

          const players = results.data.map((player) => ({
            ...player,
            Name: player.Name?.trim() || 'Unknown',
            Position: player.Position?.trim() || 'N/A',
            OVR: parseFloat(player.OVR) || 0,
            POT: parseFloat(player.POT) || 0,
            Age: parseInt(player.Age, 10) || 0,
          }));

          const updatedPlayers = calculateDollarValue(players, totalBudget, ageImpact);
          setPlayerData(updatedPlayers);
          setError('');
        },
        error: (error) => {
          setError(`File processing error: ${error.message}`);
        }
      });
    } catch (error) {
      setError(`File reading error: ${error.message}`);
    }
  };

  const calculateDollarValue = (players, totalBudget, ageImpact) => {
    // Calculate weighted OVR values with age adjustment
    const weightedValues = players.map(player => {
      const ageMultiplier = 1 + ageImpact * (player.Age - 27); // Age 27 is neutral
      return {
        ...player,
        weightedOVR: Math.max(0, player.OVR * ageMultiplier) // Prevent negative values
      };
    });

    // Sum of all weighted OVR values
    const totalWeightedOVR = weightedValues.reduce((sum, player) => sum + player.weightedOVR, 0);

    // Minimum value for each player ($1)
    const minValue = 1;
    const reservedBudget = players.length * minValue;
    const adjustableBudget = totalBudget - reservedBudget;

    // Calculate dollar values
    return weightedValues.map(player => {
      const shareOfBudget = player.weightedOVR / totalWeightedOVR;
      const calculatedValue = (shareOfBudget * adjustableBudget) + minValue;
      
      return {
        ...player,
        DollarValue: parseFloat(calculatedValue.toFixed(2))
      };
    });
  };

  const sortPlayerData = (field) => {
    const order = sortBy === field && sortOrder === 'desc' ? 'asc' : 'desc';
    const sortedData = [...playerData].sort((a, b) => {
      const aValue = typeof a[field] === 'string' ? a[field].toLowerCase() : a[field];
      const bValue = typeof b[field] === 'string' ? b[field].toLowerCase() : b[field];
      
      if (order === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      }
      return bValue < aValue ? -1 : bValue > aValue ? 1 : 0;
    });
    
    setSortBy(field);
    setSortOrder(order);
    setPlayerData(sortedData);
  };

  const getSortIndicator = (field) => {
    if (sortBy !== field) return '↕';
    return sortOrder === 'desc' ? '↓' : '↑';
  };

  return (
    <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-center text-gray-800">League Budget Valuation</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          {error}
        </div>
      )}

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Upload Player Data:</label>
        <input
          type="file"
          accept=".csv"
          onChange={(e) => {
            if (e.target.files?.[0]) {
              processPlayerFile(e.target.files[0]);
            }
          }}
          className="block w-full p-2 border rounded-lg"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            League Budget ($):
          </label>
          <input
            type="number"
            min="1"
            value={totalBudget}
            onChange={(e) => {
              const value = parseInt(e.target.value, 10);
              if (value > 0) {
                setTotalBudget(value);
                if (playerData.length > 0) {
                  setPlayerData(calculateDollarValue(playerData, value, ageImpact));
                }
              }
            }}
            className="p-2 border rounded-lg w-full"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Age Impact (-1 to 1):
          </label>
          <input
            type="number"
            step="0.05"
            min="-1"
            max="1"
            value={ageImpact}
            onChange={(e) => {
              const value = parseFloat(e.target.value);
              if (value >= -1 && value <= 1) {
                setAgeImpact(value);
                if (playerData.length > 0) {
                  setPlayerData(calculateDollarValue(playerData, totalBudget, value));
                }
              }
            }}
            className="p-2 border rounded-lg w-full"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full table-auto border border-gray-200">
          <thead className="bg-gray-100">
            <tr>
              {['Name', 'Position', 'Age', 'OVR', 'POT', 'DollarValue'].map(field => (
                <th
                  key={field}
                  onClick={() => sortPlayerData(field)}
                  className="p-2 text-left cursor-pointer hover:bg-gray-200"
                >
                  {field === 'DollarValue' ? 'Dollar Value' : field}{' '}
                  {getSortIndicator(field)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {playerData.map((player, idx) => (
              <tr
                key={`${player.Name}-${idx}`}
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

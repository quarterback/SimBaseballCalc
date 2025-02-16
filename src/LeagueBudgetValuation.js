import React, { useState } from 'react';
import Papa from 'papaparse';

const LeagueBudgetValuation = () => {
  const [players, setPlayers] = useState([]);
  const [leagueBudget, setLeagueBudget] = useState(260); // Default budget
  const [positionMultipliers, setPositionMultipliers] = useState({
    C: 1.5, SP: 1.3, RP: 1.1, OF: 1.2, INF: 1.0
  });
  const [ageImpact, setAgeImpact] = useState(0.02); // Age multiplier
  const [view, setView] = useState('combined'); // "combined" or "ratings"

  // Process uploaded CSV
  const processFile = (file) => {
    Papa.parse(file, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: (results) => {
        setPlayers(results.data);
      },
    });
  };

  // Calculate dollar value
  const calculateDollarValue = (player) => {
    const posMultiplier = positionMultipliers[player.POS] || 1;
    const ageMultiplier = 1 + ((30 - player.Age) * ageImpact);

    let playerPoints;
    if (player.POS === 'SP' || player.POS === 'RP') {
      // Pitcher Points
      playerPoints = player.STU * 0.4 + player.MOV * 0.3 + player.CON * 0.3;
    } else {
      // Hitter Points
      playerPoints = player.CON * 0.3 + player.POW * 0.3 + player.EYE * 0.2 + player.DEF * 0.2;
    }

    const totalPoints = players.reduce((sum, p) => sum + playerPoints, 0);

    return ((playerPoints * posMultiplier * ageMultiplier) / totalPoints) * leagueBudget;
  };

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-2xl font-bold">League Budget Valuation</h1>

      {/* Input Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label>
          <span>Upload Player Data:</span>
          <input
            type="file"
            onChange={(e) => processFile(e.target.files[0])}
            className="block w-full p-2 border rounded"
          />
        </label>

        <label>
          <span>League Budget ($):</span>
          <input
            type="number"
            value={leagueBudget}
            onChange={(e) => setLeagueBudget(Number(e.target.value))}
            className="block w-full p-2 border rounded"
          />
        </label>

        <label>
          <span>Age Impact:</span>
          <input
            type="number"
            step="0.01"
            value={ageImpact}
            onChange={(e) => setAgeImpact(Number(e.target.value))}
            className="block w-full p-2 border rounded"
          />
        </label>
      </div>

      {/* Player Table */}
      {players.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th>Name</th>
                <th>Position</th>
                <th>Age</th>
                <th>OVR</th>
                <th>Dollar Value</th>
              </tr>
            </thead>
            <tbody>
              {players.map((player, idx) => (
                <tr key={idx} className={idx % 2 === 0 ? 'bg-gray-50' : ''}>
                  <td>{player.Name}</td>
                  <td>{player.POS}</td>
                  <td>{player.Age}</td>
                  <td>{player.OVR}</td>
                  <td>${calculateDollarValue(player).toFixed(2)}</td>
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

import React, { useState } from "react";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Tooltip, ResponsiveContainer } from "recharts";

const AdvancedStatsTool = () => {
  const [playerData, setPlayerData] = useState({
    name: "",
    team: "",
    fip: "",
    whip: "",
    hr9: "",
    kRate: "",
    bbRate: "",
    babip: "",
    lobPercent: "",
  });

  const handleChange = (e) => {
    setPlayerData({
      ...playerData,
      [e.target.name]: e.target.value,
    });
  };

  // Calculate xERA using OOTP-approximation formula
  const xERA =
    (parseFloat(playerData.fip) || 4.00) * 0.7 +
    (parseFloat(playerData.whip) || 1.30) * 0.3 +
    (parseFloat(playerData.hr9) || 1.2) * 1.2 -
    (parseFloat(playerData.lobPercent) || 70) * 0.1 -
    (parseFloat(playerData.babip) || 0.300) * 0.2;

  // Convert raw stats into percentile rankings (scaled 0-100)
  const leagueAvg = {
    fip: 4.00,
    whip: 1.30,
    hr9: 1.2,
    kRate: 22,
    bbRate: 8,
    babip: 0.300,
    lobPercent: 70,
  };

  const percentiles = {
    fip: Math.max(0, Math.min(100, 100 - ((parseFloat(playerData.fip) - leagueAvg.fip) / 1.5) * 100)),
    whip: Math.max(0, Math.min(100, 100 - ((parseFloat(playerData.whip) - leagueAvg.whip) / 0.5) * 100)),
    hr9: Math.max(0, Math.min(100, 100 - ((parseFloat(playerData.hr9) - leagueAvg.hr9) / 1.0) * 100)),
    kRate: Math.max(0, Math.min(100, ((parseFloat(playerData.kRate) - leagueAvg.kRate) / 10) * 100)),
    bbRate: Math.max(0, Math.min(100, 100 - ((parseFloat(playerData.bbRate) - leagueAvg.bbRate) / 5) * 100)),
    babip: Math.max(0, Math.min(100, 100 - ((parseFloat(playerData.babip) - leagueAvg.babip) / 0.1) * 100)),
    lobPercent: Math.max(0, Math.min(100, ((parseFloat(playerData.lobPercent) - leagueAvg.lobPercent) / 15) * 100)),
  };

  const formattedData = [
    { stat: "xERA", value: xERA },
    { stat: "FIP", value: parseFloat(playerData.fip) || 4.00 },
    { stat: "WHIP", value: parseFloat(playerData.whip) || 1.30 },
    { stat: "HR/9", value: parseFloat(playerData.hr9) || 1.2 },
    { stat: "K%", value: parseFloat(playerData.kRate) || 22 },
    { stat: "BB%", value: parseFloat(playerData.bbRate) || 8 },
  ];

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-md rounded-lg">
      <h2 className="text-2xl font-bold text-center mb-4">OOTP Custom xERA & Pitching Metrics</h2>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <input type="text" name="name" value={playerData.name} onChange={handleChange} placeholder="Player Name" className="p-2 border rounded-md w-full" />
        <input type="text" name="team" value={playerData.team} onChange={handleChange} placeholder="Team Name" className="p-2 border rounded-md w-full" />
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <input type="number" step="0.01" name="fip" value={playerData.fip} onChange={handleChange} placeholder="FIP" className="p-2 border rounded-md w-full" />
        <input type="number" step="0.01" name="whip" value={playerData.whip} onChange={handleChange} placeholder="WHIP" className="p-2 border rounded-md w-full" />
        <input type="number" step="0.1" name="hr9" value={playerData.hr9} onChange={handleChange} placeholder="HR/9" className="p-2 border rounded-md w-full" />
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <input type="number" step="0.1" name="kRate" value={playerData.kRate} onChange={handleChange} placeholder="K%" className="p-2 border rounded-md w-full" />
        <input type="number" step="0.1" name="bbRate" value={playerData.bbRate} onChange={handleChange} placeholder="BB%" className="p-2 border rounded-md w-full" />
        <input type="number" step="0.001" name="babip" value={playerData.babip} onChange={handleChange} placeholder="BABIP" className="p-2 border rounded-md w-full" />
      </div>

      <div className="p-4 bg-gray-100 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold text-center mb-2">Generated xERA</h3>
        <p className="text-3xl text-center font-bold">{xERA.toFixed(2)}</p>
      </div>

      <div className="p-4 bg-gray-100 rounded-lg shadow-md mt-6">
        <h3 className="text-lg font-semibold text-center mb-2">Statcast-Style Pitching Visualization</h3>
        <ResponsiveContainer width="100%" height={350}>
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={formattedData}>
            <PolarGrid />
            <PolarAngleAxis dataKey="stat" />
            <PolarRadiusAxis />
            <Tooltip />
            <Radar name={playerData.name || "Player"} dataKey="value" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default AdvancedStatsTool;

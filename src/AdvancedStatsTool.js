import React, { useState } from "react";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Tooltip, ResponsiveContainer } from "recharts";

const AdvancedStatsTool = () => {
  // State for manual stat input
  const [playerData, setPlayerData] = useState({
    name: "",
    team: "",
    obp: "",
    war: "",
    iso: "",
    opsPlus: "",
    babip: "",
    fip: "",
    whip: "",
    hr9: "",
    kRate: "",
    bbRate: "",
    lobPercent: "",
  });

  // Handle user input
  const handleChange = (e) => {
    setPlayerData({
      ...playerData,
      [e.target.name]: e.target.value,
    });
  };

  // Calculate xERA (but NOT in the visualization)
  const xERA =
    (parseFloat(playerData.fip) || 4.00) * 0.7 +
    (parseFloat(playerData.whip) || 1.30) * 0.3 +
    (parseFloat(playerData.hr9) || 1.2) * 1.2 -
    (parseFloat(playerData.lobPercent) || 70) * 0.1 -
    (parseFloat(playerData.babip) || 0.300) * 0.2;

  // Hitter Stats Radar Chart
  const hitterData = [
    { stat: "OBP", value: parseFloat(playerData.obp) || 0 },
    { stat: "WAR", value: parseFloat(playerData.war) || 0 },
    { stat: "ISO", value: parseFloat(playerData.iso) || 0 },
    { stat: "OPS+", value: parseFloat(playerData.opsPlus) || 0 },
    { stat: "BABIP", value: parseFloat(playerData.babip) || 0 },
  ];

  // Pitcher Stats Radar Chart
  const pitcherData = [
    { stat: "FIP", value: parseFloat(playerData.fip) || 4.00 },
    { stat: "WHIP", value: parseFloat(playerData.whip) || 1.30 },
    { stat: "HR/9", value: parseFloat(playerData.hr9) || 1.2 },
    { stat: "K%", value: parseFloat(playerData.kRate) || 22 },
    { stat: "BB%", value: parseFloat(playerData.bbRate) || 8 },
  ];

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-md rounded-lg">
      <h2 className="text-2xl font-bold text-center mb-4">Advanced Stats Visualizer</h2>

      {/* Input Form */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <input
          type="text"
          name="name"
          value={playerData.name}
          onChange={handleChange}
          placeholder="Player Name"
          className="p-2 border rounded-md w-full"
        />
        <input
          type="text"
          name="team"
          value={playerData.team}
          onChange={handleChange}
          placeholder="Team Name"
          className="p-2 border rounded-md w-full"
        />
      </div>

      {/* Hitting Inputs */}
      <h3 className="text-lg font-semibold text-center mb-2">Hitting Stats</h3>
      <div className="grid grid-cols-3 gap-4 mb-6">
        <input
          type="number"
          step="0.001"
          name="obp"
          value={playerData.obp}
          onChange={handleChange}
          placeholder="OBP (e.g., .360)"
          className="p-2 border rounded-md w-full"
        />
        <input
          type="number"
          step="0.1"
          name="war"
          value={playerData.war}
          onChange={handleChange}
          placeholder="WAR (e.g., 3.2)"
          className="p-2 border rounded-md w-full"
        />
        <input
          type="number"
          step="0.01"
          name="iso"
          value={playerData.iso}
          onChange={handleChange}
          placeholder="ISO (e.g., .200)"
          className="p-2 border rounded-md w-full"
        />
        <input
          type="number"
          name="opsPlus"
          value={playerData.opsPlus}
          onChange={handleChange}
          placeholder="OPS+ (e.g., 125)"
          className="p-2 border rounded-md w-full"
        />
        <input
          type="number"
          step="0.001"
          name="babip"
          value={playerData.babip}
          onChange={handleChange}
          placeholder="BABIP (e.g., .310)"
          className="p-2 border rounded-md w-full"
        />
      </div>

      {/* Pitching Inputs */}
      <h3 className="text-lg font-semibold text-center mb-2">Pitching Stats</h3>
      <div className="grid grid-cols-3 gap-4 mb-6">
        <input
          type="number"
          step="0.01"
          name="fip"
          value={playerData.fip}
          onChange={handleChange}
          placeholder="FIP (e.g., 3.80)"
          className="p-2 border rounded-md w-full"
        />
        <input
          type="number"
          step="0.01"
          name="whip"
          value={playerData.whip}
          onChange={handleChange}
          placeholder="WHIP (e.g., 1.10)"
          className="p-2 border rounded-md w-full"
        />
        <input
          type="number"
          step="0.1"
          name="hr9"
          value={playerData.hr9}
          onChange={handleChange}
          placeholder="HR/9 (e.g., 1.2)"
          className="p-2 border rounded-md w-full"
        />
        <input
          type="number"
          step="0.1"
          name="kRate"
          value={playerData.kRate}
          onChange={handleChange}
          placeholder="K% (e.g., 25)"
          className="p-2 border rounded-md w-full"
        />
        <input
          type="number"
          step="0.1"
          name="bbRate"
          value={playerData.bbRate}
          onChange={handleChange}
          placeholder="BB% (e.g., 8)"
          className="p-2 border rounded-md w-full"
        />
      </div>

      {/* Generated xERA */}
      <div className="p-4 bg-gray-100 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold text-center mb-2">Generated xERA</h3>
        <p className="text-3xl text-center font-bold">{xERA.toFixed(2)}</p>
      </div>

      {/* Hitter Visualization */}
      <div className="p-4 bg-gray-100 rounded-lg shadow-md mt-6">
        <h3 className="text-lg font-semibold text-center mb-2">Hitter Performance Visualization</h3>
        <ResponsiveContainer width="100%" height={350}>
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={hitterData}>
            <PolarGrid />
            <PolarAngleAxis dataKey="stat" />
            <PolarRadiusAxis />
            <Tooltip />
            <Radar name={playerData.name || "Hitter"} dataKey="value" stroke="#ff7300" fill="#ff7300" fillOpacity={0.6} />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Pitcher Visualization */}
      <div className="p-4 bg-gray-100 rounded-lg shadow-md mt-6">
        <h3 className="text-lg font-semibold text-center mb-2">Pitcher Performance Visualization</h3>
        <ResponsiveContainer width="100%" height={350}>
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={pitcherData}>
            <PolarGrid />
            <PolarAngleAxis dataKey="stat" />
            <PolarRadiusAxis />
            <Tooltip />
            <Radar name={playerData.name || "Pitcher"} dataKey="value" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default AdvancedStatsTool;

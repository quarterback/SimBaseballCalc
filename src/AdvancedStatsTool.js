import React, { useState } from "react";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from "recharts";

const AdvancedStatsTool = () => {
  const [mode, setMode] = useState("hitting"); // Toggle between hitting and pitching
  const [playerData, setPlayerData] = useState({
    name: "",
    team: "",
    // Hitting Stats
    obp: "",
    war: "",
    iso: "",
    opsPlus: "",
    babip: "",
    // Pitching Stats
    stuff: "",
    movement: "",
    control: "",
    velocity: "",
    gbPercent: ""
  });

  // Handle input changes
  const handleChange = (e) => {
    setPlayerData({
      ...playerData,
      [e.target.name]: e.target.value,
    });
  };

  // Derived advanced stats for inferred metrics
  const inferredStats = mode === "hitting"
    ? [
        { stat: "xOBP", value: (parseFloat(playerData.obp) * 0.98).toFixed(3) || 0 },
        { stat: "xISO", value: (parseFloat(playerData.iso) * 1.05).toFixed(3) || 0 },
        { stat: "xBABIP", value: (parseFloat(playerData.babip) * 0.97).toFixed(3) || 0 },
        { stat: "Adjusted WAR", value: (parseFloat(playerData.war) * 1.1).toFixed(2) || 0 },
      ]
    : [
        { stat: "xERA", value: (5 - parseFloat(playerData.movement) * 0.1).toFixed(2) || 0 },
        { stat: "xFIP", value: (5 - parseFloat(playerData.control) * 0.09).toFixed(2) || 0 },
        { stat: "xGB%", value: (parseFloat(playerData.gbPercent) * 1.02).toFixed(1) || 0 },
        { stat: "Stuff+", value: (parseFloat(playerData.stuff) * 1.1).toFixed(1) || 0 },
      ];

  // Formatting primary data for visualization
  const formattedData = mode === "hitting"
    ? [
        { stat: "OBP", value: parseFloat(playerData.obp) || 0 },
        { stat: "WAR", value: parseFloat(playerData.war) || 0 },
        { stat: "ISO", value: parseFloat(playerData.iso) || 0 },
        { stat: "OPS+", value: parseFloat(playerData.opsPlus) || 0 },
        { stat: "BABIP", value: parseFloat(playerData.babip) || 0 },
      ]
    : [
        { stat: "Stuff", value: parseFloat(playerData.stuff) || 0 },
        { stat: "Movement", value: parseFloat(playerData.movement) || 0 },
        { stat: "Control", value: parseFloat(playerData.control) || 0 },
        { stat: "Velocity", value: parseFloat(playerData.velocity) || 0 },
        { stat: "GB%", value: parseFloat(playerData.gbPercent) || 0 },
      ];

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-md rounded-lg">
      <h2 className="text-2xl font-bold text-center mb-4">Advanced Stats Visualizer</h2>
      <div className="flex justify-center mb-4">
        <button className={`px-4 py-2 mx-2 rounded ${mode === "hitting" ? "bg-blue-500 text-white" : "bg-gray-300"}`} onClick={() => setMode("hitting")}>
          Hitting
        </button>
        <button className={`px-4 py-2 mx-2 rounded ${mode === "pitching" ? "bg-blue-500 text-white" : "bg-gray-300"}`} onClick={() => setMode("pitching")}>
          Pitching
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <input type="text" name="name" value={playerData.name} onChange={handleChange} placeholder="Player Name" className="p-2 border rounded-md w-full" />
        <input type="text" name="team" value={playerData.team} onChange={handleChange} placeholder="Team Name" className="p-2 border rounded-md w-full" />
        {mode === "hitting" ? (
          <>
            <input type="number" name="obp" value={playerData.obp} onChange={handleChange} placeholder="OBP (e.g., .360)" className="p-2 border rounded-md w-full" />
            <input type="number" name="war" value={playerData.war} onChange={handleChange} placeholder="WAR (e.g., 3.2)" className="p-2 border rounded-md w-full" />
            <input type="number" name="iso" value={playerData.iso} onChange={handleChange} placeholder="ISO (e.g., .200)" className="p-2 border rounded-md w-full" />
            <input type="number" name="opsPlus" value={playerData.opsPlus} onChange={handleChange} placeholder="OPS+ (e.g., 125)" className="p-2 border rounded-md w-full" />
            <input type="number" name="babip" value={playerData.babip} onChange={handleChange} placeholder="BABIP (e.g., .310)" className="p-2 border rounded-md w-full" />
          </>
        ) : (
          <>
            <input type="number" name="stuff" value={playerData.stuff} onChange={handleChange} placeholder="Stuff (e.g., 65)" className="p-2 border rounded-md w-full" />
            <input type="number" name="movement" value={playerData.movement} onChange={handleChange} placeholder="Movement (e.g., 60)" className="p-2 border rounded-md w-full" />
            <input type="number" name="control" value={playerData.control} onChange={handleChange} placeholder="Control (e.g., 55)" className="p-2 border rounded-md w-full" />
            <input type="number" name="velocity" value={playerData.velocity} onChange={handleChange} placeholder="Velocity (e.g., 95)" className="p-2 border rounded-md w-full" />
            <input type="number" name="gbPercent" value={playerData.gbPercent} onChange={handleChange} placeholder="GB% (e.g., 50.0)" className="p-2 border rounded-md w-full" />
          </>
        )}
      </div>

      <h3 className="text-lg font-semibold text-center mb-2">Radar Chart</h3>
      <ResponsiveContainer width="100%" height={300}>
        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={formattedData}>
          <PolarGrid />
          <PolarAngleAxis dataKey="stat" />
          <PolarRadiusAxis />
          <Radar name={playerData.name || "Player"} dataKey="value" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AdvancedStatsTool;

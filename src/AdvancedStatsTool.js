import React, { useState } from "react";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ScatterChart, Scatter, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const AdvancedStatsTool = () => {
  const [mode, setMode] = useState("hitting"); // Toggle between hitting and pitching
  const [playerData, setPlayerData] = useState({
    name: "",
    team: "",
    obp: "",
    war: "",
    iso: "",
    opsPlus: "",
    babip: "",
    stuff: "",
    movement: "",
    control: "",
    velocity: "",
    groundball: "",
    pitchRepertoire: ""
  });

  // Handle user input
  const handleChange = (e) => {
    setPlayerData({
      ...playerData,
      [e.target.name]: e.target.value,
    });
  };

  // Convert input values to numbers for chart rendering
  const formattedHittingData = [
    { stat: "OBP", value: parseFloat(playerData.obp) || 0 },
    { stat: "WAR", value: parseFloat(playerData.war) || 0 },
    { stat: "ISO", value: parseFloat(playerData.iso) || 0 },
    { stat: "OPS+", value: parseFloat(playerData.opsPlus) || 0 },
    { stat: "BABIP", value: parseFloat(playerData.babip) || 0 },
  ];

  const formattedPitchingData = [
    { stat: "Stuff", value: parseFloat(playerData.stuff) || 0 },
    { stat: "Movement", value: parseFloat(playerData.movement) || 0 },
    { stat: "Control", value: parseFloat(playerData.control) || 0 },
    { stat: "Velocity", value: parseFloat(playerData.velocity) || 0 },
    { stat: "GB%", value: parseFloat(playerData.groundball) || 0 },
  ];

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-md rounded-lg">
      <h2 className="text-2xl font-bold text-center mb-4">Advanced Stats Visualizer</h2>
      
      {/* Toggle Button for Hitting/Pitching */}
      <div className="flex justify-center mb-4">
        <button onClick={() => setMode("hitting")} className={`px-4 py-2 mr-2 rounded ${mode === "hitting" ? "bg-blue-500 text-white" : "bg-gray-300"}`}>Hitting</button>
        <button onClick={() => setMode("pitching")} className={`px-4 py-2 rounded ${mode === "pitching" ? "bg-blue-500 text-white" : "bg-gray-300"}`}>Pitching</button>
      </div>
      
      {/* Input Form */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <input type="text" name="name" value={playerData.name} onChange={handleChange} placeholder="Player Name" className="p-2 border rounded-md w-full" />
        <input type="text" name="team" value={playerData.team} onChange={handleChange} placeholder="Team Name" className="p-2 border rounded-md w-full" />
        
        {mode === "hitting" ? (
          <>
            <input type="number" step="0.001" name="obp" value={playerData.obp} onChange={handleChange} placeholder="OBP (e.g., .360)" className="p-2 border rounded-md w-full" />
            <input type="number" step="0.1" name="war" value={playerData.war} onChange={handleChange} placeholder="WAR (e.g., 3.2)" className="p-2 border rounded-md w-full" />
            <input type="number" step="0.01" name="iso" value={playerData.iso} onChange={handleChange} placeholder="ISO (e.g., .200)" className="p-2 border rounded-md w-full" />
            <input type="number" name="opsPlus" value={playerData.opsPlus} onChange={handleChange} placeholder="OPS+ (e.g., 125)" className="p-2 border rounded-md w-full" />
            <input type="number" step="0.001" name="babip" value={playerData.babip} onChange={handleChange} placeholder="BABIP (e.g., .310)" className="p-2 border rounded-md w-full" />
          </>
        ) : (
          <>
            <input type="number" name="stuff" value={playerData.stuff} onChange={handleChange} placeholder="Stuff (e.g., 65)" className="p-2 border rounded-md w-full" />
            <input type="number" name="movement" value={playerData.movement} onChange={handleChange} placeholder="Movement (e.g., 60)" className="p-2 border rounded-md w-full" />
            <input type="number" name="control" value={playerData.control} onChange={handleChange} placeholder="Control (e.g., 55)" className="p-2 border rounded-md w-full" />
            <input type="number" name="velocity" value={playerData.velocity} onChange={handleChange} placeholder="Velocity (e.g., 95)" className="p-2 border rounded-md w-full" />
            <input type="number" step="0.1" name="groundball" value={playerData.groundball} onChange={handleChange} placeholder="GB% (e.g., 50.0)" className="p-2 border rounded-md w-full" />
          </>
        )}
      </div>
      
      {/* Visualizations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-4 bg-gray-100 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-center mb-2">Radar Chart</h3>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={mode === "hitting" ? formattedHittingData : formattedPitchingData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="stat" />
              <PolarRadiusAxis />
              <Radar name={playerData.name || "Player"} dataKey="value" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      {playerData.name && playerData.team && (
        <div className="text-center mt-6">
          <h3 className="text-xl font-semibold">
            {playerData.name} - {playerData.team}
          </h3>
        </div>
      )}
    </div>
  );
};

export default AdvancedStatsTool;

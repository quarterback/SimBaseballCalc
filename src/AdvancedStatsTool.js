import React, { useState } from "react";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const AdvancedStatsTool = () => {
  const [pitcherData, setPitcherData] = useState({
    name: "",
    team: "",
    stuff: "",
    movement: "",
    control: "",
    velocity: "",
    gbPercent: "",
    hr9: "",
    bb9: "",
    k9: "",
    lobPercent: "",
    fip: "",
    era: ""
  });

  const handleChange = (e) => {
    setPitcherData({
      ...pitcherData,
      [e.target.name]: e.target.value
    });
  };

  // Derived Metrics
  const xERA = (3.00 + (parseFloat(pitcherData.fip) || 0) * 0.7 + (parseFloat(pitcherData.era) || 0) * 0.3).toFixed(2);
  const iVB = ((parseFloat(pitcherData.movement) || 50) * 0.2 + (parseFloat(pitcherData.gbPercent) || 50) * 0.3).toFixed(1);
  const iHB = ((parseFloat(pitcherData.movement) || 50) * 0.1 + (parseFloat(pitcherData.control) || 50) * 0.2 + (parseFloat(pitcherData.bb9) || 2.5) * 3).toFixed(1);
  const whiffRate = ((parseFloat(pitcherData.k9) || 8) * 2.5).toFixed(1);
  const xwOBAContact = ((parseFloat(pitcherData.hr9) || 1) * 20 + (parseFloat(pitcherData.lobPercent) || 70) * 0.5).toFixed(3);
  
  const radarData = [
    { stat: "Stuff", value: parseFloat(pitcherData.stuff) || 50 },
    { stat: "Movement", value: parseFloat(pitcherData.movement) || 50 },
    { stat: "Control", value: parseFloat(pitcherData.control) || 50 },
    { stat: "Velocity", value: parseFloat(pitcherData.velocity) || 90 }
  ];

  const scatterData = [
    { x: parseFloat(iHB), y: parseFloat(iVB), pitch: "Fastball" },
    { x: parseFloat(iHB) * 0.9, y: parseFloat(iVB) * 1.1, pitch: "Slider" },
    { x: parseFloat(iHB) * 1.2, y: parseFloat(iVB) * 0.8, pitch: "Changeup" }
  ];

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-md rounded-lg">
      <h2 className="text-2xl font-bold text-center mb-4">Advanced Pitching Stats Visualizer</h2>
      
      <div className="grid grid-cols-2 gap-4 mb-6">
        <input type="text" name="name" value={pitcherData.name} onChange={handleChange} placeholder="Pitcher Name" className="p-2 border rounded-md w-full" />
        <input type="text" name="team" value={pitcherData.team} onChange={handleChange} placeholder="Team Name" className="p-2 border rounded-md w-full" />
        <input type="number" name="stuff" value={pitcherData.stuff} onChange={handleChange} placeholder="Stuff" className="p-2 border rounded-md w-full" />
        <input type="number" name="movement" value={pitcherData.movement} onChange={handleChange} placeholder="Movement" className="p-2 border rounded-md w-full" />
        <input type="number" name="control" value={pitcherData.control} onChange={handleChange} placeholder="Control" className="p-2 border rounded-md w-full" />
        <input type="number" name="velocity" value={pitcherData.velocity} onChange={handleChange} placeholder="Velocity (MPH)" className="p-2 border rounded-md w-full" />
      </div>
      
      <div className="grid grid-cols-2 gap-6">
        <div className="p-4 bg-gray-100 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-center mb-2">Pitching Radar Chart</h3>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="stat" />
              <PolarRadiusAxis />
              <Radar name={pitcherData.name || "Pitcher"} dataKey="value" stroke="#ff7300" fill="#ff7300" fillOpacity={0.6} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
        
        <div className="p-4 bg-gray-100 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-center mb-2">Pitch Break Scatter Plot</h3>
          <ResponsiveContainer width="100%" height={300}>
            <ScatterChart>
              <CartesianGrid />
              <XAxis type="number" dataKey="x" name="Horizontal Break" />
              <YAxis type="number" dataKey="y" name="Vertical Break" />
              <Tooltip cursor={{ strokeDasharray: "3 3" }} />
              <Scatter name="Pitches" data={scatterData} fill="#8884d8" />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="mt-6 text-center">
        <h3 className="text-xl font-semibold">{pitcherData.name} - {pitcherData.team}</h3>
        <p className="mt-2 text-gray-700">xERA: {xERA} | Whiff%: {whiffRate}% | xwOBA Contact: {xwOBAContact}</p>
      </div>
    </div>
  );
};

export default AdvancedStatsTool;

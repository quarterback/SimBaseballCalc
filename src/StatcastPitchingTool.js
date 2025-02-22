import React, { useState } from 'react';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ScatterChart, Scatter, CartesianGrid, XAxis, YAxis, ZAxis, Tooltip, ResponsiveContainer, Label } from 'recharts';

const StatcastPitchingTool = () => {
  const [playerData, setPlayerData] = useState({
    name: '',
    team: '',
    era: '',
    fip: '',
    whip: '',
    k_per_9: '',
    bb_per_9: '',
    hr_per_9: '',
    k_pct: '',
    bb_pct: '',
    lob_pct: '',
    babip: '',
    h_per_9: '',
    stuff: '',
    movement: '',
    control: ''
  });

  // Function to calculate advanced sabermetric stats
  const calculateAdvancedStats = (data) => {
    const K9 = parseFloat(data.k_per_9) || 0;
    const BB9 = parseFloat(data.bb_per_9) || 0;
    const HR9 = parseFloat(data.hr_per_9) || 0;
    const FIP = parseFloat(data.fip) || 3.50; // Default to average FIP
    const BABIP = parseFloat(data.babip) || 0.300; // Default to league avg
    const LOB = parseFloat(data.lob_pct) || 70; // Default LOB% is ~70%
    const WHIP = parseFloat(data.whip) || 1.30; // Default WHIP
    const Stuff = parseFloat(data.stuff) || 50; // 20-80 scale
    const Movement = parseFloat(data.movement) || 50;
    const Control = parseFloat(data.control) || 50;

    return {
      xFIP: ((13 * HR9) + (3 * BB9) - (2 * K9)) / 9 + 3.10,
      DRA: (FIP * 0.8) + (BABIP * 10) + (LOB * 0.2),
      pCRA: (FIP * 0.75) + (BABIP * 10) + (LOB * 0.25),
      k_bb_pct: (parseFloat(data.k_pct) - parseFloat(data.bb_pct)).toFixed(1),
      whip_plus: ((WHIP / 1.30) * 100).toFixed(1), // Normalized to league avg WHIP
      hard_contact_pct: ((HR9 * 5) + (parseFloat(data.h_per_9) * 0.5) + (BABIP * 100 * 0.3)).toFixed(1),
      csw_pct: ((K9 * 1.5) - (BB9 * 0.5)).toFixed(1), // Estimated CSW% using K/9 & BB/9
      xERA: (FIP * 0.9 + Movement * 0.05).toFixed(2),
      stuff_plus: (((Stuff - 50) * 1.5) + ((K9 - 9) * 2)).toFixed(1),
    };
  };

  const advancedStats = calculateAdvancedStats(playerData);

  // Radar Chart Data
  const radarData = [
    { stat: 'Stuff+', value: parseFloat(advancedStats.stuff_plus) },
    { stat: 'K-BB%', value: parseFloat(advancedStats.k_bb_pct) },
    { stat: 'Hard Contact%', value: parseFloat(advancedStats.hard_contact_pct) },
    { stat: 'xFIP', value: parseFloat(advancedStats.xFIP) },
    { stat: 'xERA', value: parseFloat(advancedStats.xERA) }
  ];

  // Scatter Plot for pCRA vs Hard Contact%
  const scatterData = [
    { x: parseFloat(advancedStats.pCRA), y: parseFloat(advancedStats.hard_contact_pct) }
  ];

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h1 className="text-3xl font-bold text-center mb-6">OOTP Sabermetrics - Pitching</h1>

      {/* Advanced Stats Display */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Expected Stats</h3>
          <p>xERA: {advancedStats.xERA}</p>
          <p>xFIP: {advancedStats.xFIP}</p>
          <p>pCRA: {advancedStats.pCRA}</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Strikeout & Walk Metrics</h3>
          <p>K-BB%: {advancedStats.k_bb_pct}%</p>
          <p>CSW%: {advancedStats.csw_pct}%</p>
          <p>Stuff+: {advancedStats.stuff_plus}</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Contact Quality</h3>
          <p>Hard Contact%: {advancedStats.hard_contact_pct}%</p>
          <p>WHIP+: {advancedStats.whip_plus}</p>
        </div>
      </div>

      {/* Radar Chart */}
      <ResponsiveContainer width="100%" height={300}>
        <RadarChart data={radarData}>
          <PolarGrid />
          <PolarAngleAxis dataKey="stat" />
          <Radar name="Pitcher Stats" dataKey="value" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
        </RadarChart>
      </ResponsiveContainer>

      {/* Scatter Chart */}
      <ResponsiveContainer width="100%" height={300}>
        <ScatterChart>
          <XAxis dataKey="x" name="pCRA" />
          <YAxis dataKey="y" name="Hard Contact%" />
          <Tooltip />
          <Scatter name="pCRA vs Hard Contact%" data={scatterData} fill="#8884d8" />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
};

export default StatcastPitchingTool;

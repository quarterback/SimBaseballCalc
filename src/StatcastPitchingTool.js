import React, { useState } from 'react';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Scatter, ScatterChart, XAxis, YAxis, ZAxis, Tooltip, ResponsiveContainer } from 'recharts';
import Papa from 'papaparse';

const StatcastPitchingTool = () => {
  const [inputMethod, setInputMethod] = useState('manual'); // 'manual' or 'csv'
  const [loadingData, setLoadingData] = useState(false);
  const [error, setError] = useState('');
  
  const [playerData, setPlayerData] = useState({
    name: '',
    team: '',
    era: '',
    fip: '',
    k9: '',
    bb9: '',
    hr9: '',
    lob_pct: '',
    movement: '',
    control: '',
    stuff: '',
    velocity: '',
    gb_pct: '',
    bb_pct: '',
    arm_slot: '',
  });

  const calculateStatcastMetrics = (data) => {
    const xERA = (parseFloat(data.fip) * 0.85 + parseFloat(data.hr9) * 0.1 + parseFloat(data.bb9) * 0.05).toFixed(2);
    const iVB = (parseFloat(data.movement) * 0.6 + parseFloat(data.stuff) * 0.4).toFixed(1);
    const iHB = (parseFloat(data.movement) * 0.5 + parseFloat(data.control) * 0.5).toFixed(1);
    const whiffPct = (parseFloat(data.k9) * 2 + parseFloat(data.stuff) * 0.5).toFixed(1);
    const xwOBA_Contact = (parseFloat(data.babip) * 0.7 + parseFloat(data.hr9) * 0.3).toFixed(3);
    const iStuff = (parseFloat(data.stuff) * 1.2 + parseFloat(data.velocity) * 0.8).toFixed(1);
    const chasePct = (parseFloat(data.control) * 0.7 + parseFloat(data.bb_pct) * 0.3).toFixed(1);
    const zonePct = (parseFloat(data.bb_pct) * -0.5 + parseFloat(data.control) * 1.5).toFixed(1);
    const hardHitPct = (parseFloat(data.hr9) * 0.6 + parseFloat(data.babip) * 0.4).toFixed(1);
    
    return { xERA, iVB, iHB, whiffPct, xwOBA_Contact, iStuff, chasePct, zonePct, hardHitPct };
  };

  const handleManualInput = (e) => {
    setPlayerData({
      ...playerData,
      [e.target.name]: e.target.value
    });
  };

  const statcastMetrics = calculateStatcastMetrics(playerData);

  const radarData = [
    { stat: 'iVB', value: parseFloat(statcastMetrics.iVB) },
    { stat: 'iHB', value: parseFloat(statcastMetrics.iHB) },
    { stat: 'Whiff%', value: parseFloat(statcastMetrics.whiffPct) },
    { stat: 'Chase%', value: parseFloat(statcastMetrics.chasePct) },
    { stat: 'Zone%', value: parseFloat(statcastMetrics.zonePct) }
  ];

  const scatterData = [
    {
      x: parseFloat(statcastMetrics.iVB),
      y: parseFloat(statcastMetrics.iHB),
      z: parseFloat(statcastMetrics.whiffPct)
    }
  ];

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h1 className="text-3xl font-bold text-center mb-6">OOTP Statcast Simulator - Pitching</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <input type="text" name="name" value={playerData.name} onChange={handleManualInput} placeholder="Player Name" className="p-2 border rounded" />
        <input type="text" name="team" value={playerData.team} onChange={handleManualInput} placeholder="Team" className="p-2 border rounded" />
        <input type="number" name="era" value={playerData.era} onChange={handleManualInput} placeholder="ERA" className="p-2 border rounded" />
        <input type="number" name="fip" value={playerData.fip} onChange={handleManualInput} placeholder="FIP" className="p-2 border rounded" />
        <input type="number" name="k9" value={playerData.k9} onChange={handleManualInput} placeholder="K/9" className="p-2 border rounded" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Pitch Movement</h3>
          <p>Induced Vertical Break: {statcastMetrics.iVB} in</p>
          <p>Induced Horizontal Break: {statcastMetrics.iHB} in</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Expected Stats</h3>
          <p>xERA: {statcastMetrics.xERA}</p>
          <p>xwOBA Contact: {statcastMetrics.xwOBA_Contact}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-semibold text-center mb-4">Pitching Profile</h3>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={radarData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="stat" />
              <PolarRadiusAxis />
              <Radar name="Pitching Stats" dataKey="value" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-center mb-4">Pitch Break vs Whiff%</h3>
          <ResponsiveContainer width="100%" height={300}>
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <XAxis type="number" dataKey="x" name="iVB" unit=" in" />
              <YAxis type="number" dataKey="y" name="iHB" unit=" in" />
              <ZAxis type="number" dataKey="z" range={[50, 400]} name="Whiff%" />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} />
              <Scatter name="Values" data={scatterData} fill="#8884d8" />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default StatcastPitchingTool;

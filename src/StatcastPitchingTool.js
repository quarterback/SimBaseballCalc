import React, { useState } from 'react';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ScatterChart, Scatter, XAxis, YAxis, ZAxis, Tooltip, ResponsiveContainer, Text, Label } from 'recharts';
import Papa from 'papaparse';

const StatcastPitchingTool = () => {
  const [inputMethod, setInputMethod] = useState('manual');
  const [loadingData, setLoadingData] = useState(false);
  const [error, setError] = useState('');
  
  const [playerData, setPlayerData] = useState({
    // Basic Info
    name: '',
    team: '',
    // OOTP Stats
    era: '',
    fip: '',
    whip: '',
    k_per_9: '',
    bb_per_9: '',
    hr_per_9: '',
    k_pct: '',
    bb_pct: '',
    k_minus_bb: '',
    lob_pct: '',
    babip: '',
    h_per_9: '',
    wpa: '',
    war: '',
    // OOTP Ratings (20-80 scale)
    stuff: '',
    movement: '',
    control: '',
    stamina: '',
    // Velocities can be derived from stuff/movement
    velocity: ''
  });

  // Calculate Statcast-style metrics from OOTP data
  const calculateStatcastMetrics = (data) => {
    // Normalize ratings to 0-100 scale
    const normalizeRating = (rating) => {
      if (rating <= 80) {
        return ((rating - 20) / 60) * 100;
      }
      return rating;
    };

    const stuff = normalizeRating(parseFloat(data.stuff) || 0);
    const movement = normalizeRating(parseFloat(data.movement) || 0);
    const control = normalizeRating(parseFloat(data.control) || 0);

    // Whiff% - based on K%, Stuff rating
    const whiffPct = (
      (parseFloat(data.k_pct) * 0.7) +
      (stuff * 0.3)
    ).toFixed(1);

    // Chase% - based on BB%, Control rating
    const chasePct = (
      30 + // Base chase rate
      (control * 0.2) -
      (parseFloat(data.bb_pct) * 0.5)
    ).toFixed(1);

    // Vertical Break - based on Movement rating
    const verticalBreak = (
      (movement * 0.6) +
      (stuff * 0.4)
    ).toFixed(1);

    // Horizontal Break - based on Movement rating
    const horizontalBreak = (
      (movement * 0.7) +
      (control * 0.3)
    ).toFixed(1);

    // Hard Hit% - based on HR/9, H/9, BABIP
    const hardHitPct = (
      (parseFloat(data.hr_per_9) * 5) +
      (parseFloat(data.h_per_9) * 0.5) +
      (parseFloat(data.babip) * 100 * 0.3)
    ).toFixed(1);

    // Stuff+ - based on Stuff rating and K%
    const stuffPlus = (
      100 + // League average
      (stuff - 50) * 0.8 +
      ((parseFloat(data.k_pct) - 22) * 2) // Assume 22% is league average K%
    ).toFixed(1);

    // Edge% - based on Control rating and BB%
    const edgePct = (
      40 + // Base edge rate
      (control * 0.2) -
      (parseFloat(data.bb_pct) * 0.5)
    ).toFixed(1);

    return {
      whiffPct,
      chasePct,
      verticalBreak,
      horizontalBreak,
      hardHitPct,
      stuffPlus,
      edgePct
    };
  };

  const handleFileUpload = async (file) => {
    setLoadingData(true);
    setError('');

    try {
      const text = await file.text();
      Papa.parse(text, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        complete: (results) => {
          if (results.errors.length > 0) {
            setError('Error parsing CSV file');
            return;
          }

          const player = results.data[0];
          setPlayerData({
            name: player.Name || '',
            team: player.Team || '',
            era: player.ERA || '',
            fip: player.FIP || '',
            whip: player.WHIP || '',
            k_per_9: player['K/9'] || '',
            bb_per_9: player['BB/9'] || '',
            hr_per_9: player['HR/9'] || '',
            k_pct: player['K%'] || '',
            bb_pct: player['BB%'] || '',
            k_minus_bb: player['K-BB%'] || '',
            lob_pct: player['LOB%'] || '',
            babip: player.BABIP || '',
            h_per_9: player['H/9'] || '',
            wpa: player.WPA || '',
            war: player.WAR || '',
            stuff: player.Stuff || '',
            movement: player.Movement || '',
            control: player.Control || '',
            stamina: player.Stamina || '',
            velocity: player.Velocity || ''
          });
          setLoadingData(false);
        }
      });
    } catch (error) {
      setError(`Error reading file: ${error.message}`);
      setLoadingData(false);
    }
  };

  const handleManualInput = (e) => {
    setPlayerData({
      ...playerData,
      [e.target.name]: e.target.value
    });
  };

  // Calculate metrics for visualizations
  const statcastMetrics = calculateStatcastMetrics(playerData);

  // Data for radar chart
  const radarData = [
    { stat: 'Stuff+', value: parseFloat(statcastMetrics.stuffPlus) },
    { stat: 'Whiff%', value: parseFloat(statcastMetrics.whiffPct) },
    { stat: 'Chase%', value: parseFloat(statcastMetrics.chasePct) },
    { stat: 'Edge%', value: parseFloat(statcastMetrics.edgePct) },
    { stat: 'Control', value: parseFloat(playerData.control) }
  ];

  // Data for movement plot (Vertical vs Horizontal Break)
  const moveData = [
    {
      x: parseFloat(statcastMetrics.horizontalBreak),
      y: parseFloat(statcastMetrics.verticalBreak),
      z: parseFloat(statcastMetrics.stuffPlus)
    }
  ];

  // Custom chart title component
  const ChartTitle = ({ title }) => (
    <text
      x="50%"
      y="20"
      textAnchor="middle"
      className="text-lg font-bold"
      style={{ fill: '#1a1a1a' }}
    >
      {title}
    </text>
  );

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h1 className="text-3xl font-bold text-center mb-6">OOTP Statcast Simulator - Pitching</h1>
      
      {/* Input Method Selection */}
      <div className="mb-6">
        <div className="flex justify-center space-x-4">
          <button
            className={`px-4 py-2 rounded ${inputMethod === 'manual' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            onClick={() => setInputMethod('manual')}
          >
            Manual Input
          </button>
          <button
            className={`px-4 py-2 rounded ${inputMethod === 'csv' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            onClick={() => setInputMethod('csv')}
          >
            CSV Upload
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {inputMethod === 'csv' ? (
        <div className="mb-6">
          <input
            type="file"
            accept=".csv"
            onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
            className="w-full p-2 border rounded"
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Manual Input Fields */}
          <input
            type="text"
            name="name"
            value={playerData.name}
            onChange={handleManualInput}
            placeholder="Player Name"
            className="p-2 border rounded"
          />
          <input
            type="text"
            name="team"
            value={playerData.team}
            onChange={handleManualInput}
            placeholder="Team"
            className="p-2 border rounded"
          />
          
          {/* Stats Inputs */}
          {/* ERA, FIP, WHIP */}
          <input
            type="number"
            name="era"
            value={playerData.era}
            onChange={handleManualInput}
            placeholder="ERA"
            className="p-2 border rounded"
            step="0.01"
          />
          <input
            type="number"
            name="fip"
            value={playerData.fip}
            onChange={handleManualInput}
            placeholder="FIP"
            className="p-2 border rounded"
            step="0.01"
          />
          <input
            type="number"
            name="whip"
            value={playerData.whip}
            onChange={handleManualInput}
            placeholder="WHIP"
            className="p-2 border rounded"
            step="0.01"
          />
          
          {/* K/9, BB/9, HR/9 */}
          <input
            type="number"
            name="k_per_9"
            value={playerData.k_per_9}
            onChange={handleManualInput}
            placeholder="K/9"
            className="p-2 border rounded"
            step="0.01"
          />
          <input
            type="number"
            name="bb_per_9"
            value={playerData.bb_per_9}
            onChange={handleManualInput}
            placeholder="BB/9"
            className="p-2 border rounded"
            step="0.01"
          />
          <input
            type="number"
            name="hr_per_9"
            value={playerData.hr_per_9}
            onChange={handleManualInput}
            placeholder="HR/9"
            className="p-2 border rounded"
            step="0.01"
          />
          
          {/* K%, BB%, K-BB% */}
          <input
            type="number"
            name="k_pct"
            value={playerData.k_pct}
            onChange={handleManualInput}
            placeholder="K%"
            className="p-2 border rounded"
            step="0.1"
          />
          <input
            type="number"
            name="bb_pct"
            value={playerData.bb_pct}
            onChange={handleManualInput}
            placeholder="BB%"
            className="p-2 border rounded"
            step="0.1"
          />
          <input
            type="number"
            name="k_minus_bb"
            value={playerData.k_minus_bb}
            onChange={handleManualInput}
            placeholder="K-BB%"
            className="p-2 border rounded"
            step="0.1"
          />
          
          {/* Other Stats */}
          <input
            type="number"
            name="lob_pct"
            value={playerData.lob_pct}
            onChange={handleManualInput}
            placeholder="LOB%"
            className="p-2 border rounded"
            step="0.1"
          />
          <input
            type="number"
            name="babip"
            value={playerData.babip}
            onChange={handleManualInput}
            placeholder="BABIP"
            className="p-2 border rounded"
            step="0.001"
          />
          <input
            type="number"
            name="h_per_9"
            value={playerData.h_per_9}
            onChange={handleManualInput}
            placeholder="H/9"
            className="p-2 border rounded"
            step="0.01"
          />
          
          {/* Ratings */}
          <input
            type="number"
            name="stuff"
            value={playerData.stuff}
            onChange={handleManualInput}
            placeholder="Stuff Rating (20-80)"
            className="p-2 border rounded"
          />
          <input
            type="number"
            name="movement"
            value={playerData.movement}
            onChange={handleManualInput}
            placeholder="Movement Rating (20-80)"
            className="p-2 border rounded"
          />
          <input
            type="number"
            name="control"
            value={playerData.control}
            onChange={handleManualInput}
            placeholder="Control Rating (20-80)"
            className="p-2 border rounded"
          />
          <input
            type="number"
            name="stamina"
            value={playerData.stamina}
            onChange={handleManualInput}
            placeholder="Stamina Rating (20-80)"
            className="p-2 border rounded"
          />
        </div>
      )}

      {/* Statcast Metrics Display */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Pitch Quality</h3>
          <p>Stuff+: {statcastMetrics.stuffPlus}</p>
          <p>Whiff%: {statcastMetrics.whiffPct}%</p>
          <p>Chase%: {statcastMetrics.chasePct}%</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Movement</h3>
          <p>Vertical Break: {statcastMetrics.verticalBreak} in</p>
          <p>Horizontal Break: {statcastMetrics.horizontalBreak} in</p>
          <p>Edge%: {statcastMetrics.edgePct}%</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Contact Quality</h3>
          <p>Hard Hit%: {statcastMetrics.hardHitPct}%</p>
          <p>K-BB%: {playerData.k_minus_bb}%</p>
          <p>BABIP: {playerData.babip}</p>
        </div>
      </div>

      {/* Visualizations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-semibold text-center mb-4">{playerData.name} - {playerData.team} - Pitch Arsenal</h3>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={radarData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="stat" />
              <PolarRadiusAxis />
              <Tooltip />
              <Radar
                name={playerData.name}
                dataKey="value"
                stroke="#8884d8"
                fill="#8884d8"
                fillOpacity={0.6}
              />
              <text
                x={300}
                y={25}
                textAnchor="middle"
                dominantBaseline="hanging"
                className="text-sm font-medium"
              >
                {playerData.name} - {playerData.team}
              </text>
            </RadarChart>
          </ResponsiveContainer>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-center mb-4">{playerData.name} - {playerData.team} - Pitch Movement</h3>
          <ResponsiveContainer width="100%" height={300}>
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <CartesianGrid />
              <XAxis 
                type="number" 
                dataKey="x" 
                name="Horizontal Break" 
                unit=" in"
                label={{ value: 'Horizontal Break (in)', position: 'bottom' }}
              />
              <YAxis 
                type="number" 
                dataKey="y" 
                name="Vertical Break" 
                unit=" in"
                label={{ value: 'Vertical Break (in)', angle: -90, position: 'left' }}
              />
              <ZAxis type="number" dataKey="z" range={[50, 400]} name="Stuff+" />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} />
              <Scatter name="Movement" data={moveData} fill="#8884d8" />
              <text
                x={300}
                y={25}
                textAnchor="middle"
                dominantBaseline="hanging"
                className="text-sm font-medium"
              >
                {playerData.name} - {playerData.team}
              </text>
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default StatcastPitchingTool;

import React, { useState } from 'react';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Scatter, ScatterChart, XAxis, YAxis, ZAxis, Tooltip, ResponsiveContainer } from 'recharts';
import Papa from 'papaparse';

const StatcastHittingTool = () => {
  const [inputMethod, setInputMethod] = useState('manual'); // 'manual' or 'csv'
  const [loadingData, setLoadingData] = useState(false);
  const [error, setError] = useState('');
  
  const [playerData, setPlayerData] = useState({
    // Basic Info
    name: '',
    team: '',
    // OOTP Stats
    avg: '',
    obp: '',
    slg: '',
    iso: '',
    babip: '',
    hr: '',
    ab: '',
    ld_pct: '',
    gb_pct: '',
    fb_pct: '',
    pull_pct: '',
    center_pct: '',
    oppo_pct: '',
    // Contact & Eye Ratings
    contact: '',
    gap: '',
    power: '',
    eye: '',
    avoid_k: ''
  });

  // Calculate Statcast-style metrics
  const calculateStatcastMetrics = (data) => {
    // Normalize ratings to 0-100 scale if they're 20-80
    const normalizeRating = (rating) => {
      if (rating <= 80) {
        return ((rating - 20) / 60) * 100;
      }
      return rating;
    };

    const contact = normalizeRating(parseFloat(data.contact) || 0);
    const power = normalizeRating(parseFloat(data.power) || 0);
    const eye = normalizeRating(parseFloat(data.eye) || 0);
    const avoidK = normalizeRating(parseFloat(data.avoid_k) || 0);

    // Calculate derived metrics
    const barrelPct = (
      (parseFloat(data.iso) * 100) * 0.4 +
      (parseFloat(data.hr) / parseFloat(data.ab)) * 100 * 0.6
    ).toFixed(1);

    const sweetSpotPct = (
      (parseFloat(data.ld_pct) * 0.7) +
      (parseFloat(data.babip) * 100 * 0.3)
    ).toFixed(1);

    const xwOBA = (
      parseFloat(data.obp) * 0.4 +
      parseFloat(data.slg) * 0.4 +
      parseFloat(data.babip) * 0.2
    ).toFixed(3);

    const hardHitPct = (
      (parseFloat(data.iso) * 100 * 0.3) +
      (parseFloat(data.hr) / parseFloat(data.ab) * 100 * 0.4) +
      (parseFloat(data.babip) * 100 * 0.3)
    ).toFixed(1);

    const exitVelo = (
      (power * 0.5) +
      (parseFloat(data.iso) * 100 * 0.3) +
      (parseFloat(data.babip) * 100 * 0.2) +
      85 // Base exit velocity
    ).toFixed(1);

    const launchAngle = (
      (parseFloat(data.fb_pct) * 0.4) +
      (parseFloat(data.ld_pct) * 0.4) -
      (parseFloat(data.gb_pct) * 0.2) +
      12 // Average launch angle offset
    ).toFixed(1);

    return {
      barrelPct,
      sweetSpotPct,
      xwOBA,
      hardHitPct,
      exitVelo,
      launchAngle
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

          const player = results.data[0]; // Take first player from CSV
          setPlayerData({
            name: player.Name || '',
            team: player.Team || '',
            avg: player.AVG || '',
            obp: player.OBP || '',
            slg: player.SLG || '',
            iso: player.ISO || '',
            babip: player.BABIP || '',
            hr: player.HR || '',
            ab: player.AB || '',
            ld_pct: player.LD || '',
            gb_pct: player.GB || '',
            fb_pct: player.FB || '',
            pull_pct: player.Pull || '',
            center_pct: player.Center || '',
            oppo_pct: player.Oppo || '',
            contact: player.Contact || '',
            gap: player.Gap || '',
            power: player.Power || '',
            eye: player.Eye || '',
            avoid_k: player.AvoidK || ''
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
    { stat: 'Barrel%', value: parseFloat(statcastMetrics.barrelPct) },
    { stat: 'Sweet Spot%', value: parseFloat(statcastMetrics.sweetSpotPct) },
    { stat: 'Hard Hit%', value: parseFloat(statcastMetrics.hardHitPct) },
    { stat: 'Pull%', value: parseFloat(playerData.pull_pct) },
    { stat: 'Oppo%', value: parseFloat(playerData.oppo_pct) }
  ];

  // Data for scatter plot (Exit Velo vs Launch Angle)
  const scatterData = [
    {
      x: parseFloat(statcastMetrics.launchAngle),
      y: parseFloat(statcastMetrics.exitVelo),
      z: parseFloat(statcastMetrics.barrelPct)
    }
  ];

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h1 className="text-3xl font-bold text-center mb-6">OOTP Statcast Simulator - Hitting</h1>
      
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
          {/* Basic Info */}
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
          <input
            type="number"
            name="avg"
            value={playerData.avg}
            onChange={handleManualInput}
            placeholder="AVG"
            className="p-2 border rounded"
            step="0.001"
          />
          <input
            type="number"
            name="obp"
            value={playerData.obp}
            onChange={handleManualInput}
            placeholder="OBP"
            className="p-2 border rounded"
            step="0.001"
          />
          <input
            type="number"
            name="slg"
            value={playerData.slg}
            onChange={handleManualInput}
            placeholder="SLG"
            className="p-2 border rounded"
            step="0.001"
          />
          <input
            type="number"
            name="iso"
            value={playerData.iso}
            onChange={handleManualInput}
            placeholder="ISO"
            className="p-2 border rounded"
            step="0.001"
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
            name="hr"
            value={playerData.hr}
            onChange={handleManualInput}
            placeholder="HR"
            className="p-2 border rounded"
          />
          <input
            type="number"
            name="ab"
            value={playerData.ab}
            onChange={handleManualInput}
            placeholder="AB"
            className="p-2 border rounded"
          />
          
          {/* Batted Ball Profile */}
          <input
            type="number"
            name="ld_pct"
            value={playerData.ld_pct}
            onChange={handleManualInput}
            placeholder="LD%"
            className="p-2 border rounded"
            step="0.1"
          />
          <input
            type="number"
            name="gb_pct"
            value={playerData.gb_pct}
            onChange={handleManualInput}
            placeholder="GB%"
            className="p-2 border rounded"
            step="0.1"
          />
          <input
            type="number"
            name="fb_pct"
            value={playerData.fb_pct}
            onChange={handleManualInput}
            placeholder="FB%"
            className="p-2 border rounded"
            step="0.1"
          />
          
          {/* Spray Chart */}
          <input
            type="number"
            name="pull_pct"
            value={playerData.pull_pct}
            onChange={handleManualInput}
            placeholder="Pull%"
            className="p-2 border rounded"
            step="0.1"
          />
          <input
            type="number"
            name="center_pct"
            value={playerData.center_pct}
            onChange={handleManualInput}
            placeholder="Center%"
            className="p-2 border rounded"
            step="0.1"
          />
          <input
            type="number"
            name="oppo_pct"
            value={playerData.oppo_pct}
            onChange={handleManualInput}
            placeholder="Oppo%"
            className="p-2 border rounded"
            step="0.1"
          />
          
          {/* Ratings */}
          <input
            type="number"
            name="contact"
            value={playerData.contact}
            onChange={handleManualInput}
            placeholder="Contact Rating"
            className="p-2 border rounded"
          />
          <input
            type="number"
            name="gap"
            value={playerData.gap}
            onChange={handleManualInput}
            placeholder="Gap Power Rating"
            className="p-2 border rounded"
          />
          <input
            type="number"
            name="power"
            value={playerData.power}
            onChange={handleManualInput}
            placeholder="Power Rating"
            className="p-2 border rounded"
          />
          <input
            type="number"
            name="eye"
            value={playerData.eye}
            onChange={handleManualInput}
            placeholder="Eye Rating"
            className="p-2 border rounded"
          />
          <input
            type="number"
            name="avoid_k"
            value={playerData.avoid_k}
            onChange={handleManualInput}
            placeholder="Avoid K Rating"
            className="p-2 border rounded"
          />
        </div>
      )}

      {/* Statcast Metrics Display */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Quality of Contact</h3>
          <p>Barrel%: {statcastMetrics.barrelPct}%</p>
          <p>Sweet Spot%: {statcastMetrics.sweetSpotPct}%</p>
          <p>Hard Hit%: {statcastMetrics.hardHitPct}%</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Expected Stats</h3>
          <p>xwOBA: {statcastMetrics.xwOBA}</p>
          <p>Exit Velocity: {statcastMetrics.exitVelo} mph</p>
          <p>Launch Angle: {statcastMetrics.launchAngle}°</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
         <h3 className="text-lg font-semibold mb-2">Spray Chart</h3>
          <p>Pull%: {playerData.pull_pct}%</p>
          <p>Center%: {playerData.center_pct}%</p>
          <p>Oppo%: {playerData.oppo_pct}%</p>
        </div>
      </div>

      {/* Visualizations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-semibold text-center mb-4">Hitting Profile</h3>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={radarData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="stat" />
              <PolarRadiusAxis />
              <Radar
                name="Hitting Stats"
                dataKey="value"
                stroke="#8884d8"
                fill="#8884d8"
                fillOpacity={0.6}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-center mb-4">Exit Velocity vs Launch Angle</h3>
          <ResponsiveContainer width="100%" height={300}>
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <XAxis type="number" dataKey="x" name="Launch Angle" unit="°" />
              <YAxis type="number" dataKey="y" name="Exit Velocity" unit=" mph" />
              <ZAxis type="number" dataKey="z" range={[50, 400]} name="Barrel%" />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} />
              <Scatter name="Values" data={scatterData} fill="#8884d8" />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default StatcastHittingTool;

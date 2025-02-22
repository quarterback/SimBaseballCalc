import React, { useState } from 'react';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Scatter, ScatterChart, XAxis, YAxis, ZAxis, Tooltip, ResponsiveContainer } from 'recharts';
import Papa from 'papaparse';

const StatcastHittingTool = () => {
  const [inputMethod, setInputMethod] = useState('manual');
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
    war: '',
    hrPerPa: '', // HR/PA
    bb_pct: '',
    k_pct: '',
    woba: '',
    wrc_plus: '',
    ops: '',
    ops_plus: '',
    // OOTP Ratings (20-80 scale)
    contact: '',
    gap: '',
    power: '',
    eye: '',
    avoid_k: '',
    babip_pot: ''
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

    // Get normalized ratings
    const contact = normalizeRating(parseFloat(data.contact) || 0);
    const power = normalizeRating(parseFloat(data.power) || 0);
    const gap = normalizeRating(parseFloat(data.gap) || 0);
    
    // Calculate approximated Statcast metrics
    
    // Barrel % - based on power rating, ISO, and HR rate
    const barrelPct = (
      (power * 0.4) +
      (parseFloat(data.iso) * 100 * 0.3) +
      (parseFloat(data.hrPerPa) * 100 * 0.3)
    ).toFixed(1);

    // Exit Velocity - based on power, gap power, and overall hitting effectiveness
    const exitVelo = (
      85 + // Base exit velocity
      (power * 0.15) +
      (gap * 0.1) +
      (parseFloat(data.ops_plus) * 0.05)
    ).toFixed(1);

    // Launch Angle - approximated from power vs contact profile
    const launchAngle = (
      12 + // League average launch angle
      (power * 0.1) -
      (contact * 0.05) +
      (parseFloat(data.iso) * 20)
    ).toFixed(1);

    // Hard Hit % - based on power, ISO, and BABIP
    const hardHitPct = (
      (power * 0.4) +
      (parseFloat(data.iso) * 100 * 0.3) +
      (parseFloat(data.babip) * 100 * 0.3)
    ).toFixed(1);

    // xwOBAcon - expected wOBA on contact
    const xwOBAcon = (
      parseFloat(data.woba) * 0.7 +
      (power / 100) * 0.3
    ).toFixed(3);

    // Sweet Spot % - based on contact quality indicators
    const sweetSpotPct = (
      (contact * 0.3) +
      (parseFloat(data.babip) * 100 * 0.4) +
      (parseFloat(data.ops) * 20 * 0.3)
    ).toFixed(1);

    return {
      barrelPct,
      exitVelo,
      launchAngle,
      hardHitPct,
      xwOBAcon,
      sweetSpotPct
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
            avg: player.AVG || '',
            obp: player.OBP || '',
            slg: player.SLG || '',
            iso: player.ISO || '',
            babip: player.BABIP || '',
            war: player.WAR || '',
            hrPerPa: (player.HR / player.PA) || '',
            bb_pct: player['BB%'] || '',
            k_pct: player['K%'] || '',
            woba: player.wOBA || '',
            wrc_plus: player['wRC+'] || '',
            ops: player.OPS || '',
            ops_plus: player['OPS+'] || '',
            contact: player.Contact || '',
            gap: player.Gap || '',
            power: player.Power || '',
            eye: player.Eye || '',
            avoid_k: player.AvoidK || '',
            babip_pot: player.BABIPPot || ''
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
    { stat: 'Hard Hit%', value: parseFloat(statcastMetrics.hardHitPct) },
    { stat: 'Barrel%', value: parseFloat(statcastMetrics.barrelPct) },
    { stat: 'Sweet Spot%', value: parseFloat(statcastMetrics.sweetSpotPct) },
    { stat: 'Contact', value: parseFloat(playerData.contact) },
    { stat: 'Power', value: parseFloat(playerData.power) }
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
      <h1 className="text-3xl font-bold text-center mb-6">OOTP Statcast Simulator</h1>
      
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
            name="war"
            value={playerData.war}
            onChange={handleManualInput}
            placeholder="WAR"
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
            name="k_pct"
            value={playerData.k_pct}
            onChange={handleManualInput}
            placeholder="K%"
            className="p-2 border rounded"
            step="0.1"
          />
          <input
            type="number"
            name="woba"
            value={playerData.woba}
            onChange={handleManualInput}
            placeholder="wOBA"
            className="p-2 border rounded"
            step="0.001"
          />
          <input
            type="number"
            name="wrc_plus"
            value={playerData.wrc_plus}
            onChange={handleManualInput}
            placeholder="wRC+"
            className="p-2 border rounded"
          />
          <input
            type="number"
            name="ops"
            value={playerData.ops}
            onChange={handleManualInput}
            placeholder="OPS"
            className="p-2 border rounded"
            step="0.001"
          />
          <input
            type="number"
            name="ops_plus"
            value={playerData.ops_plus}
            onChange={handleManualInput}
            placeholder="OPS+"
            className="p-2 border rounded"
          />
          
          {/* Ratings Inputs */}
          <input
            type="number"
            name="contact"
            value={playerData.contact}
            onChange={handleManualInput}
            placeholder="Contact Rating (20-80)"
            className="p-2 border rounded"
          />
          <input
            type="number"
            name="gap"
            value={playerData.gap}
            onChange={handleManualInput}
            placeholder="Gap Power Rating (20-80)"
            className="p-2 border rounded"
          />
          <input
            type="number"
            name="power"
            value={playerData.power}
            onChange={handleManualInput}
            placeholder="Power Rating (20-80)"
            className="p-2 border rounded"
          />
          <input
            type="number"
            name="eye"
            value={playerData.eye}
            onChange={handleManualInput}
            placeholder="Eye Rating (20-80)"
            className="p-2 border rounded"
          />
          <input
            type="number"
            name="avoid_k"
            value={playerData.avoid_k}
            onChange={handleManualInput}
            placeholder="Avoid K Rating (20-80)"
            className="p-2 border rounded"
          />
        </div>
      )}

      {/* Statcast Metrics Display */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Quality of Contact</h3>
          <p>Barrel%: {statcastMetrics.barrelPct}%</p>
          <p>Hard Hit%: {statcastMetrics.hardHitPct}%</p>
          <p>Sweet Spot%: {statcastMetrics.sweetSpotPct}%</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Contact Metrics</h3>
          <p>Exit Velocity: {statcastMetrics.exitVelo} mph</p>
          <p>Launch Angle: {statcastMetrics.launchAngle}°</p>
          <p>xwOBAcon: {statcastMetrics.xwOBAcon}</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Player Profile</h3>
          <p>Contact: {playerData.contact}</p>
          <p>Power: {playerData.power}</p>
          <p>wRC+: {playerData.wrc_plus}</p>
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
    </div>
  );
};

export default StatcastHittingTool;

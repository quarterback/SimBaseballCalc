import React, { useState } from 'react';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ScatterChart, Scatter, XAxis, YAxis, ZAxis, Tooltip, ResponsiveContainer } from 'recharts';

const StatcastHittingTool = () => {
  const [playerData, setPlayerData] = useState({
    name: '',
    team: '',
    avg: '',
    obp: '',
    slg: '',
    iso: '',
    babip: '',
    war: '',
    hrPerPa: '',
    bb_pct: '',
    k_pct: '',
    woba: '',
    wrc_plus: '',
    ops: '',
    ops_plus: '',
    contact: '',
    gap: '',
    power: '',
    eye: '',
    avoid_k: ''
  });

  // Function to calculate new advanced hitting metrics
  const calculateAdvancedStats = (data) => {
    const AVG = parseFloat(data.avg) || 0.260; // Default to league avg
    const OBP = parseFloat(data.obp) || 0.330;
    const SLG = parseFloat(data.slg) || 0.430;
    const ISO = parseFloat(data.iso) || 0.140;
    const BABIP = parseFloat(data.babip) || 0.300;
    const HR_PA = parseFloat(data.hrPerPa) || 0.040; // Home Run per PA
    const OPS_PLUS = parseFloat(data.ops_plus) || 100;
    const WRC_PLUS = parseFloat(data.wrc_plus) || 100;
    const BB_PCT = parseFloat(data.bb_pct) || 8.0;
    const K_PCT = parseFloat(data.k_pct) || 22.0;
    const CONTACT = parseFloat(data.contact) || 50;
    const POWER = parseFloat(data.power) || 50;
    const EYE = parseFloat(data.eye) || 50;

    return {
      xBA: ((BABIP * 0.85) + (AVG * 0.15)).toFixed(3),
      xSLG: ((SLG * 0.9) + (ISO * 0.1)).toFixed(3),
      xWOBA: ((OBP * 0.6) + (SLG * 0.3) + (HR_PA * 0.1)).toFixed(3),
      BIP_PCT: (100 - (BB_PCT + K_PCT)).toFixed(1),
      xOPS_PLUS: ((OPS_PLUS * 0.9) + (ISO * 100 * 0.1)).toFixed(1),
      barrelPct: ((POWER * 0.4) + (ISO * 100 * 0.3) + (HR_PA * 100 * 0.3)).toFixed(1),
      hardHitPct: ((ISO * 100 * 0.3) + (SLG * 100 * 0.3) + (BABIP * 100 * 0.4)).toFixed(1),
      sweetSpotPct: (BABIP * 100 * 0.5).toFixed(1),
      chasePct: ((EYE * 0.4) - (K_PCT * 0.6)).toFixed(1),
      contactPlus: (((CONTACT - 50) * 1.5) + ((100 - (BB_PCT + K_PCT) - 70) * 2)).toFixed(1)
    };
  };

  const advancedStats = calculateAdvancedStats(playerData);

  // Radar Chart Data
  const radarData = [
    { stat: 'Hard Hit%', value: parseFloat(advancedStats.hardHitPct) },
    { stat: 'Barrel%', value: parseFloat(advancedStats.barrelPct) },
    { stat: 'Sweet Spot%', value: parseFloat(advancedStats.sweetSpotPct) },
    { stat: 'Contact+', value: parseFloat(advancedStats.contactPlus) },
    { stat: 'xOPS+', value: parseFloat(advancedStats.xOPS_PLUS) }
  ];

  // Scatter Plot (xSLG vs xWOBA)
  const scatterData = [
    { x: parseFloat(advancedStats.xSLG), y: parseFloat(advancedStats.xWOBA) }
  ];

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h1 className="text-3xl font-bold text-center mb-6">OOTP Sabermetrics - Hitting</h1>

      {/* Advanced Stats Display */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Expected Stats</h3>
          <p>xBA: {advancedStats.xBA}</p>
          <p>xSLG: {advancedStats.xSLG}</p>
          <p>xWOBA: {advancedStats.xWOBA}</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Contact & Power</h3>
          <p>Contact+: {advancedStats.contactPlus}</p>
          <p>Hard Hit%: {advancedStats.hardHitPct}%</p>
          <p>Barrel%: {advancedStats.barrelPct}%</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Plate Discipline</h3>
          <p>BIP%: {advancedStats.BIP_PCT}%</p>
          <p>Chase%: {advancedStats.chasePct}%</p>
        </div>
      </div>

      {/* Radar Chart */}
      <ResponsiveContainer width="100%" height={300}>
        <RadarChart data={radarData}>
          <PolarGrid />
          <PolarAngleAxis dataKey="stat" />
          <Radar name="Hitter Stats" dataKey="value" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
        </RadarChart>
      </ResponsiveContainer>

      {/* Scatter Chart */}
      <ResponsiveContainer width="100%" height={300}>
        <ScatterChart>
          <XAxis dataKey="x" name="xSLG" />
          <YAxis dataKey="y" name="xWOBA" />
          <Tooltip />
          <Scatter name="xSLG vs xWOBA" data={scatterData} fill="#8884d8" />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
};

export default StatcastHittingTool;

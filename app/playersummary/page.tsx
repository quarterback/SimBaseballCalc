// app/playersummary/page.tsx
'use client';

import React, { useState } from 'react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from 'recharts';

const AdvancedStatsTool = () => {
  const [mode, setMode] = useState('hitting');
  const [playerData, setPlayerData] = useState({
    name: '',
    team: '',
    obp: '',
    war: '',
    iso: '',
    opsPlus: '',
    babip: '',
    woba: '',
    stuff: '',
    movement: '',
    control: '',
    velocity: '',
    gbPercent: '',
    era: '',
    fip: '',
    kPer9: '',
    bbPer9: '',
  });

  const handleChange = (e) => {
    setPlayerData({
      ...playerData,
      [e.target.name]: e.target.value,
    });
  };

  const inferredStats =
    mode === 'hitting'
      ? [
          { stat: 'xOBP', value: (parseFloat(playerData.obp) * 0.98).toFixed(3) || 0 },
          { stat: 'xISO', value: (parseFloat(playerData.iso) * 1.05).toFixed(3) || 0 },
          { stat: 'xBABIP', value: (parseFloat(playerData.babip) * 0.97).toFixed(3) || 0 },
          { stat: 'xWOBA', value: (parseFloat(playerData.woba) * 1.02).toFixed(3) || 0 },
          { stat: 'Adjusted WAR', value: (parseFloat(playerData.war) * 1.1).toFixed(2) || 0 },
        ]
      : [
          {
            stat: 'xERA',
            value:
              (parseFloat(playerData.era) * 0.9 +
                parseFloat(playerData.movement) * 0.05).toFixed(2) || 0,
          },
          {
            stat: 'xFIP',
            value:
              (parseFloat(playerData.fip) * 0.95 +
                parseFloat(playerData.control) * 0.03).toFixed(2) || 0,
          },
          { stat: 'xGB%', value: (parseFloat(playerData.gbPercent) * 1.02).toFixed(1) || 0 },
          { stat: 'Stuff+', value: (parseFloat(playerData.stuff) * 1.1).toFixed(1) || 0 },
          { stat: 'K/9+', value: (parseFloat(playerData.kPer9) * 1.05).toFixed(2) || 0 },
        ];

  const formattedData =
    mode === 'hitting'
      ? [
          { stat: 'OBP', value: parseFloat(playerData.obp) || 0 },
          { stat: 'WAR', value: parseFloat(playerData.war) || 0 },
          { stat: 'ISO', value: parseFloat(playerData.iso) || 0 },
          { stat: 'OPS+', value: parseFloat(playerData.opsPlus) || 0 },
          { stat: 'BABIP', value: parseFloat(playerData.babip) || 0 },
        ]
      : [
          { stat: 'Stuff', value: parseFloat(playerData.stuff) || 0 },
          { stat: 'Movement', value: parseFloat(playerData.movement) || 0 },
          { stat: 'Control', value: parseFloat(playerData.control) || 0 },
          { stat: 'Velocity', value: parseFloat(playerData.velocity) || 0 },
          { stat: 'GB%', value: parseFloat(playerData.gbPercent) || 0 },
        ];

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-md rounded-lg">
      <h2 className="text-2xl font-bold text-center mb-4">Advanced Stats Visualizer</h2>
      <div className="flex justify-center mb-4">
        <button
          className={`px-4 py-2 mx-2 rounded ${
            mode === 'hitting' ? 'bg-blue-500 text-white' : 'bg-gray-300'
          }`}
          onClick={() => setMode('hitting')}
        >
          Hitting
        </button>
        <button
          className={`px-4 py-2 mx-2 rounded ${
            mode === 'pitching' ? 'bg-blue-500 text-white' : 'bg-gray-300'
          }`}
          onClick={() => setMode('pitching')}
        >
          Pitching
        </button>
      </div>

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
        {mode === 'hitting' ? (
          <>
            <input
              type="number"
              name="obp"
              value={playerData.obp}
              onChange={handleChange}
              placeholder="OBP (e.g., .360)"
              className="p-2 border rounded-md w-full"
            />
            <input
              type="number"
              name="woba"
              value={playerData.woba}
              onChange={handleChange}
              placeholder="wOBA (e.g., .350)"
              className="p-2 border rounded-md w-full"
            />
          </>
        ) : (
          <>
            <input
              type="number"
              name="era"
              value={playerData.era}
              onChange={handleChange}
              placeholder="ERA (e.g., 3.20)"
              className="p-2 border rounded-md w-full"
            />
            <input
              type="number"
              name="fip"
              value={playerData.fip}
              onChange={handleChange}
              placeholder="FIP (e.g., 3.50)"
              className

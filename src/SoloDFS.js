import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './components/ui/card';
import Papa from 'papaparse';

const OOTPSoloDFS = () => {
  const [roster, setRoster] = useState([]);
  const [availablePlayers, setAvailablePlayers] = useState([]);
  const [benchmarkMode, setBenchmarkMode] = useState('historical'); // 'historical', 'random', 'fixed'
  const [gameLength, setGameLength] = useState('day'); // 'day', 'week', 'month'
  const [salaryCap, setSalaryCap] = useState(50000);
  const [remainingSalary, setRemainingSalary] = useState(50000);
  
  const rosterLimits = {
    'C': { min: 1, max: 1 },
    'IF': { min: 4, max: 4 }, // 1B, 2B, 3B, SS
    'OF': { min: 3, max: 3 },
    'SP': { min: 2, max: 2 },
    'RP': { min: 2, max: 2 }
  };

  const generateSalary = (player) => {
    // Base salary on recent performance and position scarcity
    const baseScore = calculatePoints(player, player.POS.startsWith('P') ? 'pitching' : 'hitting', 'draftKingsDFS');
    const positionMultiplier = getPositionMultiplier(player.POS);
    return Math.round((baseScore * 100 * positionMultiplier) / 100) * 100;
  };

  const getPositionMultiplier = (position) => {
    const multipliers = {
      'C': 1.2,  // Catchers are scarce
      '1B': 0.9, // First basemen are abundant
      '2B': 1.1,
      '3B': 1.0,
      'SS': 1.15,
      'OF': 0.95,
      'SP': 1.1,
      'RP': 0.85
    };
    return multipliers[position] || 1.0;
  };

  const generateBenchmark = () => {
    switch (benchmarkMode) {
      case 'historical':
        // Generate benchmark based on historical performance ranges
        return {
          low: 95,    // 5th percentile
          medium: 125, // 50th percentile
          high: 155    // 95th percentile
        };
      case 'random':
        // Random but realistic benchmark
        const base = 125;
        const variance = 30;
        return {
          target: base + (Math.random() * variance * 2 - variance)
        };
      case 'fixed':
        // Fixed targets based on game length
        const targets = {
          'day': 130,
          'week': 850,
          'month': 3500
        };
        return { target: targets[gameLength] };
    }
  };

  const calculateRosterScore = (rosterPlayers) => {
    return rosterPlayers.reduce((total, player) => {
      const type = player.POS.startsWith('P') ? 'pitching' : 'hitting';
      return total + calculatePoints(player, type, 'draftKingsDFS');
    }, 0);
  };

  const validateRoster = (currentRoster) => {
    const positionCounts = currentRoster.reduce((counts, player) => {
      const pos = player.POS;
      counts[pos] = (counts[pos] || 0) + 1;
      return counts;
    }, {});

    for (const [position, limits] of Object.entries(rosterLimits)) {
      const count = Object.entries(positionCounts)
        .filter(([pos]) => pos.includes(position))
        .reduce((sum, [_, count]) => sum + count, 0);
      
      if (count < limits.min || count > limits.max) return false;
    }
    return true;
  };

  const processPlayerFile = async (file) => {
    const text = await file.text();
    Papa.parse(text, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: (results) => {
        const players = results.data.map(player => ({
          ...player,
          salary: generateSalary(player)
        }));
        setAvailablePlayers(players);
      }
    });
  };

  return (
    <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-center text-gray-800">OOTP Solo DFS</h1>
      
      {/* Configuration Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Game Settings</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <select 
            value={benchmarkMode}
            onChange={(e) => setBenchmarkMode(e.target.value)}
            className="p-2 border rounded-lg"
          >
            <option value="historical">Historical Benchmark</option>
            <option value="random">Random Target</option>
            <option value="fixed">Fixed Target</option>
          </select>
          
          <select
            value={gameLength}
            onChange={(e) => setGameLength(e.target.value)}
            className="p-2 border rounded-lg"
          >
            <option value="day">Single Day</option>
            <option value="week">Week</option>
            <option value="month">Month</option>
          </select>
          
          <input
            type="number"
            value={salaryCap}
            onChange={(e) => setSalaryCap(parseInt(e.target.value))}
            className="p-2 border rounded-lg"
            placeholder="Salary Cap"
          />
        </CardContent>
      </Card>

      {/* File Upload and Player Pool */}
      <Card>
        <CardHeader>
          <CardTitle>Import Players</CardTitle>
        </CardHeader>
        <CardContent>
          <input
            type="file"
            accept=".csv"
            onChange={(e) => processPlayerFile(e.target.files[0])}
            className="block w-full p-2 border rounded-lg"
          />
        </CardContent>
      </Card>

      {/* Current Roster and Score */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Your Roster</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Roster display code */}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Benchmark</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Benchmark display code */}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OOTPSoloDFS;

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './components/ui/dialog';
import { Button } from './components/ui/button';
import { Input } from './components/ui/input';
import Papa from 'papaparse';
import _ from 'lodash';

const FantasyCalculator = () => {
  const [hittingStats, setHittingStats] = useState([]);
  const [pitchingStats, setPitchingStats] = useState([]);
  const [scoringSystem, setScoringSystem] = useState('draftKingsDFS');
  const [loading, setLoading] = useState(false);

 const scoringSystems = {
  draftKingsDFS: {
    name: 'DraftKings DFS',
    hitting: {
      '1B': 3,
      '2B': 5,
      '3B': 8,
      'HR': 10,
      'R': 2,
      'RBI': 2,
      'BB': 2,
      'SB': 5,
      'CS': -2,
      'HBP': 2
    },
    pitching: {
      'IP': 2.25,
      'K': 2,
      'W': 4,
      'ER': -2,
      'H': -0.6,
      'BB': -0.6,
      'HBP': -0.6,
      'CG': 2.5,
      'CGSO': 2.5,
      'NH': 5
    }
  },
  fanduelDFS: {
    name: 'FanDuel DFS',
    hitting: {
      '1B': 3,
      '2B': 6,
      '3B': 9,
      'HR': 12,
      'R': 3.2,
      'RBI': 3.5,
      'BB': 3,
      'SB': 6,
      'CS': -3,
      'HBP': 3
    },
    pitching: {
      'IP': 3,
      'K': 3,
      'W': 6,
      'ER': -3,
      'H': -0.6,
      'BB': -0.6,
      'HBP': -0.6,
      'CG': 3,
      'CGSO': 3,
      'NH': 6
    }
  },
  sabermetricDFS: {
    name: 'Sabermetric DFS',
    hitting: {
      '1B': 2,
      '2B': 4,
      '3B': 6,
      'HR': 8,
      'R': 1.5,
      'RBI': 1.2,
      'BB': 3,
      'SB': 4,
      'CS': -4,
      'HBP': 3,
      'AVG': 10,
      'OBP': 15,
      'SLG': 12
    },
    pitching: {
      'IP': 3,
      'K': 2.5,
      'BB': -2,
      'HR': -4,
      'ERA': -5,
      'WHIP': -8,
      'K/9': 2,
      'K/BB': 3,
      'FIP': -5
    }
  },
  powerHitter: {
    name: 'Power Hitter League',
    hitting: {
      '1B': 1,
      '2B': 3,
      '3B': 5,
      'HR': 15,
      'R': 2,
      'RBI': 3,
      'BB': 1,
      'SB': 1,
      'SLG': 10,
      'ISO': 12
    },
    pitching: {
      'IP': 2,
      'K': 3,
      'W': 5,
      'ER': -1,
      'H': -0.5,
      'BB': -0.5,
      'HR': -3
    }
  },
  smallBall: {
    name: 'Small Ball League',
    hitting: {
      '1B': 4,
      '2B': 6,
      '3B': 8,
      'HR': 8,
      'R': 3,
      'RBI': 2,
      'BB': 3,
      'SB': 8,
      'CS': -1,
      'AVG': 15
    },
    pitching: {
      'IP': 4,
      'K': 2,
      'W': 5,
      'SV': 8,
      'HLD': 6,
      'ER': -2,
      'H': -0.5,
      'BB': -1
    }
  },
  roto5x5: {
    name: 'Rotisserie 5x5',
    hitting: ['R', 'HR', 'RBI', 'SB', 'AVG'],
    pitching: ['W', 'SV', 'ERA', 'WHIP', 'K']
  },
  statcastEra: {
    name: 'Statcast Era',
    hitting: {
      'HR': 4,
      'BB': 3,
      'K': -2,
      'OBP': 15,
      'SLG': 10,
      'ISO': 8,
      'BABIP': 5,
      'OPS': 12,
      'WAR': 10
    },
    pitching: {
      'K/9': 5,
      'BB/9': -3,
      'HR/9': -5,
      'WHIP': -8,
      'FIP': -6,
      'ERA+': 4,
      'WAR': 8
    }
  },
  backwardsBaseball: {
    name: 'Backwards Baseball',
    hitting: {
      'AB': 1,
      'H': -2,
      'HR': -10,
      'RBI': -2,
      'BB': -3,
      'K': 3,
      'GIDP': 5,
      'CS': 4
    },
    pitching: {
      'IP': 2,
      'ER': 3,
      'H': 1,
      'BB': 2,
      'K': -2,
      'HR': 5,
      'L': 10
    }
  }
};

  const processFile = async (file, type) => {
    setLoading(true);
    const text = await file.text();
    Papa.parse(text, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: (results) => {
        const processedStats = results.data.map((player) => {
          if (type === 'hitting') {
            return {
              ...player,
              '1B': player.H - (player['2B'] + player['3B'] + player.HR),
              'ISO': player.SLG - player.AVG
            };
          } else {
            return {
              ...player,
              'K/9': (player.K * 9) / player.IP,
              'K/BB': player.BB > 0 ? player.K / player.BB : player.K,
              'FIP': ((13 * player.HR) + (3 * (player.BB + player.HP)) - (2 * player.K)) / player.IP + 3.2
            };
          }
        });

        if (type === 'hitting') setHittingStats(processedStats);
        else setPitchingStats(processedStats);

        setLoading(false);
      }
    });
  };

  const calculatePoints = (player, type, system) => {
    const scoring = scoringSystems[system][type];
    return Object.entries(scoring).reduce((total, [stat, points]) => {
      if (player[stat] !== undefined && player[stat] !== null) {
        return total + player[stat] * points;
      }
      return total;
    }, 0);
  };

  const getPlayerScores = (type) => {
    const stats = type === 'hitting' ? hittingStats : pitchingStats;
    if (!stats.length) return [];

    return stats.map((player) => ({
      ...player,
      FantasyPoints: calculatePoints(player, type, scoringSystem)
    })).sort((a, b) => b.FantasyPoints - a.FantasyPoints);
  };

  return (
    <div className="space-y-6 p-4">
      <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">OOTP Fantasy Calculator</h1>

<div className="mb-4">
  <label className="block text-sm font-medium text-gray-700 mb-2">Scoring System:</label>
  <select
    value={scoringSystem}
    onChange={(e) => setScoringSystem(e.target.value)}
    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
  >
    {Object.entries(scoringSystems).map(([key, system]) => (
      <option key={key} value={key}>{system.name}</option>
    ))}
  </select>
</div>


 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Hitting Stats</CardTitle>
          </CardHeader>
          <CardContent>
            <label className="block">
              <span className="block text-sm font-medium text-gray-700 mb-2">Upload Hitting Stats:</span>
              <input
                type="file"
                accept=".csv"
                onChange={(e) => processFile(e.target.files[0], 'hitting')}
                className="w-full cursor-pointer p-2 rounded-lg bg-blue-50 text-blue-700 font-semibold hover:bg-blue-100"
              />
            </label>

            {loading && <p className="text-sm text-gray-500 mt-2">Processing file...</p>}

            {hittingStats.length > 0 && (
              <table className="w-full mt-4 border border-gray-200 rounded-lg">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-2 text-left">Name</th>
                    <th className="p-2 text-left">Position</th>
                    <th className="p-2 text-right">Points</th>
                  </tr>
                </thead>
                <tbody>
                  {getPlayerScores('hitting').map((player, idx) => (
                    <tr key={idx} className={`p-2 ${idx % 2 ? 'bg-gray-50' : 'bg-white'}`}>
                      <td className="p-2">{player.Name}</td>
                      <td className="p-2">{player.POS}</td>
                      <td className="p-2 text-right">{player.FantasyPoints.toFixed(1)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pitching Stats</CardTitle>
          </CardHeader>
          <CardContent>
            <label className="block">
              <span className="block text-sm font-medium text-gray-700 mb-2">Upload Pitching Stats:</span>
              <input
                type="file"
                accept=".csv"
                onChange={(e) => processFile(e.target.files[0], 'pitching')}
                className="w-full cursor-pointer p-2 rounded-lg bg-blue-50 text-blue-700 font-semibold hover:bg-blue-100"
              />
            </label>

            {loading && <p className="text-sm text-gray-500 mt-2">Processing file...</p>}

            {pitchingStats.length > 0 && (
              <table className="w-full mt-4 border border-gray-200 rounded-lg">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-2 text-left">Name</th>
                    <th className="p-2 text-left">Position</th>
                    <th className="p-2 text-right">Points</th>
                  </tr>
                </thead>
                <tbody>
                  {getPlayerScores('pitching').map((player, idx) => (
                    <tr key={idx} className={`p-2 ${idx % 2 ? 'bg-gray-50' : 'bg-white'}`}>
                      <td className="p-2">{player.Name}</td>
                      <td className="p-2">{player.POS}</td>
                      <td className="p-2 text-right">{player.FantasyPoints.toFixed(1)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FantasyCalculator;

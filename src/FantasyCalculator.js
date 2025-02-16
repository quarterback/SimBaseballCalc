import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './components/ui/card';
import Papa from 'papaparse';

const FantasyCalculator = () => {
  const [hittingStats, setHittingStats] = useState([]);
  const [pitchingStats, setPitchingStats] = useState([]);
  const [hittingSearchQuery, setHittingSearchQuery] = useState('');
  const [pitchingSearchQuery, setPitchingSearchQuery] = useState('');
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

  const filteredHittingStats = hittingStats.filter((player) =>
    player.Name.toLowerCase().includes(hittingSearchQuery.toLowerCase()) ||
    player.POS.toLowerCase().includes(hittingSearchQuery.toLowerCase())
  );

  const filteredPitchingStats = pitchingStats.filter((player) =>
    player.Name.toLowerCase().includes(pitchingSearchQuery.toLowerCase()) ||
    player.POS.toLowerCase().includes(pitchingSearchQuery.toLowerCase())
  );

  const processFile = async (file, type) => {
    setLoading(true);
    const text = await file.text();
    Papa.parse(text, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: (results) => {
        const stats = results.data.map((player) => ({
          ...player,
          '1B': type === 'hitting' ? player.H - (player['2B'] + player['3B'] + player.HR) : undefined
        }));
        type === 'hitting' ? setHittingStats(stats) : setPitchingStats(stats);
        setLoading(false);
      }
    });
  };

  const calculatePoints = (player, type, system) => {
    const scoring = scoringSystems[system][type];
    return Object.entries(scoring).reduce((total, [stat, points]) => {
      if (player[stat]) return total + player[stat] * points;
      return total;
    }, 0);
  };

  const getPlayerScores = (type) => {
    const stats = type === 'hitting' ? filteredHittingStats : filteredPitchingStats;
    return stats.map((player) => ({
      ...player,
      FantasyPoints: calculatePoints(player, type, scoringSystem)
    })).sort((a, b) => b.FantasyPoints - a.FantasyPoints);
  };

  return (
    <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-center text-gray-800">OOTP Fantasy Calculator</h1>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Scoring System:</label>
        <select
          value={scoringSystem}
          onChange={(e) => setScoringSystem(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {Object.entries(scoringSystems).map(([key, system]) => (
            <option key={key} value={key}>{system.name}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Hitting Stats</CardTitle>
          </CardHeader>
          <CardContent>
            <input
              type="text"
              placeholder="Search hitting stats..."
              value={hittingSearchQuery}
              onChange={(e) => setHittingSearchQuery(e.target.value)}
              className="w-full p-2 mb-4 border border-gray-300 rounded-lg"
            />
            <input
              type="file"
              accept=".csv"
              onChange={(e) => processFile(e.target.files[0], 'hitting')}
              className="block w-full p-2 border rounded-lg mb-4"
            />
            <div className="overflow-x-auto">
              <table className="w-full table-auto border border-gray-200">
                <thead className="bg-gray-100">
                  <tr>
                    <th>Name</th>
                    <th>Position</th>
                    <th>Points</th>
                  </tr>
                </thead>
                <tbody>
                  {getPlayerScores('hitting').map((player, idx) => (
                    <tr key={idx} className={`${idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}>
                      <td>{player.Name}</td>
                      <td>{player.POS}</td>
                      <td className="text-right">{player.FantasyPoints.toFixed(1)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
  <Card>
    <CardHeader>
      <CardTitle>Pitching Stats</CardTitle>
    </CardHeader>
    <CardContent>
      {/* File Input */}
      <label className="block">
        <span className="block text-sm font-medium text-gray-700 mb-2">
          Upload Pitching Stats (CSV):
        </span>
        <input
          type="file"
          accept=".csv"
          onChange={(e) => processFile(e.target.files[0], 'pitching')}
          className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          aria-label="Upload pitching stats file"
        />
      </label>

      {/* Loading Indicator */}
      {loading && <p className="text-gray-500 mt-2">Processing file...</p>}

      {/* Table or No Data Message */}
      {pitchingStats.length > 0 ? (
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-lg">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-2 text-left text-sm font-medium text-gray-700" scope="col">
                  Name
                </th>
                <th className="p-2 text-left text-sm font-medium text-gray-700" scope="col">
                  Position
                </th>
                <th className="p-2 text-right text-sm font-medium text-gray-700" scope="col">
                  Points
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {getPlayerScores('pitching').map((player, idx) => (
                <tr
                  key={idx}
                  className={`hover:bg-gray-50 ${
                    idx % 2 === 0 ? 'bg-gray-100' : 'bg-white'
                  }`}
                >
                  <td className="p-2 text-sm text-gray-700">{player.Name}</td>
                  <td className="p-2 text-sm text-gray-700">{player.POS}</td>
                  <td className="p-2 text-sm text-right text-gray-700">
                    {player.FantasyPoints.toFixed(1)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-gray-500 mt-4">No pitching stats uploaded yet. Please upload a CSV file.</p>
      )}
    </CardContent>
  </Card>
</div>

    </div>
  );
};

export default FantasyCalculator;

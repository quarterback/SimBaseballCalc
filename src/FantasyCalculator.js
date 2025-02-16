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
      hitting: { '1B': 3, '2B': 5, '3B': 8, 'HR': 10, 'R': 2, 'RBI': 2, 'BB': 2, 'SB': 5, 'CS': -2, 'HBP': 2 },
      pitching: { 'IP': 2.25, 'K': 2, 'W': 4, 'ER': -2, 'H': -0.6, 'BB': -0.6, 'HBP': -0.6, 'CG': 2.5, 'CGSO': 2.5, 'NH': 5 }
    }
    // Add other scoring systems as needed
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

        {/* Similar for Pitching */}
      </div>
    </div>
  );
};

export default FantasyCalculator;

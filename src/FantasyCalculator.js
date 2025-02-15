import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './components/ui/card';
import Papa from 'papaparse';
import _ from 'lodash';

const FantasyCalculator = () => {
  const [hittingStats, setHittingStats] = useState([]);
  const [pitchingStats, setPitchingStats] = useState([]);
  const [scoringSystem, setScoringSystem] = useState('draftKingsDFS');
  
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
        'HBP': 2  // Hit by pitch
      },
      pitching: {
        'IP': 2.25,  // per out (6.75 per full inning)
        'K': 2,
        'W': 4,
        'ER': -2,
        'H': -0.6,
        'BB': -0.6,
        'HBP': -0.6,
        'CG': 2.5,
        'CGSO': 2.5, // Complete game shutout bonus
        'NH': 5,    // No-hitter bonus
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
        'IP': 3,    // per out (9 per full inning)
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
    standard: {
      name: 'Standard Season-Long',
      hitting: {
        '1B': 1,
        '2B': 2,
        '3B': 3,
        'HR': 4,
        'R': 1,
        'RBI': 1,
        'BB': 1,
        'SB': 2,
        'CS': -1
      },
      pitching: {
        'IP': 3,
        'K': 1,
        'W': 4,
        'SV': 5,
        'HLD': 2,
        'ER': -2,
        'H': -0.5,
        'BB': -1
      }
    },
    roto5x5: {
      name: 'Rotisserie 5x5',
      hitting: ['R', 'HR', 'RBI', 'SB', 'AVG'],
      pitching: ['W', 'SV', 'ERA', 'WHIP', 'K']
    }
  };

  const processHittingFile = async (file) => {
    const text = await file.text();
    Papa.parse(text, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: (results) => {
        // Calculate singles and add DFS-specific fields
        const processedStats = results.data.map(player => ({
          ...player,
          '1B': player.H - (player['2B'] + player['3B'] + player.HR),
          'CGSO': 0, // These would need to be in your CSV or calculated
          'NH': 0,   // These would need to be in your CSV or calculated
          'CG': 0    // These would need to be in your CSV or calculated
        }));
        setHittingStats(processedStats);
      }
    });
  };

  const processPitchingFile = async (file) => {
    const text = await file.text();
    Papa.parse(text, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: (results) => {
        // Add DFS-specific fields
        const processedStats = results.data.map(player => ({
          ...player,
          'CGSO': 0, // These would need to be in your CSV or calculated
          'NH': 0,   // These would need to be in your CSV or calculated
          'CG': 0    // These would need to be in your CSV or calculated
        }));
        setPitchingStats(processedStats);
      }
    });
  };

  const calculateDFSPoints = (player, type, system) => {
    const scoring = scoringSystems[system][type];
    
    if (type === 'hitting') {
      return (
        (player['1B'] * scoring['1B']) +
        (player['2B'] * scoring['2B']) +
        (player['3B'] * scoring['3B']) +
        (player.HR * scoring.HR) +
        (player.R * scoring.R) +
        (player.RBI * scoring.RBI) +
        ((player.BB || 0) * scoring.BB) +
        ((player.SB || 0) * scoring.SB) +
        ((player.CS || 0) * scoring.CS) +
        ((player.HP || 0) * scoring.HBP)
      );
    } else {
      // Convert IP to outs for DFS scoring
      const outs = player.IP * 3;
      
      return (
        (outs * scoring.IP) +
        (player.K * scoring.K) +
        (player.W * scoring.W) +
        (player.ER * scoring.ER) +
        (player.HA * scoring.H) +
        (player.BB * scoring.BB) +
        ((player.HP || 0) * scoring.HBP) +
        ((player.CG || 0) * scoring.CG) +
        ((player.CGSO || 0) * scoring.CGSO) +
        ((player.NH || 0) * scoring.NH)
      );
    }
  };

  const calculateRotoRankings = (stats, type, categories) => {
    if (!stats.length) return [];
    
    const rankings = {};
    
    categories.forEach(category => {
      let sortedPlayers;
      
      if (category === 'AVG' || category === 'ERA' || category === 'WHIP') {
        const qualifiedStats = stats.filter(player => {
          if (type === 'hitting') return player.PA >= 20;
          return player.IP >= 10;
        });
        
        sortedPlayers = _.orderBy(qualifiedStats, [category], 
          [(category === 'ERA' || category === 'WHIP') ? 'asc' : 'desc']);
      } else {
        sortedPlayers = _.orderBy(stats, [category], ['desc']);
      }
      
      sortedPlayers.forEach((player, index) => {
        if (!rankings[player.Name]) rankings[player.Name] = 0;
        rankings[player.Name] += sortedPlayers.length - index;
      });
    });
    
    return Object.entries(rankings)
      .map(([name, points]) => ({
        Name: name,
        RotoPoints: points,
        RotoScore: (points / (categories.length * stats.length) * 12).toFixed(2)
      }))
      .sort((a, b) => b.RotoPoints - a.RotoPoints);
  };

  const getPlayerScores = (type) => {
    const stats = type === 'hitting' ? hittingStats : pitchingStats;
    if (!stats.length) return [];

    if (scoringSystem.includes('DFS')) {
      return stats.map(player => ({
        ...player,
        FantasyPoints: calculateDFSPoints(player, type, scoringSystem)
      }))
      .sort((a, b) => b.FantasyPoints - a.FantasyPoints);
    } else if (scoringSystem === 'roto5x5') {
      return calculateRotoRankings(stats, type, scoringSystems.roto5x5[type]);
    } else {
      return stats.map(player => ({
        ...player,
        FantasyPoints: calculateDFSPoints(player, type, 'standard')
      }))
      .sort((a, b) => b.FantasyPoints - a.FantasyPoints);
    }
  };

  return (
    <div className="space-y-6 p-4">
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">OOTP Fantasy Calculator</h1>
        
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Scoring System:</label>
          <select 
            value={scoringSystem}
            onChange={(e) => setScoringSystem(e.target.value)}
            className="p-2 border rounded"
          >
            {Object.entries(scoringSystems).map(([key, system]) => (
              <option key={key} value={key}>{system.name}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Hitting Section */}
          <Card>
            <CardHeader>
              <CardTitle>Hitting Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <input
                type="file"
                accept=".csv"
                onChange={(e) => processHittingFile(e.target.files[0])}
                className="mb-4"
              />
              
              {hittingStats.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="p-2 text-left">Name</th>
                        <th className="p-2 text-left">Pos</th>
                        <th className="p-2 text-right">
                          {scoringSystem === 'roto5x5' ? 'Roto Score' : 'Fantasy Points'}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {getPlayerScores('hitting').map((player, idx) => (
                        <tr key={idx} className="border-b hover:bg-gray-50">
                          <td className="p-2">{player.Name}</td>
                          <td className="p-2">{player.POS}</td>
                          <td className="p-2 text-right">
                            {scoringSystem === 'roto5x5' ? 
                              player.RotoScore : 
                              player.FantasyPoints.toFixed(1)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Pitching Section */}
          <Card>
            <CardHeader>
              <CardTitle>Pitching Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <input
                type="file"
                accept=".csv"
                onChange={(e) => processPitchingFile(e.target.files[0])}
                className="mb-4"
              />
              
              {pitchingStats.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="p-2 text-left">Name</th>
                        <th className="p-2 text-left">Pos</th>
                        <th className="p-2 text-right">
                          {scoringSystem === 'roto5x5' ? 'Roto Score' : 'Fantasy Points'}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {getPlayerScores('pitching').map((player, idx) => (
                        <tr key={idx} className="border-b hover:bg-gray-50">
                          <td className="p-2">{player.Name}</td>
                          <td className="p-2">{player.POS}</td>
                          <td className="p-2 text-right">
                            {scoringSystem === 'roto5x5' ? 
                              player.RotoScore : 
                              player.FantasyPoints.toFixed(1)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default FantasyCalculator;

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
  const [customSystems, setCustomSystems] = useState([]);
  const [newSystem, setNewSystem] = useState({
    name: '',
    hitting: {},
    pitching: {}
  });
  const [showCustomDialog, setShowCustomDialog] = useState(false);
  
  // Base scoring systems
  const baseSystems = {
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
    // ... (rest of your existing scoring systems)
  };

  const [scoringSystems, setScoringSystems] = useState(baseSystems);

  // Available stats for custom scoring
  const availableStats = {
    hitting: [
      { id: '1B', name: 'Singles' },
      { id: '2B', name: 'Doubles' },
      { id: '3B', name: 'Triples' },
      { id: 'HR', name: 'Home Runs' },
      { id: 'R', name: 'Runs' },
      { id: 'RBI', name: 'RBI' },
      { id: 'BB', name: 'Walks' },
      { id: 'SB', name: 'Stolen Bases' },
      { id: 'CS', name: 'Caught Stealing' },
      { id: 'HBP', name: 'Hit By Pitch' },
      { id: 'AVG', name: 'Batting Average' },
      { id: 'OBP', name: 'On Base Percentage' },
      { id: 'SLG', name: 'Slugging' },
      { id: 'OPS', name: 'OPS' }
    ],
    pitching: [
      { id: 'IP', name: 'Innings Pitched' },
      { id: 'K', name: 'Strikeouts' },
      { id: 'W', name: 'Wins' },
      { id: 'SV', name: 'Saves' },
      { id: 'HLD', name: 'Holds' },
      { id: 'ER', name: 'Earned Runs' },
      { id: 'H', name: 'Hits Allowed' },
      { id: 'BB', name: 'Walks' },
      { id: 'HBP', name: 'Hit By Pitch' },
      { id: 'CG', name: 'Complete Games' },
      { id: 'CGSO', name: 'Complete Game Shutouts' },
      { id: 'NH', name: 'No-Hitters' },
      { id: 'ERA', name: 'ERA' },
      { id: 'WHIP', name: 'WHIP' }
    ]
  };

  // Load custom systems from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('customScoringSystems');
    if (saved) {
      const parsed = JSON.parse(saved);
      setCustomSystems(parsed);
      setScoringSystems({
        ...baseSystems,
        ...parsed.reduce((acc, sys) => ({ ...acc, [sys.id]: sys }), {})
      });
    }
  }, []);

  const saveCustomSystem = () => {
    const id = `custom_${Date.now()}`;
    const systemToSave = {
      id,
      ...newSystem,
      type: 'custom'
    };
    
    const updatedCustomSystems = [...customSystems, systemToSave];
    setCustomSystems(updatedCustomSystems);
    setScoringSystems({
      ...scoringSystems,
      [id]: systemToSave
    });
    
    localStorage.setItem('customScoringSystems', JSON.stringify(updatedCustomSystems));
    setShowCustomDialog(false);
    setNewSystem({ name: '', hitting: {}, pitching: {} });
  };

  const CustomScoringDialog = () => (
    <Dialog open={showCustomDialog} onOpenChange={setShowCustomDialog}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create Custom Scoring System</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Input
            placeholder="System Name"
            value={newSystem.name}
            onChange={(e) => setNewSystem({ ...newSystem, name: e.target.value })}
          />
          
          <div className="grid grid-cols-2 gap-4">
            {/* Hitting Stats */}
            <div>
              <h3 className="font-medium mb-2">Hitting Points</h3>
              {availableStats.hitting.map(stat => (
                <div key={stat.id} className="flex items-center space-x-2 mb-2">
                  <label className="w-24">{stat.name}</label>
                  <Input
                    type="number"
                    step="0.1"
                    placeholder="0"
                    value={newSystem.hitting[stat.id] || ''}
                    onChange={(e) => setNewSystem({
                      ...newSystem,
                      hitting: {
                        ...newSystem.hitting,
                        [stat.id]: parseFloat(e.target.value) || 0
                      }
                    })}
                  />
                </div>
              ))}
            </div>

            {/* Pitching Stats */}
            <div>
              <h3 className="font-medium mb-2">Pitching Points</h3>
              {availableStats.pitching.map(stat => (
                <div key={stat.id} className="flex items-center space-x-2 mb-2">
                  <label className="w-24">{stat.name}</label>
                  <Input
                    type="number"
                    step="0.1"
                    placeholder="0"
                    value={newSystem.pitching[stat.id] || ''}
                    onChange={(e) => setNewSystem({
                      ...newSystem,
                      pitching: {
                        ...newSystem.pitching,
                        [stat.id]: parseFloat(e.target.value) || 0
                      }
                    })}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setShowCustomDialog(false)}>
              Cancel
            </Button>
            <Button onClick={saveCustomSystem} disabled={!newSystem.name}>
              Save System
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );

  // Your existing code for processing files and calculating scores...
  
  return (
    <div className="space-y-6 p-4">
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">OOTP Fantasy Calculator</h1>
          <Button onClick={() => setShowCustomDialog(true)}>
            Create Custom System
          </Button>
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Scoring System:</label>
          <select 
            value={scoringSystem}
            onChange={(e) => setScoringSystem(e.target.value)}
            className="p-2 border rounded"
          >
            <optgroup label="Standard Systems">
              {Object.entries(baseSystems).map(([key, system]) => (
                <option key={key} value={key}>{system.name}</option>
              ))}
            </optgroup>
            {customSystems.length > 0 && (
              <optgroup label="Custom Systems">
                {customSystems.map(system => (
                  <option key={system.id} value={system.id}>{system.name}</option>
                ))}
              </optgroup>
            )}
          </select>
        </div>

        {/* Rest of your existing JSX */}
        
        <CustomScoringDialog />
      </div>
    </div>
  );
};

export default FantasyCalculator;

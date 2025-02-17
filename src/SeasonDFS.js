import React, { useState } from 'react';
import Papa from 'papaparse';
import { DFSAI } from './DFSAI'; // Import your existing DFS component

const SeasonDFS = () => {
  // Core DFS states from your original component
  const [availablePlayers, setAvailablePlayers] = useState([]);
  const [userRoster, setUserRoster] = useState([]);
  const [currentSalary, setCurrentSalary] = useState(0);
  const [currentScore, setCurrentScore] = useState(0);
  
  // New season tracking states
  const [seasonWeek, setSeasonWeek] = useState(1);
  const [seasonPoints, setSeasonPoints] = useState(0);
  const [seasonHistory, setSeasonHistory] = useState([]);
  const [streaks, setStreaks] = useState({
    userStreak: 0,
    weeklyRanks: []
  });

  // Add the season dashboard above your existing DFS interface
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-4">
        Season-Long DFS Challenge
      </h2>

      {/* Season Dashboard */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <h3 className="text-lg font-semibold">Season Progress</h3>
            <p>Week {seasonWeek} of 26</p>
            <p>Season Points: {seasonPoints}</p>
            <p>Current Streak: {streaks.userStreak}</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold">Weekly Budget</h3>
            <p>Base: ${(250000).toLocaleString()}</p>
            <p>Bonus: ${(seasonWeek * 5000).toLocaleString()}</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold">Season Stats</h3>
            <p>Best Finish: {streaks.weeklyRanks.length > 0 ? Math.min(...streaks.weeklyRanks) : '-'}</p>
            <p>Avg Finish: {streaks.weeklyRanks.length > 0 ? 
              (streaks.weeklyRanks.reduce((a,b) => a+b, 0) / streaks.weeklyRanks.length).toFixed(1) : '-'}</p>
          </div>
        </div>
      </div>

  {/* Original DFS content goes here */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Difficulty:
          </label>
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            disabled={gameLocked}
            className="w-full p-2 border rounded-lg"
          >
            <option value="easy">Easy</option>
            <option value="balanced">Balanced</option>
            <option value="hard">Hard</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Salary Cap: ${SALARY_CAP.toLocaleString()}
          </label>
          <div className="text-lg font-medium">
            Remaining: ${(SALARY_CAP - currentSalary).toLocaleString()}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <h3 className="text-lg font-semibold mb-2">Import Players</h3>
        <input
          type="file"
          accept=".csv"
          onChange={(e) => e.target.files?.[0] && processFile(e.target.files[0])}
          className="block w-full p-2 border rounded-lg"
          disabled={loadingStats || gameLocked}
        />
      </div>

      <div className="flex gap-4 mb-4">
        <input
          type="text"
          placeholder="Search players..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full p-2 border rounded-lg"
          disabled={gameLocked}
        />
        <select
          value={positionFilter}
          onChange={(e) => setPositionFilter(e.target.value)}
          className="p-2 border rounded-lg min-w-[100px]"
          disabled={gameLocked}
        >
          {POSITIONS.map(pos => (
            <option key={pos} value={pos}>
              {pos}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Available Players */}
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-semibold mb-4">Available Players</h3>
          <div className="h-96 overflow-y-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="p-2 text-left">Name</th>
                  <th className="p-2 text-left">POS</th>
                  <th className="p-2 text-right">Salary</th>
                  <th className="p-2 text-right">Points</th>
                  <th className="p-2 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {availablePlayers
                  .filter(player => {
                    const matchesSearch = 
                      player.Name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      player.POS?.toLowerCase().includes(searchQuery.toLowerCase());
                    const matchesPosition = positionFilter === 'ALL' || player.POS === positionFilter;
                    return matchesSearch && matchesPosition;
                  })
                  .map((player, idx) => (
                    <tr key={idx} className="border-t">
                      <td className="p-2">{player.Name}</td>
                      <td className="p-2">{player.POS}</td>
                      <td className="p-2 text-right">${player.salary?.toLocaleString()}</td>
                      <td className="p-2 text-right">{player.points?.toFixed(1)}</td>
                      <td className="p-2 text-right">
                        <button
                          onClick={() => addToRoster(player)}
                          disabled={gameLocked}
                          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                        >
                          Add
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* User's Roster */}
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-semibold mb-2">Your Roster</h3>
          <div className="mb-4">
            <p className="text-lg font-semibold">
              Current Score: {currentScore.toFixed(1)}
            </p>
            <p className="text-sm text-gray-600">
              Total Salary: ${currentSalary.toLocaleString()}
            </p>
          </div>
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-2 text-left">Name</th>
                <th className="p-2 text-left">POS</th>
                <th className="p-2 text-right">Salary</th>
                <th className="p-2 text-right">Points</th>
                <th className="p-2 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {userRoster.map((player, idx) => (
                <tr key={idx} className="border-t">
                  <td className="p-2">{player.Name}</td>
                  <td className="p-2">{player.POS}</td>
                  <td className="p-2 text-right">${player.salary?.toLocaleString()}</td>
                  <td className="p-2 text-right">{player.points?.toFixed(1)}</td>
                  <td className="p-2 text-right">
                    <button
                      onClick={() => removeFromRoster(idx)}
                      disabled={gameLocked}
                      className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <button
            onClick={lockGame}
            disabled={gameLocked || userRoster.length !== 10}
            className="mt-4 w-full bg-green-500 text-white p-2 rounded hover:bg-green-600 disabled:opacity-50"
          >
            Lock Lineup & Generate AI Teams
          </button>
        </div>
      </div>

      {/* Season History */}
      {seasonHistory.length > 0 && (
        <div className="bg-white rounded-lg shadow p-4 mt-6">
          <h3 className="text-xl font-bold mb-4">Season History</h3>
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-2 text-left">Week</th>
                <th className="p-2 text-right">Score</th>
                <th className="p-2 text-right">Rank</th>
                <th className="p-2 text-right">Earnings</th>
              </tr>
            </thead>
            <tbody>
              {seasonHistory.map((week, idx) => (
                <tr key={idx} className="border-t">
                  <td className="p-2">{week.week}</td>
                  <td className="p-2 text-right">{week.score.toFixed(1)}</td>
                  <td className="p-2 text-right">{week.rank}</td>
                  <td className="p-2 text-right">${week.earnings.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default SeasonDFS;

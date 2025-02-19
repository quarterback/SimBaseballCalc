import React, { useState } from 'react';

const BeatTheStreak = () => {
  const DEFAULT_STREAK_TO_BEAT = 56;
  const [currentStreak, setCurrentStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [streakSaverUsed, setStreakSaverUsed] = useState(false);
  const [jackpot, setJackpot] = useState(null);
  
  const getRandomJackpot = () => {
    return (Math.random() * (7000000 - 3000000) + 3000000).toFixed(2);
  };
  
  const pickPlayers = (players) => {
    const hits = players.map(player => Math.random() < 0.3); // 30% chance of a hit
    return hits;
  };

  const handlePick = (players) => {
    const hits = pickPlayers(players);
    
    if (players.length === 1) {
      if (hits[0]) {
        setCurrentStreak(currentStreak + 1);
      } else {
        endStreak();
      }
    } else {
      if (hits[0] && hits[1]) {
        setCurrentStreak(currentStreak + 2);
      } else {
        endStreak();
      }
    }
  };

  const endStreak = () => {
    if (currentStreak >= 10 && currentStreak <= 18 && !streakSaverUsed) {
      setStreakSaverUsed(true);
      return;
    }

    if (currentStreak > bestStreak) {
      setBestStreak(currentStreak);
    }

    if (currentStreak > DEFAULT_STREAK_TO_BEAT) {
      setJackpot(getRandomJackpot());
    }

    setCurrentStreak(0);
    setStreakSaverUsed(false);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-4">Beat the Streak</h2>
      <p className="text-lg text-center">Current Streak: {currentStreak}</p>
      <p className="text-lg text-center">Best Streak: {bestStreak}</p>
      {jackpot && <p className="text-lg text-center text-green-600">You won ${jackpot}!</p>}
      <div className="flex justify-center gap-4 mt-4">
        <button onClick={() => handlePick(["Player 1"])} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">Regular Pick</button>
        <button onClick={() => handlePick(["Player 1", "Player 2"])} className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">Double Down</button>
      </div>
    </div>
  );
};

export default BeatTheStreak;

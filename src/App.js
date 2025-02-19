import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import FantasyCalculator from './FantasyCalculator';
import SeasonDFS from './SeasonDFS';
import SoloDFS from './SoloDFS';
import DFSAI from './DFSAI';
import FanInterestCalc from './FanInterestCalc';
import MarketCalc from './MarketCalc';
import BeatTheStreak from './BeatTheStreak';

function App() {
  return (
    <Router>
      <div className="App min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">
           OOTP Fantasy Baseball Mods - Taking fake baseball way too far
          </h1>
          
          <nav className="flex justify-center space-x-6 mb-6">
            <Link 
              to="/" 
              className="px-4 py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Fantasy Calculator
            </Link>
            <Link 
              to="/beat-the-streak" 
              className="px-4 py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Beat The Streak
            </Link>
            <Link 
              to="/season-dfs" 
              className="px-4 py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Season DFS
            </Link>
            <Link 
              to="/solo-dfs" 
              className="px-4 py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Solo DFS
            </Link>
            <Link 
              to="/dfs-ai" 
              className="px-4 py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              DFS Challenge
            </Link> 
            <Link 
              to="/market-calc" 
              className="px-4 py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Market Size Calculator
            </Link> 
           <Link 
              to="/fan-interest" 
              className="px-4 py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Fan Interest Calc
            </Link> 
          </nav>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <Routes>
              <Route path="/" element={<FantasyCalculator />} />
              <Route path="/beat-the-streak" element={<BeatTheStreak />} />
              <Route path="/season-dfs" element={<SeasonDFS />} />
              <Route path="/solo-dfs" element={<SoloDFS />} />
              <Route path="/dfs-ai" element={<DFSAI />} />
              <Route path="/market-calc" element={<MarketCalc />} />
              <Route path="/fan-interest" element={<FanInterestCalc />} />
            </Routes>
          </div>
        </div>
      </div>
    </Router>
  );
}

export default App;

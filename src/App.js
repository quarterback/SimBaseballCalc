import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import FantasyCalculator from './FantasyCalculator';
import SeasonDFS from './SeasonDFS';
import SoloDFS from './SoloDFS';
import DFSAI from './DFSAI';

function App() {
  return (
    <Router>
      <div className="App min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">
            OOTP Fantasy Baseball Mod
          </h1>
          
          <nav className="flex justify-center space-x-6 mb-6">
            <Link 
              to="/" 
              className="px-4 py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Fantasy Calculator
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
          </nav>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <Routes>
              <Route path="/" element={<FantasyCalculator />} />
              <Route path="/season-dfs" element={<SeasonDFS />} />
              <Route path="/solo-dfs" element={<SoloDFS />} />
              <Route path="/dfs-ai" element={<DFSAI />} />
            </Routes>
          </div>
        </div>
      </div>
    </Router>
  );
}

export default App;

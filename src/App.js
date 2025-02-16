import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import FantasyCalculator from './FantasyCalculator';
import LeagueBudgetValuation from './LeagueBudgetValuation';
import SoloDFS from './SoloDFS';

function App() {
  return (
    <Router>
      <div className="App min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">
            Fantasy Baseball Calculator
          </h1>
          
          <nav className="flex justify-center space-x-6 mb-6">
            <Link 
              to="/" 
              className="px-4 py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Fantasy Calculator
            </Link>
            <Link 
              to="/league-budget" 
              className="px-4 py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              League Budget
            </Link>
            <Link 
              to="/solo-dfs" 
              className="px-4 py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Solo DFS
            </Link>
          </nav>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <Routes>
              <Route path="/" element={<FantasyCalculator />} />
              <Route path="/league-budget" element={<LeagueBudgetValuation />} />
              <Route path="/solo-dfs" element={<SoloDFS />} />
            </Routes>
          </div>
        </div>
      </div>
    </Router>
  );
}

export default App;

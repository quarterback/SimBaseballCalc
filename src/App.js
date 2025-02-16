import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import FantasyCalculator from './FantasyCalculator';
import LeagueBudgetValuation from './LeagueBudgetValuation';

function App() {
  return (
    <Router>
      <div className="App">
        <h1>Fantasy Baseball Calculator</h1>
        {/* Navigation Links */}
        <nav className="space-x-4">
          <Link to="/" className="text-blue-500 underline">Fantasy Calculator</Link>
          <Link to="/league-budget" className="text-blue-500 underline">League Budget Valuation</Link>
        </nav>
        <hr className="my-4" />

        {/* Routes */}
        <Routes>
          <Route path="/" element={<FantasyCalculator />} />
          <Route path="/league-budget" element={<LeagueBudgetValuation />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

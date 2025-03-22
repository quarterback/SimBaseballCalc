import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import MarkdownSummary from './MarkdownSummary';
import FantasyCalculator from './FantasyCalculator';
import SeasonDFS from './SeasonDFS';
import DFSAI from './DFSAI';
import FieldingRunValueCalculator from './FieldingRunValueCalculator';
import StatcastHittingTool from './StatcastHittingTool';
import StatcastPitchingTool from './StatcastPitchingTool';
import FanInterestCalc from './FanInterestCalc';
import MarketCalc from './MarketCalc';
import TeamHallOfHonor from './TeamHallOfHonor';


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
              to="/season-dfs" 
              className="px-4 py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Season DFS
            </Link>
            <Link 
              to="/hit" 
              className="px-4 py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              HIT
            </Link>
            <Link 
              to="/pitch" 
              className="px-4 py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              PITCH
            </Link>
            <Link 
              to="/frvc" 
              className="px-4 py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              FieldCalc
            </Link> 
            <Link 
              to="/dfs-ai" 
              className="px-4 py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              DFS Challenge
            </Link> 
                <Link 
  to="/team-honor" 
  className="px-4 py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-100 rounded-lg transition-colors"
>
  Team Honor
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
                <Link 
  to="/markdown-summary" 
  className="px-4 py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-100 rounded-lg transition-colors"
>
  Markdown Summary
</Link>
          </nav>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <Routes>
              <Route path="/" element={<FantasyCalculator />} />
              <Route path="/markdown-summary" element={<MarkdownSummary />} />
              <Route path="/season-dfs" element={<SeasonDFS />} />
              <Route path="/frvc" element={<FieldingRunValueCalculator />} />
              <Route path="/hit" element={<StatcastHittingTool />} />
              <Route path="/pitch" element={<StatcastPitchingTool />} />
              <Route path="/dfs-ai" element={<DFSAI />} />
              <Route path="/market-calc" element={<MarketCalc />} />
              <Route path="/fan-interest" element={<FanInterestCalc />} />
              <Route path="/team-honor" element={<TeamHallOfHonor />} />
            </Routes>
          </div>
        </div>
      </div>
    </Router>
  );
}

export default App;

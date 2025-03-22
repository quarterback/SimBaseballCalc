
import React, { useState } from 'react';

const TeamHallOfHonor = () => {
  const [bnnText, setBnnText] = useState('');
  const [team, setTeam] = useState('');
  const [context, setContext] = useState('');
  const [summary, setSummary] = useState('');

  const generateSummary = () => {
    // Basic placeholder logic; actual parsing will be more complex
    const lines = bnnText.split('\n');
    const nameLine = lines.find(line => line.includes('#'));
    const name = nameLine ? nameLine.split('#')[0].trim() : 'Player';
    const yearsWithTeam = lines.filter(line => line.includes(team) && /\d{4}/.test(line)).map(line => line.match(/\d{4}/)[0]);

    const yearsText = yearsWithTeam.length > 0 ? `Played for the ${team} from ${[...new Set(yearsWithTeam)].join(', ')}.` : `Played for the ${team}.`;

    const result = `### ${name} – ${team} Hall of Honor

${yearsText}

${context ? `**Why they matter:** ${context}` : ''}

_This is an early prototype summary. Full visual plaque mode coming soon._`;

    setSummary(result);
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Team Hall of Honor Generator</h1>
      <textarea
        className="w-full p-2 border mb-4 rounded h-40"
        placeholder="Paste BNN page text here..."
        value={bnnText}
        onChange={(e) => setBnnText(e.target.value)}
      />
      <input
        className="w-full p-2 border mb-4 rounded"
        placeholder="Team name (e.g., New York Yankees)"
        value={team}
        onChange={(e) => setTeam(e.target.value)}
      />
      <textarea
        className="w-full p-2 border mb-4 rounded h-20"
        placeholder="Optional context or reason for honor..."
        value={context}
        onChange={(e) => setContext(e.target.value)}
      />
      <button
        className="bg-blue-600 text-white px-4 py-2 rounded"
        onClick={generateSummary}
      >
        Generate Plaque
      </button>

      {summary && (
        <div className="mt-6 p-4 border rounded bg-gray-100 whitespace-pre-wrap">
          {summary}
        </div>
      )}
    </div>
  );
};

export default TeamHallOfHonor;

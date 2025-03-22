// app/playersummary/page.tsx
'use client';

import React, { useState } from 'react';

const MarkdownSummary = () => {
  const [player, setPlayer] = useState({
    name: '',
    team: '',
    position: '',
    year: '',
    war: '',
    obp: '',
    ops: '',
    era: '',
    woba: '',
    awards: '',
    notes: ''
  });

  const [output, setOutput] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setPlayer(prev => ({ ...prev, [name]: value }));
  };

  const generateMarkdown = () => {
    const isPitcher = player.position.toLowerCase().includes('p');
    const summary = `### ${player.name} (${player.position}) - ${player.team}, ${player.year}

${player.notes || 'Player Summary:'}

- **WAR:** ${player.war || 'n/a'}
- **${isPitcher ? 'ERA' : 'OBP'}:** ${isPitcher ? player.era : player.obp || 'n/a'}
- **OPS:** ${player.ops || 'n/a'}
- **wOBA:** ${player.woba || 'n/a'}
${player.awards ? `- **Awards:** ${player.awards}` : ''}

---
`;
    setOutput(summary);
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Markdown Player Summary Generator</h1>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <input name="name" value={player.name} onChange={handleChange} placeholder="Player Name" className="border p-2 rounded" />
        <input name="team" value={player.team} onChange={handleChange} placeholder="Team" className="border p-2 rounded" />
        <input name="position" value={player.position} onChange={handleChange} placeholder="Position (e.g. SP, 1B)" className="border p-2 rounded" />
        <input name="year" value={player.year} onChange={handleChange} placeholder="Year (e.g. 2057)" className="border p-2 rounded" />
        <input name="war" value={player.war} onChange={handleChange} placeholder="WAR" className="border p-2 rounded" />
        <input name="obp" value={player.obp} onChange={handleChange} placeholder="OBP (for hitters)" className="border p-2 rounded" />
        <input name="ops" value={player.ops} onChange={handleChange} placeholder="OPS" className="border p-2 rounded" />
        <input name="era" value={player.era} onChange={handleChange} placeholder="ERA (for pitchers)" className="border p-2 rounded" />
        <input name="woba" value={player.woba} onChange={handleChange} placeholder="wOBA" className="border p-2 rounded" />
        <input name="awards" value={player.awards} onChange={handleChange} placeholder="Awards (optional)" className="border p-2 rounded" />
      </div>

      <textarea name="notes" value={player.notes} onChange={handleChange} placeholder="Optional blurb..." className="border p-2 rounded w-full mb-4" rows={3} />

      <button onClick={generateMarkdown} className="bg-blue-600 text-white px-4 py-2 rounded">Generate Markdown</button>

      {output && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-2">Generated Markdown</h2>
          <pre className="bg-gray-100 p-4 whitespace-pre-wrap rounded border">
            {output}
          </pre>
        </div>
      )}
    </div>
  );
};

export default MarkdownSummary;

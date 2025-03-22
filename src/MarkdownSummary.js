
import React, { useState } from 'react';

const MarkdownSummary = () => {
  const [rawInput, setRawInput] = useState('');
  const [summary, setSummary] = useState('');

  const parseBNNText = (text) => {
    const lines = text.split('\n');
    const player = {
      name: '',
      position: '',
      team: '',
      war: '',
      obp: '',
      slg: '',
      avg: '',
      ops: '',
      iso: '',
      woba: '',
      era: '',
      fip: '',
      whip: '',
      k9: '',
      bb9: '',
      role: '',
    };

    // Basic name and team
    const nameLine = lines.find(line => line.match(/^\s*[A-Z][a-z]+\s[A-Z][a-z]+\s+#\d+/));
    if (nameLine) {
      const [name, ...rest] = nameLine.split('#');
      player.name = name.trim();
    }

    const teamLine = lines.find(line => line.includes('MLB'));
    if (teamLine) {
      const match = teamLine.match(/^(.*)\s+MLB$/);
      if (match) player.team = match[1].trim();
    }

    // Determine role
    player.role = lines.find(line => line.startsWith('Suggested Role'))?.split(':')[1].trim() || '';

    // Detect hitter stats
    const avgLine = lines.find(line => line.includes('AVG') && line.includes('OBP') && line.includes('SLG'));
    if (avgLine) {
      const parts = avgLine.trim().split(/\s+/);
      player.avg = parts[0];
      player.obp = parts[1];
      player.slg = parts[2];
    }

    const warLine = lines.find(line => line.includes('WAR'));
    if (warLine) {
      const warMatch = warLine.match(/(\d+\.\d+)\s*$/);
      if (warMatch) player.war = warMatch[1];
    }

    const opsLine = lines.find(line => line.includes('OPS') && line.includes('wOBA'));
    if (opsLine) {
      const opsParts = opsLine.trim().split(/\s+/);
      player.ops = opsParts[0];
      player.woba = opsParts[1];
      player.iso = opsParts[2];
    }

    const eraLine = lines.find(line => line.includes('ERA') && line.includes('IP') && line.includes('WHIP'));
    if (eraLine) {
      const eraParts = eraLine.trim().split(/\s+/);
      player.era = eraParts[0];
      player.fip = eraParts[7] || '';
      player.whip = eraParts[5];
    }

    const k9Line = lines.find(line => line.includes('K/9') && line.includes('BB/9'));
    if (k9Line) {
      const matches = k9Line.trim().split(/\s+/);
      player.k9 = matches[2];
      player.bb9 = matches[3];
    }

    return player;
  };

  const generateMarkdown = () => {
    const p = parseBNNText(rawInput);
    let md = `### ${p.name} (${p.team})\n`;

    if (p.role.toLowerCase().includes('starter') || p.era) {
      md += `**Pitching Summary:**\n- ERA: ${p.era}\n- WHIP: ${p.whip}\n- K/9: ${p.k9}\n- BB/9: ${p.bb9}\n- FIP: ${p.fip}\n- WAR: ${p.war}\n`;
    } else {
      md += `**Batting Summary:**\n- AVG: ${p.avg}\n- OBP: ${p.obp}\n- SLG: ${p.slg}\n- OPS: ${p.ops}\n- ISO: ${p.iso}\n- wOBA: ${p.woba}\n- WAR: ${p.war}\n`;
    }

    setSummary(md);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4 text-center">BNN Markdown Summary Generator</h2>
      <textarea
        className="w-full h-64 p-3 border rounded-md mb-4"
        placeholder="Paste full BNN player page here..."
        value={rawInput}
        onChange={(e) => setRawInput(e.target.value)}
      />
      <button
        onClick={generateMarkdown}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 mb-4"
      >
        Generate Markdown
      </button>

      {summary && (
        <div>
          <h3 className="text-xl font-semibold mb-2">Markdown Output</h3>
          <pre className="bg-gray-100 p-4 rounded overflow-x-auto whitespace-pre-wrap">{summary}</pre>
        </div>
      )}
    </div>
  );
};

export default MarkdownSummary;

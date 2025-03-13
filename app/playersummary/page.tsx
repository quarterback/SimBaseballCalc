// pages/index.tsx
import { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const parseBNN = (text: string) => {
  const lines = text.split('\n');
  const summary: any = {
    name: '',
    team: '',
    position: '',
    isPitcher: false,
    advancedStats: {},
    leaderboards: []
  };

  for (const line of lines) {
    if (line.includes('AGE:')) {
      summary.name = line.split('AGE:')[0].trim();
      summary.position = line.split(' ')[0];
    }
    if (line.includes('MLB')) {
      const [_, nameLine] = line.split('MLB');
      summary.team = nameLine?.trim();
    }
    if (line.includes('WAR')) {
      const match = line.match(/WAR\s+(\d+\.\d)/);
      if (match) summary.advancedStats.WAR = parseFloat(match[1]);
    }
    if (line.includes('wRC+')) {
      const match = line.match(/wRC\+\s+(\d+)/);
      if (match) summary.advancedStats.wRC = parseInt(match[1]);
    }
    if (line.includes('FIP')) {
      const match = line.match(/FIP\s+(\d+\.\d+)/);
      if (match) summary.advancedStats.FIP = parseFloat(match[1]);
    }
    if (line.includes('ERA')) {
      const match = line.match(/ERA\s+(\d+\.\d+)/);
      if (match) summary.advancedStats.ERA = parseFloat(match[1]);
    }
    if (line.includes('OPS')) {
      const match = line.match(/OPS\s+(\d+\.\d+)/);
      if (match) summary.advancedStats.OPS = parseFloat(match[1]);
    }
    if (line.includes('ISO')) {
      const match = line.match(/ISO\s+(\d+\.\d+)/);
      if (match) summary.advancedStats.ISO = parseFloat(match[1]);
    }
    if (line.includes('LEADERBOARD APPEARANCES')) {
      summary.leaderboards.push(...lines.slice(lines.indexOf(line) + 1).filter(l => l.trim() !== ''));
    }
  }
  summary.isPitcher = !!summary.advancedStats.FIP;
  return summary;
};

export default function Home() {
  const [text, setText] = useState('');
  const [summary, setSummary] = useState<any | null>(null);

  const handleAnalyze = () => {
    const result = parseBNN(text);
    setSummary(result);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-4">
      <h1 className="text-2xl font-bold">OOTP Auto Summary Generator</h1>
      <Textarea
        placeholder="Paste full BNN player page here..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={15}
      />
      <Button onClick={handleAnalyze}>Generate Summary</Button>

      {summary && (
        <Card>
          <CardContent className="p-4 space-y-2">
            <h2 className="text-xl font-bold">{summary.name}</h2>
            <p>{summary.position} | {summary.team}</p>
            <div className="space-y-1">
              <h3 className="font-semibold">Advanced Stats</h3>
              <ul className="list-disc list-inside">
                {Object.entries(summary.advancedStats).map(([key, val]) => (
                  <li key={key}>{key}: {val}</li>
                ))}
              </ul>
            </div>
            {summary.leaderboards.length > 0 && (
              <div className="space-y-1">
                <h3 className="font-semibold">Leaderboard Mentions</h3>
                <ul className="list-disc list-inside text-sm">
                  {summary.leaderboards.slice(0, 5).map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

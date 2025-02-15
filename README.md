# OOTP Fantasy Calculator

A web application for converting Out of the Park Baseball (OOTP) statistics into fantasy baseball points using various scoring systems. Perfect for running fantasy leagues with fictional players or creating DFS contests using OOTP sim results.

## Features

### Multiple Scoring Systems
- **DraftKings DFS Style**
  - Full DraftKings scoring implementation for both hitting and pitching
  - Includes bonuses for complete games, shutouts, and no-hitters
  
- **FanDuel DFS Style**
  - Complete FanDuel scoring system for both hitting and pitching
  - Custom bonus structure for special achievements
  
- **Standard Season-Long**
  - Traditional fantasy baseball scoring
  - Configurable for both head-to-head and total points leagues
  
- **Rotisserie (5x5)**
  - Classic 5x5 categories
  - Supports both hitting and pitching categories
  - Calculates rankings and points for each category

### Stats Support
- **Hitting Statistics**
  - Singles, Doubles, Triples, Home Runs
  - Runs, RBIs
  - Walks, Hit By Pitch
  - Stolen Bases, Caught Stealing
  - Batting Average, OPS
  
- **Pitching Statistics**
  - Innings Pitched
  - Strikeouts
  - Wins, Saves, Holds
  - Earned Runs
  - Hits Allowed, Walks
  - ERA, WHIP
  - Complete Games, Shutouts, No-Hitters

## Setup

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

## Usage

1. Select your desired scoring system from the dropdown menu
2. Upload your OOTP CSV export files:
   - One for hitting statistics
   - One for pitching statistics
3. View calculated fantasy points or category rankings for each player

### CSV Format Requirements

#### Hitting Stats CSV
Required columns:
- Name
- POS (Position)
- H (Hits)
- 2B (Doubles)
- 3B (Triples)
- HR (Home Runs)
- R (Runs)
- RBI
- BB (Walks)
- SB (Stolen Bases)
- CS (Caught Stealing)
- AVG (Batting Average)
- OPS (Optional)

#### Pitching Stats CSV
Required columns:
- Name
- POS (Position)
- IP (Innings Pitched)
- HA (Hits Allowed)
- ER (Earned Runs)
- BB (Walks)
- K (Strikeouts)
- W (Wins)
- SV (Saves)
- HLD (Holds)
- ERA
- WHIP

## Scoring Details

### DraftKings DFS

#### Hitting
- Single: 3 pts
- Double: 5 pts
- Triple: 8 pts
- Home Run: 10 pts
- Run: 2 pts
- RBI: 2 pts
- Walk/HBP: 2 pts
- Stolen Base: 5 pts
- Caught Stealing: -2 pts

#### Pitching
- Per Out: 2.25 pts (6.75 per inning)
- Strikeout: 2 pts
- Win: 4 pts
- Earned Run: -2 pts
- Hit Allowed: -0.6 pts
- Walk: -0.6 pts
- HBP: -0.6 pts
- Complete Game: 2.5 pts bonus
- Complete Game Shutout: 2.5 pts bonus
- No-Hitter: 5 pts bonus

### FanDuel DFS

#### Hitting
- Single: 3 pts
- Double: 6 pts
- Triple: 9 pts
- Home Run: 12 pts
- Run: 3.2 pts
- RBI: 3.5 pts
- Walk/HBP: 3 pts
- Stolen Base: 6 pts
- Caught Stealing: -3 pts

#### Pitching
- Per Out: 3 pts (9 per inning)
- Strikeout: 3 pts
- Win: 6 pts
- Earned Run: -3 pts
- Hit Allowed: -0.6 pts
- Walk: -0.6 pts
- HBP: -0.6 pts
- Complete Game: 3 pts bonus
- Complete Game Shutout: 3 pts bonus
- No-Hitter: 6 pts bonus

## Planned Features

1. Custom Scoring Formula Builder
   - Create and save custom scoring systems
   - Support for complex scoring rules and bonuses

2. Advanced Stats Integration
   - Support for advanced metrics like wOBA, FIP
   - Custom stat calculations

3. League Management
   - Save league settings
   - Track multiple leagues
   - Season-long standings

4. Roster Management
   - Lineup optimization
   - Salary cap compliance
   - Position eligibility tracking

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the Mozilla Public License 2.0 - see the LICENSE file for details. This means:
- You can use this code in commercial projects
- You can modify the code as you need
- You must disclose the source code of any modifications
- You must state what changes you made
- You must include the original license

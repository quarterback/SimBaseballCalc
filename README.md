# OOTP Fantasy Calculator

For years, I've wanted a modular Fantasy calculator that lets you play OOTP like a fantasy league in all the various different formats, but didn't feel like building it myself because it's a huge lift for something so trivial. Then I realized all you really need is a calculator for making sense of the points, then all you need is a separate spreadsheet to play how you want. Since OOTP is mostly a solo game anyway, I figure that anyone dorky would just figure out how to make this work for themselves. This is pretty bare bones, built in less than an hour and is mostly just for me, I guess I'll share it someday. Fork and update it to your heart's content if you find it. 

Ideal state, someday there could be more features to something like this...but it's a limited use case tool and this already surpasses my hopes and dreams. 

# OOTP Fantasy Calculator

## Features

### Multiple Scoring Systems
- **DraftKings DFS Style**
  - Full DraftKings scoring implementation for both hitting and pitching
  - Includes bonuses for complete games, shutouts, and no-hitters
  
- **FanDuel DFS Style**
  - Complete FanDuel scoring system for both hitting and pitching
  - Custom bonus structure for special achievements
  
- **Rotisserie (5x5)**
  - Classic 5x5 categories (R, HR, RBI, SB, AVG for hitting; W, SV, ERA, WHIP, K for pitching)
  - Implements full category rankings
  - Calculates standardized 12-point scale scores
  
- **Statcast Era**
  - Modern analytics-focused scoring
  - Emphasizes advanced metrics like ISO, OPS, FIP
  - Includes WAR and park-adjusted stats
  
- **Backwards Baseball**
  - Reverse scoring system where negative outcomes earn points
  - Rewards strikeouts (hitting) and earned runs (pitching)
  - Perfect for finding the "best worst players"

### Stats Support
- **Basic Stats**
  - Singles, Doubles, Triples, Home Runs
  - Runs, RBIs
  - Walks, Hit By Pitch
  - Stolen Bases, Caught Stealing
  - Batting Average
  
- **Advanced Stats**
  - ISO (Isolated Power)
  - OPS (On-base Plus Slugging)
  - BABIP
  - K/9, BB/9
  - FIP (Fielding Independent Pitching)
  - ERA+
  - WAR

## CSV Format Requirements

### Hitting Stats CSV
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
- OPS
- BABIP
- WAR

### Pitching Stats CSV
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
- FIP
- ERA+
- WAR

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


### Statcast Era

#### Hitting
- OBP: 15 pts
- SLG: 10 pts
- ISO: 8 pts
- BABIP: 5 pts
- OPS: 12 pts
- WAR: 10 pts
- HR: 4 pts
- BB: 3 pts
- K: -2 pts

#### Pitching
- K/9: 5 pts
- BB/9: -3 pts
- HR/9: -5 pts
- WHIP: -8 pts
- FIP: -6 pts
- ERA+: 4 pts
- WAR: 8 pts

### Backwards Baseball

#### Hitting
- AB: 1 pt
- H: -2 pts
- HR: -10 pts
- RBI: -2 pts
- BB: -3 pts
- K: 3 pts
- GIDP: 5 pts
- CS: 4 pts

#### Pitching
- IP: 2 pts
- ER: 3 pts
- H: 1 pt
- BB: 2 pts
- K: -2 pts
- HR: 5 pts
- L: 10 pts

## License
This project is licensed under the Mozilla Public License 2.0 - see the LICENSE file for details. This means:
- You can use this code in commercial projects
- You can modify the code as you need
- You must disclose the source code of any modifications
- You must state what changes you made
- You must include the original license

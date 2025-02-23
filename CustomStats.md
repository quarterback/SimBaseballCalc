# OOTP Advanced Metrics Documentation
I wanted to generate some advanced metrics, you can view them at HIT and PITCH and using an imported CSV generate these metrics for players in your save. 

## Hitting Metrics

### Expected Stats
- **xBA**: Expected Batting Average - Combines BABIP (85%) and AVG (15%) to predict true hitting ability
- **xSLG**: Expected Slugging - Weighted combination of SLG (90%) and ISO (10%)
- **xwOBA**: Expected wOBA - Weighted combination of OBP (60%), SLG (30%), and HR rate (10%)
- **xOPS+**: Expected OPS+ - Adjusts OPS+ with isolated power impact

### Contact & Approach
- **Contact+**: Contact rating impact plus non-strikeout rate adjustment
- **Chase%**: Plate discipline metric combining Eye rating and strikeout rate
- **BIP%**: Balls in Play Percentage - PA minus HR, BB, and HBP
- **Plate Skills**: Composite of OBP, Eye rating, and contact ability

### Power Metrics
- **True ISO**: Isolated Power adjusted by Power rating
- **Barrel%**: Quality contact rate based on extra-base hits per PA
- **xHR%**: Expected Home Run rate with 15% projection factor

### Run Production
- **RPE**: Run Production Efficiency - (RBI + R - HR) per PA
- **True wOBA**: Custom wOBA with weighted values for all hit types
- **PSN**: Power-Speed Number - Harmonic mean of HR and SB

### Performance
- **Clutch Index**: WPA impact per plate appearance

## Pitching Metrics

### Expected Stats
- **xERA**: Expected ERA - Weighted ERA (60%), FIP (30%), BABIP impact (10%)
- **xFIP**: Expected FIP - FIP (85%) with HR/9 adjustment (15%)

### Command & Control
- **DOMS**: Dominance Score - K-BB% plus weighted K-rate
- **ChE%**: Chase Efficiency - Strikeout success rate on total opportunities
- **True WHIP**: WHIP excluding intentional walks

### Performance Under Pressure
- **High Lev**: High Leverage Performance Index - WPA impact plus LOB% minus BB% penalty
- **ESC%**: Escape Percentage - Success rate with inherited runners

### Stuff & Results
- **PWR%**: Putaway Rate - K's per batters faced
- **SwStr%**: Swinging Strike estimation
- **tK-BB%**: True K-BB% with leverage adjustment
- **LIE**: Leverage-adjusted Impact on ERA
- **K/IP**: Strikeouts per Inning
- **K/BF%**: Strikeout rate per Batter Faced

These metrics try to capture aspects of performance that standard stats might miss, with many being original formulations designed specifically for OOTP's statistical environment.

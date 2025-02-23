# **OOTP Advanced Stat Analyzer – Spreadsheet Formatting Guide**

To use the **OOTP Advanced Stat Analyzer** for hitters and pitchers, follow these formatting guidelines to ensure your spreadsheet is properly structured for the tool to generate advanced sabermetric metrics.

---

## **📌 General Formatting Rules**
1. **File Type:** CSV (Comma-Separated Values)
2. **Header Row:** The **first row** of the spreadsheet **must** contain column names.
3. **Data Rows:** Each row after the header represents a single **player’s** stats.
4. **Data Types:**  
   - **Numbers:** Ensure all numeric stats (AVG, OBP, K%, etc.) are stored as **numbers**, not text.
   - **Percentages:** Enter all percentages as **decimal values** (e.g., **0.300** for 30%).
   - **Ratings (20-80 Scale):** Input exactly as displayed in OOTP.
5. **Missing Data:** Leave blank or input "0" if a stat is unavailable.

---

## **📊 Hitter Spreadsheet Formatting**
### **Required Columns for Hitter Analysis**
| Column Name | Description | Example |
|-------------|-------------|----------|
| **Name** | Player's full name | Juan Soto |
| **Team** | Team name or abbreviation | SDP |
| **AVG** | Batting Average | 0.315 |
| **OBP** | On-Base Percentage | 0.420 |
| **SLG** | Slugging Percentage | 0.570 |
| **ISO** | Isolated Power (SLG - AVG) | 0.255 |
| **BABIP** | Batting Average on Balls in Play | 0.310 |
| **HR** | Home Runs | 35 |
| **PA** | Plate Appearances | 650 |
| **BB%** | Walk Percentage (decimal) | 0.125 |
| **K%** | Strikeout Percentage (decimal) | 0.180 |
| **wOBA** | Weighted On-Base Average | 0.400 |
| **wRC+** | Weighted Runs Created Plus | 160 |
| **OPS** | On-Base + Slugging | 0.990 |
| **OPS+** | OPS Adjusted for Park & League | 155 |
| **Contact** | Contact Rating (20-80 scale) | 65 |
| **Gap** | Gap Power Rating (20-80 scale) | 60 |
| **Power** | Power Rating (20-80 scale) | 75 |
| **Eye** | Plate Discipline (20-80 scale) | 70 |
| **Avoid K** | Ability to Avoid Strikeouts (20-80 scale) | 50 |

### **Optional Batted Ball & Spray Chart Data**
| Column Name | Description | Example |
|-------------|-------------|----------|
| **LD%** | Line Drive Percentage | 0.250 |
| **GB%** | Ground Ball Percentage | 0.420 |
| **FB%** | Fly Ball Percentage | 0.330 |
| **Pull%** | Percentage of Pulled Hits | 0.400 |
| **Center%** | Percentage of Center-Focused Hits | 0.350 |
| **Oppo%** | Percentage of Opposite-Field Hits | 0.250 |

### **📥 Example Hitter CSV Format**
```
Name,Team,AVG,OBP,SLG,ISO,BABIP,HR,PA,BB%,K%,wOBA,wRC+,OPS,OPS+,Contact,Gap,Power,Eye,Avoid K,LD%,GB%,FB%,Pull%,Center%,Oppo%
Juan Soto,SDP,0.315,0.420,0.570,0.255,0.310,35,650,0.125,0.180,0.400,160,0.990,155,65,60,75,70,50,0.250,0.420,0.330,0.400,0.350,0.250
```

---

## **⚾ Pitcher Spreadsheet Formatting**
### **Required Columns for Pitcher Analysis**
| Column Name | Description | Example |
|-------------|-------------|----------|
| **Name** | Player's full name | Gerrit Cole |
| **Team** | Team name or abbreviation | NYY |
| **ERA** | Earned Run Average | 2.85 |
| **FIP** | Fielding Independent Pitching | 2.90 |
| **WHIP** | Walks + Hits per IP | 1.02 |
| **K/9** | Strikeouts per 9 Innings | 11.3 |
| **BB/9** | Walks per 9 Innings | 2.1 |
| **HR/9** | Home Runs Allowed per 9 Innings | 0.85 |
| **K%** | Strikeout Percentage (decimal) | 0.280 |
| **BB%** | Walk Percentage (decimal) | 0.070 |
| **K-BB%** | Strikeout Minus Walk Rate | 0.210 |
| **LOB%** | Left on Base Percentage | 0.780 |
| **BABIP** | Opponent Batting Average on Balls in Play | 0.295 |
| **H/9** | Hits Allowed per 9 Innings | 7.1 |
| **WPA** | Win Probability Added | 2.50 |
| **WAR** | Wins Above Replacement | 6.2 |

### **Pitching Ratings (20-80 Scale)**
| Column Name | Description | Example |
|-------------|-------------|----------|
| **Stuff** | Measures ability to miss bats | 70 |
| **Movement** | Ability to prevent home runs | 65 |
| **Control** | Ability to limit walks | 55 |
| **Stamina** | Endurance (higher for SP) | 60 |
| **Velocity** | Fastball velocity (MPH) | 97 |

### **Optional Pitch Arsenal & Batted Ball Data**
| Column Name | Description | Example |
|-------------|-------------|----------|
| **GB%** | Ground Ball Percentage | 0.55 |
| **FB%** | Fly Ball Percentage | 0.30 |
| **LD%** | Line Drive Percentage | 0.15 |
| **Chase%** | Chase Rate - Swings at Out-of-Zone Pitches | 0.33 |
| **SwStr%** | Swinging Strike Percentage | 0.15 |
| **Edge%** | Pitch % on Edge of Strike Zone | 0.42 |

### **📥 Example Pitcher CSV Format**
```
Name,Team,ERA,FIP,WHIP,K/9,BB/9,HR/9,K%,BB%,K-BB%,LOB%,BABIP,H/9,WPA,WAR,Stuff,Movement,Control,Stamina,Velocity,GB%,FB%,LD%,Chase%,SwStr%,Edge%
Gerrit Cole,NYY,2.85,2.90,1.02,11.3,2.1,0.85,0.280,0.070,0.210,0.780,0.295,7.1,2.50,6.2,70,65,55,60,97,0.55,0.30,0.15,0.33,0.15,0.42
```

---

## **⏬ How to Upload the CSV to the Advanced Stat Analyzer**
1. **Prepare the CSV:** Format your spreadsheet as described above.
2. **Save As CSV:** In **Google Sheets**, go to `File` → `Download` → `Comma Separated Values (.csv)`.
3. **Upload the File:**
   - Open the **Advanced Stat Analyzer** tool.
   - Click **"CSV Upload"**.
   - Select your CSV file and click **Open**.
4. **View Results:** The tool will automatically calculate and display **new advanced stats**.

---

## **💡 FAQs**
**1️⃣ What if I don’t have all the stats for a player?**  
Leave them blank, and the analyzer will **ignore missing values** in calculations.

**2️⃣ Do I need both hitting and pitching stats in one CSV?**  
No. **Separate** hitters and pitchers into **different files**.

**3️⃣ What happens if I format it incorrectly?**  
The tool will show an **error message**. Double-check the column headers and data types.

---

This guide ensures your CSVs are correctly formatted for **fast, accurate, and in-depth OOTP analysis**. 🚀⚾ Let me know if you need modifications!

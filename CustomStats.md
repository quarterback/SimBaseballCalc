# **OOTP Advanced Metrics - README**

This document provides an overview of the **custom advanced metrics** implemented in the **OOTP Advanced Stats Tool**, including both original and adapted sabermetric concepts. These metrics help analyze players beyond what OOTP provides, giving deeper insight into performance and potential.

---

## **Pitching Metrics**
### **1. xERA (Expected ERA)**
- Expected ERA based on **FIP, HR/9, BB/9, K/9, and LOB%**.
- Provides a **fielding-independent** measure of a pitcher’s actual run prevention skill.

### **2. xFIP (Expected Fielding Independent Pitching)**
- Similar to FIP but normalizes **home run rates** to expected league averages.
- More predictive than standard FIP for evaluating future performance.

### **3. DOMS (Dominance Score)**
- A proprietary metric combining **K/9, SwStr%, and Stuff+** to measure how overpowering a pitcher is.

### **4. ChE% (Chase Efficiency)**
- Measures how often batters chase pitches **outside the zone**.
- Derived from **BB% and Control rating**.

### **5. True WHIP**
- Adjusted WHIP that accounts for **hit suppression ability** and **BABIP luck correction**.

### **6. High Lev PWR% (High-Leverage Power Rate)**
- Measures **home runs and extra-base hits allowed** in high-leverage situations.
- Uses HR/9 and leverage index to weigh clutch performance.

### **7. SwStr% (Swinging Strike Rate)**
- The percentage of total pitches that result in **swings and misses**.
- Derived from K% and Stuff rating.

### **8. ↓tK-BB% (True K-BB%)**
- A refined **strikeout-to-walk ratio** that incorporates **Command rating** and park-adjusted walk rates.

### **9. LIE (Leverage Index Efficiency)**
- Measures how **well a pitcher performs in high-pressure situations**.
- A combination of **LOB%, WPA, and leverage-adjusted ERA**.

### **10. ESC% (Escape Rate)**
- The percentage of **runners stranded** by a pitcher after allowing a baserunner.
- Derived from LOB%, GB%, and Strikeout Ability.

### **11. K/IP (Strikeouts per Inning)**
- A more granular measure of a pitcher’s ability to **generate strikeouts per inning pitched**.

---

## **Hitting Metrics**
### **12. xBA (Expected Batting Average)**
- Estimates batting average based on **contact%, BABIP, and power indicators**.

### **13. xSLG (Expected Slugging Percentage)**
- Adjusted SLG that accounts for **exit velocity, power rating, and HR/PA**.

### **14. xwOBA (Expected Weighted On-Base Average)**
- Uses **OBP, SLG, and BABIP** to approximate **expected offensive contribution**.

### **15. xOPS+ (Expected OPS Plus)**
- Normalizes **OPS** for park effects and **adjusts for expected contact quality**.

### **16. Contact+**
- A **normalized contact rating** that incorporates **avoid-K, BABIP, and gap power**.

### **17. True ISO**
- Adjusted ISO (Isolated Power) that includes **HR/PA and expected doubles rate**.

### **18. Plate Skills**
- An aggregate of **BB%, K%, Eye rating, and Chase Rate** to measure batting discipline.

### **19. Chase%**
- Percentage of swings at **out-of-zone pitches**.
- Derived from **Eye rating and BB%**.

### **20. BIP% (Balls in Play Rate)**
- Measures how often a batter **puts the ball in play** (excludes K and BB outcomes).

### **21. Barrel%**
- The percentage of **batted balls classified as barrels** (high exit velocity & optimal launch angle).
- Estimated using **ISO, HR/PA, and power rating**.

### **22. xHR% (Expected Home Run Rate)**
- Home run probability based on **ISO, flyball%, and HR/FB rate**.

### **23. RPE (Run Production Efficiency)**
- Measures how effectively a hitter converts **opportunities into runs**.
- Incorporates **wOBA, RBI%, and clutch hitting performance**.

### **24. True wOBA**
- An improved version of wOBA, incorporating **park effects and expected contact**.

### **25. Clutch Index**
- Evaluates a batter’s **performance in high-leverage situations**.
- Uses **WPA, late-inning OPS, and high-lev PAs**.

### **26. PSN (Positional Scoring Normalization)**
- Adjusts offensive performance based on **league-wide averages for a given position**.

---

### **Future Development**
- Potential additions include **park-adjusted metrics**, more defensive analytics, and **predictive modeling** based on historical performance.

import React, { useState } from 'react';

const FanInterestCalc = () => {
    const [marketSize, setMarketSize] = useState(10);
    const [currentFanInterest, setCurrentFanInterest] = useState(50);
    const [fanLoyalty, setFanLoyalty] = useState(5);
    const [winPercentages, setWinPercentages] = useState(['.500', '.500', '.500', '.500', '.500']);
    const [playoffAppearances, setPlayoffAppearances] = useState(0);
    const [divisionTitles, setDivisionTitles] = useState(0);
    const [pennants, setPennants] = useState(0);
    const [championships, setChampionships] = useState(0);
    const [expansionBoost, setExpansionBoost] = useState(false);
    const [newFanInterest, setNewFanInterest] = useState(currentFanInterest);
    const [newFanLoyalty, setNewFanLoyalty] = useState(fanLoyalty);

    const calculateFanInterest = () => {
        let interest = parseInt(currentFanInterest);
        let loyalty = parseInt(fanLoyalty);
        
        // Convert win % to actual decimals for calculation
        let winRates = winPercentages.map(wp => parseFloat(wp));
        let avgWinRate = winRates.reduce((a, b) => a + b, 0) / winRates.length;
        let recentTrend = winRates[4] - winRates[0]; // Change from 5 years ago

        // **Base Win % Impact**
        if (avgWinRate >= .600) interest += 5;
        else if (avgWinRate >= .500) interest += 2;
        else if (avgWinRate < .400) interest -= 5;
        else if (avgWinRate < .300) interest -= 10;

        // **Trend Impact**
        if (recentTrend > .050) interest += 3;
        else if (recentTrend < -.050) interest -= 3;

        // **Postseason Performance Impact**
        interest += playoffAppearances * 2;
        interest += divisionTitles * 4;
        interest += pennants * 6;
        interest += championships * 10;

        // **Expansion/Relocation Boost**
        if (expansionBoost) interest += 15;

        // **Market Size Modifier** (Larger markets are more stable)
        let marketFactor = (marketSize - 10) * 0.5; // Scale around 10
        interest += marketFactor;

        // **Randomization Factor** (Slight variability)
        let variance = Math.floor(Math.random() * 5) - 2; // -2 to +2
        interest += variance;

        // **Clamp Fan Interest between 1-100**
        interest = Math.max(1, Math.min(100, interest));

        // **Fan Loyalty Calculation** (More winning = higher loyalty, sustained losing drops it)
        if (avgWinRate >= .550) loyalty += 1;
        if (avgWinRate < .450) loyalty -= 1;
        if (championships > 0) loyalty += 2;
        if (expansionBoost) loyalty += 1;
        loyalty = Math.max(0, Math.min(10, loyalty));

        setNewFanInterest(interest);
        setNewFanLoyalty(loyalty);
    };

    return (
        <div className="p-6 max-w-lg mx-auto bg-white shadow-lg rounded-lg">
            <h2 className="text-xl font-bold mb-4">Fan Interest Calculator</h2>

            <label className="block mb-2">Market Size (1-20):</label>
            <input type="number" className="w-full p-2 border rounded" value={marketSize} 
                onChange={(e) => setMarketSize(parseInt(e.target.value))} min="1" max="20" />

            <label className="block mt-4 mb-2">Current Fan Interest (1-100):</label>
            <input type="number" className="w-full p-2 border rounded" value={currentFanInterest} 
                onChange={(e) => setCurrentFanInterest(parseInt(e.target.value))} min="1" max="100" />

            <label className="block mt-4 mb-2">Fan Loyalty (0-10):</label>
            <input type="number" className="w-full p-2 border rounded" value={fanLoyalty} 
                onChange={(e) => setFanLoyalty(parseInt(e.target.value))} min="0" max="10" />

            <label className="block mt-4 mb-2">Last 5 Seasons Win %:</label>
            <div className="grid grid-cols-5 gap-2">
                {winPercentages.map((winRate, index) => (
                    <input key={index} type="text" className="p-2 border rounded text-center" 
                        value={winRate} onChange={(e) => {
                            let updated = [...winPercentages];
                            updated[index] = e.target.value;
                            setWinPercentages(updated);
                        }} />
                ))}
            </div>

            <label className="block mt-4 mb-2">Postseason Success:</label>
            <div className="grid grid-cols-2 gap-2">
                <div>
                    <label>Playoff Appearances: </label>
                    <input type="number" className="w-full p-2 border rounded" value={playoffAppearances} 
                        onChange={(e) => setPlayoffAppearances(parseInt(e.target.value))} min="0" />
                </div>
                <div>
                    <label>Division Titles: </label>
                    <input type="number" className="w-full p-2 border rounded" value={divisionTitles} 
                        onChange={(e) => setDivisionTitles(parseInt(e.target.value))} min="0" />
                </div>
                <div>
                    <label>Pennants: </label>
                    <input type="number" className="w-full p-2 border rounded" value={pennants} 
                        onChange={(e) => setPennants(parseInt(e.target.value))} min="0" />
                </div>
                <div>
                    <label>Championships: </label>
                    <input type="number" className="w-full p-2 border rounded" value={championships} 
                        onChange={(e) => setChampionships(parseInt(e.target.value))} min="0" />
                </div>
            </div>

            <div className="mt-4">
                <label>
                    <input type="checkbox" checked={expansionBoost} onChange={() => setExpansionBoost(!expansionBoost)} />
                    Expansion/Relocation Boost
                </label>
            </div>

            <button className="mt-4 w-full bg-blue-500 text-white py-2 rounded" onClick={calculateFanInterest}>
                Calculate Fan Interest
            </button>

            <div className="mt-4 p-4 bg-gray-100 rounded">
                <h3 className="text-lg font-bold">New Fan Interest: {newFanInterest}</h3>
                <h3 className="text-lg font-bold">New Fan Loyalty: {newFanLoyalty}</h3>
            </div>
        </div>
    );
};

export default FanInterestCalc;

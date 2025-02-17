import React, { useState } from 'react';

const FanInterestCalc = () => {
    const [marketSize, setMarketSize] = useState(10);
    const [fanInterest, setFanInterest] = useState(50);
    const [fanLoyalty, setFanLoyalty] = useState(5);
    const [winPercentages, setWinPercentages] = useState(['.500', '.500', '.500', '.500', '.500']);
    const [playoffs, setPlayoffs] = useState(false);
    const [division, setDivision] = useState(false);
    const [pennant, setPennant] = useState(false);
    const [championship, setChampionship] = useState(false);
    const [expansion, setExpansion] = useState(false);
    const [newFanInterest, setNewFanInterest] = useState(null);

    const calculateFanInterest = () => {
        let interest = fanInterest;
        const marketMultiplier = marketSize / 20;
        const loyaltyFactor = fanLoyalty / 10;
        
        // Calculate base win percentage impact
        const avgWinPct = winPercentages.reduce((sum, val) => sum + parseFloat(val), 0) / 5;
        if (avgWinPct >= 0.650) interest += 5 * marketMultiplier;
        if (avgWinPct >= 0.700) interest += 10 * marketMultiplier;
        if (avgWinPct <= 0.300) interest -= 10 * (1 - loyaltyFactor);
        if (avgWinPct <= 0.200) interest -= 15 * (1 - loyaltyFactor);

        // Postseason adjustments
        if (playoffs) interest += 3;
        if (division) interest += 5;
        if (pennant) interest += 8;
        if (championship) interest += 15;

        // Expansion/Relocation boost
        if (expansion) interest = Math.max(interest, 80);

        // Clamp within 1-100 range
        interest = Math.min(Math.max(interest, 1), 100);
        
        setNewFanInterest(interest);
    };

    return (
        <div className="p-6 max-w-lg mx-auto bg-white shadow-lg rounded-lg">
            <h2 className="text-xl font-bold mb-4">Fan Interest Calculator</h2>
            
            <label className="block mb-2">Market Size (1-20):</label>
            <input type="number" min="1" max="20" className="w-full p-2 border rounded" value={marketSize} onChange={(e) => setMarketSize(parseInt(e.target.value))} />
            
            <label className="block mt-4 mb-2">Current Fan Interest (1-100):</label>
            <input type="number" min="1" max="100" className="w-full p-2 border rounded" value={fanInterest} onChange={(e) => setFanInterest(parseInt(e.target.value))} />
            
            <label className="block mt-4 mb-2">Fan Loyalty (0-10):</label>
            <input type="number" min="0" max="10" className="w-full p-2 border rounded" value={fanLoyalty} onChange={(e) => setFanLoyalty(parseInt(e.target.value))} />
            
            <label className="block mt-4 mb-2">Last 5 Seasons Win %:</label>
            <div className="grid grid-cols-5 gap-2">
                {winPercentages.map((winPct, i) => (
                    <input key={i} type="text" className="p-2 border rounded text-center" value={winPct} onChange={(e) => {
                        const newWinPcts = [...winPercentages];
                        newWinPcts[i] = e.target.value;
                        setWinPercentages(newWinPcts);
                    }} />
                ))}
            </div>
            
            <div className="mt-4">
                <label className="block mb-2">Postseason Success:</label>
                <div className="flex flex-wrap gap-4">
                    <label><input type="checkbox" checked={playoffs} onChange={() => setPlayoffs(!playoffs)} /> Playoffs</label>
                    <label><input type="checkbox" checked={division} onChange={() => setDivision(!division)} /> Division Title</label>
                    <label><input type="checkbox" checked={pennant} onChange={() => setPennant(!pennant)} /> Pennant</label>
                    <label><input type="checkbox" checked={championship} onChange={() => setChampionship(!championship)} /> Championship</label>
                </div>
            </div>
            
            <div className="mt-4">
                <label><input type="checkbox" checked={expansion} onChange={() => setExpansion(!expansion)} /> Expansion/Relocation Boost</label>
            </div>
            
            <button className="mt-4 w-full bg-blue-500 text-white py-2 rounded" onClick={calculateFanInterest}>
                Calculate Fan Interest
            </button>
            
            {newFanInterest !== null && (
                <div className="mt-4 p-4 bg-gray-100 rounded">
                    <h3 className="text-lg font-bold">New Fan Interest: {newFanInterest}</h3>
                </div>
            )}
        </div>
    );
};

export default FanInterestCalc;

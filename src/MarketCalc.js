import React, { useState } from 'react';

const cityMarketData = {
    // Tier 1 Markets (17-20)
    "New York": { "2025": 20, "1980": 19, "1950": 18 },
    "Los Angeles": { "2025": 19, "1980": 18, "1950": 17 },
    "Chicago": { "2025": 18, "1980": 17, "1950": 16 },
    "Toronto": { "2025": 17, "1980": 15, "1950": 12 },
    
    // Tier 2 Markets (14-16)
    "Dallas": { "2025": 16, "1980": 14, "1950": 10 },
    "Houston": { "2025": 16, "1980": 13, "1950": 9 },
    "Philadelphia": { "2025": 15, "1980": 14, "1950": 13 },
    "Washington DC": { "2025": 15, "1980": 13, "1950": 11 },
    "Atlanta": { "2025": 15, "1980": 12, "1950": 8 },
    "Boston": { "2025": 15, "1980": 14, "1950": 13 },
    "Phoenix": { "2025": 15, "1980": 11, "1950": 6 },
    "San Francisco": { "2025": 15, "1980": 14, "1950": 12 },
    "Montreal": { "2025": 14, "1980": 13, "1950": 11 },
    
    // Tier 3 Markets (11-13)
    "Seattle": { "2025": 13, "1980": 12, "1950": 8 },
    "Denver": { "2025": 13, "1980": 10, "1950": 7 },
    "Detroit": { "2025": 12, "1980": 14, "1950": 15 },
    "Minneapolis": { "2025": 12, "1980": 11, "1950": 8 },
    "Miami": { "2025": 12, "1980": 9, "1950": 5 },
    "San Diego": { "2025": 12, "1980": 10, "1950": 7 },
    "Tampa": { "2025": 12, "1980": 8, "1950": 4 },
    "Baltimore": { "2025": 11, "1980": 12, "1950": 13 },
    "St. Louis": { "2025": 11, "1980": 13, "1950": 14 },
    "Vancouver": { "2025": 11, "1980": 9, "1950": 6 },
    
    // Tier 4 Markets (8-10)
    "Portland": { "2025": 10, "1980": 8, "1950": 5 },
    "Sacramento": { "2025": 10, "1980": 8, "1950": 5 },
    "Charlotte": { "2025": 10, "1980": 7, "1950": 4 },
    "Pittsburgh": { "2025": 9, "1980": 11, "1950": 13 },
    "Indianapolis": { "2025": 9, "1980": 8, "1950": 7 },
    "Cincinnati": { "2025": 9, "1980": 10, "1950": 11 },
    "Cleveland": { "2025": 9, "1980": 12, "1950": 14 },
    "Kansas City": { "2025": 9, "1980": 8, "1950": 7 },
    "Columbus": { "2025": 9, "1980": 7, "1950": 6 },
    "Nashville": { "2025": 9, "1980": 6, "1950": 4 },
    "Austin": { "2025": 9, "1980": 5, "1950": 3 },
    "Calgary": { "2025": 8, "1980": 6, "1950": 4 },
    
    // Tier 5 Markets (5-7)
    "Milwaukee": { "2025": 7, "1980": 8, "1950": 9 },
    "San Antonio": { "2025": 7, "1980": 5, "1950": 3 },
    "Las Vegas": { "2025": 7, "1980": 4, "1950": 2 },
    "Oklahoma City": { "2025": 7, "1980": 5, "1950": 3 },
    "New Orleans": { "2025": 7, "1980": 8, "1950": 9 },
    "Salt Lake City": { "2025": 7, "1980": 5, "1950": 3 },
    "Buffalo": { "2025": 6, "1980": 8, "1950": 12 },
    "Memphis": { "2025": 6, "1980": 5, "1950": 4 },
    "Richmond": { "2025": 6, "1980": 5, "1950": 4 },
    "Louisville": { "2025": 6, "1980": 5, "1950": 4 },
    "Ottawa": { "2025": 6, "1980": 5, "1950": 4 },
    "Edmonton": { "2025": 5, "1980": 4, "1950": 3 },
    
    // Tier 6 Markets (1-4)
    "Albuquerque": { "2025": 4, "1980": 3, "1950": 2 },
    "Birmingham": { "2025": 4, "1980": 3, "1950": 2 },
    "Rochester": { "2025": 4, "1980": 5, "1950": 7 },
    "Tucson": { "2025": 4, "1980": 3, "1950": 2 },
    "Omaha": { "2025": 4, "1980": 3, "1950": 2 },
    "Winnipeg": { "2025": 4, "1980": 3, "1950": 2 },
    "Billings": { "2025": 3, "1980": 2, "1950": 1 },
    "Boise": { "2025": 3, "1980": 2, "1950": 1 },
    "Des Moines": { "2025": 3, "1980": 2, "1950": 2 },
    "Spokane": { "2025": 3, "1980": 2, "1950": 1 },
    "Quebec City": { "2025": 3, "1980": 2, "1950": 2 }
};

const MarketCalc = () => {
    const [city, setCity] = useState('');
    const [era, setEra] = useState('2025');
    const [marketSize, setMarketSize] = useState(null);

    const calculateMarketSize = () => {
        if (cityMarketData[city] && cityMarketData[city][era]) {
            setMarketSize(cityMarketData[city][era]);
        } else {
            setMarketSize("Unknown");
        }
    };

    return (
        <div className="p-6 max-w-lg mx-auto bg-white shadow-lg rounded-lg">
            <h2 className="text-xl font-bold mb-4">OOTP Market Size Calculator</h2>
            
            <label className="block mb-2">Select City:</label>
            <select className="w-full p-2 border rounded" value={city} onChange={(e) => setCity(e.target.value)}>
                <option value="">-- Select a City --</option>
                {Object.keys(cityMarketData).map(city => (
                    <option key={city} value={city}>{city}</option>
                ))}
            </select>
            
            <label className="block mt-4 mb-2">Select Era:</label>
            <select className="w-full p-2 border rounded" value={era} onChange={(e) => setEra(e.target.value)}>
                <option value="2025">2025</option>
                <option value="1980">1980</option>
                <option value="1950">1950</option>
            </select>
            
            <button className="mt-4 w-full bg-blue-500 text-white py-2 rounded" onClick={calculateMarketSize}>
                Calculate Market Size
            </button>
            
            {marketSize !== null && (
                <div className="mt-4 p-4 bg-gray-100 rounded">
                    <h3 className="text-lg font-bold">Market Size Rating: {marketSize}</h3>
                </div>
            )}
        </div>
    );
};

export default MarketCalc;

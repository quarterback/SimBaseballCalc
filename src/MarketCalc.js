import React, { useState } from 'react';

const cityMarketData = {
    "New York": { "2025": 20, "1980": 19, "1950": 18 },
    "Los Angeles": { "2025": 19, "1980": 18, "1950": 17 },
    "Chicago": { "2025": 18, "1980": 17, "1950": 16 },
    "Dallas": { "2025": 17, "1980": 14, "1950": 10 },
    "Houston": { "2025": 16, "1980": 13, "1950": 9 },
    "Phoenix": { "2025": 15, "1980": 11, "1950": 6 },
    "Seattle": { "2025": 14, "1980": 12, "1950": 8 },
    "Denver": { "2025": 13, "1980": 10, "1950": 7 },
    "Minneapolis": { "2025": 12, "1980": 11, "1950": 8 },
    "Miami": { "2025": 12, "1980": 9, "1950": 5 },
    "Buffalo": { "2025": 6, "1980": 8, "1950": 12 },
    "Portland": { "2025": 10, "1980": 8, "1950": 5 },
    "Billings": { "2025": 3, "1980": 2, "1950": 1 },
};

const MarketSizeCalculator = () => {
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

export default MarketSizeCalculator;

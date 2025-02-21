import React, { useState } from "react";

const FieldingRunValueCalculator = () => {
  const [playerData, setPlayerData] = useState({
    name: "",
    team: "",
    position: "OF", // Default to outfield
    zr: "",
    assists: "",
    errors: "",
    frm: "",
    pb: "",
    wp: "",
    cs: "",
    sb: "",
    eff: "",
    leagueAvgEff: "1.000", // Default to neutral efficiency
  });

  const handleChange = (e) => {
    setPlayerData({
      ...playerData,
      [e.target.name]: e.target.value,
    });
  };

  // Position Adjustment Factor (OF = 0.9, IF = 0.75)
  const posFactor = playerData.position === "OF" ? 0.9 : 0.75;

  // Calculate Fielding Run Value (FRV)
  const frv =
    (parseFloat(playerData.zr) || 0) * posFactor +
    (parseFloat(playerData.assists) || 0) * 0.5 -
    (parseFloat(playerData.errors) || 0) * 0.5 +
    (parseFloat(playerData.frm) || 0) * 0.125 -
    (parseFloat(playerData.pb) || 0) * 0.25 -
    (parseFloat(playerData.wp) || 0) * 0.1 +
    (parseFloat(playerData.cs) || 0) * 0.65 -
    (parseFloat(playerData.sb) || 0) * 0.65 +
    ((parseFloat(playerData.eff) || 1.0) - (parseFloat(playerData.leagueAvgEff) || 1.0)) * 10;

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white shadow-md rounded-lg">
      <h2 className="text-2xl font-bold text-center mb-4">OOTP Fielding Run Value Calculator</h2>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <input type="text" name="name" value={playerData.name} onChange={handleChange} placeholder="Player Name" className="p-2 border rounded-md w-full" />
        <input type="text" name="team" value={playerData.team} onChange={handleChange} placeholder="Team Name" className="p-2 border rounded-md w-full" />
        <select name="position" value={playerData.position} onChange={handleChange} className="p-2 border rounded-md w-full">
          <option value="OF">Outfielder</option>
          <option value="IF">Infielder</option>
          <option value="C">Catcher</option>
        </select>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <input type="number" step="0.01" name="zr" value={playerData.zr} onChange={handleChange} placeholder="Zone Rating (ZR)" className="p-2 border rounded-md w-full" />
        <input type="number" step="1" name="assists" value={playerData.assists} onChange={handleChange} placeholder="Assists (A)" className="p-2 border rounded-md w-full" />
        <input type="number" step="1" name="errors" value={playerData.errors} onChange={handleChange} placeholder="Errors (E)" className="p-2 border rounded-md w-full" />
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <input type="number" step="1" name="frm" value={playerData.frm} onChange={handleChange} placeholder="Framing Runs (FRM)" className="p-2 border rounded-md w-full" />
        <input type="number" step="1" name="pb" value={playerData.pb} onChange={handleChange} placeholder="Passed Balls (PB)" className="p-2 border rounded-md w-full" />
        <input type="number" step="1" name="wp" value={playerData.wp} onChange={handleChange} placeholder="Wild Pitches (WP)" className="p-2 border rounded-md w-full" />
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <input type="number" step="1" name="cs" value={playerData.cs} onChange={handleChange} placeholder="Caught Stealing (CS)" className="p-2 border rounded-md w-full" />
        <input type="number" step="1" name="sb" value={playerData.sb} onChange={handleChange} placeholder="Stolen Bases Allowed (SB)" className="p-2 border rounded-md w-full" />
        <input type="number" step="0.001" name="eff" value={playerData.eff} onChange={handleChange} placeholder="Efficiency (EFF)" className="p-2 border rounded-md w-full" />
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <input type="number" step="0.001" name="leagueAvgEff" value={playerData.leagueAvgEff} onChange={handleChange} placeholder="League Avg EFF" className="p-2 border rounded-md w-full" />
      </div>

      <div className="p-4 bg-gray-100 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold text-center mb-2">Calculated Fielding Run Value (FRV)</h3>
        <p className="text-3xl text-center font-bold">{frv.toFixed(2)} Runs</p>
      </div>
    </div>
  );
};

export default FieldingRunValueCalculator;

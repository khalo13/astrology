import React, { useEffect, useRef } from "react";

// Unicode symbols for planets
const planetSymbols = {
  Sun: "☉",       // Sun symbol (astronomical)
  Moon: "☽",      // Moon
  Mars: "♂",       // Mars
  Mercury: "☿",    // Mercury
  Jupiter: "♃",    // Jupiter
  Venus: "♀",      // Venus
  Saturn: "♄",     // Saturn
  Rahu: "☊",       // North Node
  Ketu: "☋",       // South Node
};

const houseLabels = {
  2: { x: 75, y: 60 },
  12: { x: 205, y: 60 },
  1: { x: 140, y: 120 },
  3: { x: 60, y: 75 },
  11: { x: 220, y: 75 },
  4: { x: 120, y: 140 },
  10: { x: 160, y: 140 },
  5: { x: 60, y: 205 },
  9: { x: 220, y: 205 },
  6: { x: 75, y: 220 },
  8: { x: 205, y: 220 },
  7: { x: 140, y: 160 },
};

const houseOrder = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
const signNames = [
  "Aries",
  "Taurus",
  "Gemini",
  "Cancer",
  "Leo",
  "Virgo",
  "Libra",
  "Scorpio",
  "Sagittarius",
  "Capricorn",
  "Aquarius",
  "Pisces",
];

const NorthIndianCanvasChart = ({ selectedPlanet, selectedHouse }) => {
  const canvasRef = useRef();

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.lineWidth = 2;
    ctx.strokeStyle = "#000";

    // Draw outer square
    ctx.strokeRect(10, 10, 260, 260);

    // Diagonals
    ctx.beginPath();
    ctx.moveTo(10, 10);
    ctx.lineTo(270, 270);
    ctx.moveTo(270, 10);
    ctx.lineTo(10, 270);
    ctx.stroke();

    // Inner diamond
    ctx.beginPath();
    ctx.moveTo(140, 10);
    ctx.lineTo(270, 140);
    ctx.lineTo(140, 270);
    ctx.lineTo(10, 140);
    ctx.closePath();
    ctx.stroke();

    houseOrder.forEach((houseNum, i) => {
      const pos = houseLabels[houseNum];
      if (!pos) return;

      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      // Draw house number
      ctx.fillStyle = "#000";
      ctx.font = "13px Aptos";
      ctx.fillStyle = "black  ";
      ctx.fillText(`${houseNum}`, pos.x, pos.y);

      // Draw zodiac sign initials (starting from Aries, rotate)
      const signIndex = i % 12;
      const signShort = signNames[signIndex].slice(0, 2); // e.g., "Ari"
 
      
      // Planet in selected house
      if (houseNum === selectedHouse && planetSymbols[selectedPlanet]) {
        const symbol = planetSymbols[selectedPlanet];
        
      
        ctx.fillStyle = "black";
        ctx.font = "16px Aptos"; // Font for planet
      
        if ([1, 2, 12].includes(houseNum)) {
          ctx.fillText(symbol, pos.x, pos.y - 20);
      
          ctx.font = "12px Aptos"; 
          ctx.fillText(signShort, pos.x, pos.y - 40);
      
        } else if ([3, 4, 5].includes(houseNum)) {
          ctx.fillText(symbol, pos.x - 20, pos.y);
      
          ctx.font = "12px Aptos";
          ctx.fillText(signShort, pos.x - 40, pos.y);
      
        } else if ([6, 7, 8].includes(houseNum)) {
          ctx.fillText(symbol, pos.x, pos.y + 20);
      
          ctx.font = "12px Aptos";
          ctx.fillText(signShort, pos.x, pos.y + 40);
      
        } else if ([9, 10, 11].includes(houseNum)) {
          ctx.fillText(symbol, pos.x + 20, pos.y);
      
          ctx.font = "12px Aptos";
          ctx.fillText(signShort, pos.x + 40, pos.y);
        }
      }
      
    });
  }, [selectedPlanet, selectedHouse]);

  return (
    <canvas
      ref={canvasRef}
      width={280}
      height={280}
      style={{
        
        margin: "1rem auto",
        display: "block",
      }}
    />
  );
};

export default NorthIndianCanvasChart;

import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import "../pages/Kundali.css"

// Planet Unicode symbols
const planetSymbols = {
  Sun: "Su",
  Moon: "Mo",
  Mars: "Ma",
  Mercury: "Me",
  Jupiter: "Ju",
  Venus: "Ve",
  Saturn: "Sa",
  Rahu: "Ra",
  Ketu: "Ke",
};

// House label positions (North Indian style)
const houseLabels = {
  1: { x: 188, y: 175 }, // Adjusted for larger canvas
  2: { x: 95, y: 90 }, // Adjusted for larger canvas
  3: { x: 80, y: 105 }, // Adjusted for larger canvas
  4: { x: 168, y: 195 }, // Adjusted for larger canvas
  5: { x: 75, y: 285 }, // Adjusted for larger canvas
  6: { x: 95, y: 300 }, // Adjusted for larger canvas
  7: { x: 185, y: 215 }, // Adjusted for larger canvas
  8: { x: 275, y: 300 }, // Adjusted for larger canvas
  9: { x: 296, y: 285 }, // Adjusted for larger canvas
  10: { x: 201, y: 195 }, // Adjusted for larger canvas
  11: { x: 295, y: 105 }, // Adjusted for larger canvas
  12: { x: 278, y: 90 }, // Adjusted for larger canvas
};
// Zodiac signs in order
const zodiacSigns = [
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

// Function to calculate sign numbers starting from ascendantSign
const calculateSignSequence = (ascendantSignSign) => {
  const ascendantSignIndex = zodiacSigns.findIndex(
    (sign) => sign.toLowerCase() === ascendantSignSign.toLowerCase()
  );
  if (ascendantSignIndex === -1) return [];

  const sequence = [];
  for (let i = 0; i < 12; i++) {
    sequence.push(((ascendantSignIndex + i) % 12) + 1);
  }
  return sequence;
};

const BirthChart = ({ planetData, ascendantSign, chartTitle }) => {
  const canvasRef = useRef();
  const [isRendered, setIsRendered] = useState(false);
  const [canvasSize, setCanvasSize] = useState(380);

  
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 500) {
        setCanvasSize(300); // was 260
      } else if (window.innerWidth < 800) {
        setCanvasSize(380); // was 320
      } else {
        setCanvasSize(440); // was 380
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  

  useEffect(() => {
    const timeout = setTimeout(() => {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.lineWidth = 1.3;
      ctx.strokeStyle = "#cc8e31";

      // Calculate scale factor
      const scale = canvasSize / 380;

      // Shadow effect
      ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
      ctx.shadowOffsetX = 5 * scale;
      ctx.shadowOffsetY = 5 * scale;
      ctx.shadowBlur = 10 * scale;

      const outerSquareRadius = 20 * scale;
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.moveTo(10 * scale + outerSquareRadius, 10 * scale);
      ctx.lineTo((370 * scale) - outerSquareRadius, 10 * scale);
      ctx.quadraticCurveTo(370 * scale, 10 * scale, 370 * scale, 10 * scale + outerSquareRadius);
      ctx.lineTo(370 * scale, (370 * scale) - outerSquareRadius);
      ctx.quadraticCurveTo(370 * scale, 370 * scale, (370 * scale) - outerSquareRadius, 370 * scale);
      ctx.lineTo(10 * scale + outerSquareRadius, 370 * scale);
      ctx.quadraticCurveTo(10 * scale, 370 * scale, 10 * scale, 370 * scale - outerSquareRadius);
      ctx.lineTo(10 * scale, 10 * scale + outerSquareRadius);
      ctx.quadraticCurveTo(10 * scale, 10 * scale, 10 * scale + outerSquareRadius, 10 * scale);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Diagonal lines inside the square
      ctx.beginPath();
      ctx.moveTo((37 - outerSquareRadius) * scale, 15 * scale);
      ctx.lineTo((384 - outerSquareRadius) * scale, 366 * scale);
      ctx.moveTo((384 - outerSquareRadius) * scale, 15 * scale);
      ctx.lineTo((37 - outerSquareRadius) * scale, 366 * scale);
      ctx.stroke();

      // Inner diamond
      ctx.beginPath();
      ctx.moveTo(190 * scale, 10 * scale);
      ctx.lineTo(370 * scale, 190 * scale);
      ctx.lineTo(190 * scale, 370 * scale);
      ctx.lineTo(10 * scale, 190 * scale);
      ctx.closePath();
      ctx.stroke();

      ctx.shadowColor = "transparent";
      const signSequence = calculateSignSequence(ascendantSign);


      // Dynamically decide house key based on chartType or data shape
      const getHouseNumber = (planet) => {
        return (
          planet.house || // D1
          planet.navamsa_house || // D9
          planet.dasamsa_house || // D10 etc.
          planet.hora_house || // D2
          planet.saptamsa_house || // D7
          planet.house_number || // fallback if using generic key
          1 // default to avoid crash
        );
      };

      const planetMap = {};
      planetData.forEach((planet) => {
        const houseNum = getHouseNumber(planet);
        if (!planetMap[houseNum]) planetMap[houseNum] = [];
        planetMap[houseNum].push(planet);
      });

      for (let houseNum = 1; houseNum <= 12; houseNum++) {
        // Scale house label positions
        const pos = houseLabels[houseNum]
          ? { x: houseLabels[houseNum].x * scale, y: houseLabels[houseNum].y * scale }
          : null;
        if (!pos) continue;

        const signNum = signSequence[houseNum - 1];
        ctx.font = `${13 * scale}px Aptos`;
        ctx.fillStyle = "#000";
        ctx.fillText(signNum, pos.x, pos.y);
        if (houseNum === 1) {
          ctx.font = `${13 * scale}px Aptos`;
          ctx.fillText("Asc", pos.x - 8 * scale, pos.y - 100 * scale);
        }

        if (planetMap[houseNum]) {
          let baseOffsetX = 0;
          const horizontalSpacing = 20 * scale;
          const maxPlanetsPerLine = 3;
          let currentLine = 0;
          const occupiedPositions = new Set();

          planetMap[houseNum].forEach((planet, i) => {
            const symbol = planetSymbols[planet.planet_name];
            if (!symbol) return;
            ctx.font = `${13 * scale}px`;

            let offsetX = baseOffsetX + (i % maxPlanetsPerLine) * horizontalSpacing;
            let offsetY = currentLine * 10 * scale;
            if (i > 0 && i % maxPlanetsPerLine === 0) {
              currentLine++;
            }
            let posX = pos.x + offsetX;
            let posY = pos.y + offsetY;

            if (planet.planet_name === "Ketu") {
              const hasRahu = planetMap[houseNum].some(
                (p) => p.planet_name === "Rahu"
              );
              if (hasRahu) {
                const belowRahuY = posY + 10 * scale;
                if (!occupiedPositions.has(`${posX},${belowRahuY}`)) {
                  posY = belowRahuY;
                }
              }
            }
            while (occupiedPositions.has(`${posX},${posY}`)) {
              posX += 20 * scale;
            }
            occupiedPositions.add(`${posX},${posY}`);

            if ([1, 2, 12].includes(houseNum)) {
              ctx.fillText(symbol, posX - 20 * scale, posY - 50 * scale);
              ctx.font = `${12 * scale}px Aptos`;
            } else if ([3, 4, 5].includes(houseNum)) {
              ctx.fillText(symbol, posX - 60 * scale, posY);
              ctx.font = `${12 * scale}px Aptos`;
            } else if ([6, 7, 8].includes(houseNum)) {
              ctx.fillText(symbol, posX, posY + 50 * scale);
              ctx.font = `${12 * scale}px Aptos`;
            } else if ([9, 10, 11].includes(houseNum)) {
              ctx.fillText(symbol, posX + 20 * scale, posY);
              ctx.font = `${12 * scale}px Aptos`;
            }
          });
        }
      }

      setIsRendered(true);
    }, 100);

    return () => clearTimeout(timeout);
  }, [planetData, ascendantSign, canvasSize]);
  const boxVariants = {
    hidden: { opacity: 0, scale: 0.4, y: 10 },
    visible: { opacity: 1, scale: 1, y: 0 },
  };
  return (
    <>
      <motion.div
        variants={boxVariants}
        initial="hidden"
        animate="visible"
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        {isRendered && (
          <h3
            style={{
              textAlign: "center",
              fontFamily: "Aptos",
            }}
          >
            {chartTitle}
          </h3>
        )}

        <canvas
          ref={canvasRef}
          width={canvasSize}
          height={canvasSize}
          style={{
            overflow: "scroll",
            display: "block",
            maxWidth: "100%",
            height: "auto",
          }}
        />
      </motion.div>
    </>
  );
};

export default BirthChart;

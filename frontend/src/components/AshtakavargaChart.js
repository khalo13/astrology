import React, { useEffect, useRef, useState } from "react";

const zodiacSigns = [
  "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
  "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"
];

// House label positions as a percentage of base size (380x380)
const houseLabels = {
  1: { x: 188 / 380, y: 100 / 380 },
  2: { x: 95 / 380, y: 50 / 380 },
  3: { x: 50 / 380, y: 105 / 380 },
  4: { x: 100 / 380, y: 195 / 380 },
  5: { x: 50 / 380, y: 285 / 380 },
  6: { x: 95 / 380, y: 340 / 380 },
  7: { x: 185 / 380, y: 280 / 380 },
  8: { x: 275 / 380, y: 340 / 380 },
  9: { x: 330 / 380, y: 285 / 380 },
  10: { x: 270 / 380, y: 195 / 380 },
  11: { x: 330 / 380, y: 105 / 380 },
  12: { x: 278 / 380, y: 50 / 380 },
};

const calculateSignSequence = (ascendantSign) => {
  const ascIndex = zodiacSigns.findIndex(
    (sign) => sign.toLowerCase() === ascendantSign.toLowerCase()
  );
  if (ascIndex === -1) return [];
  return Array.from({ length: 12 }, (_, i) => ((ascIndex + i) % 12) + 1);
};

const BASE_SIZE = 380;

const AshtakavargaChart = ({
  ascendantSign,
  bhinnashtakvarga,
  chartTitle,
  sarvashtakavarga,
  selectedPlanet,
}) => {
  const canvasRef = useRef();
  const wrapperRef = useRef();
  const [canvasSize, setCanvasSize] = useState(BASE_SIZE);

  // Responsive resize handler
  useEffect(() => {
    function handleResize() {
      if (wrapperRef.current) {
        const width = wrapperRef.current.offsetWidth;
        setCanvasSize(Math.max(220, Math.min(width, 380))); // min 220, max 380
      }
    }
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Redraw chart on data or size change
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const size = canvasSize;
    const scale = size / BASE_SIZE;
    const radius = 20 * scale;

    // Draw outer square with rounded corners
    ctx.lineWidth = 1.3 * scale;
    ctx.strokeStyle = "#cc8e31";
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.moveTo(10 * scale + radius, 10 * scale);
    ctx.lineTo((370 * scale) - radius, 10 * scale);
    ctx.quadraticCurveTo(370 * scale, 10 * scale, 370 * scale, 10 * scale + radius);
    ctx.lineTo(370 * scale, 370 * scale - radius);
    ctx.quadraticCurveTo(370 * scale, 370 * scale, 370 * scale - radius, 370 * scale);
    ctx.lineTo(10 * scale + radius, 370 * scale);
    ctx.quadraticCurveTo(10 * scale, 370 * scale, 10 * scale, 370 * scale - radius);
    ctx.lineTo(10 * scale, 10 * scale + radius);
    ctx.quadraticCurveTo(10 * scale, 10 * scale, 10 * scale + radius, 10 * scale);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Helper to draw lines
    function drawLine(x1, y1, x2, y2, color = "#cc8e31", width = 1.3 * scale) {
      ctx.strokeStyle = color;
      ctx.lineWidth = width;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }

    // Draw diagonals
    drawLine((37 - 20) * scale, 15 * scale, (384 - 20) * scale, 366 * scale);
    drawLine((384 - 20) * scale, 15 * scale, (37 - 20) * scale, 366 * scale);

    // Erase center diagonals
    const centerX = size / 2;
    const centerY = size / 2;
    const eraseLength = 100 * scale;
    const eraseThickness = 12 * scale;
    function eraseCenterSegment(x1, y1, x2, y2) {
      const dx = x2 - x1;
      const dy = y2 - y1;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const ux = dx / dist;
      const uy = dy / dist;
      const t = ((centerX - x1) * dx + (centerY - y1) * dy) / (dist * dist);
      const px = x1 + t * dx;
      const py = y1 + t * dy;
      const startX = px - (eraseLength / 2) * ux;
      const startY = py - (eraseLength / 2) * uy;
      const endX = px + (eraseLength / 2) * ux;
      const endY = py + (eraseLength / 2) * uy;
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = eraseThickness;
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(endX, endY);
      ctx.stroke();
    }
    eraseCenterSegment((37 - 20) * scale, 15 * scale, (384 - 20) * scale, 366 * scale);
    eraseCenterSegment((384 - 20) * scale, 15 * scale, (37 - 20) * scale, 366 * scale);

    // Draw inner diamond
    ctx.strokeStyle = "#cc8e31";
    ctx.lineWidth = 1.3 * scale;
    ctx.beginPath();
    ctx.moveTo(190 * scale, 10 * scale);
    ctx.lineTo(370 * scale, 190 * scale);
    ctx.lineTo(190 * scale, 370 * scale);
    ctx.lineTo(10 * scale, 190 * scale);
    ctx.closePath();
    ctx.stroke();

    // Calculate sign sequence for houses
    const signSequence = calculateSignSequence(ascendantSign);

    // Map BAV total by sign number
    let dataToUse = [];
    if (Array.isArray(bhinnashtakvarga) && bhinnashtakvarga.length > 0) {
      dataToUse = bhinnashtakvarga;
    } else if (
      Array.isArray(sarvashtakavarga) &&
      sarvashtakavarga.length > 0
    ) {
      dataToUse = sarvashtakavarga.map((entry) => ({
        rashi: entry.rashi || entry.sign,
        total: entry.total !== undefined ? entry.total : entry.value,
      }));
    }
    const totalMapBySignNum = {};
    if (Array.isArray(dataToUse)) {
      dataToUse.forEach((entry) => {
        const signNum = zodiacSigns.findIndex(
          (sign) => sign.toLowerCase() === entry.rashi.toLowerCase()
        );
        if (signNum !== -1) {
          totalMapBySignNum[signNum + 1] = entry.total;
        }
      });
    }

    // Draw BAV totals at houses
    ctx.font = `${Math.round(16 * scale)}px Aptos`;
    ctx.textAlign = "center";
    for (let house = 1; house <= 12; house++) {
      const pos = houseLabels[house];
      if (!pos) continue;
      const signNum = signSequence[house - 1];
      const total = totalMapBySignNum[signNum];
      if (total !== undefined) {
        ctx.fillStyle = "#cc8e31";
        ctx.font = `bold ${Math.round(16 * scale)}px Aptos`;
        ctx.fillText(`${total}`, pos.x * size, pos.y * size);
      }
    }

    // Draw selected planet and its total in center
    if (selectedPlanet && Array.isArray(bhinnashtakvarga)) {
      const totalPoints = bhinnashtakvarga
        .filter(
          (bav) =>
            bav.bav_planet.toLowerCase() === selectedPlanet.toLowerCase()
        )
        .reduce((sum, bav) => sum + (bav.total || 0), 0);

      ctx.fillStyle = "#cc8e31";
      ctx.font = `bold ${Math.round(24 * scale)}px Aptos`;
      ctx.fillText(
        selectedPlanet.toUpperCase(),
        size / 2,
        size / 2 - 10 * scale
      );
      ctx.font = `bold ${Math.round(18 * scale)}px Aptos`;
      ctx.fillText(
        `Total: ${totalPoints}`,
        size / 2,
        size / 2 + 20 * scale
      );
    }
    if (
      (!bhinnashtakvarga || bhinnashtakvarga.length === 0) &&
      Array.isArray(sarvashtakavarga) &&
      sarvashtakavarga.length > 0
    ) {
      const sarvaData = sarvashtakavarga.map((entry) => ({
        total: entry.total !== undefined ? entry.total : entry.value,
      }));
      const sarvaTotal = sarvaData.reduce(
        (sum, entry) => sum + (entry.total || 0),
        0
      );
      ctx.font = `bold ${Math.round(18 * scale)}px Aptos`;
      ctx.fillText(`SARV:`, size / 2, size / 2 - 10 * scale);
      ctx.font = `bold ${Math.round(18 * scale)}px Aptos`;
      ctx.fillText(
        `Total: ${sarvaTotal}`,
        size / 2,
        size / 2 + 20 * scale
      );
    }
  }, [ascendantSign, bhinnashtakvarga, sarvashtakavarga, selectedPlanet, canvasSize]);

  return (
    <div
      ref={wrapperRef}
      style={{
        width: "100%",
        maxWidth: 400,
        margin: "0 auto",
        textAlign: "center",
        fontFamily: "Aptos",
      }}
    >
      <canvas
        ref={canvasRef}
        width={canvasSize}
        height={canvasSize}
        style={{
          display: "block",
          margin: "0 auto",
          width: "100%",
          height: "auto",
          maxWidth: 380,
          background: "#fff",
        }}
      />
    </div>
  );
};

export default AshtakavargaChart;

import React from "react";
import "./sun.css"; // Reuse same CSS
import { useNavigate } from "react-router-dom";
import NorthIndianCanvasChart from "../components/NorthIndianCanvasChart";

const houses = [
  "1st House - Lagna (Self, Personality)",
  "2nd House - Dhana (Wealth, Speech, Family)",
  "3rd House - Sahaja (Siblings, Courage, Efforts)",
  "4th House - Sukha (Home, Mother, Comforts)",
  "5th House - Putra (Creativity, Children, Intelligence)",
  "6th House - Ari (Enemies, Disease, Litigation)",
  "7th House - Yuvati (Partnership, Marriage)",
  "8th House - Randhra (Longevity, Transformation, Secrets)",
  "9th House - Dharma (Fortune, Philosophy, Religion)",
  "10th House - Karma (Career, Fame, Actions)",
  "11th House - Labha (Gains, Desires, Friendships)",
  "12th House - Vyaya (Expenditures, Losses, Moksha)",
];

const houseMeanings = [
  "Gives unusual personality, magnetic aura, and obsession with self-image. Can lead to identity confusion.",
  "Obsession with wealth, speech, and family. Gains possible through unconventional sources.",
  "Very courageous and clever in communication. Can be manipulative or tactful with siblings.",
  "Strong attachment to home and mother. Foreign land connections and strange emotional attachments.",
  "Unconventional creativity and attraction to taboo topics. Can lead to fame in arts or mysticism.",
  "Makes one skilled in dealing with enemies and diseases. May give sudden health changes.",
  "Karmic relationships, unexpected partnerships. May bring attraction to foreign or older partners.",
  "Strong interest in occult, secrets, and rebirth. Sudden gains or losses likely. Good for research.",
  "Intense desire for spiritual knowledge or foreign travels. May rebel against traditional beliefs.",
  "Highly ambitious for career. Can bring fame through unconventional work or foreign influence.",
  "Desire for large social circles and gains. Can give unusual friends or mentors.",
  "Inclination to isolation, spirituality, or escapism. Can bring foreign connections or moksha tendencies.",
];

const signNatures = [
  { sign: "Aries", nature: "Bold, aggressive, driven", strength: "Neutral" },
  { sign: "Taurus", nature: "Sensual, stable, materialistic", strength: "Exalted" },
  { sign: "Gemini", nature: "Clever, adaptable, intellectual", strength: "Friendly" },
  { sign: "Cancer", nature: "Emotional, intuitive, nurturing", strength: "Neutral" },
  { sign: "Leo", nature: "Dominant, showy, strong-willed", strength: "Enemy" },
  { sign: "Virgo", nature: "Analytical, practical, detailed", strength: "Friendly" },
  { sign: "Libra", nature: "Balanced, charming, diplomatic", strength: "Neutral" },
  { sign: "Scorpio", nature: "Mysterious, passionate, intense", strength: "Debilitated" },
  { sign: "Sagittarius", nature: "Idealistic, expansive, spiritual", strength: "Enemy" },
  { sign: "Capricorn", nature: "Disciplined, hardworking, grounded", strength: "Friendly" },
  { sign: "Aquarius", nature: "Innovative, unique, visionary", strength: "Friendly" },
  { sign: "Pisces", nature: "Imaginative, dreamy, escapist", strength: "Neutral" },
];

const Rahu = () => {
  const navigate = useNavigate();

  const getPathFromIndex = (index) => {
    const houseNames = [
      "first",
      "second",
      "third",
      "fourth",
      "fifth",
      "sixth",
      "seventh",
      "eighth",
      "ninth",
      "tenth",
      "eleventh",
      "twelfth",
    ];
    return `/rahu-in-${houseNames[index]}-house`;
  };

  return (
    <div className="sun-positions-wrapper">
      <h2>☸️ Rahu in Each House (North Indian Style)</h2>
      <div className="chart-grid">
        {houses.map((houseName, index) => {
          const signData = signNatures[index % 12];

          return (
            <div
              key={index}
              className="chart-card"
              onClick={() => navigate(getPathFromIndex(index))}
              style={{ cursor: "pointer" }}
            >
              <h3>{houseName}</h3>
              <NorthIndianCanvasChart
                selectedPlanet="Rahu"
                selectedHouse={index + 1}
              />
              <p>
                <strong>Rahu in House {index + 1}:</strong> {houseMeanings[index]}
              </p>
              <p>
                <strong>Rahu in {signData.sign}</strong> is {signData.strength}{" "}
                and gives a {signData.nature} temperament.
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Rahu;

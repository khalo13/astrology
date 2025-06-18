import React from "react";
import "./sun.css";
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
  " Strong personality, leadership, confidence, and self-expression.",
  " Authority in speech, financial success, but possible ego clashes in family matters.",
  "Courageous, competitive, and great communication skills; a natural risk-taker.",
  " Strong connection with home and mother; leadership in family matters, but can cause dominance at home.",
  "Creativity, intelligence, and leadership shine; great for careers in teaching, politics, or entertainment.",
  "Brings success in overcoming enemies and health-related obstacles; gives a competitive spirit.",
  " Dominance in partnerships; strong leadership in relationships but requires balance to avoid power struggles.",
  " Interest in secrets, research, and transformation; potential sudden gains or losses.",
  " Wisdom, spirituality, and luck in higher studies; strong belief systems and moral leadership.",
  " Career success, authoritative position, and government-related influence; a natural leader.",
  " Expands social circles and brings gains from influential connections; good for wealth accumulation.",
  " Spirituality, introspection, and deep thinking; success in foreign-related work but possible isolation tendencies.",
];

const signNatures = [
  {
    sign: "Aries",
    nature: "Bold, energetic, leadership-driven",
    strength: "Exalted",
  },
  { sign: "Taurus", nature: "Stable, patient, sensual", strength: "Enemy" },
  {
    sign: "Gemini",
    nature: "Adaptable, communicative, curious",
    strength: "Friendly",
  },
  {
    sign: "Cancer",
    nature: "Emotional, nurturing, protective",
    strength: "Friendly",
  },
  {
    sign: "Leo",
    nature: "Confident, charismatic, creative",
    strength: "Own Sign",
  },
  {
    sign: "Virgo",
    nature: "Analytical, practical, detail-oriented",
    strength: "Friendly",
  },
  {
    sign: "Libra",
    nature: "Diplomatic, charming, balanced",
    strength: "Debiliated",
  },
  {
    sign: "Scorpio",
    nature: "Intense, strategic, transformative",
    strength: "Friendly",
  },
  {
    sign: "Sagittarius",
    nature: "Optimistic, adventurous, philosophical",
    strength: "Friendly",
  },
  {
    sign: "Capricorn",
    nature: "Disciplined, ambitious, responsible",
    strength: "Enemy",
  },
  {
    sign: "Aquarius",
    nature: "Innovative, independent, visionary",
    strength: "Enemy",
  },
  {
    sign: "Pisces",
    nature: "Imaginative, compassionate, intuitive",
    strength: "Friendly",
  },
];

const Sun = () => {
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
    return `/sun-in-${houseNames[index]}-house`;
  };

  return (
    <div className="sun-positions-wrapper">
      <h2>☀️ Sun in Each House (North Indian Style)</h2>
      <div className="chart-grid">
        {houses.map((houseName, index) => {
          const signData = signNatures[index % 12]; // Cycle through signs

          return (
            <div
              key={index}
              className="chart-card"
              onClick={() => navigate(getPathFromIndex(index))}
              style={{ cursor: "pointer" }}
            >
              <h3>{houseName}</h3>
              <NorthIndianCanvasChart
                selectedPlanet="Sun"
                selectedHouse={index + 1}
              />
              <p>
                <strong>Sun in House {index + 1}:</strong>{" "}
                {houseMeanings[index]}
              </p>
              <p>
                <strong>Sun in {signData.sign} </strong> is {signData.strength}{" "}
                and give {signData.nature} personality
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Sun;

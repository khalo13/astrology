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
  "Sharp intellect, witty personality, good communication skills, and charm.",
  "Skilled speaker, financially smart, great with analytics and budgeting.",
  "Excellent communicator, clever, curious; gains through writing or media.",
  "Strong memory, emotional intelligence, and great for real estate or education.",
  "Intelligent, witty, good with studies and teaching; analytical in love.",
  "Smart strategist in tackling enemies; good for legal or medical fields.",
  "Good conversationalist in relationships; clever but may overthink partnerships.",
  "Deep analytical mind, may love research and hidden knowledge; secretive thinker.",
  "Philosophical and curious; interest in scriptures, foreign languages, and travel.",
  "Smart leadership; success in careers involving communication, trade, or writing.",
  "Many intellectual friends; gains through networking, business, and ideas.",
  "Sharp intuition, interested in spiritual studies, dreams, and foreign work.",
];

const signNatures = [
  { sign: "Aries", nature: "Quick-witted, impulsive speaker", strength: "Neutral" },
  { sign: "Taurus", nature: "Practical, grounded mind", strength: "Enemy" },
  { sign: "Gemini", nature: "Clever, multi-talented communicator", strength: "Own Sign" },
  { sign: "Cancer", nature: "Emotionally intelligent but moody", strength: "Enemy" },
  { sign: "Leo", nature: "Creative thinker, confident speaker", strength: "Neutral" },
  { sign: "Virgo", nature: "Analytical genius, detail-oriented", strength: "Exalted" },
  { sign: "Libra", nature: "Diplomatic, charming speaker", strength: "Friendly" },
  { sign: "Scorpio", nature: "Investigative, intense mind", strength: "Neutral" },
  { sign: "Sagittarius", nature: "Philosophical, humorous communicator", strength: "Friendly" },
  { sign: "Capricorn", nature: "Logical, serious thinker", strength: "Neutral" },
  { sign: "Aquarius", nature: "Innovative, scientific mind", strength: "Friendly" },
  { sign: "Pisces", nature: "Imaginative, poetic communicator", strength: "Debilitated" },
];

const Mercury = () => {
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
    return `/mercury-in-${houseNames[index]}-house`;
  };

  return (
    <div className="sun-positions-wrapper">
      <h2>🧠 Mercury in Each House (North Indian Style)</h2>
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
                selectedPlanet="Mercury"
                selectedHouse={index + 1}
              />
              <p>
                <strong>Mercury in House {index + 1}:</strong> {houseMeanings[index]}
              </p>
              <p>
                <strong>Mercury in {signData.sign}</strong> is {signData.strength} and brings{" "}
                {signData.nature}.
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Mercury;

import React from "react";
import "./sun.css"; // Reuse styling
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
  "Wise, generous, and spiritual personality. Natural leadership and respect in society.",
  "Fortunate in finances and family life. Wise speech and value-driven living.",
  "Philosophical communicator, good relations with siblings, and courageous in beliefs.",
  "Strong moral upbringing, spiritual home environment, deep connection with mother.",
  "Great for children, education, and intelligence. Favors teaching, law, and spirituality.",
  "Victory over enemies through wisdom. May heal others or work in spiritual health fields.",
  "Brings ethical behavior in partnerships. Partner may be spiritual or wealthy.",
  "Hidden knowledge, occult understanding, and good luck in inheritance or transformations.",
  "Best house for Jupiter! Brings luck, wisdom, fame, and divine grace.",
  "Success through ethics and higher principles. Wise leader or advisor career path.",
  "Huge gains through networks, noble friends, and long-term vision.",
  "Spiritual moksha-seeker, wise recluse, or yogi. Good for foreign travel and detachment.",
];

const signNatures = [
  { sign: "Aries", nature: "Bold, righteous, and driven", strength: "Neutral" },
  { sign: "Taurus", nature: "Stable, value-oriented, and kind", strength: "Enemy" },
  { sign: "Gemini", nature: "Intelligent, communicative, witty", strength: "Enemy" },
  { sign: "Cancer", nature: "Nurturing, spiritual, deeply wise", strength: "Exalted" },
  { sign: "Leo", nature: "Regal, generous, inspirational", strength: "Friendly" },
  { sign: "Virgo", nature: "Practical, logical, perfectionist", strength: "Enemy" },
  { sign: "Libra", nature: "Balanced, diplomatic, refined", strength: "Neutral" },
  { sign: "Scorpio", nature: "Intense, transformative, wise", strength: "Neutral" },
  { sign: "Sagittarius", nature: "Optimistic, spiritual, teacher-like", strength: "Own Sign" },
  { sign: "Capricorn", nature: "Disciplined, structured, cautious", strength: "Debilitated" },
  { sign: "Aquarius", nature: "Visionary, future-minded, wise", strength: "Neutral" },
  { sign: "Pisces", nature: "Compassionate, mystical, artistic", strength: "Own Sign" },
];

const Jupiter = () => {
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
    return `/jupiter-in-${houseNames[index]}-house`;
  };

  return (
    <div className="sun-positions-wrapper">
      <h2>🪐 Jupiter in Each House (North Indian Style)</h2>
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
                selectedPlanet="Jupiter"
                selectedHouse={index + 1}
              />
              <p>
                <strong>Jupiter in House {index + 1}:</strong>{" "}
                {houseMeanings[index]}
              </p>
              <p>
                <strong>Jupiter in {signData.sign}</strong> is {signData.strength}{" "}
                and gives a {signData.nature} nature.
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Jupiter;

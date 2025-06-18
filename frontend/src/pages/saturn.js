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
  "Disciplined, serious personality with a strong sense of responsibility. Can delay self-growth.",
  "Slow but steady wealth accumulation; disciplined family values and conservative speech.",
  "Hardworking and disciplined in efforts; may have distant or fewer siblings.",
  "Emotional detachment from mother or homeland; slow but lasting comfort and real estate success.",
  "Delayed creativity or children; intense focus in education or speculative ventures.",
  "Excellent for facing enemies, diseases, and debts with persistence and maturity.",
  "Delayed or karmic relationships; loyal but serious in partnerships and marriage.",
  "Longevity, mystical interests, and transformation through hardship; Saturn gives deep endurance.",
  "Strong sense of duty in religion or philosophy; can bring foreign karma or spiritual trials.",
  "Very powerful for career success; Saturn’s own house here brings long-term fame and stability.",
  "Gains through hard work and persistent efforts; late success in networking and wealth.",
  "Isolated or introverted by nature; powerful for moksha, meditation, and work in foreign lands.",
];

const signNatures = [
  { sign: "Aries", nature: "Impulsive, bold, assertive", strength: "Debilitated" },
  { sign: "Taurus", nature: "Stable, sensual, grounded", strength: "Friendly" },
  { sign: "Gemini", nature: "Adaptable, intellectual, expressive", strength: "Neutral" },
  { sign: "Cancer", nature: "Emotional, intuitive, nurturing", strength: "Enemy" },
  { sign: "Leo", nature: "Proud, commanding, dramatic", strength: "Enemy" },
  { sign: "Virgo", nature: "Analytical, disciplined, practical", strength: "Neutral" },
  { sign: "Libra", nature: "Balanced, fair, aesthetic", strength: "Exalted" },
  { sign: "Scorpio", nature: "Intense, secretive, determined", strength: "Neutral" },
  { sign: "Sagittarius", nature: "Optimistic, philosophical, bold", strength: "Neutral" },
  { sign: "Capricorn", nature: "Ambitious, disciplined, structured", strength: "Own Sign" },
  { sign: "Aquarius", nature: "Innovative, detached, humanitarian", strength: "Own Sign" },
  { sign: "Pisces", nature: "Dreamy, spiritual, fluid", strength: "Neutral" },
];

const Saturn = () => {
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
    return `/saturn-in-${houseNames[index]}-house`;
  };

  return (
    <div className="sun-positions-wrapper">
      <h2>🪐 Saturn in Each House (North Indian Style)</h2>
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
                selectedPlanet="Saturn"
                selectedHouse={index + 1}
              />
              <p>
                <strong>Saturn in House {index + 1}:</strong> {houseMeanings[index]}
              </p>
              <p>
                <strong>Saturn in {signData.sign}</strong> is {signData.strength}{" "}
                and gives a {signData.nature} nature.
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Saturn;

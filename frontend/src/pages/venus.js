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
  "Charming personality, attractive appearance, strong desire for beauty and harmony.",
  "Sweet speech, artistic family background, financial prosperity through creative fields.",
  "Talent in performing arts, writing, or media; harmonious relationships with siblings.",
  "Luxurious home, love for comfort, artistic home environment, deep love for mother.",
  "Romantic, creative, and expressive; love affairs and enjoyment in education or children.",
  "Challenges in relationships; may lead to love-related struggles or indulgence issues.",
  "Ideal for love and marriage; harmonious spouse, often beautiful or artistic partner.",
  "Sensual but secretive; intense attraction, secret relationships, or mystical allure.",
  "Love for travel, luxury, and philosophy; support from women in higher education or religion.",
  "Charisma in the workplace; potential for fame in arts, fashion, or beauty industries.",
  "Popular in social circles; gains through female friends or romantic opportunities.",
  "Strong sensuality; spiritual love, may enjoy isolation and beauty in solitude or foreign lands.",
];

const signNatures = [
  { sign: "Aries", nature: "Passionate and bold in love", strength: "Neutral" },
  { sign: "Taurus", nature: "Sensual, loyal, romantic", strength: "Own Sign" },
  { sign: "Gemini", nature: "Flirty, witty, playful", strength: "Friendly" },
  { sign: "Cancer", nature: "Emotionally attached, soft lover", strength: "Neutral" },
  { sign: "Leo", nature: "Dramatic, generous in love", strength: "Friendly" },
  { sign: "Virgo", nature: "Overcritical in love", strength: "Debilitated" },
  { sign: "Libra", nature: "Romantic, graceful, charming", strength: "Own Sign" },
  { sign: "Scorpio", nature: "Passionate, intense, mysterious", strength: "Neutral" },
  { sign: "Sagittarius", nature: "Playful, philosophical lover", strength: "Friendly" },
  { sign: "Capricorn", nature: "Reserved, practical in love", strength: "Enemy" },
  { sign: "Aquarius", nature: "Detached but artistic", strength: "Enemy" },
  { sign: "Pisces", nature: "Idealistic, dreamy love", strength: "Exalted" },
];

const Venus = () => {
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
    return `/venus-in-${houseNames[index]}-house`;
  };

  return (
    <div className="sun-positions-wrapper">
      <h2>💖 Venus in Each House (North Indian Style)</h2>
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
                selectedPlanet="Venus"
                selectedHouse={index + 1}
              />
              <p>
                <strong>Venus in House {index + 1}:</strong> {houseMeanings[index]}
              </p>
              <p>
                <strong>Venus in {signData.sign}</strong> is {signData.strength} and brings{" "}
                {signData.nature}.
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Venus;

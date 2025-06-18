import React from "react";
import "./sun.css"; // Reuse same styles
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
  "Fiery personality, strong leadership, bold presence. Can be aggressive if not controlled.",
  "Direct and forceful speech. Can bring financial gains through assertive efforts.",
  "Very courageous, energetic, and competitive. Strong bond or rivalry with siblings.",
  "Aggression at home or dominance over family members. May have property-related issues.",
  "Bold thinker, passionate in love and children matters. Strong will in creativity.",
  "Excellent placement for defeating enemies, litigation, and sports; can cause health flare-ups.",
  "Difficult for marriage due to dominance or control issues. Needs compromise.",
  "Interest in occult or hidden knowledge. Risk of sudden accidents or intense transformations.",
  "Strong moral values, energetic in religious or foreign travel pursuits.",
  "Driven in career, great for army, police, or technical fields. High ambition and fame.",
  "Ambitious and highly energetic in goals. Can be aggressive in social groups.",
  "Secret enemies, hidden energy loss, but good for foreign competition and spiritual fire.",
];

const signNatures = [
  { sign: "Aries", nature: "Bold, energetic, confident", strength: "Own Sign" },
  { sign: "Taurus", nature: "Stubborn, determined, steady", strength: "Enemy" },
  { sign: "Gemini", nature: "Talkative, agile, clever", strength: "Neutral" },
  { sign: "Cancer", nature: "Emotional, reactive, protective", strength: "Debilitated" },
  { sign: "Leo", nature: "Proud, commanding, passionate", strength: "Friendly" },
  { sign: "Virgo", nature: "Analytical, practical, critical", strength: "Neutral" },
  { sign: "Libra", nature: "Balanced, aesthetic, cooperative", strength: "Enemy" },
  { sign: "Scorpio", nature: "Powerful, intense, secretive", strength: "Own Sign" },
  { sign: "Sagittarius", nature: "Bold, idealistic, adventurous", strength: "Friendly" },
  { sign: "Capricorn", nature: "Disciplined, strategic, firm", strength: "Exalted" },
  { sign: "Aquarius", nature: "Rebellious, unconventional, visionary", strength: "Neutral" },
  { sign: "Pisces", nature: "Dreamy, sensitive, elusive", strength: "Enemy" },
];

const Mars = () => {
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
    return `/mars-in-${houseNames[index]}-house`;
  };

  return (
    <div className="sun-positions-wrapper">
      <h2>🔥 Mars in Each House (North Indian Style)</h2>
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
                selectedPlanet="Mars"
                selectedHouse={index + 1}
              />
              <p>
                <strong>Mars in House {index + 1}:</strong>{" "}
                {houseMeanings[index]}
              </p>
              <p>
                <strong>Mars in {signData.sign}</strong> is {signData.strength}{" "}
                and gives a {signData.nature} temperament.
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Mars;

import React from "react";
import "./sun.css"; // Reuse the same styling
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
  "Emotional sensitivity, self-awareness, and charm. Strong need for connection with others.",
  "Emotionally attached to wealth, family, and food. Security through material stability.",
  "Nurturing sibling relationships, emotional courage, and a curious mind.",
  "Deep bond with mother and home. Emotional comfort from familiar surroundings.",
  "Emotionally creative, strong parental instincts, and intuitive intelligence.",
  "Emotionally reactive to enemies and stress. Can overcome health issues with care.",
  "Needs emotional bonding in relationships. Partnership brings peace or conflict.",
  "Emotional depth, transformative mind, and attachment to secrecy or mysticism.",
  "Philosophical outlook, emotional connection with dharma, and love for travel.",
  "Emotionally driven in career. Public image influenced by feelings and mood.",
  "Seeks emotional fulfillment through friends, dreams, and collective causes.",
  "Emotionally withdrawn at times. Spiritual and introspective, but sensitive to isolation.",
];

const signNatures = [
  {
    sign: "Aries",
    nature: "Bold, reactive, passionate",
    strength: "Friendly",
  },
  {
    sign: "Taurus",
    nature: "Steady, affectionate, nurturing",
    strength: "Exalted",
  },
  {
    sign: "Gemini",
    nature: "Witty, adaptable, sociable",
    strength: "Neutral",
  },
  {
    sign: "Cancer",
    nature: "Sensitive, caring, protective",
    strength: "Own Sign",
  },
  {
    sign: "Leo",
    nature: "Proud, expressive, emotionally strong",
    strength: "Friendly",
  },
  {
    sign: "Virgo",
    nature: "Analytical, modest, emotionally critical",
    strength: "Neutral",
  },
  {
    sign: "Libra",
    nature: "Balanced, diplomatic, emotional charm",
    strength: "Friendly",
  },
  {
    sign: "Scorpio",
    nature: "Intense, secretive, emotionally powerful",
    strength: "Debilitated",
  },
  {
    sign: "Sagittarius",
    nature: "Idealistic, cheerful, emotionally free",
    strength: "Friendly",
  },
  {
    sign: "Capricorn",
    nature: "Reserved, responsible, emotionally dry",
    strength: "Enemy",
  },
  {
    sign: "Aquarius",
    nature: "Detached, thoughtful, humanitarian",
    strength: "Enemy",
  },
  {
    sign: "Pisces",
    nature: "Dreamy, empathetic, spiritual",
    strength: "Friendly",
  },
];

const Moon = () => {
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
    return `/moon-in-${houseNames[index]}-house`;
  };

  return (
    <div className="sun-positions-wrapper">
      <h2>🌙 Moon in Each House (North Indian Style)</h2>
      <div className="chart-grid">
        {houses.map((houseName, index) => {
          const signData = signNatures[index % 12]; // Rotate signs across 12 houses

          return (
            <div
              key={index}
              className="chart-card"
              onClick={() => navigate(getPathFromIndex(index))}
              style={{ cursor: "pointer" }}
            >
              <h3>{houseName}</h3>
              <NorthIndianCanvasChart
                selectedPlanet="Moon"
                selectedHouse={index + 1}
              />
              <p>
                <strong>Moon in House {index + 1}:</strong>{" "}
                {houseMeanings[index]}
              </p>
              <p>
                <strong>Moon in {signData.sign}</strong> is {signData.strength}{" "}
                and gives a {signData.nature} mind & emotions.
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Moon;

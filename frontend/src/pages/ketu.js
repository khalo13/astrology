import React from "react";
import "./sun.css"; // Reusing same styling
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
  "Creates a detached or spiritual personality. Can bring mystical aura, but identity crises too.",
  "Disinterest in material wealth or family ties. Often silent or detached in speech.",
  "Detached from siblings, but highly intuitive and fearless. Good for spiritual courage.",
  "Spiritual home life or loss of comfort. May feel alienated from maternal bonds.",
  "Detached creativity, inclination towards spiritual or ancient knowledge. Not ideal for romance.",
  "Powerful placement for defeating enemies or diseases through past life merit.",
  "Challenges in relationships; karmic debts with spouse. Strong spiritual growth via detachment.",
  "Very mystical and psychic. Excellent for spiritual research, moksha, and metaphysics.",
  "Detachment from religion, but deep intuitive wisdom. Inclined to hidden truths over dogma.",
  "Disinterested in fame. Often leads to renunciation of material goals in favor of deeper truth.",
  "Detachment from social circles. May have few but meaningful friendships or isolated gains.",
  "One of the best placements for moksha. Strong spiritual tendencies, dreams, or enlightenment.",
];

const signNatures = [
  { sign: "Aries", nature: "Warrior-like detachment", strength: "Friendly" },
  { sign: "Taurus", nature: "Detached from materialism", strength: "Debilitated" },
  { sign: "Gemini", nature: "Detached communicator", strength: "Neutral" },
  { sign: "Cancer", nature: "Emotionally spiritual", strength: "Friendly" },
  { sign: "Leo", nature: "Detached from ego", strength: "Friendly" },
  { sign: "Virgo", nature: "Analytical detachment", strength: "Enemy" },
  { sign: "Libra", nature: "Detached diplomat", strength: "Neutral" },
  { sign: "Scorpio", nature: "Moksha-karaka", strength: "Exalted" },
  { sign: "Sagittarius", nature: "Detached philosopher", strength: "Neutral" },
  { sign: "Capricorn", nature: "Detached from authority", strength: "Enemy" },
  { sign: "Aquarius", nature: "Spiritual rebel", strength: "Friendly" },
  { sign: "Pisces", nature: "Mystic detachment", strength: "Friendly" },
];

const Ketu = () => {
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
    return `/ketu-in-${houseNames[index]}-house`;
  };

  return (
    <div className="sun-positions-wrapper">
      <h2>☄️ Ketu in Each House (North Indian Style)</h2>
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
                selectedPlanet="Ketu"
                selectedHouse={index + 1}
              />
              <p>
                <strong>Ketu in House {index + 1}:</strong> {houseMeanings[index]}
              </p>
              <p>
                <strong>Ketu in {signData.sign}</strong> is {signData.strength} and brings{" "}
                {signData.nature}.
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Ketu;
    
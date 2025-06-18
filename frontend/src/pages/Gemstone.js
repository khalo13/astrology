import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import "./Gemstone.css";
import KundaliForm from "../components/Form"; // Adjust path as needed
import gemimg1 from "../assets/gem-img-1.png";
import gemimg2 from "../assets/gem-img-2.png";
import panna from "../assets/panna.png";
import manik from "../assets/manik.png";
import moti from "../assets/moti.png";
import moonga from "../assets/moonga.png";
import neelam from "../assets/neelam.png";
import pukhraj from "../assets/pukhraj.png";
import heera from "../assets/heera.png";




const GemstoneCalculator = () => {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const resultRef = useRef(null);

  const handleGemstoneSubmit = async ({ date, time, place }) => {
    setLoading(true);
    try {
      const response = await axios.post("http://localhost:5000/api/gemstone", {
        date_input: date,
        time_input: time,
        location_input: place,
      });

      setResult(response.data);
      localStorage.setItem("gemstoneResult", JSON.stringify(response.data)); // 💾 Save
    } catch (err) {
      console.error("Gemstone fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const stored = localStorage.getItem("gemstoneResult");
    if (stored) {
      setResult(JSON.parse(stored));
    }
  }, []);


  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, []);

  useEffect(() => {
    if (resultRef.current && result?.gemstones) {
      resultRef.current.scrollIntoView({ behavior: "auto" });
    }
  }, [result]);
  const gemDataMap = {
    "Emerald": {
      img: panna,
      detail: `Emerald is the gemstone ruled by Mercury. Wearing Emerald brings good health, strong body, wealth, property, and good eyesight. It protects from evil spirits, snake bites, and bad influences of the evil eye. It also helps with epilepsy, insanity, and bad dreams.`,
      summary: {
        substitute: "Onyx",
        finger: "Little",
        weight: "4 - 6.25 Ratti",
        day: "Wednesday",
        deity: "Mercury",
        metal: "Gold",
      },
    },
    "Ruby": {
      img: manik,
      detail: `Ruby is ruled by the Sun. Wearing Ruby strengthens leadership, boosts confidence, improves blood circulation, and enhances vitality. It brings fame, authority, and supports heart and eye health.`,
      summary: {
        substitute: "Red Spinel",
        finger: "Ring",
        weight: "3 - 5.25 Ratti",
        day: "Sunday",
        deity: "Sun God (Surya)",
        metal: "Gold or Copper",
      },
    },
    "Pearl": {
      img: moti,
      detail: `Pearl is ruled by the Moon. It calms emotions, improves mental peace, memory, and balances mood swings. It's helpful for sleep disorders, emotional sensitivity, and mental clarity.`,
      summary: {
        substitute: "Moonstone",
        finger: "Little",
        weight: "4 - 6.25 Ratti",
        day: "Monday",
        deity: "Moon God (Chandra)",
        metal: "Silver",
      },
    },
    "Red Coral": {
      img: moonga,
      detail: `Red Coral is ruled by Mars. It enhances courage, action, and strength. Great for military, police, and sports professionals. It helps overcome enemies and blood or muscle-related ailments.`,
      summary: {
        substitute: "Carnelian",
        finger: "Ring",
        weight: "5 - 9 Ratti",
        day: "Tuesday",
        deity: "Mars (Mangal)",
        metal: "Copper or Gold",
      },
    },
    "Blue Sapphire": {
      img: neelam,
      detail: `Blue Sapphire is ruled by Saturn. It brings discipline, career growth, and spiritual depth. Known for sudden positive transformations. Must be tested before wearing due to its intense energy.`,
      summary: {
        substitute: "Amethyst",
        finger: "Middle",
        weight: "3 - 4.25 Ratti",
        day: "Saturday",
        deity: "Saturn (Shani)",
        metal: "Silver",
      },
    },
    "Yellow Sapphire": {
      img: pukhraj,
      detail: `Yellow Sapphire is ruled by Jupiter. It enhances education, wealth, marital bliss, and spiritual inclination. Beneficial for teachers, priests, and wisdom seekers. Helps in progeny and divine blessings.`,
      summary: {
        substitute: "Yellow Topaz",
        finger: "Index",
        weight: "5 - 7.25 Ratti",
        day: "Thursday",
        deity: "Jupiter (Brihaspati)",
        metal: "Gold",
      },
    },
    "Diamond": {
      img: heera,
      detail: `Diamond is ruled by Venus. It amplifies charm, beauty, luxury, and romantic fulfillment. Brings material success and artistic abilities. Good for marriage, fertility, and social recognition.`,
      summary: {
        substitute: "Opal / Zircon",
        finger: "Index",
        weight: "1 - 4.25 Ratti",
        day: "Friday",
        deity: "Venus (Shukra)",
        metal: "Silver or Platinum",
      },
    },

  };
  const renderSummaryTable = (gemName) => {
    const data = gemDataMap[gemName]?.summary || gemDataMap["default"].summary;
    return (
      <table className="gem-summary-table">
        <tbody>
          <tr><td><strong>Substitute</strong></td><td>{data.substitute}</td></tr>
          <tr><td><strong>Finger</strong></td><td>{data.finger}</td></tr>
          <tr><td><strong>Weight</strong></td><td>{data.weight}</td></tr>
          <tr><td><strong>Day</strong></td><td>{data.day}</td></tr>
          <tr><td><strong>Deity</strong></td><td>{data.deity}</td></tr>
          <tr><td><strong>Metal</strong></td><td>{data.metal}</td></tr>
        </tbody>
      </table>
    );
  };



  return (
    <div className="gemstone-container-wrapper">
      {/* 🔹 Section 1: Input Form */}

      {!result && (
        <div className="gemstone-form-section">
          <h1 style={{ textAlign: "center", color: "white", marginBottom: 58 }}>Gemstone Calculator</h1>

          <div className="gemstone-form-section-content">
            {/* Left: Image and description */}

            <div className="below-form" >
              <h2 >What are Gemstones?</h2>
              <p >💎 Gemstones: Vibrational Catalysts for Healing and Destiny</p>
              <p >
                Gemstones are naturally occurring crystals or mineral fragments, each possessing a unique structure, color, and texture formed deep within the Earth over millions of years. Beyond their ornamental beauty and use in fine jewelry, these precious stones have been revered across cultures for their energetic and metaphysical properties. In the realm of Vedic astrology, gemstones are considered potent tools for balancing planetary influences and enhancing specific life domains such as health, prosperity, relationships, and inner peace.

                According to ancient wisdom, each gemstone emits a subtle but constant vibration—a cosmic frequency that aligns with the energetic field (aura) of a person. These vibrations are believed to interact directly with the body's subtle energy centers (chakras), thereby influencing physical, emotional, and spiritual states. When prescribed accurately through astrological analysis, wearing a gemstone can activate dormant potential, restore balance to afflicted planets, and guide the individual toward their highest path.

                Vedic astrology offers multiple methods for gemstone selection. While some astrologers recommend gemstones based on the Ascendant (Lagna), others rely on the Moon sign (Rashi) or Mahadasha (planetary period) currently influencing the native. The most commonly used method—Moon sign-based recommendation—focuses on strengthening the planet that rules over the individual's emotional foundation and subconscious tendencies. The gemstone corresponding to that planet is believed to amplify its favorable effects and counterbalance its negative expressions.
              </p>
              <p style={{ color: "white", marginTop: 31, fontSize: 16.5 }}>
                Wearing a gemstone is not merely about aesthetics—it is about resonance. When a gemstone is in contact with the skin, preferably set in gold or silver and worn on a recommended finger, it transmits its vibrations into the body’s energy field. These vibrations influence one's thoughts, moods, and destiny pathways over time. The right gemstone, chosen with astrological precision, can serve as a constant source of spiritual support, mental clarity, emotional healing, and material success.

                In essence, gemstones are nature’s coded energy capsules—formed in the womb of the Earth and destined to harmonize your journey through the stars.
              </p>
            </div>
            {/* Right: Form */}
            <div className="gemstone-right">
              <div className="form-wrapper">
                <KundaliForm onSubmit={handleGemstoneSubmit} loading={loading} />
              </div>
            </div>

          </div>
          <div className="gemstone-how-section">
            <div className="gemstone-left">
              <img src={gemimg1} alt="Gem Illustration 1" className="gem-img" />
            </div>
            <div className="gemstone-how-text">
              <h2>How these Gemstones Work?</h2>
              <p>
                Astrological gemstones act as energetic amplifiers and conductors. Far beyond mere adornments, they are sacred tools that resonate with the frequencies emitted by their corresponding planets. When worn with the right intent and timing, they channel the planet’s energy directly into the aura of the wearer. The gemstone either enhances the positive effects of a strong planet or mitigates the adverse effects of a weak or afflicted one.

                This effect is achieved through a dual mechanism: gemstones reflect favorable cosmic photons back into the body, while simultaneously absorbing and neutralizing negative radiation.

                <img src={gemimg1} alt="Gem Illustration 1" className="gem-img-inline-mobile" />

                Just as tuning forks resonate at specific frequencies, gemstones vibrate in harmony with their associated planet, subtly realigning the wearer’s internal frequency with cosmic rhythms. Worn correctly—based on an individual’s Janma Kundali (natal chart), dashas, and planetary positions—a gemstone strengthens beneficial planetary energies.

                Over time, this can lead to profound improvements in the areas governed by that planet. For instance, a ruby can ignite leadership and vitality (Sun), an emerald may enhance speech and intellect (Mercury), and a yellow sapphire can usher in wisdom and spiritual blessings (Jupiter).

                In essence, choosing and wearing the right gemstone is like plugging into the right frequency of the universe. It is a spiritual attunement—fine-tuning your life path with the cosmos. When prescribed correctly, a gemstone becomes more than a crystal—it becomes a personal energy device, offering support, protection, and cosmic alignment across every domain of life.
              </p>
            </div>

          </div>


          <div className="gemstone-type-section">
            <div className="gemstone-type-text">
              <h2>✨ Types of Gemstones:-</h2>
              <div className="gemstone-types-row">
                <div className="gemstone-type-block">
                  <h4>🔮 1. Life Stone (Janma Ratna or Lagna Ratna)</h4>
                  <p>
                    <strong>Life Stone</strong> Represents the lord of the Ascendant (Lagna lord) and plays a foundational role in shaping one’s destiny...
                  </p>
                </div>
                <div className="gemstone-type-block">
                  <h4>🌟 2. Fortune Stone (Bhagya Ratna)</h4>
                  <p>
                    <strong>Fortune Stone:</strong> Linked to the 9th house of luck, fortune, and blessings...
                  </p>
                </div>
                <div className="gemstone-type-block">
                  <h4>🍀 3. Lucky Stones (Subh Ratna or Yogakaraka Gemstones)</h4>
                  <p>
                    <strong>Lucky Stone:</strong> Associated with planets that are naturally benefic or yogakarakas for your lagna...
                  </p>
                </div>
              </div>
            </div>
            <div className="gemstone-right-image">
              <img src={gemimg2} alt="Gem Illustration" className="gem-img2" />
            </div>
          </div>

          <div className="gemstone-table-section">
            <h2 style={{ textAlign: "center", color: "white" }}>Planetary Gemstones & Their Colors</h2>
            <table className="gemstone-table">
              <thead>
                <tr>
                  <th>Planet</th>
                  <th>Gemstone</th>
                  <th>Color Vibration</th>
                  <th>Represents</th>
                  <th>Potential Benefits</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Sun</td>
                  <td>Ruby</td>
                  <td>Red/Golden Light

                  </td>
                  <td>Soul, Authority, Confidence
                  </td>
                  <td>Boosts vitality, leadership, willpower
                  </td>
                </tr>
                <tr>
                  <td>Moon</td>
                  <td>Pearl</td>
                  <td>Cool White
                  </td>
                  <td>Emotions, Mind, Intuition
                  </td>
                  <td>Promotes calmness, emotional stability, mental peace
                  </td>
                </tr>
                <tr>
                  <td>Mars</td>
                  <td>Red Coral</td>
                  <td>Fiery Red/Orange
                  </td>
                  <td>Energy, Courage, Action
                  </td>
                  <td>Enhances physical strength, decisiveness, protection
                  </td>
                </tr>
                <tr>
                  <td>Mercury</td>
                  <td>Emerald</td>
                  <td>Deep/Olive Green
                    n</td>
                  <td>Intelligence, Communication, Commerce
                  </td>
                  <td>Sharpens intellect, eloquence, business acumen
                  </td>
                </tr>
                <tr>
                  <td>Jupiter</td>
                  <td>Yellow Sapphire</td>
                  <td>Yellow/Golden Yellow
                  </td>
                  <td>Wisdom, Expansion, Fortune
                  </td>
                  <td>Attracts abundance, education, spiritual upliftment
                  </td>
                </tr>
                <tr>
                  <td>Venus</td>
                  <td>Diamond</td>
                  <td>Clear/White/Baby Pink</td>
                  <td>Love, Luxury, Beauty</td>
                  <td>Invites harmony in relationships, creativity, prosperity
                  </td>
                </tr>
                <tr>
                  <td>Saturn</td>
                  <td>Blue Sapphire</td>
                  <td>Deep Blue/Indigo Blue
                  </td>
                  <td>Discipline, Karma, Longevity</td>
                  <td>Accelerates growth, stability, career focus
                  </td>
                </tr>
                <tr>
                  <td>Rahu</td>
                  <td>Hessonite (Gomed)</td>
                  <td>Reddish Brown/Smoky Orange
                    /Electric Blue</td>
                  <td>Materialism, Obsession, Foreign Elements, Transformation</td>
                  <td>Removes confusion, legal issues, Balances karmic energies
                  </td>
                </tr>
                <tr>
                  <td>Ketu</td>
                  <td>Cat’s Eye</td>
                  <td>Gray-Green</td>
                  <td>Spirituality, Detachment, Past Karma</td>
                  <td>Protects from hidden enemies, opens intuition
                    , spiritual growth and sharp insight</td>
                </tr>
              </tbody>
            </table>

          </div>

        </div>
      )}

      {/* 🔹 Section 2: Results */}
      {result && result.gemstones && (
        <div className="gemstone-result-section" ref={resultRef}>
          <div style={{ marginTop: "2rem", textAlign: "center", fontSize: 22 }}>
            <button
              onClick={() => {
                setResult(null);
                localStorage.removeItem("gemstoneResult"); // ❌ Remove saved data
              }}
              style={{

                marginRight: 22,
                border: "none",

                all: "unset",
                cursor: "pointer",
                float: "right"
              }}
            >
              🔄
            </button>

          </div>
          <h2>Gemstiones for You</h2>
          <div className="gemstone-summary-row">
            {/* Life Stone Block */}
            <div className="gemstone-summary-column">
              <img
                src={gemDataMap[result.gemstones.life_stone.gem]?.img || gemDataMap["default"].img}
                alt={result.gemstones.life_stone.gem}
                className="gemstone-display-img"
              />
              {renderSummaryTable(result.gemstones.life_stone?.gem)}
            </div>

            {/* Lucky Stone Block */}
            <div className="gemstone-summary-column">
              <img
                src={gemDataMap[result.gemstones.lucky_stones?.[0]?.gem]?.img || gemDataMap["default"].img}
                alt={result.gemstones.lucky_stones?.[0]?.gem}
                className="gemstone-display-img"
              />
              {renderSummaryTable(result.gemstones.lucky_stones?.[0]?.gem)}
            </div>

            {/* Fortune Stone Block */}
            <div className="gemstone-summary-column">
              <img
                src={gemDataMap[result.gemstones.fortune_stone.gem]?.img || gemDataMap["default"].img}
                alt={result.gemstones.fortune_stone.gem}
                className="gemstone-display-img"
              />
              {renderSummaryTable(result.gemstones.fortune_stone?.gem)}
            </div>
          </div>

          <h2>🔮 Your Gemstone Recommendations</h2>

          {/* Life Stone */}
          <div className="gem-block" style={{ display: "flex" }}>
            <div>
              <h4>💎 Life Stone: {result.gemstones.life_stone.gem}</h4>

              <p><strong>Description:</strong> {result.gemstones.life_stone.description}</p>

              <p style={{ color: "black" }}>
                <strong>About:</strong> {gemDataMap[result.gemstones.life_stone.gem]?.detail || gemDataMap["default"].detail}
              </p>
              <p><strong>How to Wear:</strong> {result.gemstones.life_stone.how_to_wear}</p>
              <p><strong>Mantra:</strong> {result.gemstones.life_stone.mantra}</p>
            </div>
            <img
              src={gemDataMap[result.gemstones.life_stone.gem]?.img || gemDataMap["default"].img}
              alt={result.gemstones.life_stone.gem}
              className="gemstone-display-img   line-gem"
            />
          </div>

          <div className="gem-block" style={{ display: "flex" }}>
            <div>
              <h4>🌟 Fortune Stone: {result.gemstones.fortune_stone.gem}</h4>

              <p><strong>Description:</strong> {result.gemstones.fortune_stone.description}</p>

              <p style={{ color: "black" }}>
                <strong>About:</strong> {gemDataMap[result.gemstones.fortune_stone.gem]?.detail || gemDataMap["default"].detail}
              </p>
              <p><strong>How to Wear:</strong> {result.gemstones.fortune_stone.how_to_wear}</p>
              <p><strong>Mantra:</strong> {result.gemstones.fortune_stone.mantra}</p>
            </div>
            <img
              src={gemDataMap[result.gemstones.fortune_stone.gem]?.img || gemDataMap["default"].img}
              alt={result.gemstones.fortune_stone.gem}
              className="gemstone-display-img  line-gem"
            />
          </div>

          {result.gemstones.lucky_stones?.length > 0 && (
            <div className="gem-block" style={{ display: "flex" }}>

              <div>
                <h4>🍀 Lucky Stone: {result.gemstones.lucky_stones[0].gem}</h4>
                <p><strong>Description:</strong> {result.gemstones.lucky_stones[0].description}</p>

                <p style={{ color: "black" }}>
                  <strong>About:</strong> {gemDataMap[result.gemstones.lucky_stones[0].gem]?.detail || gemDataMap["default"].detail}
                </p>
                <p><strong>How to Wear:</strong> {result.gemstones.lucky_stones[0].how_to_wear}</p>
                <p><strong>Mantra:</strong> {result.gemstones.lucky_stones[0].mantra}</p>
              </div>
              <img
                src={gemDataMap[result.gemstones.lucky_stones[0].gem]?.img || gemDataMap["default"].img}
                alt={result.gemstones.lucky_stones[0].gem}
                className="gemstone-display-img  line-gem"
              />
            </div>
          )}



        </div>
      )}

    </div>
  );
};

export default GemstoneCalculator;

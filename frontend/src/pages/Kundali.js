import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import "./Kundali.css"; // Import your CSS file for styling\
import BirthChart from "../components/BirthChart";
import { motion } from "framer-motion";
import AshtakavargaChart from "../components/AshtakavargaChart";
import "../index.css";

const KundaliPage = () => {
  const navigate = useNavigate();
  const { birthId } = useParams();
  const [formData, setFormData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeSection, setActiveSection] = useState("akshadva");
  const [activeChart, setActiveChart] = useState("dasamsa");
  const [activeTab, setActiveTab] = useState("houses");
  const [openedDasha, setOpenedDasha] = useState(null);
  const [selectedBAVPlanet, setSelectedBAVPlanet] = useState("Sun");
  const [selectedAVType, setSelectedAVType] = useState("bhinnashtakvarga"); // or "sarvashtakavarga"
  const [mobileTable, setMobileTable] = useState("sign");

  // Default is 'kundali'
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, []);
  useEffect(() => {
    if (activeSection === "ashtakavarga") {
      setSelectedBAVPlanet("sun"); // Reset to Sun when entering Ashtakavarga section
    }
  }, [activeSection]);
  useEffect(() => {
    const fetchBirthDetails = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const response = await axios.get(
          `http://localhost:4000/user-data/${birthId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const { data } = response.data;

        if (data) {
          setFormData(data);
        } else {
          setError("No birth details found.");
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to fetch birth details.");
      } finally {
        setLoading(false);
      }
    };

    if (birthId) fetchBirthDetails();
  }, [birthId]);
  if (loading)
    return (
      <div className="kundali-page">
        <p>Loading...</p>
      </div>
    );
  if (error || !formData) {
    return (
      <div className="kundali-page">
        <h2>{error || "No Data Found"}</h2>
        <button onClick={() => navigate("/")}>Go Back</button>
      </div>
    );
  }

  const { birthDetails } = formData;

  const akshadva = formData.akshadva?.[0];

  const navamsaPlanets = formData.navamsa
    .filter((p) => p.planet_name !== "Ascendant")
    .map((p) => ({
      planet_name: p.planet_name,
      house: p.navamsa_house,
    }));
  const navamsaAsc = formData.navamsa.find(
    (p) => p.planet_name === "Ascendant"
  )?.navamsa_sign;

  const dasamsaPlanets = formData.dasamsa
    .filter((p) => p.planet_name !== "Ascendant")
    .map((p) => ({
      planet_name: p.planet_name,
      house: p.dasamsa_house,
    }));
  const dasamsaAsc = formData.dasamsa.find(
    (p) => p.planet_name === "Ascendant"
  )?.dasamsa_sign;

  const horaPlanets = formData.hora
    .filter((p) => p.planet_name !== "Ascendant")
    .map((p) => ({
      planet_name: p.planet_name,
      house: p.hora_house,
    }));
  const horaAsc = formData.hora.find(
    (p) => p.planet_name === "Ascendant"
  )?.hora_sign;

  const trimsamsaPlanets = formData.trimsamsa
    .filter((p) => p.planet_name !== "Ascendant")
    .map((p) => ({
      planet_name: p.planet_name,
      house: p.trimsamsa_house,
    }));
  const trimsamsaAsc = formData.trimsamsa.find(
    (p) => p.planet_name === "Ascendant"
  )?.trimsamsa_sign;

  const drekkanaPlanets = formData.drekkana
    .filter((p) => p.planet_name !== "Ascendant")
    .map((p) => ({
      planet_name: p.planet_name,
      house: p.drekkana_house,
    }));
  const drekkanaAsc = formData.drekkana.find(
    (p) => p.planet_name === "Ascendant"
  )?.drekkana_sign;

  const chaturthamsaPlanets = formData.chaturthamsa
    .filter((p) => p.planet_name !== "Ascendant")
    .map((p) => ({
      planet_name: p.planet_name,
      house: p.chaturthamsa_house,
    }));
  const chaturthamsaAsc = formData.chaturthamsa.find(
    (p) => p.planet_name === "Ascendant"
  )?.chaturthamsa_sign;

  const siddhamsaPlanets = formData.siddhamsa
    .filter((p) => p.planet_name !== "Ascendant")
    .map((p) => ({
      planet_name: p.planet_name,
      house: p.siddhamsa_house,
    }));
  const siddhamsaAsc = formData.siddhamsa.find(
    (p) => p.planet_name === "Ascendant"
  )?.siddhamsa_sign;
  const saptamsaPlanets = formData.saptamsa
    .filter((p) => p.planet_name !== "Ascendant")
    .map((p) => ({
      planet_name: p.planet_name,
      house: p.saptamsa_house,
    }));
  const saptamsaAsc = formData.saptamsa.find(
    (p) => p.planet_name === "Ascendant"
  )?.saptamsa_sign;
  const shodasamsaPlanets = formData.shodasamsa
    .filter((p) => p.planet_name !== "Ascendant")
    .map((p) => ({
      planet_name: p.planet_name,
      house: p.shodasamsa_house,
    }));
  const shodasamsaAsc = formData.shodasamsa.find(
    (p) => p.planet_name === "Ascendant"
  )?.shodasamsa_sign;
  const chatvarimsamsaPlanets = formData.chatvarimsamsa
    .filter((p) => p.planet_name !== "Ascendant")
    .map((p) => ({
      planet_name: p.planet_name,
      house: p.chatvarimsamsa_house,
    }));
  const chatvarimsamsaAsc = formData.chatvarimsamsa.find(
    (p) => p.planet_name === "Ascendant"
  )?.chatvarimsamsa_sign;

  const vimsamsaPlanets = formData.vimsamsa
    .filter((p) => p.planets_name !== "Ascendant")
    .map((p) => ({
      planet_name: p.planet_name,
      house: p.vimsamsa_house,
    }));
  const vimsamsaAsc = formData.vimsamsa.find(
    (p) => p.planet_name === "Ascendant"
  )?.vimsamsa_sign;

  const formattedDate = new Date(birthDetails.birth_date).toLocaleDateString(
    "en-US",
    {
      year: "numeric",
      month: "long",
      day: "numeric",
    }
  );
  const boxVariants = {
    hidden: { opacity: 0, scale: 0.4, y: 10 },
    visible: { opacity: 1, scale: 1, y: 0 },
  };
  const groupedDasha = [];
  formData.dasha.forEach((item) => {
    const existingGroup = groupedDasha.find(
      (group) => group.maha_dasha === item.maha_dasha
    );
    if (existingGroup) {
      existingGroup.periods.push({
        antar_dasha: item.antar_dasha,
        antar_start_date: item.antar_start_date,
        antar_end_date: item.antar_end_date,
      });
    } else {
      groupedDasha.push({
        maha_dasha: item.maha_dasha,
        start_date: item.start_date, // Add maha_dasha start date
        end_date: item.end_date,
        periods: [
          {
            antar_dasha: item.antar_dasha,
            antar_start_date: item.antar_start_date,
            antar_end_date: item.antar_end_date,
          },
        ],
      });
    }
  });
  const moonLagnaAscendantSign =
    formData.moonLagna?.find((p) => p.planet_name === "Moon")?.sign || "";

  const sunLagnaAscendantSign =
    formData.sunLagna?.find((p) => p.planet_name === "Sun")?.sign || "";

  // Map API data to expected keys
  const sarvashtakavargaMapped = Array.isArray(formData.sarvashtakavarga)
    ? formData.sarvashtakavarga.map((entry) => ({
      rashi: entry.sign,
      total: entry.value,
    }))
    : [];

  const tableCellStyle = {
    border: "1px solid #14056c51",
    padding: "8px 14px",
    textAlign: "center",
    fontSize: 14,
  };

  const mahadashaContent = {
    Sun: {
      text: `☉ The Sun Mahadasha marks a transformative and illuminating period in an individual’s life. Lasting for 6 years in the Vimshottari Dasha system, this phase is governed by the Sun — the king of the planetary cabinet — symbolizing authority, leadership, ego, vitality, and soul purpose (Atma).

During this Mahadasha, themes of self-identity, recognition, and personal power come to the forefront. The native is often pushed to step into roles of greater responsibility, leadership, or visibility. Careers in government, administration, politics, or positions involving status and command may thrive. There may also be an increased desire for respect, honor, and independence.

On a deeper level, the Sun represents the father, soul, and dharma. Thus, this Mahadasha may bring either blessings or challenges in relationships with paternal figures, clarity about life purpose, and opportunities for inner growth. The individual may gain confidence and charisma but must be cautious of arrogance, ego clashes, and authoritarian behavior.

If the Sun is well-placed in the natal chart (strong in Leo, Aries, or 10th house, unafflicted), this Mahadasha can bring fame, leadership, success, and recognition. If afflicted (by Saturn, Rahu, or debilitated in Libra), it may lead to ego conflicts, loss of status, heart or eye issues, or strained authority relationships.

Spiritual practices like Surya Namaskar, reciting the Aditya Hridayam Stotra, or offering water to the rising Sun can strengthen its energy.

In essence, the Sun Mahadasha acts as a spotlight, revealing both your strengths and flaws, challenging you to align with your true purpose and live with integrity and confidence.`,
    },
    Moon: {
      text: `☽The Moon Mahadasha, lasting 10 years, is a deeply emotional and introspective period in Vedic astrology. Ruled by the nurturing and receptive Moon, this phase brings to the surface themes of emotions, intuition, relationships, mental stability, and domestic life.

The Moon represents the mind, mother, comfort, and emotional security. During this Mahadasha, individuals may experience heightened sensitivity, a stronger connection to family, and a deeper interest in nurturing others or being nurtured. The native becomes more attuned to the feelings of those around them, often becoming a source of comfort, but also more prone to emotional fluctuations and mood swings.

If the Moon is well-placed (strong in Taurus, Cancer, or in the 4th house and receiving benefic aspects), this period brings mental peace, support from the mother, popularity, romantic success, and creative inspiration. It can also indicate a comfortable home life, fertility, and happiness through children.

However, if the Moon is afflicted (in Scorpio, waning, combust, or aspected by malefics like Rahu, Saturn, or Mars), it may lead to mental unrest, depression, emotional instability, or problems with mother or female figures. The native may feel lost, dependent, or overly sentimental.

Professions related to the public, hospitality, counseling, or the arts may flourish during this time due to the Moon’s influence on popularity and imagination.

To strengthen Moon’s positive influence, remedies include wearing pearls, chanting the Chandra Beej Mantra, or offering water mixed with rice to Lord Shiva on Mondays.

Ultimately, Moon Mahadasha is a time to heal, connect, and nurture the inner self, promoting emotional maturity and compassion.`,
    },
    Mars: {
      text: `♂The Mars Mahadasha, spanning 7 years, is a period characterized by energy, action, courage, and assertiveness. Mars, known as Mangal or Kuja in Vedic astrology, is a fiery planet symbolizing willpower, initiative, aggression, ambition, and military strength. This Mahadasha often marks a time of dynamic change, where one’s physical and mental stamina is tested and refined.

When Mars is strong and well-placed (in Aries, Scorpio, Capricorn—where it's exalted—or in angular houses), this period can bring career advancements, victories, property gains, leadership roles, and increased vitality. The native becomes more decisive, goal-oriented, and focused, often initiating bold moves in business, sports, real estate, or defense-related fields. Confidence and competitiveness rise sharply.

However, if Mars is afflicted (in Cancer, combust, debilitated, or aspected by malefics), the Mahadasha can lead to conflicts, injuries, legal battles, accidents, or impulsive actions that backfire. The native may experience anger issues, rash decisions, or strained relationships, especially with brothers or male figures.

Mars also rules over siblings, property, and land. Thus, disputes over inheritance, real estate, or joint ventures may arise during this time. Physical health requires attention, particularly related to blood, muscles, or inflammations.

To balance Mars’s energy, one can perform remedies like chanting the Mangal Beej Mantra, wearing a red coral (Moonga) if astrologically suitable, and offering red lentils or sweets to Hanuman ji on Tuesdays.

In essence, Mars Mahadasha is a high-energy, transformative period. With discipline and purpose, it becomes a time of great achievements, self-assertion, and breakthroughs. Without control, it can lead to destructive outcomes.`,
    },
    Mercury: {
      text: `☿ The Mercury Mahadasha, lasting for 17 years, is a period governed by intellect, communication, analysis, and adaptability. Mercury—called Budha in Vedic astrology—is associated with logic, learning, speech, writing, trade, and youthfulness. This Mahadasha enhances one’s mental sharpness, curiosity, and ability to articulate thoughts, often bringing success in education, business, marketing, writing, media, or technology.

When Mercury is well-placed (in Gemini, Virgo—where it's exalted—or in Kendra/trikona houses), it blesses the native with intellectual growth, articulation, financial gains through business, and mental agility. It is highly favorable for careers involving communication, law, accounting, IT, teaching, and consulting. The native may become more social, clever, and versatile, attracting opportunities through networking and diplomacy.

If Mercury is afflicted (in Pisces, combust, or aspected by malefics like Rahu or Saturn), it can lead to mental restlessness, nervous disorders, speech problems, falsehoods, or miscommunication. The native may become over-calculative, manipulative, or indecisive, with a tendency to become anxious or overly dependent on logic, ignoring intuition or emotions.

Mercury also governs skin, nervous system, and speech organs, so ailments in these areas may emerge. During this period, one should remain cautious in contracts, verbal agreements, and speculative ventures.

For balancing Mercury’s effects, remedies include chanting the Budha Beej Mantra, wearing a green emerald (Panna) if suitable, and offering green moong or grass to cows on Wednesdays.

In essence, Mercury Mahadasha is a time of mental expansion, cleverness, and career advancement through intellect and communication. When positively channeled, it unlocks innovation and success; if mishandled, it leads to confusion and instability.`,
    },
    Jupiter: {
      text: `♃ The Jupiter Mahadasha, spanning 16 years, is a highly auspicious and expansive period in Vedic astrology. Known as Guru in Sanskrit, Jupiter symbolizes wisdom, spirituality, morality, wealth, and divine blessings. During this Mahadasha, a person experiences growth in knowledge, higher education, religious or spiritual pursuits, and overall life direction.

If Jupiter is well-placed (in Sagittarius, Pisces, Cancer – where it is exalted – or in trine/Kendra houses), it can bring financial abundance, marriage, childbirth, career advancements, and spiritual evolution. The native often gains respect as a mentor, guide, or teacher, and may be drawn to philosophical studies, dharmic duties, or charitable work. This period is ideal for pursuits that involve ethics, law, teaching, counseling, or spiritual leadership.

In relationships, Jupiter Mahadasha promotes marriage stability, trust, and family harmony, especially if Jupiter is the karaka (significator) for marriage in the chart. Health usually improves, and there’s a sense of optimism and purpose.

However, if Jupiter is afflicted (placed in Capricorn, combust, or influenced by malefics like Rahu or Saturn), it can lead to false beliefs, overconfidence, financial misjudgments, or misguided religious views. The native may suffer due to excess generosity, legal issues, or misplaced faith.

Jupiter governs the liver, fat metabolism, and thighs, so related health concerns may arise.

To enhance positive results, one may chant the Guru Beej Mantra, wear a yellow sapphire (Pukhraj) if astrologically suitable, and offer bananas or yellow sweets to Brahmins on Thursdays.

Overall, Jupiter Mahadasha is a time of prosperity, spiritual elevation, and expansion of inner and outer wealth, provided Jupiter is strong in the natal chart. `,
    },
    Venus: {
      text: `♀ The Venus Mahadasha, lasting 20 years, is one of the longest and most desirable planetary periods in the Vimshottari Dasha system. Venus, or Shukra, represents love, luxury, beauty, relationships, art, comfort, and material pleasures. When well-placed in the birth chart, this Mahadasha brings significant improvement in lifestyle, romantic life, creativity, and financial stability.

This period often enhances one's attraction to the finer things in life, such as fashion, music, dance, design, and aesthetics. If Venus is strong and well-aspected, the native may experience marriage, romantic fulfillment, artistic success, or wealth through partnerships. It's a time when personal charisma and magnetism are heightened, making it easier to form social and romantic connections.

Venus also governs vehicles, real estate, jewelry, and comforts of life, so people often acquire such assets during this Dasha. Professionally, those involved in entertainment, luxury, fashion, beauty, or diplomacy tend to rise in status.

However, if Venus is afflicted (placed in Virgo where it is debilitated, combust, or under the influence of malefics like Saturn, Mars, or Rahu), the Mahadasha can lead to indulgence, infidelity, relationship issues, financial loss through extravagance, or addictions. There may be emotional dissatisfaction masked by external comfort.

Venus governs the reproductive system, skin, eyes, and kidneys, so health concerns related to these areas may surface.

To strengthen Venus, one can chant the Shukra Beej Mantra, donate white items like rice, milk, or clothes on Fridays, and wear a diamond or white sapphire if astrologically appropriate.

In essence, Venus Mahadasha is a period of grace, refinement, and emotional fulfillment, with lessons centered on love, balance, and values.`,
    },
    Saturn: {
      text: `♄ The Saturn Mahadasha, lasting 19 years, is a profound and transformative period in one’s life. Saturn, or Shani, symbolizes discipline, karma, hard work, delay, responsibility, and spiritual growth. This Dasha often marks a time of serious life lessons, increased burdens, and deep introspection.

  If Saturn is well-placed (exalted in Libra, in own signs Capricorn or Aquarius, or aspected by benefics), this period can bring stability, career progress, wealth through effort, and wisdom through maturity. Saturn rewards patience, integrity, and dedication—those who follow structure and remain humble often experience long-term success and respect.

  However, if Saturn is afflicted (placed in enemy signs, combust, retrograde and malefic, or under the influence of Mars, Rahu, or Ketu), it can lead to delays, setbacks, hardships, isolation, health concerns, or emotional coldness. The native may feel burdened by responsibilities or face repeated failures until they learn Saturn's core lessons of perseverance and detachment.

  Professionally, Saturn Mahadasha benefits fields like law, administration, engineering, mining, labor, spiritual teaching, or any career requiring endurance and structure. It often pushes individuals to take on leadership roles, but only after proving their worth through trials.

  Health-wise, Saturn rules the bones, joints, teeth, and nervous system, so issues in these areas may arise.

  To mitigate negative effects, one can chant the Shani Beej Mantra, donate black items like sesame seeds, urad dal, or shoes on Saturdays, and serve the elderly or underprivileged. Wearing blue sapphire should only be done after proper astrological evaluation.

  Ultimately, Saturn Mahadasha is a time of cleansing karmas, building inner strength, and achieving lasting results through duty, discipline, and humility.`,
    },
    Rahu: {
      text: `☊ The Rahu Mahadasha, lasting 18 years, is a period marked by intense karmic acceleration, material desires, and unconventional experiences. Rahu, the North Node of the Moon, is a shadow planet with no physical body, but immense psychological and energetic influence. It represents illusion (Maya), worldly success, foreign influences, technology, sudden changes, and obsessions.

During this Mahadasha, individuals often encounter unexpected events, rapid rises or falls, and life-altering circumstances. If Rahu is well-placed (in Gemini, Taurus, Virgo, or in beneficial houses and aspected by benefics), it can bring tremendous success in foreign lands, innovation, politics, media, technology, or occult sciences. Rahu helps break boundaries and shatter norms, offering breakthroughs in fields where boldness and out-of-the-box thinking are essential.

However, if Rahu is afflicted (in Scorpio, Sagittarius, or conjunct malefics without benefic support), it can lead to addictions, scandals, mental instability, deceptions, or false success followed by downfall. The native may chase illusions, fall into immoral or unethical paths, or suffer due to overambition, confusion, or sudden shocks.

Psychologically, Rahu Mahadasha can trigger identity crises, fear, restlessness, or anxiety as the soul undergoes intense transformation.

Remedies include chanting the Rahu Beej Mantra, worshipping Durga or Bhairava, and donating smoky quartz or black sesame on Saturdays. Avoid shortcuts and focus on grounding practices like meditation and seva (selfless service). Wearing hessonite (gomed) may help but only under astrological supervision.

Ultimately, Rahu Mahadasha is a test of detachment, urging the native to balance material ambition with spiritual insight, and to master the illusions that bind the soul.`,
    },
    Ketu: {
      text: `☋ The Ketu Mahadasha, spanning 7 years, is a deeply spiritual and often detaching period in Vedic astrology. Ketu, the South Node of the Moon, is a headless shadow planet symbolizing moksha (liberation), past life karmas, detachment, intuition, and mysticism. It often marks a time when the soul is pulled inward, away from worldly distractions and toward spiritual growth and self-realization.

During this phase, external achievements may feel unfulfilling, and the individual may experience disillusionment with material life. There can be losses, separations, or sudden endings, especially if the person is overly attached to worldly gains. However, these events often serve as karmic cleansings, pushing one toward higher consciousness.

If Ketu is well-placed (in Scorpio, Sagittarius, Pisces, or in the 9th or 12th houses), it can bring profound spiritual awakenings, intuitive insights, occult mastery, and detachment from ego and desires. The person may excel in fields like astrology, healing, meditation, or renunciation.

If afflicted (especially in Gemini, Leo, or afflicted by malefics), the Mahadasha may lead to confusion, mental fog, isolation, accidents, or misunderstood behavior. The person may feel lost, disconnected, or haunted by unresolved subconscious patterns.

Psychologically, this Dasha can bring introspection, solitude, and austerity. It’s an excellent time for inner work, spiritual practices, and simplifying life.

Remedies include chanting Ketu Beej Mantra, worshipping Ganesha, engaging in charitable acts, and practicing detachment. Avoid rash decisions and focus on spiritual alignment.

In essence, Ketu Mahadasha offers a chance to transcend the ego, dissolve illusions, and align with the soul’s true purpose, even if it comes through challenges and renunciation. `,
    },
  };
  const gemBackgrounds = {};

  return (
    <div className="kundali-page">
      {/* Top navigation buttons */}
      <div className="kundali-button-header">
        <button className="kundali-button" onClick={() => navigate("/")}>
          Home
        </button>
        <button
          className="kundali-button"
          onClick={() => setActiveSection("akshadva")}
        >
          Akhadva
        </button>
        <button
          className="kundali-button"
          onClick={() => setActiveSection("kundali")}
        >
          Kundali
        </button>
        <button
          className="kundali-button"
          onClick={() => setActiveSection("allcharts")}
        >
          Charts
        </button>
        <button
          className="kundali-button"
          onClick={() => setActiveSection("ashtakavarga")}
        >
          Ashtakavarga
        </button>
        <button
          className="kundali-button"
          onClick={() => setActiveSection("dasha")}
        >
          Dashas
        </button>

        <button
          className="kundali-button"
          onClick={() => setActiveSection("sade-sati-panoti")}
        >
          Sade-Sati-Panoti
        </button>
        {/* <button
          className="kundali-button"
          onClick={() => setActiveSection("free-report")}
        >
          Free Report
        </button> */}
      </div>
      {activeSection === "akshadva" && akshadva && (
        <div>
          <div className="kundali-grid">
            <div className="kundali-details">
              <h2>🌟 Birth Details</h2>
              <p>
                <strong>Name:</strong> {birthDetails.name}
              </p>
              <p>
                <strong>Date of Birth:</strong> {formattedDate}
              </p>
              <p>
                <strong>Time of Birth:</strong> {birthDetails.birth_time}
              </p>
              <p>
                <strong>Place of Birth:</strong> {birthDetails.birth_place}
              </p>
            </div>
            <div className="akshadva-details">
              <h2>🌿 Akhadva Details</h2>
              <p>
                <strong>Nakshatra Charan:</strong> {akshadva.nakshatra_charan}
              </p>
              <p>
                <strong>Name Alphabet:</strong> {akshadva.name_alphabet}
              </p>
              <p>
                <strong>Gan:</strong> {akshadva.gan}
              </p>
              <p>
                <strong>Yoni:</strong> {akshadva.yoni}
              </p>
              <p>
                <strong>Nadi:</strong> {akshadva.nadi}
              </p>
              <p>
                <strong>Karan:</strong> {akshadva.karan}
              </p>
              <p>
                <strong>Tithi:</strong> {akshadva.tithi}
              </p>
              <p>
                <strong>Yoga:</strong> {akshadva.yoga}
              </p>
              <p>
                <strong>Paksha:</strong> {akshadva.paksha}
              </p>
              <p>
                <strong>Varna:</strong> {akshadva.varna}
              </p>
              <p>
                <strong>Vashya:</strong> {akshadva.vashya}
              </p>
              <p>
                <strong>Paya:</strong> {akshadva.paya}
              </p>
              <p>
                <strong>Tatva:</strong> {akshadva.tatva}
              </p>
              <p>
                <strong>Rashi:</strong> {akshadva.sign}
              </p>
              <p>
                <strong>Ascendant Sign:</strong> {akshadva.ascendant_sign}
              </p>
            </div>
          </div>

          <h1
            style={{
              color: " rgb(192, 189, 234)",
              textAlign: "center",
              marginTop: "60px",
            }}
          >
            What are Akshadva Details?
          </h1>
          <h6
            style={{
              color: " rgb(192, 189, 234)",
              textAlign: "center",
              fontSize: 18,
            }}
          >
            🔱 अखद्वसूत्रेण जन्मगुणाः विशदं प्रदर्श्यन्ते॥ —{" "}
            <span>
              Through the Akhadva thread, the traits of birth are clearly
              displayed.
            </span>
          </h6>
          <div
            className="akshadva-content"
            style={{ marginTop: "20px", padding: "20px", color: "white" }}
          >
            <p style={{ fontSize: 16, lineHeight: 1.7 }}>
              In Vedic astrology, <strong>Akhadva</strong> (or{" "}
              <em>Akṣadvaya</em>) is not a classical term found in ancient
              scriptures, but has gained popularity in modern astrology software
              and consulting practices. It refers to a set of core astrological
              attributes derived primarily from the native's{" "}
              <strong>Moon position, Nakshatra, and Panchang elements</strong>{" "}
              at the time of birth.
              <br />
              These details form a subtle yet essential layer of a person's
              astrological identity — often used in{" "}
              <strong>matchmaking (Ashtakoot Milan)</strong>,{" "}
              <strong>Naamkaran (naming)</strong>,{" "}
              <strong>Panchang analysis</strong>, and to understand
              psychological and spiritual tendencies.
              <br />
              The Akhadva snapshot includes traits such as Nakshatra, Charan,
              Rashi (Moon sign), Lagna (Ascendant), Yoni, Gan, Nadi, Varna, and
              others — offering a concise yet insightful summary of a native's
              cosmic fingerprint.
            </p>

            <ul className="akshadva-uses-list" style={{ lineHeight: 1.8 }}>
              <li>
                <strong>Moon's Position at Birth (Rashi + Nakshatra):</strong>
                <br />
                The placement of the Moon determines your <em>Rashi</em> (zodiac
                sign) and <em>Nakshatra</em> (constellation). These influence
                your emotional nature, instincts, and the rhythm of your inner
                life. Nakshatra and its Charan also decide the starting syllable
                of your name and reflect your core personality traits.
              </li>
              <li>
                <strong>Lagna (Ascendant) Sign:</strong>
                <br />
                The sign rising on the eastern horizon at the moment of birth
                defines your <em>Lagna</em> or Ascendant. It governs your
                physical appearance, behavioral patterns, health, and the
                overall direction of your life’s journey. It is crucial in
                predicting real-world experiences and career trajectory.
              </li>
              <li>
                <strong>Panchang Elements (Tithi, Yoga, Karan):</strong>
                <br />
                These are five limbs of the Vedic calendar that reflect the
                cosmic atmosphere at the time of your birth:
                <ul style={{ paddingLeft: "1.5rem" }}>
                  <li>
                    <strong>Tithi:</strong> The lunar day — indicates mental
                    temperament and compatibility traits.
                  </li>
                  <li>
                    <strong>Yoga:</strong> A specific combination of Sun and
                    Moon positions — affects fortune and mindset.
                  </li>
                  <li>
                    <strong>Karan:</strong> Half of a Tithi — signifies your
                    capacity for action and execution style.
                  </li>
                </ul>
              </li>
              <li>
                <strong>Additional Birth Indicators:</strong>
                <br />
                These include key astrological attributes like <em>
                  Yoni
                </em>{" "}
                (instinctive behavior), <em>Gan</em> (temperament class),{" "}
                <em>Varna</em> (spiritual caste), <em>Nadi</em> (energy
                channel), <em>Vashya</em> (dominance nature), and <em>Paya</em>{" "}
                (birth fortune level). Together, they offer deep insight into
                your compatibility, destiny, and karmic makeup — and are
                frequently used in{" "}
                <strong>
                  matchmaking, naming rituals, and personality decoding
                </strong>
                .
              </li>
            </ul>

            <h6
              style={{
                color: "rgb(217, 216, 236)",
                fontSize: 20,
                textAlign: "center",
                marginTop: "2rem",
              }}
            >
              🧭 So, Akhadva Details = Snapshot of Key Birth Factors
            </h6>

            <table
              className="table table-bordered akhadva-table"
              style={{ fontSize: "0.95rem", marginTop: "1rem" }}
            >
              <thead>
                <tr>
                  <th>Field</th>
                  <th>What It Shows</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Nakshatra & Charan</td>
                  <td>
                    Your birth star and its quarter (used for naming and
                    personality)
                  </td>
                </tr>
                <tr>
                  <td>Name Alphabet (Syllable)</td>
                  <td>
                    The syllable (like "Dha") from which your name is
                    traditionally chosen
                  </td>
                </tr>
                <tr>
                  <td>Rashi (Moon Sign)</td>
                  <td>
                    Your emotional core — how you feel, react, and connect
                  </td>
                </tr>
                <tr>
                  <td>Ascendant Sign (Lagna)</td>
                  <td>Your physical self and life direction</td>
                </tr>
                <tr>
                  <td>Yoni</td>
                  <td>
                    Animal symbolic nature based on Nakshatra — represents
                    sexual and instinctive behavior
                  </td>
                </tr>
                <tr>
                  <td>Gan</td>
                  <td>
                    Temperament category — Deva (godly), Manushya (human),
                    Rakshasa (demonic)
                  </td>
                </tr>
                <tr>
                  <td>Varna</td>
                  <td>
                    Spiritual caste (Brahmin, Kshatriya, etc.) based on Moon
                    sign
                  </td>
                </tr>
                <tr>
                  <td>Vashya</td>
                  <td>
                    Influence nature (who controls whom in a relationship)
                  </td>
                </tr>
                <tr>
                  <td>Nadi</td>
                  <td>
                    Ancestral energy channel (used in compatibility and health)
                  </td>
                </tr>
                <tr>
                  <td>Paya</td>
                  <td>
                    Indicates fortune level at birth (Gold, Silver, Copper,
                    Iron)
                  </td>
                </tr>
                <tr>
                  <td>Tithi</td>
                  <td>Lunar day — reflects mental and emotional strength</td>
                </tr>
                <tr>
                  <td>Yoga</td>
                  <td>
                    Combination of Sun and Moon degrees — affects general
                    fortune
                  </td>
                </tr>
                <tr>
                  <td>Karan</td>
                  <td>
                    Half of a Tithi — micro-time trait influencing action style
                  </td>
                </tr>
                <tr>
                  <td>Tatva (Element)</td>
                  <td>
                    Fire, Earth, Water, Air — tells about behavior and nature
                  </td>
                </tr>
                <tr>
                  <td>Paksha</td>
                  <td>
                    Shukla (waxing) or Krishna (waning) Moon phase — reflects
                    extroversion or introversion
                  </td>
                </tr>
              </tbody>
            </table>

            <h6
              style={{
                color: "rgb(192, 189, 234)",
                fontSize: 18,
                marginTop: "1rem",
              }}
            >
              📌 Where Are These Used?
            </h6>

            <ul className="akshadva-uses-list" style={{ lineHeight: 1.8 }}>
              <li>
                <strong>🕊️ Matchmaking (Ashtakoot Milan):</strong>
                <br />
                Elements like <em>Yoni</em> (instinctual compatibility),{" "}
                <em>Gan</em> (temperament), <em>Nadi</em> (life energy channel),{" "}
                <em>Varna</em> (spiritual class), and <em>Vashya</em> (mutual
                influence) are used to assess marital harmony and long-term
                relationship balance. These factors form the foundation of the
                traditional 36-point compatibility system in Vedic marriage.
              </li>
              <li>
                <strong>📜 Naamkaran (Naming Ceremony):</strong>
                <br />
                The combination of Nakshatra and its Charan determines the
                syllable with which a child’s name should ideally begin. This is
                said to resonate with their cosmic frequency, ensuring spiritual
                alignment and personal well-being throughout life.
              </li>
              <li>
                <strong>🪔 Personality Reading:</strong>
                <br />
                Insights from <em>Nakshatra</em>, <em>Moon sign (Rashi)</em>,{" "}
                <em>Yoga</em>, and <em>Tithi</em> reveal your mental patterns,
                emotional tendencies, behavior, and karmic strengths. These help
                astrologers decode your nature, habits, and spiritual
                inclinations.
              </li>
              <li>
                <strong>🌗 Daily Panchang Influence:</strong>
                <br />
                <em>Tithi</em>, <em>Yoga</em>, and <em>Karan</em> — three
                pillars of the Panchang — are not just birth indicators but also
                guide daily rituals, auspicious timings (muhurta), travel plans,
                ceremonies, and spiritual observances.
              </li>
            </ul>

            <h6
              style={{
                color: "rgb(192, 189, 234)",
                fontSize: 18,
                marginTop: "1rem",
              }}
            >
              🧠 In Short:
            </h6>
            <ul className="akshadva-uses-list" style={{ lineHeight: 1.8 }}>
              <li>
                <strong>🧠 Personality:</strong>
                <br />
                Understand your innate nature, emotional makeup, behavioral
                patterns, and how you interact with the world. Nakshatra, Rashi,
                and Tithi play a key role in decoding this.
              </li>
              <li>
                <strong>💪 Health and Vitality:</strong>
                <br />
                Factors like Nadi, Lagna, and planetary strength indicate
                physical constitution, immunity, and energy levels — helpful in
                preventive astrology and wellness.
              </li>
              <li>
                <strong>💞 Relationship Dynamics:</strong>
                <br />
                Yoni, Vashya, and Gan provide insights into attraction, harmony,
                dominance, and instinctual compatibility with partners.
              </li>
              <li>
                <strong>🕉️ Spiritual Energy:</strong>
                <br />
                Varna, Yoga, and Moon’s position reflect your soul tendencies,
                dharma, and spiritual inclinations — useful in guiding
                meditation, sadhana, or life path.
              </li>
              <li>
                <strong>🔗 Astrological Compatibility:</strong>
                <br />
                Akhadva attributes are core to Kundli Milan — they determine how
                well two charts align for marriage, friendship, or partnership.
              </li>
            </ul>
          </div>
        </div>
      )}

      {activeSection === "kundali" && akshadva && (
        <div>
          <div className="kundali-details">
            <motion.div
              variants={boxVariants}
              initial="hidden"
              animate="visible"
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <div className="switch-dropdown">
                <select
                  value={activeChart}
                  onChange={(e) => setActiveChart(e.target.value)}
                  className="dropdown-select"
                >
                  <option value="moonlagnachart">Moon-Chart</option>
                  <option value="sunlagnachart">Sun-Chart</option>
                  <option value="gochar">Gochar</option>
                  <option value="bhavcusp">BhavCusp</option>
                  <option value="dasamsa">Dasamsa</option>
                  <option value="hora">Hora</option>
                  <option value="trimsamsa">Trimsamsa</option>
                  <option value="drekkana">Drekkana</option>
                  <option value="chaturthamsa">Chaturthamsa</option>
                  <option value="shodasamsa">Shodasamsa</option>
                  <option value="saptamsa">Saptamsa</option>
                  <option value="siddhamsa">Siddhamsa</option>
                  <option value="chatvarimsamsa">Chatvarimsamsa</option>
                  <option value="vimsamsa">Vimsamsa</option>
                </select>
              </div>
            </motion.div>
            <div className="d-charts">
              <BirthChart
                planetData={formData.planets}
                ascendantSign={akshadva.ascendant_sign}
                chartTitle="Lagna Chart"
              />

              <BirthChart
                planetData={navamsaPlanets}
                ascendantSign={navamsaAsc}
                chartTitle="Navamsa Chart"
              />

              <div className="hide-on-mobile">
                {activeChart === "dasamsa" && (
                  <BirthChart
                    planetData={dasamsaPlanets}
                    ascendantSign={dasamsaAsc}
                    chartTitle="Dasamsa Chart"
                  />
                )}
                {activeChart === "hora" && (
                  <BirthChart
                    planetData={horaPlanets}
                    ascendantSign={horaAsc}
                    chartTitle="Hora Chart"
                  />
                )}
                {activeChart === "trimsamsa" && (
                  <BirthChart
                    planetData={trimsamsaPlanets}
                    ascendantSign={trimsamsaAsc}
                    chartTitle="Trimsamsa Chart"
                  />
                )}
                {activeChart === "drekkana" && (
                  <BirthChart
                    planetData={drekkanaPlanets}
                    ascendantSign={drekkanaAsc}
                    chartTitle="Drekkana Chart"
                  />
                )}
                {activeChart === "chaturthamsa" && (
                  <BirthChart
                    planetData={chaturthamsaPlanets}
                    ascendantSign={chaturthamsaAsc}
                    chartTitle="Chaturthamsa Chart"
                  />
                )}
                {activeChart === "vimsamsa" && (
                  <BirthChart
                    planetData={vimsamsaPlanets}
                    ascendantSign={vimsamsaAsc}
                    chartTitle="Vimsamsa Chart"
                  />
                )}
                {activeChart === "siddhamsa" && (
                  <BirthChart
                    planetData={siddhamsaPlanets}
                    ascendantSign={siddhamsaAsc}
                    chartTitle="Siddhamsa Chart"
                  />
                )}
                {activeChart === "saptamsa" && (
                  <BirthChart
                    planetData={saptamsaPlanets}
                    ascendantSign={saptamsaAsc}
                    chartTitle="Saptamsa Chart"
                  />
                )}
                {activeChart === "shodasamsa" && (
                  <BirthChart
                    planetData={shodasamsaPlanets}
                    ascendantSign={shodasamsaAsc}
                    chartTitle="Shodasamsa Chart"
                  />
                )}
                {activeChart === "chatvarimsamsa" && (
                  <BirthChart
                    planetData={chatvarimsamsaPlanets}
                    ascendantSign={chatvarimsamsaAsc}
                    chartTitle=" chatvarimsamsaChart"
                  />
                )}
                {activeChart === "gochar" && (
                  <BirthChart
                    planetData={formData.gocharData}
                    ascendantSign={akshadva.ascendant_sign}
                    chartTitle="Gochar Chart"
                  />
                )}
                {activeChart === "bhavcusp" && (
                  <BirthChart
                    planetData={formData.bhavCusp}
                    ascendantSign={akshadva.ascendant_sign}
                    chartTitle="BhavCusp Chart"
                  />
                )}
                {activeChart === "moonlagnachart" && (
                  <BirthChart
                    planetData={formData.moonLagna}
                    ascendantSign={moonLagnaAscendantSign}
                    chartTitle="Moon Lagna Chart"
                  />
                )}
                {activeChart === "sunlagnachart" && (
                  <BirthChart
                    planetData={formData.sunLagna}
                    ascendantSign={sunLagnaAscendantSign}
                    chartTitle="Sun Lagna Chart"
                  />
                )}
              </div>
            </div>
            <br />
            <br />
            <h2 className="ascendant-header">🌌 Ascendant Details</h2>
            <div className="ascendant-data">
              <div className="left-ascendant">
                <div>
                  <strong>Sign:</strong> {akshadva.ascendant_sign}
                </div>
                <div>
                  <strong>Degrees:</strong>
                  {akshadva.ascendant_degree}
                </div>
              </div>
              <div className="right-ascendant">
                <div>
                  <strong>Nakshatra:</strong>
                  {akshadva.ascendant_nakshatra}
                </div>
                <div>
                  <strong>Nakshatra-Lord:</strong>
                  {akshadva.ascendant_nakshatra_lord}
                </div>
              </div>
            </div>
            <div style={{ display: "flex", gap: "53rem", marginTop: "40px" }} className="heading-planet">
              <h3>🪐 Planetary Positions:</h3>
              <h3>🪐 Karakas Positions:</h3>
            </div>
            <div className="upper-part-table">
              {/* --- MOBILE PLANET TABLE TOGGLE --- */}
              <div className="mobile-planet-table">
                <div className="mobile-table-buttons">
                  <button
                    className={mobileTable === "sign" ? "active" : ""}
                    onClick={() => setMobileTable("sign")}
                  >
                    Sign
                  </button>
                  <button
                    className={mobileTable === "nakshatra" ? "active" : ""}
                    onClick={() => setMobileTable("nakshatra")}
                  >
                    Nakshatra
                  </button>
                </div>
                {mobileTable === "sign" && (
                  <table>
                    <thead>
                      <tr>
                        <th>Planet</th>
                        <th>Sign</th>
                        <th>House</th>
                        <th>Degrees</th>
                        <th>Strength</th>
                        <th>Retro</th>
                        <th>Combust</th>
                      </tr>
                    </thead>
                    <tbody>
                      {formData.planets.map((planet, index) => (
                        <tr key={index}>
                          <td>{planet.planet_name}</td>
                          <td>{planet.sign}</td>
                          <td>{planet.house}</td>
                          <td>
                            {planet.degree_in_sign !== undefined
                              ? `${Math.floor(planet.degree_in_sign)}° ${String(
                                Math.round((planet.degree_in_sign % 1) * 60)
                              ).padStart(2, "0")}'`
                              : "—"}
                          </td>
                          <td>{planet.strength}</td>
                          <td>{planet.retrograde ? "Yes" : "No"}</td>
                          <td>{planet.combustion}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
                {mobileTable === "nakshatra" && (
                  <table>
                    <thead>
                      <tr>
                        <th>Planet</th>
                        <th>Nakshatra</th>
                        <th>Nakshatra Lord</th>
                        <th> Relative Nature</th>
                      </tr>
                    </thead>
                    <tbody>
                      {formData.planets.map((planet, index) => (
                        <tr key={index}>
                          <td>{planet.planet_name}</td>
                          <td>{planet.nakshatra}</td>
                          <td>{planet.nakshatra_lord}</td>
                          <td>{planet.functional_nature}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
              <table className="planet-table">
                <thead>
                  <tr>
                    <th>Planet</th>
                    <th>Sign</th>
                    <th>House</th>
                    <th>Degrees</th>
                    <th>Strength</th>
                    <th>Nakshatra</th>
                    <th>Nakshatra Lord</th>
                    <th>Retrograde</th>
                    <th>Combustion</th>

                    <th>R-Nature</th>
                  </tr>
                </thead>
                <tbody>
                  {formData.planets.map((planet, index) => (
                    <tr key={index}>
                      <td>{planet.planet_name}</td>
                      <td>{planet.sign}</td>
                      <td>{planet.house}</td>
                      <td>
                        {planet.degree_in_sign !== undefined
                          ? `${Math.floor(planet.degree_in_sign)}° ${String(
                            Math.round((planet.degree_in_sign % 1) * 60)
                          ).padStart(2, "0")}'`
                          : "—"}
                      </td>

                      <td>{planet.strength}</td>
                      <td>{planet.nakshatra}</td>
                      <td>{planet.nakshatra_lord}</td>
                      <td>{planet.retrograde ? "Yes" : "No"}</td>
                      <td>{planet.combustion}</td>

                      <td>{planet.functional_nature}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <table className="karakas-table">
                <thead>
                  <tr>
                    <th>Karaka</th>
                    <th>Planet-Name</th>
                    <th>Planet-Sign</th>
                  </tr>
                </thead>
                <tbody>
                  {formData.karakas.map((karaka, index) => (
                    <tr key={index}>
                      <td>{karaka.karaka_type}</td>
                      <td>{karaka.planet_name}</td>
                      <td>{karaka.karaka_sign}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="lower-part-table">
              <table className="avastha-table">
                <thead>
                  <tr>
                    <th>Planet</th>
                    <th>Baladi</th>
                    <th>Jagrat</th>
                    <th>Deeptadi</th>
                  </tr>
                </thead>
                <tbody>
                  {formData.planets.map((planetObj, idx) => (
                    <tr key={idx}>
                      <td>{planetObj.planet_name}</td>
                      <td>{planetObj.baladi}</td>
                      <td>{planetObj.jagrat}</td>
                      <td>{planetObj.deeptadi}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div
                style={{
                  display: "flex",
                  gap: "16px",

                  flexWrap: "wrap",
                }} className="gemstone-right-part hide-on-mobile-gem"
              >
                {/* Life Stone Card */}
                {formData.lifeStones.length > 0 && (
                  <div
                    style={{
                      border: "1px solid #ccc",
                      borderRadius: "40px",
                      padding: "10px",
                      height: "400px",
                      width: "20rem",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                      background:
                        gemBackgrounds[formData.lifeStones[0].gem] || "#fff",
                      textAlign: "center",
                    }}
                  >
                    <h4>Life Stone</h4>
                    <p>
                      <strong>Gem:</strong> {formData.lifeStones[0].gem}
                    </p>
                    <p style={{ fontSize: "14px", color: "#555" }}>
                      {formData.lifeStones[0].description}
                    </p>
                    <p>
                      <em>How to wear:</em> {formData.lifeStones[0].how_to_wear}
                    </p>
                    <p>Mantra:{formData.lifeStones[0].mantra}</p>
                  </div>
                )}

                {/* Fortune Stone Card */}
                {formData.fortuneStones.length > 0 && (
                  <div
                    style={{
                      border: "1px solid #ccc",
                      borderRadius: "40px",
                      padding: "10px",
                      height: "400px",
                      width: "20rem",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                      background:
                        gemBackgrounds[formData.fortuneStones[0].gem] || "#fff",
                      textAlign: "center",
                    }}
                  >
                    <h4>Fortune Stone</h4>
                    <p>
                      <strong>Gem:</strong> {formData.fortuneStones[0].gem}
                    </p>
                    <p style={{ fontSize: "14px", color: "#555" }}>
                      {formData.fortuneStones[0].description}
                    </p>
                    <p>
                      <em>How to wear:</em>{" "}
                      {formData.fortuneStones[0].how_to_wear}
                    </p>
                    <p>Mantra:{formData.fortuneStones[0].mantra}</p>
                  </div>
                )}

                {/* Lucky Stone Card */}
                {formData.luckyStones.length > 0 && (
                  <div
                    style={{
                      border: "1px solid #ccc",
                      borderRadius: "40px",
                      padding: "10px",
                      height: "400px",
                      width: "20rem",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                      background:
                        gemBackgrounds[formData.luckyStones[0].gem] || "#fff",
                      textAlign: "center",
                    }}
                  >
                    <h4>Lucky Stone</h4>
                    <p>
                      <strong>Gem:</strong> {formData.luckyStones[0].gem}
                    </p>
                    <p style={{ fontSize: "14px", color: "#555" }}>
                      {formData.luckyStones[0].description}
                    </p>
                    <p>
                      <em>How to wear:</em>{" "}
                      {formData.luckyStones[0].how_to_wear}
                    </p>
                    <p>Mantra:{formData.luckyStones[0].mantra}</p>
                  </div>
                )}
              </div>
            </div>
            <div className="unique-flex unique-gap-4 unique-mb-4">
              <button
                onClick={() => setActiveTab("houses")}
                className={`unique-px-4 unique-py-2 unique-rounded ${activeTab === "houses"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200"
                  }`}
              >
                Houses
              </button>
              <button
                onClick={() => setActiveTab("planetary")}
                className={`unique-px-4 unique-py-2 unique-rounded ${activeTab === "planetary"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200"
                  }`}
              >
                Planetary
              </button>
            </div>
            <div className="Inter-pretation">
              {activeTab === "houses" && (
                <div>
                  {formData.houses.map((houseData, index) => {
                    const houseKey = Object.keys(houseData)[0];
                    const house = houseData[houseKey];

                    return (
                      <React.Fragment key={index}>
                        <h4 >
                          House {house.house_number}:
                        </h4>
                        <p >
                          {house.interpretation}
                        </p>
                      </React.Fragment>
                    );
                  })}
                </div>
              )}

              {activeTab === "planetary" && (
                <div>
                  {formData.planetInter.map((planetInterData, index) => (
                    <React.Fragment key={index}>
                      <h4 >
                        {planetInterData.planet_name}:
                      </h4>
                      <p >
                        {planetInterData.interpretation}
                      </p>
                    </React.Fragment>
                  ))}
                </div>
              )}
            </div>
          </div>

          <h1
            style={{
              color: " rgb(192, 189, 234)",
              textAlign: "center",
              marginTop: "60px",
            }}
          >
            What is Kundali Analysis?
          </h1>
          <h6
            style={{
              color: " rgb(192, 189, 234)",
              textAlign: "center",
              fontSize: 18,
            }}
          >
            🔱 जातकस्य गूढार्थः विवेच्यते –{" "}
            <span>Unlocking the Deeper Meaning of the Birth Chart</span>
          </h6>
          <div
            className="kundali-content"
            style={{ marginTop: "20px", padding: "20px", color: "white", textAlign: "justify" }}
          >
            {" "}
            <p style={{ fontSize: 16, marginTop: "1rem" }}>
              In Vedic astrology, <strong>Kundali</strong> (or Janma Kundali) is
              the detailed celestial map of an individual's birth — capturing
              the exact configuration of planets, Ascendant (Lagna), Moon sign
              (Rashi), and Nakshatras (constellations) at the moment of birth.
              It is considered the astrological DNA of a person, holding the key
              to one's karmic blueprint, innate nature, life path, and
              potential.
            </p>
            <p style={{ fontSize: 16 }}>
              The Kundali is divided into twelve houses (Bhavas), each
              representing different aspects of life — such as personality,
              wealth, siblings, home, education, marriage, profession, and
              spirituality. The signs (Rashis) and planets (Grahas) placed in
              these houses determine how these life areas unfold. It reflects
              your core personality traits, subconscious drives, emotional
              needs, decision-making patterns, and even your spiritual
              inclinations.
            </p>
            <p style={{ fontSize: 16 }}>
              Every planet in your Kundali brings its own influence: the{" "}
              <strong>Sun</strong> represents the soul and authority, the{" "}
              <strong>Moon</strong> governs mind and emotions,{" "}
              <strong>Mercury</strong> controls intellect and speech,
              <strong>Venus</strong> manages relationships and beauty,{" "}
              <strong>Mars</strong> shows drive and aggression,
              <strong>Jupiter</strong> reflects wisdom and growth,{" "}
              <strong>Saturn</strong> governs discipline and karma,
              <strong>Rahu</strong> and <strong>Ketu</strong> signify karmic
              debts and liberation.
            </p>
            <p style={{ fontSize: 16 }}>
              Beyond planetary positions, Kundali analysis involves deeper
              layers — such as
              <strong> Yogas</strong> (planetary combinations),{" "}
              <strong>Doshas</strong> (flaws or afflictions like Kaal Sarp or
              Manglik),
              <strong> Dasha</strong> systems (planetary periods like
              Vimshottari Dasha), and <strong>Ashtakavarga</strong> scoring.
              These techniques help predict the timing of major life events and
              understand when certain areas of life will flourish or face
              obstacles.
            </p>
            <p style={{ fontSize: 16 }}>
              The role of <strong>Lagna</strong> (Ascendant) is central — it
              marks the starting point of your physical life and influences your
              appearance, behavior, and outlook. The Moon sign reflects your
              inner world — how you feel, react, and emotionally process life.
              The Sun sign adds spiritual focus and vitality.
            </p>
            <p style={{ fontSize: 16 }}>
              A well-analyzed Kundali not only predicts external events but also
              empowers you with inner clarity. It reveals your karmic
              tendencies, recurring patterns, and untapped strengths. It becomes
              a guiding light for making wise decisions, choosing the right
              profession or partner, understanding health risks, and aligning
              with your higher dharma (purpose).
            </p>
            <p style={{ fontSize: 16 }}>
              In modern applications, Kundalis are used in marriage
              compatibility (Kundali Milan), personalized daily horoscopes,
              career guidance, gemstone recommendations, Shubh Muhurta
              (auspicious timing), and even psychological profiling. With tools
              like Navamsa (D9 chart), Dasamsa (D10), and other divisional
              charts, even more precise analysis becomes possible — helping you
              navigate life with cosmic insight.
            </p>
            <h3 style={{ color: "rgb(192, 189, 234)", marginTop: "2rem" }}>
              🏠 House-wise Life Themes:
            </h3>
            <ul className="kundali-houses-list">
              <li>
                <strong>1st House – Lagna (Ascendant):</strong> This house
                signifies the starting point of your life journey. It governs
                your physical appearance, body structure, temperament, and
                overall vitality. It is also the lens through which your entire
                chart is interpreted — shaping how you assert yourself, how
                others perceive you, and how you approach the world. A strong
                1st house often leads to self-confidence, leadership, and
                personal magnetism.
              </li>
              <li>
                <strong>2nd House – Dhana (Wealth & Speech):</strong> This house
                relates to material possessions, savings, food habits, and
                speech. It reflects your relationship with money, your values,
                and your family upbringing. It governs your ability to
                accumulate and manage wealth, as well as how gracefully or
                harshly you communicate. It also reveals emotional security and
                how deeply you’re rooted in tradition or family.
              </li>
              <li>
                <strong>3rd House – Sahaj (Courage & Communication):</strong>{" "}
                Known for governing willpower and communication, this house
                shows your expression through writing, speech, art, or movement.
                It represents siblings (especially younger ones), short travels,
                curiosity, and creative courage. A strong 3rd house can make
                someone bold, witty, and active in personal endeavors or social
                media.
              </li>
              <li>
                <strong>4th House – Sukha (Home & Mother):</strong> This is the
                heart of the chart — reflecting inner peace, comfort, motherly
                nurturing, domestic life, and roots. It governs your real
                estate, vehicles, and homeland. A healthy 4th house indicates a
                happy home life, maternal blessings, and emotional fulfillment,
                while an afflicted one can cause internal unrest or family
                disconnect.
              </li>
              <li>
                <strong>5th House – Putra (Creativity & Children):</strong> The
                5th house showcases your intellectual brilliance, love affairs,
                children, and creative talents. It is deeply connected to
                past-life karmas and the results they bear in this incarnation.
                A strong 5th house signifies a sharp mind, romantic charm, joy
                from children, and even success in speculative ventures like
                trading or entertainment.
              </li>
              <li>
                <strong>6th House – Ripu (Health & Enemies):</strong> Often
                misunderstood, this house highlights the arena of
                self-discipline and daily work. It shows the challenges you must
                face to grow — including illness, debts, competition, and
                enemies. It also represents your service to others, workplace
                dynamics, and ability to overcome obstacles. Strong planets here
                make one a fighter and a problem-solver.
              </li>
              <li>
                <strong>7th House – Yuvati (Marriage & Partnerships):</strong>{" "}
                Directly opposite to the 1st house, the 7th governs
                relationships — romantic, business, and legal. It reveals your
                marriage prospects, spouse’s nature, and how you behave in
                one-on-one partnerships. A harmonious 7th house points toward
                successful unions and public dealings, while afflictions may
                indicate delays, separation, or imbalance in relationships.
              </li>
              <li>
                <strong>8th House – Randhra (Mystery & Transformation):</strong>{" "}
                This is the house of the unknown — associated with occult
                sciences, secrets, hidden wealth, and inner transformation. It
                governs inheritance, longevity, death-rebirth cycles, and
                psychic depth. People with strong 8th house placements often go
                through intense personal transformations or are drawn to tantra,
                astrology, or psychological healing.
              </li>
              <li>
                <strong>9th House – Dharma (Fortune & Higher Wisdom):</strong>{" "}
                Considered the house of blessings and fortune, it governs your
                connection to spirituality, ethics, gurus, and higher learning.
                It also rules long journeys and cultural exploration. This house
                shows your karmic rewards from past deeds and is essential for
                understanding your moral framework and life philosophy.
              </li>
              <li>
                <strong>10th House – Karma (Career & Status):</strong> The house
                at the zenith of the chart, it reveals your public life, career
                direction, ambitions, and how society views you. It reflects
                your boss-like qualities, leadership capacity, and your legacy.
                A strong 10th house often leads to fame, recognition, and
                powerful achievements, especially if occupied by benefic
                planets.
              </li>
              <li>
                <strong>11th House – Labha (Gains & Desires):</strong> The house
                of aspirations and social rewards, it indicates income from your
                career, network circles, elder siblings, and societal gains. It
                shows how your dreams materialize through collaboration and
                community. A well-placed 11th house often brings financial
                prosperity and influential social connections.
              </li>
              <li>
                <strong>12th House – Vyaya (Losses & Liberation):</strong> The
                final house deals with endings, isolation, expenses, foreign
                settlements, and spiritual liberation (moksha). It governs
                sleep, dreams, charity, and subconscious fears. Though
                associated with losses, it is also the key to transcendence and
                spiritual detachment — pointing toward higher evolution and
                universal consciousness.
              </li>
            </ul>
            <h3 style={{ color: "rgb(192, 189, 234)", marginTop: "2rem" }}>
              📌 Where Is It Used?
            </h3>
            <ul className="kundali-uses-list">
              <li>
                <strong>🔭 Life Path Analysis:</strong> The Lagna (Ascendant),
                Moon, and Sun signs shape the fundamental nature of your
                personality, aspirations, life direction, and karmic role. They
                help decode the "why" behind your instincts, life goals, and
                choices — and form the base of your destiny map.
              </li>
              <li>
                <strong>💼 Career Guidance:</strong> The 2nd (wealth), 6th
                (service), 10th (profession), and 11th (gains) houses, combined
                with the influence of Mercury (intellect), Sun (authority),
                Saturn (hard work), and Mars (ambition), point to your ideal
                career paths, leadership potential, business acumen, or job
                stability.
              </li>
              <li>
                <strong>❤️ Relationship Compatibility:</strong> Houses 5
                (romance), 7 (marriage), and Venus (love), Mars (passion),
                Jupiter (husband in female charts), and Moon (emotional needs)
                help in assessing compatibility, emotional bonding, marriage
                timing, and partner qualities. Kundali Milan using Ashtakoot &
                Dashakoot systems further analyzes long-term harmony.
              </li>
              <li>
                <strong>🧘‍♂️ Spiritual Evolution:</strong> The 9th (dharma), 12th
                (moksha), and 5th (past life merits) houses, along with Jupiter
                (guru), Ketu (detachment), and Moon (faith), reveal spiritual
                tendencies, life philosophy, potential for sadhana, pilgrimages,
                and karmic liberation.
              </li>
              <li>
                <strong>⚕️ Health & Disease:</strong> The 6th (disease), 8th
                (chronic issues), and 12th (hospitalization) houses, afflicted
                planets (like Rahu, Mars, Saturn), and doshas (Manglik, Kaal
                Sarp, Pitra) indicate vulnerabilities, genetic dispositions,
                mental health risks, and recovery patterns.
              </li>
              <li>
                <strong>📆 Timing of Events:</strong> The Dasha system
                (planetary periods), along with transits (Gochar), help
                astrologers pinpoint when key life events — such as job changes,
                marriage, childbirth, or travel — are likely to happen and how
                favorable those phases are.
              </li>
              <li>
                <strong>💎 Remedies & Alignment:</strong> Kundali analysis
                suggests personalized Vedic remedies like mantra chanting,
                gemstones, fasting, daan (donations), and planetary rituals
                (like Navagraha Puja) to neutralize doshas and strengthen weak
                planets for better life outcomes.
              </li>
              <li>
                <strong>👨‍👩‍👧 Family & Children:</strong> Houses 4 (home), 2
                (family), and 5 (children), along with Jupiter and Moon, help
                understand parenting karma, family harmony, progeny timing, and
                bonding patterns within the household.
              </li>
              <li>
                <strong>🌍 Travel & Foreign Settlement:</strong> The 3rd, 9th,
                and 12th houses, especially when linked with Rahu, Moon, or
                Venus, indicate potential for foreign education, residence
                abroad, spiritual retreats, or professional migration.
              </li>
            </ul>
            <h3 style={{ color: "rgb(192, 189, 234)", marginTop: "2rem" }}>
              🧠 In Short:
            </h3>
            <ul className="kundali-summary-list">
              <li>
                <strong>🪐 Planetary Positions:</strong> Reveal your strengths,
                weaknesses, talents, karmic debts, and challenges across all
                areas of life. The placement and dignity (exalted, debilitated,
                combust, retrograde) of each planet shapes your fate.
              </li>
              <li>
                <strong>📈 House Analysis:</strong> Each of the 12 houses
                governs a life domain — such as personality (1st), wealth (2nd),
                career (10th), marriage (7th), and losses or liberation (12th).
                Their lords and planetary occupants offer specific life lessons.
              </li>
              <li>
                <strong>🧬 Karakas (Significators):</strong> Key planets
                represent core energies: Sun (soul/authority), Moon
                (mind/emotion), Mars (courage/energy), Mercury
                (intellect/speech), Jupiter (wisdom/wealth), Venus (love/art),
                and Saturn (discipline/karma).
              </li>
              <li>
                <strong>🌠 Yogas & Doshas:</strong> Yogas like Gajakesari, Raj
                Yoga, or Dhan Yoga bring prosperity, status, and wisdom. Doshas
                like Manglik, Kaal Sarp, Pitra, and Grahan can cause delays or
                challenges if not remedied or balanced with grace periods.
              </li>
              <li>
                <strong>💎 Gemstone Remedies:</strong> Based on your Ascendant
                Lord, planetary benefics, and functional malefics, specific gems
                (like Ruby for Sun or Emerald for Mercury) are advised to
                enhance planetary support and neutralize afflictions.
              </li>
              <li>
                <strong>📊 Dasha & Transit Timings:</strong> The Vimshottari
                Dasha system and planetary transits (Gochar) determine when
                events unfold — such as career growth, marriage, illness, or
                spiritual breakthroughs — with incredible precision.
              </li>
              <li>
                <strong>🧿 Hidden Karma & Life Purpose:</strong> The 5th and 9th
                houses, Ketu, and the Navamsa (D9) chart reveal past-life
                impressions, your soul’s journey, spiritual leanings, and the
                deeper purpose behind your current incarnation.
              </li>
            </ul>
          </div>
        </div>
      )}

      {activeSection === "allcharts" && formData && (
        <div
          className="d-allcharts"

        >
          {/* Helper function to render chart + description */}
          {[
            {
              planetData: formData.planets,
              ascendantSign: akshadva.ascendant_sign,
              chartTitle: "Lagna Chart",
              description: (
                <ul>
                  <li>Shows the exact ascendant (rising sign) at birth.</li>
                  <li>Displays planetary placements in houses and signs.</li>
                  <li>Reveals life areas influenced by planets and houses.</li>
                  <li>
                    Forms the base chart for all Vedic astrology analysis.
                  </li>
                  <li>
                    Helps understand personality, health, and overall life path.
                  </li>
                </ul>
              ),
            },
            {
              planetData: formData.bhavCusp,
              ascendantSign: akshadva.ascendant_sign,
              chartTitle: "BhavCusp Chart",
              description: (
                <ul>
                  <li>
                    Marks the exact starting points of the twelve houses
                    (bhavas).
                  </li>
                  <li>
                    Defines house boundaries for interpreting planetary effects.
                  </li>
                  <li>Helps clarify the influence of planets in each house.</li>
                  <li>
                    Essential for precise calculation of life areas like career,
                    relationships, and wealth.
                  </li>
                  <li>
                    Used to assess transit impacts on specific life sectors
                    accurately.
                  </li>
                </ul>
              ),
            },
            {
              planetData: formData.moonLagna,
              ascendantSign: moonLagnaAscendantSign,
              chartTitle: "Moon Lagna Chart",
              description: (
                <ul>
                  <li>
                    Represents the rising sign at the moment of Moon’s birth
                    position.
                  </li>
                  <li>
                    Focuses on emotional nature, mind, and subconscious
                    patterns.
                  </li>
                  <li>
                    Used to analyze mental health, moods, and inner personality.
                  </li>
                  <li>
                    Important in predicting timing of events related to feelings
                    and family.
                  </li>
                  <li>
                    Supports understanding of one’s emotional responses and
                    habits.
                  </li>
                </ul>
              ),
            },
            {
              planetData: formData.sunLagna,
              ascendantSign: sunLagnaAscendantSign,
              chartTitle: "Sun Lagna Chart",
              description: (
                <ul>
                  <li>
                    Shows the rising sign at the moment of Sun’s birth position.
                  </li>
                  <li>
                    Highlights ego, vitality, leadership qualities, and
                    self-expression.
                  </li>
                  <li>
                    Used to assess career potential, authority, and life
                    purpose.
                  </li>
                  <li>
                    Helps understand one’s core identity and public image.
                  </li>
                  <li>
                    Important for timing events related to health and personal
                    power.
                  </li>
                </ul>
              ),
            },
            {
              planetData: navamsaPlanets,
              ascendantSign: navamsaAsc,
              chartTitle: "Navamsa Chart",
              description: (
                <ul>
                  <li>
                    Divisional chart focusing on deeper insight into marriage
                    and relationships.
                  </li>
                  <li>
                    Reveals spiritual growth, inner strengths, and soul’s
                    purpose.
                  </li>
                  <li>
                    Used to judge the strength and dignity of planets beyond the
                    natal chart.
                  </li>
                  <li>
                    Important for predicting marital harmony, longevity, and
                    partner’s nature.
                  </li>
                  <li>
                    Helps refine understanding of life’s finer spiritual and
                    emotional aspects.
                  </li>
                </ul>
              ),
            },
            {
              planetData: dasamsaPlanets,
              ascendantSign: dasamsaAsc,
              chartTitle: "Dasamsa Chart",
              description: (
                <ul>
                  <li>
                    Focuses on career, profession, and public achievements.
                  </li>
                  <li>
                    Reveals aptitude, authority, and reputation in the
                    workplace.
                  </li>
                  <li>
                    Used to analyze professional growth and major job changes.
                  </li>
                  <li>
                    Helps understand one's karmic duties and vocational
                    direction.
                  </li>
                  <li>
                    Vital for timing promotions, status, and professional
                    success.
                  </li>
                </ul>
              ),
            },
            {
              planetData: horaPlanets,
              ascendantSign: horaAsc,
              chartTitle: "Hora Chart",
              description: (
                <ul>
                  <li>Deals with wealth, assets, and material prosperity.</li>
                  <li>
                    Divides signs into Sun Hora and Moon Hora for
                    masculine/feminine energy.
                  </li>
                  <li>
                    Helps judge earning potential and financial discipline.
                  </li>
                  <li>
                    Useful in determining tendencies towards saving or spending.
                  </li>
                  <li>
                    Supports decisions on investments, income, and resource
                    management.
                  </li>
                </ul>
              ),
            },
            {
              planetData: trimsamsaPlanets,
              ascendantSign: trimsamsaAsc,
              chartTitle: "Trimsamsa Chart",
              description: (
                <ul>
                  <li>Deals with misfortunes, weaknesses, and karmic debts.</li>
                  <li>
                    Used to analyze mental health, hidden fears, and diseases.
                  </li>
                  <li>
                    Indicates inner strength, courage, and endurance during
                    adversity.
                  </li>
                  <li>
                    Important in determining the source of recurring troubles or
                    enemies.
                  </li>
                  <li>
                    Assists in prescribing remedies and spiritual protection
                    methods.
                  </li>
                </ul>
              ),
            },
            {
              planetData: drekkanaPlanets,
              ascendantSign: drekkanaAsc,
              chartTitle: "Drekkana Chart",
              description: (
                <ul>
                  <li>
                    Focuses on siblings, courage, and cooperative ventures.
                  </li>
                  <li>
                    Reveals mental strength, boldness, and attitude toward risk.
                  </li>
                  <li>
                    Used for analyzing younger co-borns and social
                    relationships.
                  </li>
                  <li>
                    Helps in understanding willpower and communication strength.
                  </li>
                  <li>
                    Supports interpretation of public interactions and support
                    networks.
                  </li>
                </ul>
              ),
            },
            {
              planetData: chaturthamsaPlanets,
              ascendantSign: chaturthamsaAsc,
              chartTitle: "Chaturthamsa Chart",
              description: (
                <ul>
                  <li>Deals with property, vehicles, and material comfort.</li>
                  <li>
                    Indicates the potential for inheritance and fixed assets.
                  </li>
                  <li>
                    Reveals connection to land, mother, and real estate success.
                  </li>
                  <li>
                    Important in timing property deals or domestic stability.
                  </li>
                  <li>
                    Shows desire for security, home life, and ancestral support.
                  </li>
                </ul>
              ),
            },
            {
              planetData: vimsamsaPlanets,
              ascendantSign: vimsamsaAsc,
              chartTitle: "Vimsamsa Chart",
              description: (
                <ul>
                  <li>
                    Reflects spiritual inclination, devotion, and inner
                    practices.
                  </li>
                  <li>
                    Used to judge the depth of faith and religious tendencies.
                  </li>
                  <li>
                    Reveals karmic progress in spiritual growth across
                    lifetimes.
                  </li>
                  <li>
                    Important for selecting spiritual paths and disciplines
                    (sadhana).
                  </li>
                  <li>
                    Assists in understanding dharma and inner peace potential.
                  </li>
                </ul>
              ),
            },
            {
              planetData: siddhamsaPlanets,
              ascendantSign: siddhamsaAsc,
              chartTitle: "Siddhamsa Chart",
              description: (
                <ul>
                  <li>
                    Focuses on learning, education, and intellectual
                    development.
                  </li>
                  <li>
                    Used to assess academic excellence and interest in
                    scriptures.
                  </li>
                  <li>
                    Shows clarity, intelligence, and ability to absorb
                    knowledge.
                  </li>
                  <li>
                    Important in predicting success in studies and competitive
                    exams.
                  </li>
                  <li>
                    Reveals potential for becoming a teacher or spiritual guide.
                  </li>
                </ul>
              ),
            },
            {
              planetData: saptamsaPlanets,
              ascendantSign: saptamsaAsc,
              chartTitle: "Saptamsa Chart",
              description: (
                <ul>
                  <li>Deals with children, fertility, and lineage.</li>
                  <li>
                    Shows the potential for progeny and relationship with
                    children.
                  </li>
                  <li>
                    Used to understand creative output and reproduction-related
                    matters.
                  </li>
                  <li>
                    Important in timing childbirth and analyzing parental karma.
                  </li>
                  <li>
                    Also helps assess joy, love, and playful aspects of life.
                  </li>
                </ul>
              ),
            },
            {
              planetData: shodasamsaPlanets,
              ascendantSign: shodasamsaAsc,
              chartTitle: "Shodasamsa Chart",
              description: (
                <ul>
                  <li>
                    Concerns luxuries, comforts, vehicles, and sensual
                    pleasures.
                  </li>
                  <li>
                    Shows the quality of life, happiness, and lifestyle
                    upgrades.
                  </li>
                  <li>
                    Used to analyze attachment to worldly pleasures and
                    indulgence.
                  </li>
                  <li>
                    Important for evaluating satisfaction with material life.
                  </li>
                  <li>
                    Helps understand taste, aesthetic sense, and comfort zones.
                  </li>
                </ul>
              ),
            },
            {
              planetData: chatvarimsamsaPlanets,
              ascendantSign: chatvarimsamsaAsc,
              chartTitle: "Chatvarimsamsa Chart",
              description: (
                <ul>
                  <li>
                    Represents maternal karmas and blessings/curses from the
                    maternal line.
                  </li>
                  <li>
                    Used to detect inherited emotional and spiritual strengths
                    or flaws.
                  </li>
                  <li>
                    Helps interpret hidden karmic roots and their consequences.
                  </li>
                  <li>
                    Important for understanding the effect of past life merits
                    or sins.
                  </li>
                  <li>
                    Guides deep karmic cleansing through spiritual practices.
                  </li>
                </ul>
              ),
            },
          ].map(({ planetData, ascendantSign, chartTitle, description }) => (
            <div key={chartTitle} className="allcharts-card">
              <div style={{ flex: "0 0 250px" }}>
                <BirthChart
                  planetData={planetData}
                  ascendantSign={ascendantSign}
                />
              </div>
              <div
                style={{
                  flex: "1",
                  paddingLeft: "1rem",
                  transition: "transform 0.2s ease",
                }}
              >
                <h3
                  style={{
                    margin: "0 0 0.5rem 0",
                    color: "rgb(5, 54, 77)",
                    textAlign: "center",
                  }}
                >
                  {chartTitle}
                </h3>
                <p
                  style={{
                    margin: 0,
                    fontSize: "0.9rem",
                  }}
                >
                  {description}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeSection === "ashtakavarga" && formData && (
        <div>
          <div className="ashtakavarga-details">
            {/* Type Switch Buttons */}
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: "1rem", // space-x-4 = 1rem gap between buttons

                marginBottom: "2rem",
              }}
            >
              <button
                onClick={() => setSelectedAVType("bhinnashtakvarga")}
                style={{
                  padding: "0.625rem 1.5rem", // py-2.5 px-6
                  borderRadius: "0.75rem", // rounded-xl
                  fontSize: "1rem", // text-base
                  fontWeight: 500, // font-medium
                  transition: "all 0.3s",
                  borderWidth: "2px",
                  borderStyle: "solid",
                  ...(selectedAVType === "bhinnashtakvarga"
                    ? {
                      backgroundImage:
                        "linear-gradient(to right,rgb(229, 102, 70),rgb(237, 58, 91))", // indigo-600 to purple-600
                      color: "white",
                      boxShadow:
                        "0 10px 15px -3px rgba(99, 102, 241, 0.7), 0 4px 6px -4px rgba(139, 92, 246, 0.7)", // shadow-lg approx
                      borderColor: "transparent",
                      transform: "scale(1.05)",
                    }
                    : {
                      backgroundColor: "white",
                      color: "#4b5563", // gray-700
                      borderColor: "#d1d5db", // gray-300
                      cursor: "pointer",
                    }),
                }}
              >
                Bhinnashtakavarga
              </button>

              <button
                onClick={() => setSelectedAVType("sarvashtakavarga")}
                style={{
                  padding: "0.625rem 1.5rem",
                  borderRadius: "0.75rem",
                  fontSize: "1rem",
                  fontWeight: 500,
                  transition: "all 0.3s",
                  borderWidth: "2px",
                  borderStyle: "solid",
                  ...(selectedAVType === "sarvashtakavarga"
                    ? {
                      backgroundImage:
                        "linear-gradient(to right,rgb(229, 102, 70),rgb(237, 58, 91))",
                      color: "white",
                      boxShadow:
                        "0 10px 15px -3px rgba(99, 102, 241, 0.7), 0 4px 6px -4px rgba(139, 92, 246, 0.7)",
                      borderColor: "transparent",
                      transform: "scale(1.05)",
                    }
                    : {
                      backgroundColor: "white",
                      color: "#4b5563",
                      borderColor: "#d1d5db",
                      cursor: "pointer",
                    }),
                }}
              >
                Sarvashtakavarga
              </button>
            </div>
            {selectedAVType === "bhinnashtakvarga" && (
              <>
                {/* Bhinnashtakavarga table */}

                <div className="bav-table">
                  <div className="bav-table-header">
                    <div className="bav-table-buttons">
                      {["sun", "moon", "mars", "mercury", "jupiter", "venus", "saturn"].map((planet) => (
                        <button
                          key={planet}
                          onClick={() => setSelectedBAVPlanet(planet)}
                          className={`planet-btn ${planet === "sun" ? "sticky-left" : ""} ${selectedBAVPlanet === planet ? "selected" : ""}`}
                        >
                          {planet.charAt(0).toUpperCase() + planet.slice(1)}
                        </button>
                      ))}
                    </div>


                    <AshtakavargaChart
                      ascendantSign={akshadva?.ascendant_sign}
                      bhinnashtakvarga={formData.bhinnashtakvarga.filter(
                        (bav) => bav.bav_planet === selectedBAVPlanet
                      )}
                      selectedPlanet={selectedBAVPlanet}
                      chartTitle={`${selectedBAVPlanet.charAt(0).toUpperCase() +
                        selectedBAVPlanet.slice(1)
                        } `}
                    />
                  </div>

                  <div className="bav-table-container">
                    <table>
                      <thead>
                        <tr>
                          <th>Sign</th>
                          <th>Ascendant</th>
                          <th>Sun</th>
                          <th>Moon</th>
                          <th>Mars</th>
                          <th>Mercury</th>
                          <th>Venus</th>
                          <th>Jupiter</th>
                          <th>Saturn</th>
                          <th>Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {formData.bhinnashtakvarga
                          .filter((bav) => bav.bav_planet === selectedBAVPlanet)
                          .map((bav, idx, arr) => (
                            <React.Fragment key={idx}>
                              <tr>
                                <td>{bav.rashi}</td>
                                <td>{bav.ascendant}</td>
                                <td>{bav.sun}</td>
                                <td>{bav.moon}</td>
                                <td>{bav.mars}</td>
                                <td>{bav.mercury}</td>
                                <td>{bav.venus}</td>
                                <td>{bav.jupiter}</td>
                                <td>{bav.saturn}</td>
                                <td>{bav.total}</td>
                              </tr>
                              {idx === arr.length - 1 &&
                                (() => {
                                  const totalRow = arr.reduce(
                                    (acc, b) => {
                                      acc.ascendant += b.ascendant;
                                      acc.sun += b.sun;
                                      acc.moon += b.moon;
                                      acc.mars += b.mars;
                                      acc.mercury += b.mercury;
                                      acc.venus += b.venus;
                                      acc.jupiter += b.jupiter;
                                      acc.saturn += b.saturn;
                                      acc.total += b.total;
                                      return acc;
                                    },
                                    {
                                      ascendant: 0,
                                      sun: 0,
                                      moon: 0,
                                      mars: 0,
                                      mercury: 0,
                                      venus: 0,
                                      jupiter: 0,
                                      saturn: 0,
                                      total: 0,
                                    }
                                  );
                                  return (
                                    <tr className="total-row">
                                      <td>
                                        <strong>Total</strong>
                                      </td>
                                      <td>{totalRow.ascendant}</td>
                                      <td>{totalRow.sun}</td>
                                      <td>{totalRow.moon}</td>
                                      <td>{totalRow.mars}</td>
                                      <td>{totalRow.mercury}</td>
                                      <td>{totalRow.venus}</td>
                                      <td>{totalRow.jupiter}</td>
                                      <td>{totalRow.saturn}</td>
                                      <td>{totalRow.total}</td>
                                    </tr>
                                  );
                                })()}
                            </React.Fragment>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}

            {selectedAVType === "sarvashtakavarga" && (
              <div>
                <p
                  style={{
                    maxWidth: "1300px",
                    wordWrap: "break-word",
                    whiteSpace: "normal",
                    lineHeight: 1.6,
                    fontSize: "16px",
                    color: "#000206",
                    margin: "0 auto 20px auto",
                    textAlign: "justify",
                  }}
                >
                  Ashtakvarga is an important analytical tool in Vedic astrology
                  used to evaluate the relative strength and influence of
                  planets within a birth chart. It works by assigning a
                  numerical score or quantification to each planet, reflecting
                  how favorably or unfavorably it interacts with the other seven
                  planets as well as the Lagna (Ascendant). These scores are
                  derived from intricate calculations that consider the
                  positions and relationships of the planets in various signs
                  and houses. In the Sarva Ashtaka Varga (SAV), the total scores
                  from all the Bhinnashtakavargas (individual planetary
                  Ashtakavargas) are combined and overlaid to create an
                  aggregate picture of planetary strength. This composite chart
                  provides valuable insights into the overall energy, potential,
                  and auspiciousness of the planetary influences for an
                  individual. The SAV highlights patterns of harmony and discord
                  among planetary forces, revealing periods of good fortune,
                  challenges, and opportunities in life. One significant aspect
                  of the Sarvashtakavarga system is that the total sum of all
                  points across the twelve signs should ideally amount to 337.
                  This fixed total allows astrologers to assess whether a
                  particular birth chart leans towards strength or weakness in
                  certain areas of life. By analyzing the distribution of these
                  points, one can gain deeper understanding of health, wealth,
                  career prospects, relationships, and other vital aspects.
                  Ultimately, Ashtakvarga serves as a powerful method to decode
                  the subtle planetary dynamics and provides a quantitative
                  approach that complements traditional interpretative
                  techniques in Jyotish, thereby enhancing the accuracy of
                  predictions and remedial measures.
                </p>
                <div style={{ marginTop: 20, marginBottom: 20 }}>
                  <AshtakavargaChart
                    ascendantSign={akshadva?.ascendant_sign}
                    sarvashtakavarga={sarvashtakavargaMapped}
                    chartTitle="Sarvashtakavarga"
                  />
                </div>

                <div
                  style={{
                    overflowX: "auto",
                    border: "1px solid #ddd",
                    borderRadius: 6,
                    padding: 12,
                    maxWidth: "100%",
                    background:
                      "linear-gradient(to right, rgb(190, 210, 241), #cfb5f6)",
                  }}
                >
                  <h3
                    style={{
                      marginBottom: 12,
                      fontWeight: 600,
                      fontSize: 18,
                      textAlign: "center",
                    }}
                  >
                    🌌 Sarvashtakavarga Table
                  </h3>

                  <table
                    style={{
                      width: "100%",
                      minWidth: 600,
                      borderCollapse: "collapse",
                      whiteSpace: "nowrap",
                    }}
                  >
                    <thead>
                      <tr
                        style={{
                          background:
                            "linear-gradient(to right, rgb(209, 176, 245), #abc4f6)",
                        }}
                      >
                        <th style={tableCellStyle}>Sign</th>
                        {sarvashtakavargaMapped?.map((entry, index) => (
                          <th key={index} style={tableCellStyle}>
                            {entry.rashi}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td style={tableCellStyle}>Total</td>
                        {sarvashtakavargaMapped?.map((entry, index) => (
                          <td key={index} style={tableCellStyle}>
                            {entry.total}
                          </td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
          <h1
            style={{
              color: " rgb(192, 189, 234)",
              textAlign: "center",
              marginTop: "60px",
            }}
          >
            🪙 What is Ashtakavarga Analysis?
          </h1>
          <h6
            style={{
              color: " rgb(192, 189, 234)",
              textAlign: "center",
              fontSize: 18,
              margin: "20px auto",
            }}
          >
            🔱 बिन्दूनां रहस्यं सूचयति –{" "}
            <span>
              Revealing the Secret Significance of Planetary Strength through
              Points
            </span>
          </h6>
          <div
            className="ashtakavarga-content"
            style={{
              color: "white",
              margin: "0 auto",
              padding: "20px",
              textAlign: "justify",
            }}
          >
            <p style={{ fontSize: 16, marginTop: "1rem" }}>
              In Vedic astrology, <strong>Ashtakavarga</strong> is a unique
              mathematical system that assigns points (called <em>Bindus</em>)
              to each sign based on planetary positions and mutual
              relationships. It offers a quantified perspective on planetary
              strength and the support each house receives, helping astrologers
              assess the practical potential of different life areas. Unlike
              traditional planetary interpretations, Ashtakavarga breaks down
              the chart into a score-based map, showing how much "cosmic
              backing" each sign and house has. Each planet contributes points
              to signs depending on its location and aspects, which are then
              visualized in tables like the{" "}
              <strong>Samudaya Ashtakavarga</strong> and{" "}
              <strong>Bhinnashtakavarga</strong>. The key idea is: the higher
              the number of bindus in a house or sign, the more positive results
              it tends to produce during transits and planetary periods. For
              example, a house with 30+ bindus is usually strong and protected,
              while one with less than 20 may indicate vulnerability or
              struggle. Each planet’s individual Ashtakavarga score (from{" "}
              <strong>Bhinnashtakavarga</strong>) helps predict its
              effectiveness during <strong>Dashas</strong> and{" "}
              <strong>transits</strong>. Combined scores (Samudaya) reveal how a
              particular sign or house behaves overall, especially during{" "}
              <strong>Gochar</strong> — helping forecast timing of events like
              marriage, promotions, financial gain, or travel.
              <br />
              Ashtakavarga also aids in remedies and decision-making. If a house
              or sign is weak in points, suitable rituals, gemstones, or
              behavioral alignments can be recommended. It provides a realistic,
              data-backed foundation to balance karma with conscious effort.
              While classical Kundali analysis focuses on qualities and
              symbolism, Ashtakavarga bridges that with numbers — making
              astrology more measurable and accurate. It reveals hidden
              strengths, long-term trends, and critical timings, especially when
              used with divisional charts and Dasha systems. Today, astrologers
              use Ashtakavarga for transit forecasting, lifespan analysis,
              health prediction, financial timing, and even{" "}
              <strong>house activation</strong>. Its blend of logic and
              spirituality makes it a powerful tool for anyone seeking clarity
              and strategic guidance from their birth chart.
            </p>

            <h6
              style={{
                color: " rgb(192, 189, 234)",
                textAlign: "center",
                fontSize: 18,
                margin: "22px auto",
              }}
            >
              🔱 बिन्दूनां विवेकः फलनिर्णायक –{" "}
              <span>Discerning the Points Determines the Fruits</span>
            </h6>
            <p style={{ fontSize: 16, marginTop: "1rem" }}>
              In the vast and ancient system of Vedic astrology, Ashtakavarga
              stands out as a remarkably precise and logical technique that
              translates the divine language of the stars into a structured
              matrix of numbers. Rooted in the Sanskrit words “Ashta” (eight)
              and “Varga” (division), Ashtakavarga is essentially the study of
              how eight vital influences — the seven visible planets (Sun, Moon,
              Mars, Mercury, Jupiter, Venus, Saturn) and the Ascendant (Lagna) —
              distribute their energies across the twelve zodiac signs. The
              uniqueness of this system lies in its objective approach: it
              doesn’t merely speak of a planet’s presence in a sign but
              evaluates how much benefit that planet offers to that sign in a
              measurable form, via what are called “Bindus” (points). These
              points range from 0 to 8 per planet per sign, and when aggregated,
              they form comprehensive charts known as the Bhinnashtakavarga
              (individual contribution of each planet) and Samudaya Ashtakavarga
              (cumulative contribution from all planets to each sign or house).
              The phrase "बिन्दूनां विवेकः फलनिर्णायकः" — meaning “discerning
              the points determines the fruits” — captures the essence of this
              technique perfectly. It reminds us that the real outcome in life,
              whether success, delay, or growth, is not simply based on symbolic
              planetary placements, but on the quantified strength and support
              those planets provide. A Lagna may seem strong on the surface, but
              if the relevant planets assign it fewer bindus, the promise of
              strength may remain unfulfilled. Conversely, a seemingly afflicted
              house may still deliver benefits if it is numerically
              well-supported. This layer of analysis helps bridge intuition and
              calculation, transforming astrology into a predictive science
              grounded in karmic mathematics. The real magic of Ashtakavarga
              reveals itself in transit analysis. For instance, when Saturn
              transits over a sign where it has contributed a high number of
              bindus in the Bhinnashtakavarga chart, the results are generally
              constructive, even if Saturn is traditionally seen as malefic.
              This goes beyond generalized forecasts and allows for highly
              individualized timing predictions. Houses with 30 or more points
              in the Samudaya chart are considered robust and capable of
              handling even challenging transits, while those with fewer than 20
              points may struggle during planetary movements and may require
              remedial measures. It’s a cosmic accounting system — a scorecard
              of planetary goodwill — that allows astrologers to see the
              likelihood of real-world outcomes with remarkable clarity.
              Moreover, Ashtakavarga helps interpret yogas, dashas, and
              divisional charts with more precision. A yoga involving Jupiter
              and Venus may seem auspicious, but its real-world impact is
              filtered through the Ashtakavarga scores of the houses and signs
              involved. If the house receiving the yoga is poorly scored, the
              yoga’s effect could be delayed, limited, or conditional.
              Similarly, a strong Vimshottari Dasha period for Mercury might not
              yield full results if Mercury’s Ashtakavarga distribution is weak
              across critical life houses. This level of analysis is not
              abstract — it allows individuals to plan life events like
              marriage, career shifts, property investments, travel, or even
              surgery based on numerically favorable windows. Ashtakavarga can
              even point out which houses are karmically 'blocked' and where
              spiritual remedies or conscious efforts will be required to shift
              energy. For example, if the 7th house of marriage has consistently
              low bindus from multiple planets, delays or dissatisfaction in
              relationships may be karmically indicated — but once that is
              understood, it can be worked with consciously, rather than
              suffered passively. Thus, Ashtakavarga does not negate free will —
              it enhances it by providing a diagnostic tool to align our
              decisions with our cosmic strengths and weaknesses.
            </p>

            <p style={{ fontSize: 16 }}>
              The deeper philosophical value of Ashtakavarga lies in its blend
              of logic and metaphysics. Unlike other methods which may rely on
              interpretive symbolism alone, Ashtakavarga offers tangible
              validation to abstract ideas. It lets us “see” the unseen
              influences of karma through points, just as a financial chart
              visualizes profit and loss. This makes it an indispensable tool
              for both astrologers and seekers who want to go beyond
              surface-level astrology. In fact, Ashtakavarga is one of the few
              systems that remains useful across all stages of chart analysis —
              from birth chart diagnosis to dashas, transits, yogas, divisional
              charts, and even remedial measures. One can study the
              Bhinnashtakavarga of Saturn, for example, to understand in which
              signs and houses Saturn will provide real support. Similarly, the
              Samudaya chart helps assess the overall condition of each house:
              Is the 4th house (home and mother) karmically blessed with strong
              support, or is it an area of struggle and transformation?
              Ashtakavarga provides this clarity with numerical objectivity.
              Another powerful feature is the ability to compare charts — for
              example, in Kundali Milan (match-making), comparing the bindus of
              key houses (like 7th, 2nd, 11th) in both charts can provide
              insight into marital harmony and shared prosperity. A couple with
              complementary bindu distribution is more likely to navigate life’s
              challenges with mutual strength. The system also has relevance in
              financial forecasting. A person with high bindus in the 2nd, 11th,
              and 5th houses might be more inclined toward wealth accumulation,
              speculative gains, and investment success — particularly when
              those houses are activated by dashas or favorable transits. Even
              spiritual progress can be inferred: high bindus in the 9th and
              12th houses, for example, can indicate a soul supported in its
              quest for dharma, detachment, and liberation. What’s also profound
              is how Ashtakavarga introduces the concept of karma as measurable.
              Bindus are, in essence, a numerical expression of past karmas —
              the merits and debts we've brought into this life. They aren't
              static, either. While the natal chart shows our inherited
              distribution, our free will, choices, spiritual practices, and
              attitude can enhance or harmonize these energies over time.
              Ashtakavarga, then, is not fatalistic. It is diagnostic — offering
              a karmic health report that empowers you to take conscious action.
              In modern usage, astrologers use software to instantly calculate
              these charts, but the foundational wisdom remains timeless: the
              real fruits of life do not depend solely on where planets are
              placed, but on the silent arithmetic of cosmic support they offer.
              And it is the wise interpretation — the विवेक — of these bindus
              that determines how we understand our blessings and burdens, and
              ultimately how we shape our journey on Earth.
            </p>
          </div>
        </div>
      )}

      {activeSection === "dasha" && formData && (
        <div>
          <div className="Dasha-Section">
            {/* LEFT: Mahadasha + Antardasha list */}

            <div className="Dasha-List">
              {formData.dasha && (
                <>
                  <h2>🕉️ Vimshottari Mahadasha Periods</h2>
                  <ul className="mahadasha-list">
                    {groupedDasha.map((dashaGroup, index) => (
                      <li
                        key={index}
                        className={`mahadasha-item ${openedDasha === dashaGroup.maha_dasha ? "open" : ""
                          }`}
                      >
                        <div
                          onClick={() =>
                            setOpenedDasha(
                              openedDasha === dashaGroup.maha_dasha
                                ? null
                                : dashaGroup.maha_dasha
                            )
                          }
                        >
                          <strong>{dashaGroup.maha_dasha}</strong>
                          {new Date(dashaGroup.start_date).toLocaleDateString(
                            "en-US",
                            {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            }
                          )}{" "}
                          ➝{" "}
                          {new Date(dashaGroup.end_date).toLocaleDateString(
                            "en-US",
                            {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            }
                          )}
                        </div>

                        {/* Show Antardasha even if clicked */}
                        <ul className="antar-dasha-list">
                          {dashaGroup.periods.map((antar, antarIndex) => (
                            <li key={antarIndex} className="antar-dasha-item">
                              <strong>{dashaGroup.maha_dasha}-{antar.antar_dasha}</strong>:

                              {new Date(
                                antar.antar_start_date
                              ).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              })}{" "}
                              ➝{" "}
                              {new Date(
                                antar.antar_end_date
                              ).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              })}
                            </li>
                          ))}
                        </ul>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
            <div className="Dasha-Detail">
              {openedDasha ? (
                <>
                  <p>{mahadashaContent[openedDasha]?.text}</p>
                </>
              ) : (
                <p
                  style={{
                    fontStyle: "italic",
                    maxWidth: "1300px",

                    whiteSpace: "normal",

                    fontSize: "16px",

                    textAlign: "justify",
                  }}
                >
                  Mahadasha is a major planetary period in our Vedic astrology
                  that plays a crucial role in shaping an individual’s life
                  journey. This system divides a person's lifespan into distinct
                  segments ruled by one of the nine celestial bodies — ☉ Sun, ☽
                  Moon, ♂ Mars, ☿ Mercury, ♃ Jupiter, ♀ Venus, ♄ Saturn, ☊ Rahu,
                  and ☋ Ketu. Each Mahadasha corresponds to the influence of a
                  particular planet and lasts for a specific number of years,
                  typically ranging from 6 to 20 years. The exact sequence and
                  duration of these planetary periods are meticulously
                  calculated based on the position of the Moon’s Nakshatra at
                  the time of birth, following the ancient Vimshottari Dasha
                  system. This system is considered one of the most accurate and
                  widely used timing tools in Jyotish. During a Mahadasha, the
                  ruling planet’s energies and attributes become highly
                  influential, often bringing about significant changes in
                  various aspects of an individual's life. These may include
                  health, career, wealth, relationships, mental state, and
                  spiritual growth. For example, a Mahadasha ruled by ♃ Jupiter
                  could enhance wisdom, expansion, and prosperity, while a ♄
                  Saturn Mahadasha might test endurance, discipline, and
                  responsibility. Understanding the Mahadasha periods enables
                  astrologers to forecast key life events with greater
                  precision. By analyzing the nature of the ruling planet and
                  its placement in the birth chart, astrologers can offer
                  insights into upcoming challenges or opportunities. Mahadasha
                  analysis is an indispensable part of life prediction and
                  spiritual guidance in Vedic astrology. In essence, Mahadasha
                  serves as a cosmic clock that maps out the ebb and flow of
                  planetary energies throughout a person’s life, making it a
                  vital tool for timing events, understanding destiny, and
                  navigating the complexities of human experience.
                </p>
              )}
            </div>
            {/* RIGHT: Mahadasha Description */}
          </div>
          <h1
            style={{
              color: " rgb(192, 189, 234)",
              textAlign: "center",
              marginTop: "60px",
            }}
          >
            🕉️ What is Vimshottari Dasha Analysis?
          </h1>
          <h6
            style={{
              color: " rgb(192, 189, 234)",
              textAlign: "center",
              fontSize: 18,
              margin: "20px auto",
            }}
          >
            🔱 कालस्य विज्ञानं फलस्य संकेतः–{" "}
            <span>
              Timing is Wisdom, and Wisdom Reveals the Fruits of Karma
            </span>
          </h6>
          <div
            className="dasha-content"
            style={{
              color: "white",
              margin: "0 auto",
              padding: "20px",
              textAlign: "justify",
            }}
          >
            <p style={{ fontSize: 16, marginTop: "1rem" }}>
              <strong>Vimshottari Dasha</strong> is the heart of predictive
              astrology in the Vedic system. It is a planetary period system
              that divides the human lifespan — ideally set at 120 years — among
              the nine planets (including Rahu and Ketu). Each planet governs a
              fixed number of years: for example, the Moon rules for 10 years,
              Venus for 20, Saturn for 19, and so on. This powerful technique
              doesn't just show what is present in the birth chart — it tells us{" "}
              <em>when</em> those planetary promises will unfold. It reveals the
              timing of major life events like marriage, career rise, illness,
              foreign travel, spiritual awakening, or financial breakthroughs.
              Just as a seed must sprout in its season, the fruits of one's
              karmic potential blossom during the right Dasha period. The
              Sanskrit shloka above —{" "}
              <strong>कालस्य विज्ञानं फलस्य संकेतः</strong> — expresses this
              truth beautifully: “To know the timing is to know the fruit.”
            </p>

            <p style={{ fontSize: 16 }}>
              At the time of birth, based on the exact degree of the Moon, a
              person enters the Dasha of a specific planet. This planet becomes
              the <strong>Mahadasha lord</strong> and rules for its full
              duration (e.g., if it’s Mars — 7 years). Within each Mahadasha
              lies a nested series of smaller cycles known as{" "}
              <strong>Antardashas</strong> (sub-periods), which are further
              divided into <strong>Pratyantar Dashas</strong> and even smaller
              units. This fractal structure is what allows astrologers to
              pinpoint events with remarkable accuracy. The experience during a
              Dasha depends on many factors: the nature of the planet, its
              dignity in the chart (own sign, exaltation, debilitation), house
              ownership and placement, conjunctions, aspects, and the houses it
              activates. A strong Mahadasha lord can uplift a person
              dramatically, while a weak or afflicted lord might bring hardship,
              delays, or transformation. Vimshottari Dasha not only times
              external events but reveals our internal evolution — as each
              planetary period unfolds a different karmic theme, challenges
              different aspects of our ego, and invites us into deeper layers of
              our life’s journey.
            </p>

            <p style={{ fontSize: 16 }}>
              The genius of the Vimshottari Dasha system lies in its ability to
              connect planetary symbolism with time. Each Mahadasha brings a
              distinct flavor of experience. For instance, the{" "}
              <strong>Sun</strong> Dasha may highlight issues of authority,
              confidence, ego, or government affairs. The <strong>Moon</strong>{" "}
              Dasha stirs emotions, family, nourishment, and mental health.{" "}
              <strong>Mars</strong> triggers action, ambition, conflict, or
              physical energy. <strong>Mercury</strong> refines intellect,
              communication, learning, and trade. <strong>Jupiter</strong>{" "}
              expands growth, knowledge, wealth, and dharma.{" "}
              <strong>Venus</strong> governs relationships, luxury, love, and
              creative talents. <strong>Saturn</strong> teaches discipline,
              endurance, hardship, and karmic accountability.{" "}
              <strong>Rahu</strong> brings sudden shifts, obsession, foreign
              connections, and unconventional paths, while <strong>Ketu</strong>{" "}
              prompts detachment, spirituality, isolation, and past-life themes.
              Yet no Mahadasha acts alone — its effects are shaped by the
              sub-periods (Antardashas), the houses it activates, its strength
              in the birth chart, and its interaction with ongoing transits.
            </p>

            <p style={{ fontSize: 16 }}>
              Let’s say a person is in the Mahadasha of Jupiter. If Jupiter is
              placed in a friendly sign, well-aspected, and rules auspicious
              houses, that period might bring blessings like education,
              marriage, childbirth, or spiritual growth. But if Jupiter is
              debilitated, combust, or afflicted by malefics, the same Dasha may
              bring confusion in belief systems, financial instability, or
              excessive idealism. Similarly, Antardashas add complexity. A Venus
              Antardasha within a Saturn Mahadasha, for instance, might bring
              emotional or relationship stress due to Saturn's restrictive
              nature combined with Venus’s longing for harmony. This subtle
              layering means every Dasha period is unique — shaped not only by
              planetary qualities but by the individual’s karmic imprint and
              mental maturity. Two people may run the same Dasha, but their
              experience will differ vastly depending on their charts, choices,
              and consciousness.
            </p>

            <p style={{ fontSize: 16 }}>
              Another powerful feature of Vimshottari Dasha is its use in
              **life-event timing**. Astrologers can map significant events from
              the past and predict upcoming phases with precision. Want to know
              when marriage is likely? Look for Dasha periods involving the 7th
              house, its lord, or Venus (for males) and Jupiter (for females).
              Want to see when a career peak might happen? Analyze Dashas
              activating the 10th house, its lord, or planets placed therein.
              The Dasha system also helps explain why some people rise late in
              life — their key planets mature or get activated only in later
              Mahadashas. In this way, Vimshottari Dasha corrects our perception
              of “delay” — reminding us that life unfolds not when we want, but
              when the karma ripens.
            </p>

            <p style={{ fontSize: 16 }}>
              The Dasha system is also deeply intertwined with the Moon, which
              represents the mind. That’s why the Dasha sequence begins based on
              the Moon’s exact longitude at the time of birth (called the{" "}
              <strong>Janma Nakshatra</strong>). This makes the system highly
              personalized — unlike solar Western astrology, this is lunar-based
              and mind-centric. The emotional texture, inner growth, and
              psychological shifts of a person are all embedded in their Dasha
              timeline. For spiritual seekers, this becomes a roadmap of inner
              evolution. A Rahu Mahadasha may bring disillusionment with
              material success, while a Ketu Mahadasha could trigger inward
              withdrawal or mystic experiences. Jupiter's Dasha can enhance
              sattva (purity and wisdom), and Saturn's may force surrender
              through trials. Every planet becomes a karmic teacher, preparing
              the soul for the next stage of evolution.
            </p>

            <p style={{ fontSize: 16 }}>
              Vimshottari Dasha also brings a unique dimension to **remedial
              astrology**. If a person is undergoing a tough Mahadasha,
              especially of a malefic or afflicted planet, astrologers recommend
              strengthening the relevant planet through mantras, donations,
              fasting, or wearing gemstones (if eligible). For example, during a
              tough Mercury Dasha, chanting the Budh Beej Mantra, donating green
              moong, or enhancing communication skills might mitigate the
              stress. These remedies are most effective when aligned with Dasha
              timing, acting like conscious interventions that align one’s
              karmic clock with spiritual effort. Thus, the Dasha is not a fixed
              sentence but a dynamic opportunity — to learn, to evolve, and to
              act with awareness.
            </p>

            <p style={{ fontSize: 16 }}>
              Ultimately, the Vimshottari Dasha system reminds us of a deep
              truth: that time is not linear, but karmic. Each moment in life is
              colored by subtle planetary energies, unfolding not randomly, but
              according to the soul’s encoded rhythm. The Mahadashas guide us
              through chapters of our life’s book — some joyous, others
              difficult, but each essential. By understanding our Dasha
              patterns, we stop resisting life and start collaborating with it.
              We learn to flow with favorable periods and practice patience and
              humility during tougher ones. It is a system that replaces fear
              with foresight and confusion with cosmic clarity.
            </p>
            <div className="dasha-table-wrapper">
              <table className="dasha-meaning-table">
                <thead>
                  <tr>
                    <th>Planet</th>
                    <th>Duration</th>
                    <th>Dasha Theme</th>
                    <th>Likely Results</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>☉ Sun</td>
                    <td>6 Years</td>
                    <td>Period of identity assertion, visibility, and self-leadership</td>
                    <td>Rise in career, recognition from authority, new leadership roles, or father-related changes. Conflicts may arise due to ego or rigid decisions.</td>
                  </tr>
                  <tr>
                    <td>☽ Moon</td>
                    <td>10 Years</td>
                    <td>Emotional maturation, nurturing needs, inner reflection</td>
                    <td>Domestic shifts, deeper family bonds, increased emotional awareness. Careers in caregiving, food, or arts may thrive. Emotional instability possible.</td>
                  </tr>
                  <tr>
                    <td>♂ Mars</td>
                    <td>7 Years</td>
                    <td>Period of competition, survival instincts, physical action</td>
                    <td>Increased courage, new ventures, property dealings, or military/police work. Can bring legal conflicts or accidents if Mars is weak or afflicted.</td>
                  </tr>
                  <tr>
                    <td>☿ Mercury</td>
                    <td>17 Years</td>
                    <td>Intellect-driven period of skill refinement and commerce</td>
                    <td>Boost in communication, marketing, learning, technology, or youth-related fields. Unstable decisions or overthinking may surface.</td>
                  </tr>
                  <tr>
                    <td>♃ Jupiter</td>
                    <td>16 Years</td>
                    <td>Expansion, ethical realignment, growth in values and fortune</td>
                    <td>Marriage, childbirth, teaching roles, or spiritual studies flourish. Can become passive, over-trusting, or delay action if Jupiter is weak.</td>
                  </tr>
                  <tr>
                    <td>♀ Venus</td>
                    <td>20 Years</td>
                    <td>Desire-driven phase emphasizing relationships and comfort</td>
                    <td>Romance, marriage, luxury, artistic or beauty professions thrive. Can lead to indulgence, relationship dilemmas, or material obsession.</td>
                  </tr>
                  <tr>
                    <td>♄ Saturn</td>
                    <td>19 Years</td>
                    <td>Karmic cleansing, responsibility, delayed gratification</td>
                    <td>Career foundation, maturity, endurance. Delays, loss, or depression if Saturn is harsh. Life tests bring inner transformation and wisdom.</td>
                  </tr>
                  <tr>
                    <td>☊ Rahu</td>
                    <td>18 Years</td>
                    <td>Karmic acceleration, illusion, foreign exposure, desire surge</td>
                    <td>Sudden career rise, travel, fame, or tech success. Risk of addiction, burnout, or disillusionment. Unconventional paths dominate.</td>
                  </tr>
                  <tr>
                    <td>☋ Ketu</td>
                    <td>7 Years</td>
                    <td>Disconnection, past-life activation, mystic detachment</td>
                    <td>Sudden endings, spiritual awakening, isolation, or foreign relocation. If mishandled, may bring confusion, loss of direction, or apathy.</td>
                  </tr>
                </tbody>
              </table>

            </div>

          </div>
        </div>
      )}

      {activeSection === "sade-sati-panoti" && formData && (
        <div>
          <div className="sade-sati-panoti-list">
            {formData.sadesatipanoti.map((period, index) => (
              <div className="sade-sati-panoti-card" key={period.id || index}>
                <h4 className="sade-phase">{period.phase}</h4>

                <div className="chakra-divider">
                  <span>✦</span>
                </div>
                <p className="sade-sign">Sign → {period.sign}</p>
                <div className="shani-dates">
                  <p>
                    <strong>From:</strong>{" "}
                    {new Date(period.start_date).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                  <p>
                    <strong>To:</strong>{" "}
                    {new Date(period.end_date).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <div
            className="sade-sati-phase-explanation"
            style={{ marginTop: "2rem" }}
          >
            <h3
              style={{
                color: "#a6742f",
                marginBottom: "2rem",
                fontSize: "1.5rem",
              }}
            >
              Understanding the Sade Sati Phases
            </h3>

            <div style={{ marginBottom: "1rem" }}>
              <h4>1. Rising Phase 🌒 (Beginning of Sade Sati)</h4>
              <p>
                The rising phase of Sade Sati begins when Saturn enters the
                natal Moon sign, marking the second and often the most intense
                stage of this 7.5-year karmic period. During this phase, Saturn
                directly influences the Moon, which governs emotions, thoughts,
                and mental stability. As a result, individuals may experience
                heightened emotional sensitivity, feelings of isolation, or
                overwhelming mental pressure. It is not uncommon for people to
                go through personal or professional setbacks, health concerns,
                or strained relationships. This phase acts as a mirror,
                reflecting unresolved fears, past mistakes, and inner
                vulnerabilities that must be acknowledged and transformed.
                However, the rising phase is not merely a time of suffering; it
                is a deeply transformative period that offers the greatest
                potential for spiritual and emotional growth. Saturn’s role as
                the taskmaster of the zodiac pushes individuals to confront
                reality, accept responsibilities, and develop inner strength. It
                encourages introspection and a reevaluation of life priorities.
                While the external world may seem uncertain or burdensome, the
                inner world begins to evolve with increased awareness,
                discipline, and resilience. Those who face this phase with
                patience, humility, and self-discipline often emerge with
                profound wisdom and a renewed sense of direction. The rising
                phase tests one's endurance but also builds character. By the
                end of it, many individuals feel emotionally cleansed, mentally
                stronger, and more spiritually grounded. This phase serves as a
                powerful catalyst for long-term transformation, making it one of
                the most crucial and life-defining stages of the Sade Sati
                journey.
              </p>
            </div>

            <div className="" style={{ marginBottom: "1rem" }}>
              <h4> 2. Peak Phase 🌕 (Middle of Sade Sati)</h4>
              <p>
                The peak phase of Sade Sati occurs when Saturn is exactly
                transiting over the natal Moon sign. This is the central and
                most intense part of the 7.5-year cycle and is often considered
                the most challenging. During this phase, the emotional and
                psychological pressure tends to reach its highest point. Since
                the Moon represents the mind, emotions, and inner comfort,
                Saturn’s heavy influence can lead to feelings of loneliness,
                depression, confusion, or fear. Individuals may face significant
                life disruptions such as job loss, financial instability, health
                issues, or separation from loved ones. Saturn forces a deep
                confrontation with reality, often stripping away illusions and
                compelling the person to face life’s truths without the crutches
                of denial or avoidance. Despite its intensity, the peak phase
                offers unparalleled opportunities for inner growth and spiritual
                evolution. Saturn is not just a planet of hardship—it is a
                teacher that rewards honesty, effort, and responsibility. Those
                who remain patient and resilient during this phase can
                experience a profound shift in consciousness. It encourages
                individuals to let go of ego, attachments, and unhealthy
                emotional patterns. Meditation, solitude, and reflection can be
                especially beneficial during this time, helping to restore inner
                peace and clarity. In essence, the peak phase of Sade Sati is a
                spiritual crucible—painful yet purifying. Though it may feel
                like a period of darkness, it ultimately leads to enlightenment
                and maturity. The wisdom gained through these trials lays the
                foundation for a more stable, authentic, and purposeful life
                ahead.
              </p>
            </div>

            <div style={{ marginBottom: "1rem" }}>
              <h4> 3. Setting Phase 🌘 (End of Sade Sati)</h4>
              <p>
                The setting phase of Sade Sati begins when Saturn moves into the
                zodiac sign immediately following the natal Moon sign. This
                final stage of the 7.5-year cycle signals a gradual easing of
                the intense pressures experienced during the previous phases.
                While some challenges may still linger, the energy shifts toward
                resolution, healing, and rebuilding. Individuals often start to
                feel a sense of relief as Saturn’s harsh lessons begin to
                settle, allowing the fruits of their perseverance and hard work
                to manifest. This phase encourages a renewed focus on stability,
                discipline, and long-term planning. Emotionally, the setting
                phase brings a clearer perspective, enabling one to integrate
                the wisdom gained during the earlier stages. There is a growing
                sense of emotional maturity, inner calm, and a deeper
                understanding of life’s rhythms. Relationships may improve, and
                opportunities that were previously blocked may now open up.
                Financial and health matters often stabilize, reflecting the
                more balanced approach cultivated throughout the Sade Sati
                journey. Spiritually, this phase offers a chance for reflection
                and gratitude. It is a time to honor the growth achieved and to
                set new intentions based on the lessons learned. Saturn’s
                influence, once perceived as restrictive or burdensome, is now
                recognized as a guiding force that helped shape a stronger,
                wiser self. The setting phase ultimately prepares the individual
                to move forward with confidence and clarity, stepping into a new
                chapter of life enriched by resilience, discipline, and
                spiritual insight.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KundaliPage;

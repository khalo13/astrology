import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import healthImage from "../assets/health.png";
import emotionsImage from "../assets/emotions.png";
import luckImage from "../assets/luck.png";
import professionImage from "../assets/profession.png";
import personal_lifeImage from "../assets/personal_life.png";
import travelImage from "../assets/travel.png";
import ariescard from "../assets/ariescard.png";
import tauruscard from "../assets/tauruscard.png";
import geminicard from "../assets/geminicard.png";
import cancercard from "../assets/cancercard.png";
import leoCard from "../assets/leocard.png";
import virgocard from "../assets/virgocard.png";
import libracard from "../assets/libracard.png";
import scorpiocard from "../assets/scorpiocard.png";
import sagittariuscard from "../assets/sagittariuscard.png";
import capricorncard from "../assets/capricorncard.png";
import aquariuscard from "../assets/aquariuscard.png";
import piscescard from "../assets/piscescard.png";
import "./ZodiacDetails.css";
import axios from "axios";
const ZodiacDetails = () => {
  const { rashiName } = useParams();
  const navigate = useNavigate();
  
  const rashiList = [
    {
      name: "Aries",
      image: ariescard,
      description:
        "Aries is the first sign of the zodiac, symbolizing leadership and courage.",
      intro:
        "I am incredibly strong! Call me the bravest of all. Bold and fearless, that’s who I am. Always ready to lead towards the success, the only initiator. Me Aries, I’m a powerful force, always curious to find undiscovered treasures. Here I am, living like a warrior, pursuing things with full of passion.",
      characteristic:
        "Ariens are famed for their fiery, positive, outgoing natures. Considered among the most enthusiastic of the zocliac children, they have high energy levels and often fast-paced lifestyles. Their fiery determination to accomplish things sometimes encourages hot-headedness and rudeness. Ariens do all things in their own way, with energetic determination and regardless of obstacles.",
      compatibleZodiacs: ["Leo", "Libra"],
      strengths: ["Courageous", "Determined", "Confident", "Enthusiastic"],
      weaknesses: ["Impulsive", "Impatient", "Short-tempered"],
      favorableColors: ["Red", "White", "Black"],
      favorableNumbers: [1, 8, 17, 26],
    },
    {
      name: "Taurus",
      image: tauruscard,
      description:
        "Taurus represents stability, patience, and a strong connection to nature.",
      intro: `I’m a fighter of love, a believer of happily ever after! They call me a great lover, romantic is how they describe me. I am Taurus, incredibly loyal and passionate. Here I am, with the ability to make a relationship work, expressing love is my joy. Deep, insightful, smart and intellectual, that’s who I am.`,
      characteristic: `Taureans are famed for their romanticism, reliability, and charm, and they are often reputed to be the most beautiful people among all the zodiac children. Warm, affectionate, and sincere, they inspire confidence and loyalty in those around them. Taureans have a great need for financial and personal security. They love luxury, comfort, and beautiful things — tendencies that can encourage an obsessive possessiveness on their part. Like the Bull who symbolizes their sign, Taureans are slow to anger, but when aroused, they can be fearsome.`,
      compatibleZodiacs: ["Scorpio", "Cancer"],
      strengths: ["Reliable", "Patient", "Devoted", "Responsible"],
      weaknesses: ["Stubborn", "Possessive", "Uncompromising"],
      favorableColors: ["Green", "Pink"],
      favorableNumbers: [2, 6, 9, 12, 24],
    },
    {
      name: "Gemini",
      image: geminicard,
      description:
        "Gemini is known for adaptability, communication skills, and curiosity.",
      intro: `My energy circulates in so many ways. As a Gemini, I am highly communicative and the thirst to explore is my inner trait. You can call me restless! I have an impressive way with words, love to be social and be around fun. Fascinated by the world, I am here to experience things.`,
      characteristic: `Geminians are lively, restless, quick-witted, fast-thinking, mercurial creatures who rarely stay in one place — physically or philosophically — for long. They are marvellous communicators and easily sway people to their own ideas and opinions. Geminians detest boredom — indeed, they run from it — and often prefer spreading their considerable emotional and intellectual energies among a variety of tasks (and people). This ability to do several things at once is typical of the Geminians' dual nature, aptly represented by the Twins. Poorly channelled, however, the Geminians' inability to settle down with one thing or one person can lead to the appearance of shallowness and a tendency to gloss over the important details of life.`,
      compatibleZodiacs: ["Sagittarius", "Aquarius"],
      strengths: ["Gentle", "Affectionate", "Curious", "Adaptable"],
      weaknesses: ["Nervous", "Inconsistent", "Indecisive"],
      favorableColors: ["Light Green", "Yellow"],
      favorableNumbers: [5, 7, 14, 23],
    },
    {
      name: "Cancer",
      image: cancercard,
      description:
        "Cancer is known for emotional depth, intuition, and strong family values.",
      intro: `They call me emotional and sensitive. Being intuitive and sentimental are my traits. As a Cancer, I’m a real caretaker. Friends and family are life to me! I am sympathetic, I will keep you close to me. Here I am, extremely loyal, highly imaginative and persuasive.`,
      characteristic: `Sensitive (but often “crabby”), imaginatively creative and artistically gifted (but often obsessed with the minutiae of home and the past), Cancerians are among the most challenging of the zodiac children to get to know. Like the crab that symbolizes their sign, they often present a hard, crusty, even impenetrable exterior to the world, and can appear withdrawn, cool, and reserved. Beneath the shell, however, lies an emotional and sensitive soul with great reserves of compassion and intuition. Like the crab, Cancerians are also tenacious and protective of their home turf and make for fiercely protective and loyal parents and friends.`,
      compatibleZodiacs: ["Capricorn", "Taurus"],
      strengths: ["Tenacious", "Loyal", "Emotional", "Sympathetic"],
      weaknesses: ["Pessimistic", "Suspicious", "Manipulative"],
      favorableColors: ["White"],
      favorableNumbers: [2, 3, 15],
    },
    {
      name: "Leo",
      image: leoCard,
      description:
        "Leo is known for leadership, charisma, and a radiant personality.",
      intro: `Just like the Lion, I am regal in the true sense. Call me Leo, the kindest of all. I am energetic, enthusiastic and outgoing. Ruled by the Sun, I hold the trait of a leader. Here I am, ambitious by nature, straightforward and charismatic, I am everything that a lion is known for.`,
      characteristic: `As majestic and impressive as the Lion that represents their sign, Leos are the natural leaders of the zodiac. Radiantly enthusiastic, magnanimous with their charm and gifts, and fiercely proud and confident, Leos love and live life to the fullest and expect — indeed need — to be at the helm at home, work, and play. Wonderfully affectionate, dramatic, and creative — there are many Leos among the actors of the world — Leos hate small-mindedness and nit-picking. But they themselves are occasionally stubborn, autocratic, and dogmatic.`,
      compatibleZodiacs: ["Aquarius", "Gemini"],
      strengths: ["Creative", "Passionate", "Generous", "Humorous"],
      weaknesses: ["Arrogant", "Stubborn", "Lazy", "Inflexible"],
      favorableColors: ["Gold", "Yellow", "Orange"],
      favorableNumbers: [1, 3, 10],
    },
    {
      name: "Virgo",
      image: virgocard,
      description:
        "Virgo is analytical, detail-oriented, and deeply practical.",
      intro:
        "I am the most independent of all. Call me analytical, observant and reliable. I can be your good friend, a great business partner. My Straight thinking and logical problem solving will make you wish to be around me. Be with me, I’m calm and helpful.",
      characteristic:
        "Virgoans are modest, self-effacing, hardworking, and practical on the surface, but are often earthy, warm, and loving beneath that surface, as befits their zodiac symbol, the Virgin, a composite figure of ancient goddesses of the earth and the harvest. Quick thinking and analytical, Virgoans have so much excess mental energy that they often are subject to stress and tension. Their pertchants for perfection and hard work also incline them towards being over-critical at times. The planet Mercury (the planet of communication) rules Gemini and Virgo. Virgoans are excellent and persuasive communicators who use their keen intellects to win arguments and win over people.",
      compatibleZodiacs: ["Pisces", "Cancer"],
      strengths: ["Loyal", "Analytical", "Kind", "Hardworking"],
      weaknesses: ["Shyness", "Worry", "All work and no play"],
      favorableColors: ["Grey", "Pale-Yellow", "Beige"],
      favorableNumbers: [5, 14, 15, 23, 32],
    },
    {
      name: "Libra",
      image: libracard,
      description:
        "Libra is known for harmony, diplomacy, and a strong sense of justice.",
      intro: `I Libra, specialize in balancing of relationship. Charming, harmonious and polished are my traits. The only peacemaker you’ll know. Here I am, socially inclined and hold a strong sense of justice. I govern partnerships, relations and close associations.`,
      characteristic: `Outgoing, warm-hearted, and very sociable, Librans — like the Scales that represent the sign — are frequently concerned with achieving balance, harmony, peace, and justice in the people and in the world around them. And they are well-equipped to do that with their enormous reserves of charm, cleverness, frankness, persuasion, and easy communication. They tend at times to be too facile and laid-back and have earned an undeserved reputation for laziness. In fact, they can be hard workers and are often leaders in their fields. They are especially good at any “peace-keeping” types of jobs, because they have the remarkable gift of easily seeing (and reconciling) both sides of an issue.`,
      compatibleZodiacs: ["Aries", "Sagittarius"],
      strengths: ["Cooperative", "Diplomatic", "Gracious", "Fair-Minded"],
      weaknesses: ["Indecisive", "Avoids Confrontations", "Self-pity"],
      favorableColors: ["Green", "Pink"],
      favorableNumbers: [4, 6, 13],
    },
    {
      name: "Scorpio",
      image: scorpiocard,
      description:
        "Scorpio is known for intensity, mystery, and emotional depth.",
      intro: `I am mysterious and secretive in my ways. Cleverness and perceptiveness are my nature. Me Scorpio, I am highly suspicious, ambitious, focused and competitive. I may experience extreme highs and lows but you feel deeply connected and protected around me.`,
      characteristic: `Mysterious Scorpios are deep-thinking, private, intense, very sexual, and always a step removed from the world. Because of their intensity and an obsessive need for privacy, there is often an aura of “danger” around Scorpios — a trait they share, of course, with the deadly Scorpion that symbolizes their sign. But this is only one facet of the rather complex Scorpio personality. They can be driven workers and achievers with the ability to overcome enormously challenging obstacles. They also value their intimate relationships and their friendships quite highly and work hard to encourage the best in those they love.`,
      compatibleZodiacs: ["Taurus", "Cancer"],
      strengths: ["Resourceful", "Brave", "A true Friend"],
      weaknesses: ["Distrusting", "Jealous", "Violent"],
      favorableColors: ["Red", "Rust"],
      favorableNumbers: [8, 11, 18],
    },
    {
      name: "Sagittarius",
      image: sagittariuscard,
      description:
        "Sagittarius is known for optimism, adventure, and a love for freedom.",
      intro: `Ruled by Jupiter, I live by the notion of endless possibilities. Optimistic is what they call me! I’ve got an independent spirit to inspire others. Here I am, full of adventure and passion that control my desires. I Sagittarius, hold a belief of being honest and keeping things real.`,
      characteristic: `Sagittarians love challenges of all kinds — physical or mental — and throw themselves into intellectual or physical pursuits with boundless and infectious reserves of energy. Sagittarians’ interests in both purely intellectual pursuits and highly physical adventure underscore their versatile natures and are clearly related to the dual nature of the Archer who symbolizes the sign and who represents the centaur Chiron — a half-man, half-horse god who was famed for wisdom and bravery. Sagittarians are often unabashedly optimistic extroverts who draw the admiration and affection of all those they encounter.`,
      compatibleZodiacs: ["Gemini", "Aries"],
      strengths: ["Generous", "Idealistic", "Great sense of humor"],
      weaknesses: ["Very impatient"],
      favorableColors: ["Purple"],
      favorableNumbers: [3, 7, 9],
    },
    {
      name: "Capricorn",
      image: capricorncard,
      description:
        "Capricorn is known for ambition, discipline, and an unwavering drive for success.",
      intro: `I am all about ambitious power, position and money! I Capricorn, have a competitive nature. I possess the tendency to climb mountains to achieve what I want. Here I stand, independent, determined and patient. Loyal, humble and hard working, that’s who I am.`,
      characteristic: `The Goat that symbolizes Capricorn was traditionally depicted as half-goat, half-fish. This complex dual nature is echoed in the Capricornian personality, one of the most complex characters in all the zodiac. They have two distinct natures. One side of the sign is ambitious, hard-working, and enterprising. This Capricornian is highly motivated, loves life, and is able to set high but achievable goals. The other side of the Capricornian, however, is lost in a world of real or imagined obstacles to success; further, this Capricornian often cannot find the motivation to take action and challenge those obstacles. Even successful Capricornians have a tendency to whine and complain about imagined burdens. These darker tendencies are not eased by Capricornians’ introverted natures and love of solitude.`,
      compatibleZodiacs: ["Taurus", "Cancer"],
      strengths: ["Responsible", "Disciplined", "Self-control"],
      weaknesses: ["Know-it-all", "Unforgiving", "Condescending"],
      favorableColors: ["Brown", "Black"],
      favorableNumbers: [4, 8, 13],
    },
    {
      name: "Aquarius",
      image: aquariuscard,
      description:
        "Aquarius is known for innovation, independence, and a deep sense of humanity.",
      intro: `Being Aquarius is creative! Besides my acute sense of art, I believe in giving the best kick-starts. Call me an absolute dreamer while I’m popular for my eccentric approach. Here I am, tend to hold the future of an artist, painter or philosopher.`,
      characteristic: `Often considered the most enigmatic of the zodiac children, Aquarians are fiercely individualistic and independent intellectuals who rarely form permanent relationships with anyone. Nevertheless, they are also noted for being friendly, kind, helpful, and caring; and they are possessed of deep humanitarian instincts. Still, they always remain quintessentially private people. Aquarians are gifted with inventiveness, originality, and creativity, and they are equally comfortable working in such disparate worlds as social work and science.`,
      compatibleZodiacs: ["Leo", "Sagittarius"],
      strengths: ["Progressive", "Independent", "Humanitarian"],
      weaknesses: ["Temperamental", "Uncompromising", "Aloof"],
      favorableColors: ["Light Purple", "Silver"],
      favorableNumbers: [4, 7, 11],
    },
    {
      name: "Pisces",
      image: piscescard,
      description:
        "Pisces is known for compassion, sensitivity, and deep emotional insight.",
      intro: `I absorb the sadness all around. I am all about empathy! I hold the power to feel the pain of others. My sensitivity enables me to pursue emotions and needs of people. Here I am, using my energy to be productive and helpful.`,
      characteristic: `Sensitive, sensual, emotional, and richly imaginative and creative, Pisceans are the other-worldly dreamers and poets of the zodiac. Deeply affected by the dual nature of their sign — symbolized by the two fishes swimming in opposite directions — Pisceans are often torn between wanting to do something real and valuable in the world (they are often drawn to humanitarian causes and artistic careers) and retreating from the world altogether to the safer harbours of their private worlds of imagination and dreams. This is an enormous pull for Pisceans, and because of its power, they are often prone to extreme nervous tension and even escapism (sometimes into alcohol and drugs). A lack of self-confidence is almost always at the root of a Piscean’s inability to get on with the real world, but when this weakness can be overcome, they are found among the finest humanitarians and artists in the world.`,
      compatibleZodiacs: ["Virgo", "Taurus"],
      strengths: ["Compassionate", "Artistic", "Intuitive", "Gentle", "Wise"],
      weaknesses: ["Fearful", "Overly trusting", "Sad"],
      favorableColors: ["Purple", "Violet", "Seagreen"],
      favorableNumbers: [3, 9, 12],
    },
  ];
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [categoryHoroscopes, setCategoryHoroscopes] = useState({
    Health: "",
    Emotions: "",
    Love: "",
    Career: "",
    Travel: "",
    Luck: "",
  });
  const [selectedRashi, setSelectedRashi] = useState(
    rashiName ? decodeURIComponent(rashiName) : ""
  );
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, []); // <-- scrolls to top on route change

  useEffect(() => {
    if (!selectedRashi) return;
    setLoadingCategories(true);
    setCategoryHoroscopes({
      Health: "",
      Emotions: "",
      Love: "",
      Career: "",
      Travel: "",
      Luck: "",
    });

    const categories = [
      "Health",
      "Emotions",
      "Love",
      "Career",
      "Travel",
      "Luck",
    ];
    Promise.all(
      categories.map((cat) =>
        axios
          .post("http://localhost:4000/api/horoscope", {
            rashi: selectedRashi,
            category: cat,
          })
          .then((res) => res.data.horoscope)
          .catch(() => "Could not fetch.")
      )
    ).then((results) => {
      setCategoryHoroscopes({
        Health: results[0],
        Emotions: results[1],
        Love: results[2],
        Career: results[3],
        Travel: results[4],
        Luck: results[5],
      });
      setLoadingCategories(false);
    });
  }, [selectedRashi]);

  const handleSelectChange = (e) => {
    const newRashi = e.target.value;
    setSelectedRashi(newRashi);
    navigate(`/zodiac/${encodeURIComponent(newRashi)}`);
  };

  const rashi = rashiList.find(
    (r) => r.name.toLowerCase() === decodeURIComponent(rashiName).toLowerCase()
  );

  if (!rashi) {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        <h2>Rashi Not Found</h2>
        <button onClick={() => navigate(-1)}>Go Back</button>
      </div>
    );
  }
  return (
    <div className="rashi-layout">
      <div className="rashi-container">
        <button className="back-button" onClick={() => navigate("/")}>
          ← Back
        </button>
        <select
          className="rashi-select"
          value={selectedRashi}
          onChange={handleSelectChange}
        >
          {rashiList.map((r) => (
            <option key={r.name} value={r.name}>
              {r.name}
            </option>
          ))}
        </select>
        <h1 className="rashi-title">{rashi.name}</h1>
        <img className="rashi-image" src={rashi.image} alt={rashi.name} />
        <p className="rashi-description">{rashi.description}</p>
        <p className="rashi-intro">{rashi.intro}</p>

        <h2 className="section-title">Characteristics</h2>
        <div className="zodiac-chakra-divider">
          <span>✦</span>
        </div>
        <p className="rashi-characteristics">{rashi.characteristic}</p>

        <h2 className="section-title">Compatible Zodiacs</h2>
        <div className="zodiac-chakra-divider">
          <span>✦</span>
        </div>
        <ul className="rashi-list">
          {rashi.compatibleZodiacs.map((zodiac, index) => (
            <li key={index}>
              <button className="functional-zodiac-btn">{zodiac}</button>
            </li>
          ))}
        </ul>

        <h2 className="section-title">Strengths</h2>

        <div className="zodiac-chakra-divider">
          <span>✦</span>
        </div>
        <ul className="rashi-list">
          {rashi.strengths.map((strength, index) => (
            <li key={index}>{strength}</li>
          ))}
        </ul>
        <h2 className="section-title">Weaknesses</h2>
        <div className="zodiac-chakra-divider">
          <span>✦</span>
        </div>
        <ul className="rashi-list">
          {rashi.weaknesses.map((weakness, index) => (
            <li key={index}>{weakness}</li>
          ))}
        </ul>

        <h2 className="section-title">Favorable Colors</h2>
        <div className="zodiac-chakra-divider">
          <span>✦</span>
        </div>
        <ul className="rashi-list">
          {rashi.favorableColors.map((color, index) => (
            <li key={index}>
              <div className="favourable-colour">{color}</div>
            </li>
          ))}
        </ul>

        <h2 className="section-title">Favorable Numbers</h2>
        <div className="zodiac-chakra-divider">
          <span>✦</span>
        </div>
        <ul className="rashi-list">
          {rashi.favorableNumbers.map((number, index) => (
            <li key={index}>
              <div className="favourable-numbers">{number}</div>
            </li>
          ))}
        </ul>
     
      </div>

      <div className="horoscope-section">
        <h2>Horoscope</h2>
        {/* <div className="horoscope-buttons">
          <button className="horoscope-btn">Daily</button>
          <button className="horoscope-btn">Monthly</button>
          <button className="horoscope-btn">Yearly</button>
        </div> */}
        <div className="rashi-category-columns">
          <div className="rashi-category-group">
            {[healthImage, emotionsImage, personal_lifeImage].map(
              (img, idx) => {
                const cat = ["Health", "Emotions", "Love"][idx];
                return (
                  <div className="rashi-item" key={cat}>
                    <img src={img} alt="Icon" />
                    <div>
                      <h4>{cat.toUpperCase()} HOROSCOPE</h4>
                      <p>
                        {loadingCategories ? (
                          <div
                            className="dot-spinner"
                            style={{ marginTop: "13px" }}
                          >
                            <span className="dot-spinner-dot"></span>
                            <span className="dot-spinner-dot"></span>
                            <span className="dot-spinner-dot"></span>
                          </div>
                        ) : (
                          categoryHoroscopes[cat]
                        )}
                      </p>
                    </div>
                  </div>
                );
              }
            )}
          </div>
          <div className="rashi-category-group">
            {[professionImage, travelImage, luckImage].map((img, idx) => {
              const cat = ["Career", "Travel", "Luck"][idx];
              return (
                <div className="rashi-item" key={cat}>
                  <img src={img} alt="Icon" />
                  <div>
                    <h4>{cat.toUpperCase()} HOROSCOPE</h4>
                    <p>
                       {loadingCategories ? (
                          <div
                            className="dot-spinner"
                            style={{ marginTop: "13px" }}
                          >
                            <span className="dot-spinner-dot"></span>
                            <span className="dot-spinner-dot"></span>
                            <span className="dot-spinner-dot"></span>
                          </div>
                        ) : (
                          categoryHoroscopes[cat]
                        )}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ZodiacDetails;

import React, { useState, useEffect, useRef } from "react";
import { useLocation, Link } from "react-router-dom";
import { useDebounce } from "use-debounce";
import axios from "axios";
import "./Hero.css";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../pages/AuthContext";
import { FaEdit, FaTrash } from "react-icons/fa";
import geminiImage from "../assets/Gemini.png";
import taurusImage from "../assets/Taurus.png";
import cancerImage from "../assets/Cancer.png";
import leoImage from "../assets/Leo.png";
import virgoImage from "../assets/Virgo.png";
import libraImage from "../assets/Libra.png";
import scorpioImage from "../assets/Scorpio.png";
import sagittariusImage from "../assets/Sagittarius.png";
import capricornImage from "../assets/Capricorn.png";
import aquariusImage from "../assets/Aquarius.png";
import piscesImage from "../assets/Pisces.png";
import ariesImage from "../assets/Aries.png";
import PanchangBox from "./Panchang";
import gemstoneBox from "../assets/gemstone.png";
import rudrakshaBox from "../assets/rudraksha.png";
import numerologyBox from "../assets/numerology.png";
import ishtadevtaBox from "../assets/ishtadevta.png";

const Hero = () => {
  const [selectedPlace, setSelectedPlace] = useState(null); // Add this state

  const formRef = useRef(null);
  const [formData, setFormData] = useState({
    name: "",
    birthDate: "",
    birthTime: "",
    birthPlace: "",
  });
  const { user, isAuthenticated } = useAuth();
  const [myKundalis, setMyKundalis] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [locationSelected, setLocationSelected] = useState(false);
  const [debouncedPlace] = useDebounce(formData.birthPlace, 400);

  const [searchQuery, setSearchQuery] = useState("");
  const [autoSubmit, setAutoSubmit] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (isAuthenticated && user && user.id && token) {
      axios
        .get(`http://localhost:4000/my-kundalis/${user.id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        })
        .then((response) => {
          setMyKundalis(response.data.kundalis);
        })
        .catch((error) => {
          console.error("Error fetching kundalis:", error);
        });
    }
  }, [user, isAuthenticated]);
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") {
        setSuggestions([]);
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  useEffect(() => {
    if (debouncedPlace.length > 2 && !locationSelected && !autoSubmit) {
      fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${debouncedPlace}`
      )
        .then((res) => res.json())
        .then((data) => {
          setSuggestions(data.slice(0, 5));
        });
    } else {
      setSuggestions([]);
    }
  }, [debouncedPlace, locationSelected, autoSubmit]);

  useEffect(() => {
    if (autoSubmit) {
      formRef.current?.dispatchEvent(
        new Event("submit", { cancelable: true, bubbles: true })
      );
      setAutoSubmit(false);
    }
  }, [autoSubmit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // If user is typing in birthPlace, reset the selected flag
    if (name === "birthPlace") {
      setLocationSelected(false);
      // If suggestions are empty, allow submission
    }
  };


  const handlePlaceSelect = (placeName, placeObj) => {
    setFormData((prev) => ({ ...prev, birthPlace: placeName }));
    setSelectedPlace(placeObj); // Save the full suggestion object
    setSuggestions([]);
    setLocationSelected(true);

    // Optional: blur the input after selecting
    const input = document.querySelector("#input-place");
    input?.blur();
  };
  const convertTo12hrFormat = (timeInput) => {
    // Split the time input into hours and minutes
    const [hours, minutes] = timeInput
      .split(":")
      .map((part) => parseInt(part, 10));

    // Determine whether it's AM or PM
    const period = hours >= 12 ? "PM" : "AM";

    // Convert to 12-hour format
    const hours12hr = hours % 12 || 12; // Convert 0-23 hour format to 1-12 format

    // Format the time in 12-hour format with AM/PM
    const formattedTime = `${hours12hr}:${minutes < 10 ? "0" + minutes : minutes
      } ${period}`;

    return formattedTime;
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission
    setLoading(true);
    // Validate form data
    // Ensure time includes AM/PM if it's missing

    // Convert to 12-hour time format with AM/PM
    const formattedTimeWithAMPM = convertTo12hrFormat(formData.birthTime);

    const dataToSend = {
      name_input: formData.name,
      date_input: formData.birthDate,
      time_input: formattedTimeWithAMPM,
      location_input: formData.birthPlace,
      user_id: user?.id,
      latitude: selectedPlace?.lat,      // Add latitude
      longitude: selectedPlace?.lon,     // Add longitude
    };
    console.log("dataToSend:", dataToSend);
    try {
      const response = await axios.post(
        "http://localhost:4000/birth-details",
        dataToSend
      );
      console.log("Response from backend:", response.data);

      // Now extract birthId correctly from response.data.data
      const birthId =
        response.data.data?.birth_id ||
        response.data.data?.id ||
        response.data.data?.birthDetails?.id;

      if (birthId) {
        navigate(`/kundali/${birthId}`);
      } else {
        console.error("birthId is missing in response!");
        console.log("FULL response", response.data);
      }
    } catch (error) {
      console.error("Error sending data to backend:", error);
    } finally {
      setLoading(false); // Stop loading
    }
  };

  const rashiList = [
    {
      name: "Aries",
      image: ariesImage,
      description:
        " Element is 🔥 Fire. Nature is bold, energetic, and action-oriented 🚀. Aries individuals are fearless leaders, always ready to take charge and tackle challenges head-on. They’re highly independent, with a strong competitive spirit that drives them forward. Their dynamic nature makes them natural go-getters, unafraid of risks or obstacles in their path.",
    },
    {
      name: "Taurus",
      image: taurusImage,
      description:
        "Element is 🌱 Earth. Nature is stable, patient, and sensual 🌿. Taurus individuals seek comfort and security, valuing stability in both material and emotional aspects of life. They are steadfast and loyal, with a deep appreciation for luxury and beauty. Their grounded approach ensures practical decision-making, making them dependable in relationships and careers.",
    },
    {
      name: "Gemini",
      image: geminiImage,
      description:
        "Element is 🌬️ Air. Nature is curious, communicative, and adaptable 💡. Gemini individuals are quick-witted and versatile, thriving in environments that require intellectual engagement. They excel at expressing ideas, making them great conversationalists and problem-solvers. Their dual nature allows them to explore multiple perspectives, keeping them constantly engaged in new experiences.",
    },
    {
      name: "Cancer",
      image: cancerImage,
      description:
        "Element is 🌊 Water. Nature is emotional, intuitive, and nurturing 🏡. Cancer individuals feel deeply connected to their home and loved ones. They possess strong protective instincts, ensuring the well-being of those close to them. Their high emotional intelligence makes them empathetic and understanding, though their moods can fluctuate based on external influences.",
    },
    {
      name: "Leo",
      image: leoImage,
      description:
        "Element is 🔥 Fire. Nature is confident, ambitious, and charismatic 🌟. Leo individuals radiate self-assurance and leadership, drawing attention wherever they go. Their magnetism and creativity make them natural-born leaders who inspire others. They thrive in positions that allow them to shine, and they love receiving recognition for their efforts",
    },
    {
      name: "Virgo",
      image: virgoImage,
      description:
        "Element is 🌱 Earth. Nature is analytical, disciplined, and perfectionist 🔍. Virgo individuals have keen attention to detail, ensuring everything they do is efficient and precise. They are practical thinkers, capable of solving problems logically. Their desire for improvement pushes them toward self-growth and refinement, though they may be overly critical at times.",
    },
    {
      name: "Libra",
      image: libraImage,
      description:
        "Element is 🌬️ Air. Nature is harmonious, diplomatic, and artistic 🎭. Libra individuals seek balance and beauty in all aspects of life. They value relationships and social connections, using their charismatic personality to maintain peace and harmony. Their refined taste makes them excellent at aesthetic and creative pursuits, though indecision may sometimes slow their progress.",
    },
    {
      name: "Scorpio",
      image: scorpioImage,
      description:
        "Element is 🌊 Water. Nature is intense, mysterious, and transformative 🔥. Scorpio individuals are deep thinkers, always seeking profound truths. They are highly intuitive, with a natural ability to understand the unseen. Their determination and resilience ensure they emerge stronger from challenges, making them strategic and resourceful in all aspects of life.",
    },
    {
      name: "Sagittarius",
      image: sagittariusImage,
      description:
        "Element is 🔥 Fire. Nature is optimistic, adventurous, and philosophical 🏹. Sagittarius individuals crave freedom and exploration, constantly seeking wisdom and new experiences. Their enthusiasm and humor make them fun to be around, as they radiate positive energy. Their love for learning and traveling ensures their life is always full of exciting discoveries.",
    },
    {
      name: "Capricorn",
      image: capricornImage,
      description:
        "Element is 🌱 Earth. Nature is disciplined, ambitious, and responsible ⛰️. Capricorn individuals are hardworking and goal-oriented, with a strong drive for success and stability. They possess immense patience, ensuring long-term achievements through consistent effort. Their practical mindset allows them to excel in leadership roles, though they may sometimes struggle with emotional expression.",
    },
    {
      name: "Aquarius",
      image: aquariusImage,
      description:
        "Element is 🌬️ Air. Nature is innovative, independent, and visionary 🚀. Aquarius individuals thrive in unique and progressive environments, pushing boundaries to create new ideas and social change. Their unconventional thinking makes them rebellious and forward-driven, often leading them toward scientific and intellectual pursuits. They value freedom and individuality, constantly inspiring others.",
    },
    {
      name: "Pisces",
      image: piscesImage,
      description:
        "Element is 🌊 Water. Nature is dreamy, compassionate, and artistic 🎨. Pisces individuals have a deep spiritual connection, often living in their own imaginative world. They are highly empathetic, absorbing the emotions of others and offering unconditional support. Their intuitive nature allows them to navigate life through gut instincts and creativity.",
    },
  ];

  useEffect(() => {
    // Only target planet banners, not the sun
    const banners = document.querySelectorAll(".orbit .planet-banner");
    banners.forEach((el) => {
      // Set a random starting angle between 0 and 360deg
      const angle = Math.floor(Math.random() * 360);
      el.style.setProperty("--start-angle", `${angle}deg`);
    });
  }, []);

  const location = useLocation();
  useEffect(() => {
    if (location.state?.scrollTo) {
      const el = document.getElementById(location.state.scrollTo);
      if (el) el.scrollIntoView({ behavior: "auto" });
    }
  }, [location.state]);
  return (
    <div className="hero-wrapper" id="hero-wrapper">
      {/* Planetary Banners Section */}

      <div className="planet-orbit-system">
        <div className="sun-center" onClick={() => navigate("/sun")}>
          ☀️ <strong>Sun</strong>
          <p>Self, soul, and vitality. </p>
        </div>
        <div className="orbit orbit-wrapper">
          <div
            className="planet-banner"
            style={{ "--i": 0 }}
            onClick={() => navigate("/moon")}
          >
            🌙 <strong>Moon</strong>
            <p>Mind, emotions, and instincts. </p>
          </div>
          <div
            className="planet-banner"
            style={{ "--i": 1 }}
            onClick={() => navigate("/mars")}
          >
            ♂️ <strong>Mars</strong>
            <p>Action, drive, and aggression. </p>
          </div>
          <div
            className="planet-banner"
            style={{ "--i": 2 }}
            onClick={() => navigate("/mercury")}
          >
            ☿ <strong>Mercury</strong>
            <p>Communication, logic, and learning.</p>
          </div>
          <div
            className="planet-banner"
            style={{ "--i": 3 }}
            onClick={() => navigate("/jupiter")}
          >
            ♃ <strong>Jupiter</strong>
            <p>Wisdom, growth, and spirituality.</p>
          </div>
          <div
            className="planet-banner"
            style={{ "--i": 4 }}
            onClick={() => navigate("/venus")}
          >
            ♀️ <strong>Venus</strong>
            <p>Love, beauty and harmony.</p>
          </div>
          <div
            className="planet-banner"
            style={{ "--i": 5 }}
            onClick={() => navigate("/saturn")}
          >
            ♄ <strong>Saturn</strong>
            <p>Karma, discipline, and structure.</p>
          </div>
          <div
            className="planet-banner"
            style={{ "--i": 6 }}
            onClick={() => navigate("/rahu")}
          >
            ☊ <strong>Rahu</strong>
            <p>Obsession, illusion, and ambition.</p>
          </div>
          <div
            className="planet-banner"
            style={{ "--i": 7 }}
            onClick={() => navigate("/ketu")}
          >
            ☋ <strong>Ketu</strong>
            <p>Detachment, past lives, and moksha.</p>
          </div>
        </div>
      </div>

      <div className="tagline">
        <div className="panchang-box-wrapper">
          <PanchangBox />
        </div>
        <p>
          ॐ तारा ज्योतिर्मय जीवनं मार्गदर्शयति !! -{" "}
          <span style={{ fontStyle: "italic" }}>
            {" "}
            The light of stars guides life’s path.
          </span>
        </p>

        <p id="typewriter">
          Beyond horoscopes, into the Self — illuminate your path with ancient
          Jyotish, where every planet whispers your story and you begin where
          your stars began.
          <button className="explore-btn">Explore More</button>
        </p>
      </div>

      <div className="hero-kundalisection-header">
        <h2> Kundli – Your Celestial Blueprint for Life</h2>
        <h6>
          🔱 ग्रहाः फलन्ति कर्मणाम्-{" "}
          <span>Planets deliver the fruits of our karma.</span>
        </h6>
        <p>
          A Kundli, or birth chart, is more than just a diagram of planets — it
          is a sacred map of your destiny, formed at the precise moment and
          location of your birth. Rooted in the timeless science of Vedic
          astrology (Jyotish Shastra), a Kundli reveals how the movements of
          celestial bodies influence your life, relationships, career, health,
          and spiritual growth. Each graha (planet) in your Kundli represents a
          specific force, and its placement across the twelve houses offers deep
          insight into your karmic patterns. As the ancient Sanskrit wisdom
          says, "ग्रहाः फलन्ति कर्मणाम्" — the planets deliver the results of
          our actions. This means your Kundli is not just about fate, but a
          reflection of your past deeds and current potential. With the help of
          modern astrology tools, anyone can now generate their Janam Kundli in
          seconds — personalized and in multiple Indian languages. Whether
          you're a beginner curious about your Moon sign, or an advanced seeker
          exploring divisional charts and yogas, the Kundli acts as your cosmic
          guide. Unlock the story written in the stars. Understand yourself
          deeply, align your actions with your dharma, and navigate life with
          clarity — all through the lens of your celestial blueprint.
        </p>
        <p>
          The power of a Kundli lies in its ability to decode the invisible
          patterns that govern your life. From the planetary conjunctions that
          shape your personality to the Dasha (planetary periods) that influence
          different phases of your journey, every detail in the chart holds
          meaning. When read with care, it can help you make informed choices,
          avoid unfavorable periods, and harness opportunities at the right
          time. What makes Kundli even more relevant today is its ability to
          blend ancient wisdom with modern life. Whether you're choosing a
          career path, seeking relationship compatibility, or trying to
          understand a repeating life challenge, your birth chart becomes a
          mirror of insight. And with accurate software-based calculations, you
          no longer need to rely solely on in-person consultations — your entire
          astrological profile can now be accessed in a few clicks. Our Kundli
          software not only generates charts but also offers interpretations,
          yogas, doshas, planetary strengths, and predictive insights — all in a
          user-friendly format. Plus, with multilingual support and mobile
          access, astrology is now truly in everyone’s hands. In a world of
          uncertainty, your Kundli stands as a guiding light, reminding you that
          while the stars suggest the path, it is your karma that ultimately
          shapes your destiny.
        </p>
        <p>
          A Kundli doesn’t just predict — it empowers. It shows you where your
          strengths lie and highlights the areas that need growth. By
          understanding planetary influences, you gain clarity on why certain
          challenges keep appearing, why certain phases feel lucky, or why
          specific relationships feel karmically bound. This self-awareness can
          lead to real transformation when used wisely. In Vedic astrology, time
          is not just a measurement — it’s a spiritual force. Through Dashas,
          transits (Gochar), and yogas, the Kundli acts like a cosmic calendar,
          helping you align with the right timing for action, reflection, or
          change. Whether it’s marriage, education, business, or spiritual
          practice, knowing the right muhurta (auspicious time) can shift
          outcomes in your favor. Our digital Kundli tool combines the authentic
          precision of classical astrology with the convenience of technology.
          It’s designed not just for astrologers, but for anyone curious about
          their life path. Whether you're looking for daily insights or lifelong
          patterns, your Kundli offers a map — you just need to learn how to
          read it. So take a step inward. Explore your karmic design. Let the
          stars reveal their message — not as fate carved in stone, but as a
          guide to a more conscious, fulfilled, and aligned life.
        </p>
      </div>

      <div className="content-layout" id="content-layout">
        {/* Form Panel */}
        <div className="form-section" id="form-section">
          <h2>🔮 Kundali Input</h2>
          <form
            ref={formRef}
            onSubmit={handleSubmit}
            className="kundali-form"
            id="kundali-form"
          >
            <label htmlFor="input-name">
              Name:
              <input
                id="input-name"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Your full name"
              />
            </label>

            <label htmlFor="input-date">
              Birth Date:
              <input
                id="input-date"
                type="date"
                name="birthDate"
                value={formData.birthDate}
                onChange={handleChange}
              />
            </label>

            <label htmlFor="input-time">
              Birth Time:
              <input
                id="input-time"
                type="time"
                name="birthTime"
                value={formData.birthTime}
                onChange={handleChange}
              />
            </label>

            <label htmlFor="input-place" className="location-label">
              Birth Place:
              <input
                id="input-place"
                type="text"
                name="birthPlace"
                value={formData.birthPlace}
                onChange={handleChange}
                placeholder="Search your city"
                autoComplete="off"
              />
              {suggestions.length > 0 && (
                <ul className="location-suggestions" id="location-suggestions">
                  {suggestions.map((sug, i) => (
                    <li
                      key={i}
                      onClick={() => handlePlaceSelect(sug.display_name, sug)} // Pass sug object
                    >
                      {sug.display_name}
                    </li>
                  ))}
                </ul>
              )}
            </label>

            <button
              type="submit"
              className="submit-btn"
              id="submit-btn"
              disabled={loading}
            >
              {loading ? "Generating ...." : "Generate Kundali"}
            </button>
          </form>
        </div>

        <div>
          <div className="my-kundalis-section" id="my-kundalis-section">
            <h2>🗂️ My Kundalis</h2>
            <div className="search-bar" style={{ marginBottom: "1rem" }}>
              <input
                type="text"
                placeholder="Search by name..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="search-input"
                style={{ padding: "8px", width: "100%" }}
                disabled={!user}
              />
            </div>

            {!user ? (
              <div style={{ textAlign: "center", margin: "2rem 0" }}>
                <button
                  className="submit-btn"
                  onClick={() => navigate("/login")}
                  style={{
                    padding: "10px 30px",
                    fontSize: "1.1rem",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "10px", // space between icon and text
                  }}
                >
                  <i className="bi bi-person-circle profile-icon"></i>
                  Login to view your Kundalis
                </button>
              </div>
            ) : (
              myKundalis
                .filter((kundali) =>
                  kundali.name.toLowerCase().includes(searchQuery.toLowerCase())
                )
                .map((kundali) => (
                  <div
                    key={kundali.id}
                    className="kundali-card"
                    style={{ cursor: "pointer", position: "relative" }}
                  >
                    {/* Edit & Delete Icons */}
                    <div
                      style={{
                        position: "absolute",
                        top: 8,
                        right: 8,
                        display: "flex",
                        gap: "10px",
                        zIndex: 2,
                      }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <FaEdit
                        style={{ cursor: "pointer", color: "blue" }}
                        title="Edit"
                        onClick={() => {
                          setFormData({
                            name: kundali.name,
                            birthDate: kundali.birth_date,
                            birthTime: kundali.birth_time.split(" ")[0],
                            birthPlace: kundali.birth_place,
                          });
                          setLocationSelected(true);
                          window.scrollTo({ behavior: "smooth" });
                        }}
                      />

                      <FaTrash
                        style={{ cursor: "pointer", color: "red" }}
                        title="Delete"
                        onClick={async () => {
                          if (
                            !window.confirm(
                              "Are you sure you want to delete this kundali?"
                            )
                          )
                            return;
                          try {
                            await axios.delete(
                              `http://localhost:4000/my-kundalis/${kundali.kundali_id}`
                            );
                            setMyKundalis((prev) =>
                              prev.filter(
                                (k) => k.kundali_id !== kundali.kundali_id
                              )
                            );
                          } catch (error) {
                            console.error("Error deleting kundali:", error);
                          }
                        }}
                      />
                    </div>
                    {/* Card Content */}
                    <div onClick={() => navigate(`/kundali/${kundali.id}`)}>
                      <h3>{kundali.name}</h3>
                      <p>
                        {new Date(kundali.birth_date).toLocaleDateString(
                          "en-IN",
                          {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          }
                        )}{" "}
                        {kundali.birth_time} |{" "}
                        <span style={{ color: "#11187f" }}>
                          {kundali.birth_place}
                        </span>
                      </p>
                    </div>
                  </div>
                ))
            )}
          </div>
        </div>
        <div className="features-section">
          <Link to="/gemstone">
            <div className="feature-box">
              <img src={gemstoneBox} alt="Gemstone" className="feature-icon" />
              <p className="feature-label">Gemstone Calculator</p>
              <div className="feature-overlay">
                Life, Lucky and Fortune stones as per your kundali{" "}
              </div>
            </div>
          </Link>

          <Link to="/rudraksha">
            <div className="feature-box">
              <img src={rudrakshaBox} alt="Rudraksha" className="feature-icon" />
              <p className="feature-label">Rudraksha Calculator</p>
              <div className="feature-overlay">
                Know which Rudraksha brings good luck and blessings for you
              </div>
            </div>
          </Link>

          <Link to="/numerology">
            <div className="feature-box">
              <img src={numerologyBox} alt="Numerology" className="feature-icon" />
              <p className="feature-label">Numerology Tool</p>
              <div className="feature-overlay">
                Get your numerology interpretations and predictions
              </div>
            </div>
          </Link>

          <Link to="/ishtadevta">
            <div className="feature-box">
              <img src={ishtadevtaBox} alt="Ishtadevta" className="feature-icon" />
              <p className="feature-label">Ishtadevta Finder</p>
              <div className="feature-overlay">
                Know your true Spiritual Guide? Check Here
              </div>
            </div>
          </Link>
        </div>
      </div>
      {/* Rashi Scroll Section */}
      <div className="rashi-scroll-wrapper" id="rashi-scroll-wrapper">
        <div className="rashi-scroll-header">
          <h1 style={{ color: " rgb(192, 189, 234)" }}>
            🌌 Zodiac Signs (Rashi)
          </h1>
          <h6>
            🔱 द्वादश राशयः स्वभावं दर्शयन्ति —{" "}
            <span>
              The twelve zodiac signs reflect our inherent nature and cosmic
              imprint.
            </span>
          </h6>
        </div>

        <div className="rashi-section">
          {/* Left: Paragraph only */}
          <div className="rashi-left">
            <p>
              The twelve zodiac signs, known as Rashis in Vedic astrology, form
              the foundational framework of your birth chart. Each Rashi is
              governed by a ruling planet and embodies a unique combination of
              elemental energy — fire, earth, air, or water — shaping your
              behavior, temperament, and destiny. From the fiery leadership of
              Aries (Mesha) to the spiritual depth of Pisces (Meena), every sign
              reveals a sacred layer of your personality. These signs not only
              define how you express yourself but also how you respond to life’s
              challenges, interact with others, and pursue your soul’s path. The
              Rashis are far more than mere symbols of the zodiac — they are
              living archetypes that guide you through karmic lessons and divine
              purpose. Understanding your Rashi helps uncover your strengths,
              growth areas, and the subtle energetic patterns influencing your
              journey. Whether you're ruled by the discipline of Capricorn, the
              passion of Leo, or the compassion of Cancer, your zodiac sign is a
              celestial fingerprint — a sacred echo of the universe imprinted on
              your soul at birth. Let each Rashi reveal a piece of your eternal
              self.
            </p>
            <br />
            <p>
              As you journey deeper into the essence of each Rashi, you begin to
              see how these archetypes subtly influence every facet of your
              existence — from your career and relationships to your spiritual
              inclinations and emotional rhythms. The fiery signs ignite
              ambition and courage, pushing you toward bold action; the earthy
              signs ground you in stability and perseverance; the airy signs
              inspire intellect and communication; and the watery signs awaken
              intuition and emotional depth. These energies are not isolated —
              they interact dynamically in your chart, creating a rich tapestry
              of strengths and struggles meant to guide your evolution. When
              planets transit through different Rashis, they activate specific
              themes in your life, prompting growth, reflection, or
              transformation. By honoring their messages and living in harmony
              with their rhythms, you align yourself with a deeper cosmic
              intelligence — one that reminds you that your life is not random
              but divinely orchestrated, written across the sky from the moment
              you took your first breath.
            </p>
          </div>

          {/* Right: Heading and Rashi cards */}
          <div className="rashi-right">
            <h2>Trace the Path Your Stars Have Drawn</h2>
            <div className="rashi-scroll">
              {rashiList.map((rashi, index) => (
                <div
                  key={index}
                  className="rashi-card"
                  onClick={() =>
                    navigate(`/zodiac/${encodeURIComponent(rashi.name)}`)
                  }
                >
                  <img
                    src={rashi.image}
                    alt={rashi.name}
                    className="rashi-symbol"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;

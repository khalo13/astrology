import React, { useState, useEffect, useCallback } from "react";
import "./AshtakootMilan.css";
import { useDebounce } from "use-debounce";
import axios from "axios";
import { useLocation } from "react-router-dom";

const AshtakootMilan = () => {
  const [person1, setPerson1] = useState({
    name: "",
    dob: "",
    tob: "",
    pob: "",
  });
  const [person2, setPerson2] = useState({
    name: "",
    dob: "",
    tob: "",
    pob: "",
  });
  const [suggestions1, setSuggestions1] = useState([]);
  const [suggestions2, setSuggestions2] = useState([]);
  const [locationSelected1, setLocationSelected1] = useState(false);
  const [locationSelected2, setLocationSelected2] = useState(false);
  const [milanResult, setMilanResult] = useState(null);
  const [debouncedPob1] = useDebounce(person1.pob, 400);
  const [debouncedPob2] = useDebounce(person2.pob, 400);
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [blogs, setBlogs] = useState([]);
  const [visibleBlogs, setVisibleBlogs] = useState([]);

  const getRandomBlogs = useCallback(() => {
    const shuffled = [...blogs].sort(() => 0.5 - Math.random());
    setVisibleBlogs(shuffled.slice(0, 4));
  }, [blogs]);

  useEffect(() => {
    if (blogs.length >= 4) {
      getRandomBlogs();
    }
  }, [blogs, getRandomBlogs]);

  // For Person 1
  useEffect(() => {
    if (debouncedPob1.length > 2 && !locationSelected1) {
      fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${debouncedPob1}`
      )
        .then((res) => res.json())
        .then((data) => setSuggestions1(data.slice(0, 5)));
    } else {
      setSuggestions1([]);
    }
  }, [debouncedPob1, locationSelected1]);

  // For Person 2
  useEffect(() => {
    if (debouncedPob2.length > 2 && !locationSelected2) {
      fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${debouncedPob2}`
      )
        .then((res) => res.json())
        .then((data) => setSuggestions2(data.slice(0, 5)));
    } else {
      setSuggestions2([]);
    }
  }, [debouncedPob2, locationSelected2]);

  const handleChange = (e, person) => {
    const { name, value } = e.target;
    if (person === 1) {
      setPerson1((prev) => ({ ...prev, [name]: value }));
      if (name === "pob") setLocationSelected1(false);
    } else {
      setPerson2((prev) => ({ ...prev, [name]: value }));
      if (name === "pob") setLocationSelected2(false);
    }
  };

  const handlePlaceSelect = (place, person) => {
    if (person === 1) {
      setPerson1((prev) => ({ ...prev, pob: place }));
      setSuggestions1([]);
      setLocationSelected1(true);
    } else {
      setPerson2((prev) => ({ ...prev, pob: place }));
      setSuggestions2([]);
      setLocationSelected2(true);
    }
  };

  function convertTo12hrFormat(time) {
    if (!time) return "";
    let [hours, minutes] = time.split(":");
    hours = parseInt(hours, 10);
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;
    return `${hours}:${minutes} ${ampm}`;
  }
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formattedTimeWithAMPM1 = convertTo12hrFormat(person1.tob);
    const formattedTimeWithAMPM2 = convertTo12hrFormat(person2.tob);

    const dataToSend = {
      boy: {
        date_input: person1.dob,
        time_input: formattedTimeWithAMPM1,
        location_input: person1.pob,
      },
      girl: {
        date_input: person2.dob,
        time_input: formattedTimeWithAMPM2,
        location_input: person2.pob,
      },
    };
    try {
      const nodeResponse = await axios.post(
        "http://localhost:4000/ashtakoot-milan",
        dataToSend
      );
      const result = nodeResponse.data.milan;
      setMilanResult(result);
      localStorage.setItem("milanResult", JSON.stringify(result));
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };
  const handleReset = () => {
    setMilanResult(null); // clear result
    document.getElementById("frmAstro")?.reset(); // reset form inputs (if using native form)
  };
  useEffect(() => {
    return () => {
      localStorage.removeItem("milanResult");
    };
  }, []);

  useEffect(() => {
    const navType = performance.getEntriesByType("navigation")[0]?.type;
    const isReload = navType === "reload" || performance.navigation?.type === 1;

    if (isReload) {
      const saved = localStorage.getItem("milanResult");
      if (saved) {
        setMilanResult(JSON.parse(saved));
      }
    }
  }, []);

  useEffect(() => {
    const navType = performance.getEntriesByType("navigation")[0]?.type;
    const isReload = navType === "reload" || performance.navigation?.type === 1;

    if (!isReload) {
      localStorage.removeItem("milanResult");
      setMilanResult(null);
    }
  }, [location.pathname]);

  useEffect(() => {
    const fetchRSS = async () => {
      try {
        const res = await fetch(
          "https://api.rss2json.com/v1/api.json?rss_url=https://cafeastrology.com/feed"
        );
        const data = await res.json();

        if (!data.items) throw new Error("No blog items found");
       

        const latestBlogs = data.items.slice(0, 6).map((item, index) => ({
          id: index,
          title: item.title,
          excerpt:
            item.description.replace(/<[^>]+>/g, "").slice(0, 150) + "...",
          link: item.link,
        }));

        setBlogs(latestBlogs);
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch RSS:", error);
        setLoading(false);
      }
    };

    fetchRSS();
  }, []);

  return (
    <div className="ashtakoot-container">
      {!milanResult && (
        <div className="milan-container">
          <div className="milan-left">
            <h2>अष्टकूट मिलानम्</h2>
            <h2>वैदिक विवाहयोग्यता परीक्षणस्य प्राचीनतमं सूत्रम् ॥ -</h2>
            <h4>ASHTAKOOTA: The most ancient method of Vedic marriage compatibility examination. </h4>
            <h5>Significance of Matchmaking:</h5>
            <p>
              Even today, marriage is more or less universal in India. ‘Vivaha’
              or Marriage is one of the 16 Samskaras or religious
              conducts/rites. Samskaras are the different crucial turning points
              in a person’s life; hence they are respected and celebrated. Hindu
              scriptures consider marriage as a very holy union determined even
              before birth. Hence match-making assumes a great significance to
              understand the physical, mental, intellectual, and behavioral
              compatibility of the potential couple. Marriage Matchmaking has
              now assumed a greater significance with the changing
              socio-economic conditions and radical modifications in the status
              and role of women in family life. Besides comparing the
              educational, cultural, and professional backgrounds, the
              prospective bride/groom and their parents are also interested in
              assuring whether their married life will be happy, harmonious, and
              fruitful too.This is where the importance of match-making comes.
            </p>
            <h5>What is Match Making?</h5>
            <p>
              Marriage Matchmaking is known by different names such as Kundli
              Milan, Guna Milan, and Lagna Melapak. The main factors to be
              considered while matching horoscopes are the promise of a long and
              healthy marital relationship, Guna Milan, Manglik consideration,
              and the strength of the Navamansha chart.
            </p>
            <h5>Guna Milan and Types:</h5>
            <p>
              Guna Milan is not to be mixed up with Match Making; it is actually
              a part of the Kundli Milan. In North India, a very traditional,
              yet simple method of Guna matching is followed which is called the
              ‘Ashtakoota Milan’. It literally means the ‘Matching of Eight
              Qualities or Aspects’. ‘Ashta’ means Eight and ‘Koota’ means
              ‘aspect’. These eight aspects or kootas are allotted a certain
              numeric value depending upon their significance or role in
              deciding different aspects of a couple’s compatibility. The eight
              Gunas are Varna, Vashya, Tara, Yoni, Graha Maitri, Gana, Bhakoota,
              and Nadi. On the other hand, a more comprehensive and complicated
              method of matchmaking is followed in South India which is known as
              the ‘DashaKoota (Ten Aspects) Milan’. In this method, Mahendra
              Koota, Deergha Koota, Vedha Koota, and Rajju Koota too are
              considered besides the above eight kootas.
            </p>
            <h5>The ‘Ashtakoota’ Method of Matching:</h5>
            <p>
              Ashtakoota matching means the matching of 8 criteria – each of
              which is based on the Moon signs and the Natal Moon Nakshatras.
              The Navmansha Chart is generally not taken into account. Some
              astrologers consider Manglik dosha too.
            </p>

            <h5>The eight Kootas or Aspects of Ashtakoota are as follows:</h5>
            <ol>
              <li>
                <span>VARNA: </span>This represents the spiritual compatibility
                of the boy and the girl. It exhibits the ego level and
                personalities of both. The matching of Varna Koota ensures the
                existence of mutual love and comfort in marriage life.
              </li>
              <li>
                <span>VASHYA: </span>This measures mutual attraction and the
                degree to which the partners shall be able to influence each
                other. In other words, it calculates the power equation between
                the two.
              </li>
              <li>
                <span>TARA: </span> Tara or Dina Koota indicates the wellbeing
                and longevity of the prospective couple. Its compatibility
                ensures that the couple shall remain disease-free and have a
                long life thereby will be able to enjoy the comforts of a happy
                conjugal life.
              </li>
              <li>
                <span>YONI: </span> Yoni Koota measures the intimacy levels,
                sexual compatibility, and mutual love of the prospective couple.
                It matches the sensuous nature and characteristics of both.
              </li>
              <li>
                <span>GRAHA MAITRI: </span> This reflects the mental
                compatibility, affection, and natural friendship between the
                partners. It denotes how inimical the boy and the girl are to
                each other.
              </li>
              <li>
                <span>GANA: </span> Gana indicates the mutual behaviors, mental
                compatibility, and temperaments of the prospective bride and
                groom. This is a vital factor that impacts the compatibility
                levels of the Partners.
              </li>
              <li>
                <span>BHAKOOTA: </span> This represents the emotional
                compatibility of the couple. It shows the relative influence of
                one partner on the other and their capability of realizing
                mutual understanding and mental acceptance.
              </li>

              <li>
                <span>NADI: </span> Nadi measures the comparative levels of
                Vata, Pitta, and Kapha between the couple. This shows the impact
                upon progeny and child-birth issues; it also addresses the
                health matters and metabolism of the partners. Same Nadi is not
                recommended for marriage.
              </li>
            </ol>

            <h5>POINTS OBTAINED RESULTS</h5>
            <div className="milan-points-results">
              <span>33 to 36:</span>
              <p> Excellent Match</p>
            </div>
            <div className="milan-points-results">
              <span>29 to 32:</span>
              <p>VERY Good Match</p>
            </div>
            <div className="milan-points-results">
              <span>18 to 24:</span>
              <p>ACCEPTABLE BUT NEED TO CONSIDER</p>
            </div>

            <div className="milan-points-results">
              <span> {">  "}= 18: </span>
              <p>NOT RECOMMENDED</p>
            </div>
          </div>
          <div className="milan-right">
            <form className="milan-form-wrapper" onSubmit={handleSubmit}>
              <div className="milan-form-section milan-boy-form">
                <h4 className="milan-section-title">Boy</h4>
                <label className="milan-input-label">
                  Name:
                  <input
                    type="text"
                    name="name"
                    placeholder="Name"
                    value={person1.name}
                    onChange={(e) => handleChange(e, 1)}
                    required
                    className="milan-input"
                  />
                </label>
                <label className="milan-input-label">
                  Birth Date:
                  <input
                    type="date"
                    name="dob"
                    value={person1.dob}
                    onChange={(e) => handleChange(e, 1)}
                    required
                    className="milan-input"
                  />
                </label>
                <label className="milan-input-label">
                  Birth Time:
                  <input
                    type="time"
                    name="tob"
                    value={person1.tob}
                    onChange={(e) => handleChange(e, 1)}
                    className="milan-input"
                  />
                </label>
                <label className="milan-input-label milan-location-label">
                  Birth Place:
                  <input
                    type="text"
                    name="pob"
                    placeholder="Place of Birth"
                    value={person1.pob}
                    onChange={(e) => handleChange(e, 1)}
                    autoComplete="off"
                    className="milan-input"
                  />
                  {suggestions1.length > 0 && (
                    <ul className="milan-location-suggestions">
                      {suggestions1.map((sug, i) => (
                        <li
                          key={i}
                          onClick={() => handlePlaceSelect(sug.display_name, 1)}
                          className="milan-location-option"
                        >
                          {sug.display_name}
                        </li>
                      ))}
                    </ul>
                  )}
                </label>
              </div>
              <div className="milan-form-divider"></div>

              <div className="milan-form-section milan-girl-form">
                <h4 className="milan-section-title">Girl</h4>
                <label className="milan-input-label">
                  Name:
                  <input
                    type="text"
                    name="name"
                    placeholder="Name"
                    value={person2.name}
                    onChange={(e) => handleChange(e, 2)}
                    required
                    className="milan-input"
                  />
                </label>
                <label className="milan-input-label">
                  Birth Date:
                  <input
                    type="date"
                    name="dob"
                    value={person2.dob}
                    onChange={(e) => handleChange(e, 2)}
                    required
                    className="milan-input"
                  />
                </label>
                <label className="milan-input-label">
                  Birth Time:
                  <input
                    type="time"
                    name="tob"
                    value={person2.tob}
                    onChange={(e) => handleChange(e, 2)}
                    className="milan-input"
                  />
                </label>
                <label className="milan-input-label milan-location-label">
                  Birth Place:
                  <input
                    type="text"
                    name="pob"
                    placeholder="Place of Birth"
                    value={person2.pob}
                    onChange={(e) => handleChange(e, 2)}
                    autoComplete="off"
                    className="milan-input"
                  />
                  {suggestions2.length > 0 && (
                    <ul className="milan-location-suggestions">
                      {suggestions2.map((sug, i) => (
                        <li
                          key={i}
                          onClick={() => handlePlaceSelect(sug.display_name, 2)}
                          className="milan-location-option"
                        >
                          {sug.display_name}
                        </li>
                      ))}
                    </ul>
                  )}
                </label>
              </div>

              <div className="milan-submit-section">
                <button
                  type="submit"
                  className="milan-submit-btn"
                  disabled={loading}
                >
                  {loading ? "Calculating..." : "Calculate Milan"}
                </button>
              </div>
            </form>
            <div className="milan-blog-section">
              <div className="milan-blog-header">
                <h2 className="milan-blog-title">Latest Blogs</h2>
                <button className="milan-refresh-btn" onClick={getRandomBlogs}>
                  🔁
                </button>
              </div>

              {visibleBlogs.length === 0 ? (
                <p className="milan-blog-loading">Loading blogs...</p>
              ) : (
                <div className="milan-blog-grid">
                  {visibleBlogs.map(({ id, title, excerpt, image, link }) => (
                    <a
                      href={link}
                      target="_blank"
                      rel="noopener noreferrer"
                      key={id}
                      className="milan-blog-card"
                    >
                      <h3 className="milan-blog-card-title">{title}</h3>
                      <p className="milan-blog-card-excerpt">{excerpt}</p>
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Show Milan Result Table */}
      {milanResult && (
        <div className="milan-table-container">
          <h3>Ashtakoot Milan Result</h3>
          <table className="milan-table">
            <thead>
              <tr>
                <th>Guna</th>
                <th>Area Of Life</th>
                <th>Boy</th>
                <th>Girl</th>
                <th>Obtained Point</th>
                <th>Maximum Point</th>
              </tr>
            </thead>
            <tbody>
              {milanResult.guna_milan_table?.map((row, idx) => {
                const obtained = parseFloat(row["Obtained Point"]);
                const max = parseFloat(row["Maximum Point"]);
                const percentage = (obtained / max) * 100;

                return (
                  <tr key={idx}>
                    <td>
                      <div className="guna-with-circle">
                        <div className="circle-wrapper">
                          <svg viewBox="0 0 36 36" className="circular-chart">
                            <path
                              className="circle-bg"
                              d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                            />
                            <path
                              className="circle"
                              strokeDasharray={`${percentage}, 100`}
                              d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                            />
                            <text x="18" y="20.35" className="percentage">
                              {Math.round(percentage)}%
                            </text>
                          </svg>
                        </div>
                        <span className="guna-name">{row.Guna}</span>
                      </div>
                    </td>
                    <td>{row["Area Of Life"]}</td>
                    <td>{row.Boy}</td>
                    <td>{row.Girl}</td>
                    <td>{row["Obtained Point"]}</td>
                    <td>{row["Maximum Point"]}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div className="milan-summary">
            <br />
            <h4>Summary</h4>
            <p>Total Points: {milanResult.total_points} / 36</p>
            <div style={{ marginTop: "1rem" }}>
              <b>Boy Mangal Dosh:</b> {milanResult.boy_mangal_dosh?.status} (
              {milanResult.boy_mangal_dosh?.reason})
              <br />
              <b>Girl Mangal Dosh:</b> {milanResult.girl_mangal_dosh?.status} (
              {milanResult.girl_mangal_dosh?.reason})
            </div>
          </div>

          {/* ✅ Reset Button */}
          <div style={{ marginTop: "1.5rem" }}>
            <button onClick={handleReset} className="reset-button">
              Reset & Try New Match
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AshtakootMilan;

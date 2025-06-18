import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Panchang.css";

function PanchangBox() {
  const [panchang, setPanchang] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPanchang = async () => {
      try {
        const response = await axios.get("http://localhost:4000/api/panchang");
        setPanchang(response.data);
      } catch (err) {
        console.error("Failed to fetch Panchang:", err);
        setError("Unable to load Panchang data.");
      }
    };

    fetchPanchang();
  }, []);

  if (error) {
    return (
      <div className="panchang-box">
        <h2>Panchang Today</h2>
        <p>{error}</p>
      </div>
    );
  }

  if (!panchang) {
    return (
      <div className="panchang-box">
        <h2>Panchang Today</h2>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="panchang-box">
      <div className="panchang-header-row">
        <div className="left">
          <strong>Date:</strong> {panchang.date}
        </div>
        <div className="center">Panchang Today</div>
        <div className="right">
          <strong>Day:</strong> {panchang.vara}
        </div>
      </div>

      <div className="panchang-today-date">
        <div className="row">
          <div>
            <strong>Tithi:</strong> {panchang.tithi}
          </div>
          <div>
            <strong>Yoga:</strong> {panchang.yoga}
          </div>
        </div>
      </div>

      <div className="sun-moon-panchang">
        <h5>Sun And Moon Calculations</h5>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <div>
            <strong>Sunrise:</strong> {panchang.sunrise}
          </div>
          <div>
            <strong>Sunset:</strong> {panchang.sunset}
          </div>

          <div>
            <strong>Sun Sign:</strong> {panchang.sun_sign}
          </div>
          <div>
            <strong>Moon Sign:</strong> {panchang.moon_sign}
          </div>
        </div>
      </div>

      <div className="panchang-shubha-muhurat">
        <h5>Auspicious Timings (Shubha Muhurat)</h5>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <div>
            <strong>Abhijit Muhurat:</strong> {panchang.abhijit_muhurat}
          </div>
          <div>
            <strong>Brahma Muhurat:</strong> {panchang.brahma_muhurat}
          </div>
        </div>
      </div>

      <div className="panchang-ashubha-muhurat">
        <h5>Inauspicious Timings (Ashubha Muhurat)</h5>
        <div>
          <strong>Rahu Kalam:</strong> {panchang.rahu_kalam}
        </div>
        <div>
          <strong>Yamaganda:</strong> {panchang.yamaganda}
        </div>
        <div>
          <strong>Gulika:</strong> {panchang.gulika}
        </div>
      </div>
    </div>
  );
}

export default PanchangBox;

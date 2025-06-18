import React, { useEffect, useState, useRef } from "react";
import { useDebounce } from "use-debounce";

const KundaliForm = ({ onSubmit, loading = false, autoSubmit = false }) => {
  const [formData, setFormData] = useState({
    name: "",
    birthDate: "",
    birthTime: "",
    birthPlace: "",
  });

  const [suggestions, setSuggestions] = useState([]);
  const [locationSelected, setLocationSelected] = useState(false);
  const [debouncedPlace] = useDebounce(formData.birthPlace, 400);
  const formRef = useRef(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === "birthPlace") {
      setLocationSelected(false);
    }
  };

  const handlePlaceSelect = (placeName) => {
    setFormData((prev) => ({ ...prev, birthPlace: placeName }));
    setSuggestions([]);
    setLocationSelected(true);
    const input = document.querySelector("#input-place");
    input?.blur();
  };

  const convertTo12hrFormat = (timeInput) => {
    const [hours, minutes] = timeInput.split(":").map(Number);
    const period = hours >= 12 ? "PM" : "AM";
    const hours12hr = hours % 12 || 12;
    return `${hours12hr}:${minutes < 10 ? "0" + minutes : minutes} ${period}`;
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const payload = {
      name: formData.name,
      date: formData.birthDate,
      time: convertTo12hrFormat(formData.birthTime),
      place: formData.birthPlace,
    };
    onSubmit?.(payload);
  };

  useEffect(() => {
    if (debouncedPlace.length > 2 && !locationSelected && !autoSubmit) {
      fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${debouncedPlace}`
      )
        .then((res) => res.json())
        .then((data) => setSuggestions(data.slice(0, 5)));
    } else {
      setSuggestions([]);
    }
  }, [debouncedPlace, locationSelected, autoSubmit]);

  return (
    <div className="form-section" id="form-section">
      <h2>🔮 Kundali Input</h2>
      <form
        ref={formRef}
        onSubmit={handleFormSubmit}
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
                  onClick={() => handlePlaceSelect(sug.display_name)}
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
          {loading ? "Generating..." : "Generate Kundali"}
        </button>
      </form>
    </div>
  );
};

export default KundaliForm;

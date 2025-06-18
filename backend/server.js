// server.js
require("dotenv").config();
const express = require("express");
const axios = require("axios");
const mysql = require("mysql2");
const bodyParser = require("body-parser");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// Create an Express app
const app = express();
const port = 4000;
app.use(
  cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// Middleware
app.use(bodyParser.json());

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "123456",
  database: "homepage",
});

// Connect to MySQL
db.connect((err) => {
  if (err) throw err;
  console.log("Connected to MySQL database");
});

const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;

  console.log("Auth header:", authHeader);
  if (!authHeader) return res.status(401).json({ error: "No token" });
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your_jwt_secret"
    );
    db.query(
      "SELECT * FROM astrology_users WHERE id = ?",
      [decoded.id],
      (err, results) => {
        if (err || results.length === 0) {
          return res.status(401).json({ error: "User not found" });
        }
        req.user = results[0];
        next();
      }
    );
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }
};

app.post("/signup", async (req, res) => {
  const { email, password, name } = req.body;
  if (!email || !password || !name) {
    return res.status(400).json({ error: "All fields required" });
  }
  try {
    // Check if user already exists
    db.query(
      "SELECT * FROM astrology_users WHERE email = ?",
      [email],
      async (err, results) => {
        if (err) return res.status(500).json({ error: "DB error" });
        if (results.length > 0) {
          return res.status(409).json({ error: "User already exists" });
        }
        // Hash password
        const hash = await bcrypt.hash(password, 10);
        db.query(
          "INSERT INTO astrology_users (email, password_hash, name) VALUES (?, ?, ?)",
          [email, hash, name],
          (err, result) => {
            if (err) return res.status(500).json({ error: "DB error" });
            res.json({ message: "Signup successful" });
          }
        );
      }
    );
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "All fields required" });
  }
  try {
    db.query(
      "SELECT * FROM astrology_users WHERE email = ?",
      [email],
      async (err, results) => {
        if (err) return res.status(500).json({ error: "DB error" });
        if (results.length === 0) {
          return res.status(401).json({ error: "Invalid email or password" });
        }
        const user = results[0];
        const match = await bcrypt.compare(password, user.password_hash);
        if (!match) {
          return res.status(401).json({ error: "Invalid email or password" });
        }
        // Create JWT token
        const token = jwt.sign(
          { id: user.id, email: user.email, name: user.name },
          process.env.JWT_SECRET || "your_jwt_secret", // Use a strong secret in production!
          { expiresIn: "7d" }
        );
        res.json({
          message: "Login successful",
          token,
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
          },
        });
      }
    );
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

let moonSignCache = null;
let lastFetchDate = null;
let isFetchingMoonSign = false;

const fetchMoonSign = async () => {
  const today = new Date().toISOString().slice(0, 10);

  // ✅ If already cached for today, return it
  if (moonSignCache && lastFetchDate === today) {
    return moonSignCache;
  }

  // 🕒 If another request is already fetching, wait and retry
  if (isFetchingMoonSign) {
    for (let i = 0; i < 10; i++) {
      await new Promise((resolve) => setTimeout(resolve, 100)); // Wait 100ms
      if (moonSignCache && lastFetchDate === today) {
        return moonSignCache;
      }
    }
    return null; // Timed out waiting
  }

  isFetchingMoonSign = true;
  try {
    console.log("Calling Flask Panchang API...");
    const response = await fetch("http://127.0.0.1:5000/api/panchang");
    const data = await response.json();

    if (!data.moon_sign) throw new Error("moon_sign missing");

    moonSignCache = data.moon_sign;
    lastFetchDate = today;
    console.log("Moon sign fetched:", moonSignCache);
    return moonSignCache;
  } catch (error) {
    console.error("Error fetching moon sign:", error.message);
    return null;
  } finally {
    isFetchingMoonSign = false;
  }
};

app.post("/api/horoscope", async (req, res) => {
  const { rashi, category } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;
  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

  if (!rashi || !category)
    return res.status(400).json({ error: "Rashi and category are required" });

  if (!apiKey) {
    console.error("Google Gemini API key is missing");
    return res.status(500).json({ error: "Google Gemini API key is missing" });
  }

  try {
    // 1. Check MySQL cache
    const [rows] = await new Promise((resolve, reject) => {
      db.query(
        "SELECT horoscope FROM cached_horoscopes WHERE rashi = ? AND category = ? AND date = ?",
        [rashi, category, today],
        (err, result) => {
          if (err) return reject(err);
          resolve([result]);
        }
      );
    });

    if (rows.length > 0) {
      return res.json({ horoscope: rows[0].horoscope, cached: true });
    }

    const moonSign = await fetchMoonSign();
    if (!moonSign) {
      return res
        .status(500)
        .json({ error: "Moon sign could not be retrieved." });
    }

    const zodiacOrder = [
      "Aries",
      "Taurus",
      "Gemini",
      "Cancer",
      "Leo",
      "Virgo",
      "Libra",
      "Scorpio",
      "Sagittarius",
      "Capricorn",
      "Aquarius",
      "Pisces",
    ];
    const currentMoonIndex = zodiacOrder.indexOf(moonSign);
    const nativeMoonIndex = zodiacOrder.indexOf(rashi);
    const transitHouse = ((currentMoonIndex - nativeMoonIndex + 12) % 12) + 1;
    // 2. If not cached, call Gemini API
    const { GoogleGenerativeAI } = require("@google/generative-ai");
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const categoryPrompts = {
      health: `Focus on themes like physical well-being, diet, immunity, energy levels, and chronic issues.`,
      emotions: `Focus on inner feelings, subconscious patterns, emotional strength, and self-reflection.`,
      love: `Discuss love life, attraction, relationship bonding, compatibility, and romantic communication.`,
      career: `Talk about work ethics, communication at work, finances, recognition, and responsibilities.`,
      travel: `Mention short and long-distance travel, timing, delays, and outcomes of trips.`,
      luck: `Evaluate financial luck, divine favor, blessings, risks, or unplanned opportunities.`,
    };

    const extraContext = categoryPrompts[category.toLowerCase()] || "";

    const prompt = `You are a professional Vedic astrologer. Today's Moon is in ${moonSign}, transiting the ${transitHouse}th house from ${rashi}.
Write a daily ${category.toLowerCase()} horoscope for the zodiac sign ${rashi}, focusing on this Moon transit.
${extraContext}
Ensure the prediction is unique to the category, and concise (strictly 5 lines). Avoid using the word 'aspecting'.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    // 3. Store in MySQL cache
    await new Promise((resolve, reject) => {
      db.query(
        "INSERT INTO cached_horoscopes (rashi, category, date, horoscope) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE horoscope = VALUES(horoscope)",
        [rashi, category, today, text],
        (err) => {
          if (err) return reject(err);
          resolve();
        }
      );
    });

    res.json({ horoscope: text, cached: false });
  } catch (error) {
    console.error("Gemini API error:", error.message);
    res.status(500).json({ error: "Failed to fetch horoscope" });
  }
});

// Panchang proxy endpoint
app.get("/api/panchang", async (req, res) => {
  try {
    // You can pass date/location as query params if needed
    const { date, location } = req.query;
    const params = [];
    if (date) params.push(`date=${encodeURIComponent(date)}`);
    if (location) params.push(`location=${encodeURIComponent(location)}`);
    const url =
      "http://127.0.0.1:5000/api/panchang" +
      (params.length ? "?" + params.join("&") : "");

    const response = await axios.get(url);
    res.json(response.data);
  } catch (error) {
    console.error("Error fetching Panchang:", error.message);
    res.status(500).json({ error: "Failed to fetch Panchang" });
  }
});
app.post("/birth-details", async (req, res) => {
  const { name_input, date_input, time_input, user_id, latitude, longitude, location_input } = req.body;
  console.log("Received data:", req.body);

  try {
    // Check if the user already exists in the database
    const checkUserQuery = `
      SELECT * FROM birth_details 
      WHERE name = ? AND birth_date = ? AND birth_time = ? AND latitude = ? AND longitude = ? AND birth_place = ?
    `;
    const result = await new Promise((resolve, reject) => {
      db.query(
        checkUserQuery,
        [name_input, date_input, time_input, latitude, longitude, location_input],
        (err, result) => {
          if (err) return reject(err);
          resolve(result);
        }
      );
    });

    if (result.length > 0) {
      // 1. Get the original birthId
      const originalBirthId = result[0].id;
      const kundaliExists = await new Promise((resolve, reject) => {
        db.query(
          "SELECT * FROM kundalis WHERE user_id = ? AND name_input = ? AND date_input = ? AND time_input = ? AND latitude = ? AND longitude = ? AND location_input = ?",
          [user_id, name_input, date_input, time_input, latitude, longitude, location_input],
          (err, rows) => {
            if (err) return reject(err);
            resolve(rows.length > 0);
          }
        );
      });

      // 3. If not, insert into kundalis table
      if (!kundaliExists) {
        await new Promise((resolve, reject) => {
          db.query(
            "INSERT INTO kundalis (user_id, name_input, date_input, time_input, latitude, longitude, location_input) VALUES (?, ?, ?, ?, ?, ?, ?)",
            [user_id, name_input, date_input, time_input, latitude, longitude, location_input],
            (err) => {
              if (err) return reject(err);
              resolve();
            }
          );
        });
      }

      // 4. Return the existing birthId (no data copy!)
      const axiosResponse = await axios.get(
        `http://localhost:4000/user-data/${originalBirthId}`
      );
      return res.status(200).json(axiosResponse.data);
    } else {
      // Send only coordinates to Flask API
      const response = await axios.post("http://localhost:5000/api/data", {
        date_input,
        time_input,
        latitude,
        longitude,
      });

      const apiData = response.data;

      // Insert into birth_details (store location and coordinates)
      const birthQuery = `
        INSERT INTO birth_details (name, birth_date, birth_time, user_id, latitude, longitude, birth_place) 
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;
      const birthResult = await new Promise((resolve, reject) => {
        db.query(
          birthQuery,
          [name_input, date_input, time_input, user_id, latitude, longitude, location_input],
          (err, result) => {
            if (err) return reject(err);
            resolve(result);
          }
        );
      });

      const birthId = birthResult.insertId;
      await new Promise((resolve, reject) => {
        db.query(
          "INSERT INTO kundalis (user_id, name_input, date_input, time_input, latitude, longitude, location_input) VALUES (?, ?, ?, ?, ?, ?, ?)",
          [user_id, name_input, date_input, time_input, latitude, longitude, location_input],
          (err) => {
            if (err) return reject(err);
            resolve();
          }
        );
      }); const aksha = apiData.akshadva.akshadva;
      const ascSign = apiData.ascendant.ascendant_sign;
      const ascDegree = apiData.ascendant.ascendant_degree;
      const ascNakshatra = apiData.ascendant.ascendant_nakshatra;
      const ascNakshatraLord = apiData.ascendant.ascendant_nakshatra_lord;

      // Insert into akshadva
      const akshadvaQuery = `
    INSERT INTO akshadva 
    (birth_id, gan, karan, nadi, nakshatra_charan, name_alphabet, paksha, paya, sign, tatva, tithi, varna, vashya, yoga, yoni, ascendant_sign, ascendant_degree, ascendant_nakshatra, ascendant_nakshatra_lord)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?,?)
  `;
      const akshadvaValues = [
        birthId,
        aksha["Gan"],
        aksha["Karan"],
        aksha["Nadi"],
        aksha["Nakshatra-Charan"],
        aksha["Name-Alphabet"],
        aksha["Paksha"],
        aksha["Paya"],
        aksha["Sign"],
        aksha["Tatva"],
        aksha["Tithi"],
        aksha["Varna"],
        aksha["Vashya"],
        aksha["Yoga"],
        aksha["Yoni"],

        ascSign,
        ascDegree,
        ascNakshatra,
        ascNakshatraLord,
      ];
      await new Promise((resolve, reject) => {
        db.query(akshadvaQuery, akshadvaValues, (err) => {
          if (err) return reject(err);
          resolve();
        });
      });

      // Insert planetary data
      const planetInsertQuery = `
  INSERT INTO planetary_data 
  (birth_id, planet_name, sign, house, degree_in_sign, strength, nakshatra, nakshatra_lord, baladi, jagrat, deeptadi, retrograde, combustion, functional_nature)
  VALUES ?
`;

      const planetValues = apiData["lagna-chart"].planets.map((p) => [
        birthId,
        p.planet,
        p.sign,
        p.house_number,
        p.degree_in_sign,
        p.strength,
        p.nakshatra,
        p.nakshatra_lord,
        p.baladi,
        p.jagrat,
        p.deeptadi,
        p.retrograde,
        p.combustion,
        p.functional_nature,
      ]);

      await new Promise((resolve, reject) => {
        db.query(planetInsertQuery, [planetValues], (err) => {
          if (err) return reject(err);
          resolve();
        });
      });

      const divisionalCharts = [
        {
          table: "navamsa_data",
          key: "navmasa",
          signKey: "Navamsa Sign",
          houseKey: "House",
        },
        {
          table: "dasamsa_data",
          key: "dasamsa",
          signKey: "Dasamsa Sign",
          houseKey: "House",
        },
        {
          table: "trimsamsa_data",
          key: "trimsamsa",
          signKey: "Trimsamsa Sign",
          houseKey: "House",
        },
        {
          table: "bhamsa_data",
          key: "bhamsa",
          signKey: "Bhamsa Sign",
          houseKey: "House",
        },
        {
          table: "drekkana_data",
          key: "drekkana",
          signKey: "Drekkana Sign",
          houseKey: "House",
        },
        {
          table: "shodasamsa_data",
          key: "shodasamsa",
          signKey: "Shodasamsa Sign",
          houseKey: "House",
        },
        {
          table: "shashtiamsa_data",
          key: "shashtiamsa",
          signKey: "Shashtiamsa Sign",
          houseKey: "House",
        },
        {
          table: "saptamsa_data",
          key: "saptamsa",
          signKey: "Saptamsa Sign",
          houseKey: "House",
        },
        {
          table: "hora_data",
          key: "hora",
          signKey: "Hora Sign",
          houseKey: "House",
        },
        {
          table: "siddhamsa_data",
          key: "siddhamsa",
          signKey: "Siddhamsa Sign",
          houseKey: "House",
        },
        {
          table: "dvadasamsa_data",
          key: "dvadasamsa",
          signKey: "Dvadasamsa Sign",
          houseKey: "House",
        },
        {
          table: "chaturthamsa_data",
          key: "chaturthamsa",
          signKey: "Chaturthamsa Sign",
          houseKey: "House",
        },
        {
          table: "vimsamsa_data",
          key: "vimsamsa",
          signKey: "Vimsamsa Sign",
          houseKey: "House",
        },
        {
          table: "chatvarimsamsa_data",
          key: "chatvarimsamsa",
          signKey: "Chatvarimsamsa Sign",
          houseKey: "House",
        },
      ];
      // Handle divisional charts (same process for all charts)
      const chartInsertPromises = divisionalCharts.map((chart) => {
        const chartData = apiData[chart.key];
        if (!chartData) return Promise.resolve();

        const values = Object.entries(chartData).map(([planet, data]) => [
          birthId,
          planet,
          data[chart.signKey]?.trim(),
          data[chart.houseKey],
        ]);

        const insertQuery = `
          INSERT INTO ${chart.table} 
          (birth_id, planet_name, ${chart.table.split("_")[0]}_sign, ${chart.table.split("_")[0]
          }_house)
          VALUES ?
        `;
        return new Promise((resolve, reject) => {
          db.query(insertQuery, [values], (err) => {
            if (err) {
              console.error(`Error saving ${chart.key} data:`, err);
              reject(`Failed to save ${chart.key} data`);
            } else {
              resolve();
            }
          });
        });
      });

      await Promise.all(chartInsertPromises);

      const karakas = apiData["karakas"];
      const karakasQuery = `
        INSERT INTO karakas 
        (birth_id, karaka_type,planet_name, karaka_sign)
        VALUES ?
      `;
      const karakasValues = Object.entries(karakas)
        .filter(([_, data]) => data["planet"] && data["sign"]) // ✅ check actual keys
        .map(([karakaType, data]) => [
          birthId,
          karakaType, // Atma Karaka, Amatya Karaka, etc.
          String(data["planet"]),
          String(data["sign"]),
        ]);

      await new Promise((resolve, reject) => {
        db.query(karakasQuery, [karakasValues], (err) => {
          if (err) {
            console.error("Error saving karakas data:", err);
            reject("Failed to save karakas data");
          } else {
            resolve();
          }
        });
      });

      const houseKeys = [
        "first_house",
        "second_house",
        "third_house",
        "fourth_house",
        "fifth_house",
        "sixth_house",
        "seventh_house",
        "eighth_house",
        "ninth_house",
        "tenth_house",
        "eleventh_house",
        "twelfth_house",
      ];

      const insertHouseDataPromises = houseKeys.map((key, index) => {
        const houseData = apiData[key];
        if (!houseData) return Promise.resolve(); // skip if missing

        // Dynamically access field names from JSON
        const planetsInHouse = houseData[`planets_in_${key}`] || [];
        const planetsAspecting = (
          houseData[`planets_aspecting_${key}`] || []
        ).map((p) => p.planet);

        const values = [
          [
            birthId,
            index + 1, // 1 to 12 for house_number
            houseData[`${key}_lord`]?.planet || null,
            houseData[`${key}_sign`] || null,
            houseData.interpretation || null,
            planetsInHouse.length > 0 ? planetsInHouse.join(", ") : "None",
            planetsAspecting.length > 0 ? planetsAspecting.join(", ") : "None",
          ],
        ];

        const insertQuery = `
          INSERT INTO houses 
          (birth_id, house_number, house_lord_name, house_sign, interpretation, planets_in_house, planets_aspecting)
          VALUES ?
        `;

        return new Promise((resolve, reject) => {
          db.query(insertQuery, [values], (err) => {
            if (err) {
              console.error(`Error saving ${key}:`, err);
              reject(`Failed to save ${key}`);
            } else {
              resolve();
            }
          });
        });
      });

      await Promise.all(insertHouseDataPromises);

      // Insert Dasha and Antardasha data
      const dashaInsertQuery = `
  INSERT INTO dasha_data (
    birth_id, maha_dasha, start_date, end_date, antar_dasha, antar_start_date, antar_end_date
  )
  VALUES ?
`;

      // Map the data to match the expected insert structure
      const dashaValues = apiData.vimshottari_dasha.flatMap((dasha) => {
        // Extracting the Maha Dasha details
        const mahaDasha = dasha["Dasha Lord"];
        const mahaStartDate = dasha["Start Date"];
        const mahaEndDate = dasha["End Date"];

        // Map over Antardashas and create insertable values
        return dasha.Antardashas.map((antarDasha) => [
          birthId, // assuming birthId is defined elsewhere
          mahaDasha, // Dasha Lord (Maha Dasha)
          mahaStartDate, // Start Date of Dasha
          mahaEndDate, // End Date of Dasha
          antarDasha["Antardasha Lord"], // Antar Dasha Lord
          antarDasha["Start Date"], // Antar Start Date
          antarDasha["End Date"], // Antar End Date
        ]);
      });

      // Insert the values into the database
      await new Promise((resolve, reject) => {
        db.query(dashaInsertQuery, [dashaValues], (err) => {
          if (err) {
            console.error("Error saving dasha data:", err);
            reject("Failed to save dasha data");
          } else {
            resolve();
          }
        });
      });
      // Helper to convert "November 03, 2014" → "2014-11-03"
      const formatDateToMySQL = (dateString) => {
        if (!dateString) return null;
        const date = new Date(dateString);
        if (isNaN(date)) return null;
        return date.toISOString().split("T")[0];
      };

      const sadesati = apiData.sade_sati_panoti.map((sade) => [
        birthId,
        sade.phase || null,
        sade.sign || null,
        formatDateToMySQL(sade.start),
        formatDateToMySQL(sade.end),
      ]);

      const sadesatiQuery = `
  INSERT INTO sade_sati_panoti (birth_id, phase,sign, start_date, end_date)
  VALUES ?
  ON DUPLICATE KEY UPDATE end_date = VALUES(end_date)
`;

      await new Promise((resolve, reject) => {
        db.query(sadesatiQuery, [sadesati], (err) => {
          if (err) {
            console.error("Error saving sadesati data:", err);
            reject("Failed to save sadesati data");
          } else {
            resolve();
          }
        });
      });

      const gocharInsertQuery = `
      INSERT INTO gochar_data 
      (birth_id, planet_name, sign, house, degree_in_sign, retrograde)
      VALUES ?
    `;

      const gocharValues = apiData["gochar_chart"].map((p) => [
        birthId,
        p.Planet,
        p.Sign,
        p.House,
        p.Degree,
        p.Retrograde,
      ]);

      await new Promise((resolve, reject) => {
        db.query(gocharInsertQuery, [gocharValues], (err) => {
          if (err) return reject(err);
          resolve();
        });
      });

      const moonLagnaInsertQuery = `
  INSERT INTO moon_lagna_data 
  (birth_id, planet_name, sign, house, degree_in_sign, retrograde)
  VALUES ?
`;

      // Map moon_lagna_chart.planets data to insert values array
      const moonLagnaValues = apiData["moon_lagna_chart"].planets.map((p) => [
        birthId,
        p.planet, // lowercase 'planet' from API
        p.sign, // 'sign' from API
        p.house_number, // 'house_number' from API
        p.degree_in_sign, // 'degree_in_sign' from API
        p.retrograde, // boolean 'retrograde' from API
      ]);

      await new Promise((resolve, reject) => {
        db.query(moonLagnaInsertQuery, [moonLagnaValues], (err) => {
          if (err) return reject(err);
          resolve();
        });
      });

      const sunLagnaInsertQuery = `
  INSERT INTO sun_lagna_data 
  (birth_id, planet_name, sign, house, degree_in_sign, retrograde)
  VALUES ?
`;

      // Map sun_lagna_chart.planets data to insert values array
      const sunLagnaValues = apiData["sun_lagna_chart"].planets.map((p) => [
        birthId,
        p.planet,
        p.sign,
        p.house_number,
        p.degree_in_sign,
        p.retrograde,
      ]);

      await new Promise((resolve, reject) => {
        db.query(sunLagnaInsertQuery, [sunLagnaValues], (err) => {
          if (err) return reject(err);
          resolve();
        });
      });

      const bhavCuspInsertQuery = `
  INSERT INTO bhav_cusp
  (birth_id, house, planet_name, sign, sign_lord, star_lord, sub_lord)
  VALUES ?
`;

      // Map the bhav_chalit_chart array to insert-ready array of arrays
      const bhavCuspValues = apiData["bhav_chalit_chart"].map((item) => [
        birthId, // your birth record ID
        item.Cusp, // number
        item.Planet, // string
        item.Sign, // string
        item["Sign Lord"], // string (note the space, so bracket notation)
        item["Star Lord"], // string
        item["Sub Lord"], // string
      ]);

      await new Promise((resolve, reject) => {
        db.query(bhavCuspInsertQuery, [bhavCuspValues], (err) => {
          if (err) return reject(err);
          resolve();
        });
      });

      function saveGemstonesToDb(birthId, apiData, db) {
        return new Promise(async (resolve, reject) => {
          try {
            // Prepare insert queries
            const fortuneQuery = `
        INSERT INTO fortune_stones
        (birth_id, description, gem, how_to_wear, mantra)
        VALUES ?
      `;

            const lifeQuery = `
        INSERT INTO life_stones
        (birth_id, description, gem, how_to_wear, mantra)
        VALUES ?
      `;

            const luckyQuery = `
        INSERT INTO lucky_stones
        (birth_id, description, gem, how_to_wear, mantra)
        VALUES ?
      `;

            // Extract gemstone data
            const fortune = apiData.gemstones?.fortune_stone;
            const fortuneValues = fortune
              ? [
                [
                  birthId,
                  fortune.description || "",
                  fortune.gem || "",
                  fortune.how_to_wear || null,
                  fortune.mantra || null,
                ],
              ]
              : [];

            const life = apiData.gemstones?.life_stone;
            const lifeValues = life
              ? [
                [
                  birthId,
                  life.description || "",
                  life.gem || "",
                  life.how_to_wear || null,
                  life.mantra || null,
                ],
              ]
              : [];

            const luckyArray = apiData.gemstones?.lucky_stones || [];
            const luckyValues = luckyArray.map((lucky) => [
              birthId,
              lucky.description || "",
              lucky.gem || "",
              lucky.how_to_wear || null,
              lucky.mantra || null,
            ]);

            // Insert fortune stone if present
            if (fortuneValues.length > 0) {
              await new Promise((res, rej) => {
                db.query(fortuneQuery, [fortuneValues], (err) => {
                  if (err) return rej(err);
                  res();
                });
              });
            }

            // Insert life stone if present
            if (lifeValues.length > 0) {
              await new Promise((res, rej) => {
                db.query(lifeQuery, [lifeValues], (err) => {
                  if (err) return rej(err);
                  res();
                });
              });
            }

            // Insert lucky stones if present
            if (luckyValues.length > 0) {
              await new Promise((res, rej) => {
                db.query(luckyQuery, [luckyValues], (err) => {
                  if (err) return rej(err);
                  res();
                });
              });
            }

            console.log("Gemstones saved successfully");
            resolve();
          } catch (error) {
            console.error("Failed to save gemstones:", error);
            reject(error);
          }
        });
      }
      if (apiData.gemstones) {
        await saveGemstonesToDb(birthId, apiData, db);
      }

      const interpretationValues = [];

      for (const [key, value] of Object.entries(apiData)) {
        if (key.endsWith("_interpretation") && value) {
          const planet = key.replace("_interpretation", "").toUpperCase(); // e.g., "ketu" → "KETU"
          interpretationValues.push([birthId, planet, value]);
        }
      }

      if (interpretationValues.length > 0) {
        const interpretationQuery = `
          INSERT INTO planet_interpretations
          (birth_id, planet_name, interpretation)
          VALUES ?
        `;

        await new Promise((resolve, reject) => {
          db.query(interpretationQuery, [interpretationValues], (err) => {
            if (err) {
              console.error("Error saving planet interpretations:", err);
              reject("Failed to save interpretations");
            } else {
              resolve();
            }
          });
        });
      }

      const bavInsertQuery = `
  INSERT INTO bhinnashtakvarga (
    birth_id, bav_planet, rashi, ascendant, jupiter, mars, mercury,
    moon, saturn, sun, venus, total
  ) VALUES ?
`;

      const bavValues = [];
      const bavPlanets = [
        "sun_ashtakavarga",
        "moon_ashtakavarga",
        "mars_ashtakavarga",
        "mercury_ashtakavarga",
        "jupiter_ashtakavarga",
        "venus_ashtakavarga",
        "saturn_ashtakavarga",
      ];

      bavPlanets.forEach((key) => {
        const rashiArray = apiData[key]?.[0]; // Get the array of 12 rashis
        const planet = key.split("_")[0]; // e.g., "sun" from "sun_ashtakavarga"

        if (Array.isArray(rashiArray)) {
          rashiArray.forEach((item) => {
            bavValues.push([
              birthId,
              planet,
              item.Rashi || "",
              item.Ascendant || 0,
              item.Jupiter || 0,
              item.Mars || 0,
              item.Mercury || 0,
              item.Moon || 0,
              item.Saturn || 0,
              item.Sun || 0,
              item.Venus || 0,
              item.Total || 0,
            ]);
          });
        }
      });

      if (bavValues.length > 0) {
        await new Promise((resolve, reject) => {
          db.query(bavInsertQuery, [bavValues], (err) => {
            if (err) {
              console.error("Error inserting Bhinnashtakvarga:", err);
              return reject(err);
            }
            resolve();
          });
        });
      }
      const sarvaQuery = `
  INSERT INTO sarvashtakavarga_total (birth_id, sign, value)
  VALUES ?
`;

      const sarvaData = apiData.sarvashtakavarga_total || [];

      const sarvaValues = sarvaData.map((item) => [
        birthId,
        item.sign || "",
        item.value || 0,
      ]);

      if (sarvaValues.length > 0) {
        await new Promise((resolve, reject) => {
          db.query(sarvaQuery, [sarvaValues], (err) => {
            if (err) {
              console.error("Error inserting sarvashtakavarga_total:", err);
              return reject(err);
            }
            resolve();
          });
        });
      }

      return res.status(200).json({
        message: "All data inserted successfully",
        data: {
          birth_id: birthId,
          akshadva: aksha,
          ascendant_sign: ascSign,
          planets: apiData.planets,
          navamsa: apiData.navamsa,
        },
      });
    }
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({ error: "An error occurred" });
  }
});
app.get("/user-data/:birthId", authenticate, async (req, res) => {
  const { birthId } = req.params;

  try {
    // Fetch birth details from the database
    const birthDetailsQuery = `SELECT * FROM birth_details WHERE id = ?`;
    const birthDetails = await new Promise((resolve, reject) => {
      db.query(birthDetailsQuery, [birthId], (err, result) => {
        if (err) return reject(err);
        resolve(result);
      });
    });

    if (birthDetails.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    // Fetch the associated Akshadva data
    const akshadvaQuery = `SELECT * FROM akshadva WHERE birth_id = ?`;
    const akshadvaData = await new Promise((resolve, reject) => {
      db.query(akshadvaQuery, [birthId], (err, result) => {
        if (err) return reject(err);
        resolve(result);
      });
    });

    // Fetch the associated planetary data
    const planetQuery = `SELECT * FROM planetary_data WHERE birth_id = ?
    ORDER BY FIELD(planet_name, 'Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu')`;
    const planetData = await new Promise((resolve, reject) => {
      db.query(planetQuery, [birthId], (err, result) => {
        if (err) return reject(err);
        resolve(result);
      });
    });

    // Fetch divisional chart data
    const divisionalCharts = [
      { table: "navamsa_data", key: "navamsa" },
      { table: "dasamsa_data", key: "dasamsa" },
      { table: "bhamsa_data", key: "bhamsa" },
      { table: "drekkana_data", key: "drekkana" },
      { table: "shodasamsa_data", key: "shodasamsa" },
      { table: "shashtiamsa_data", key: "shashtiamsa" },
      { table: "saptamsa_data", key: "saptamsa" },
      { table: "hora_data", key: "hora" },
      { table: "siddhamsa_data", key: "siddhamsa" },
      { table: "dvadasamsa_data", key: "dvadasamsa" },
      { table: "chaturthamsa_data", key: "chaturthamsa" },
      { table: "vimsamsa_data", key: "vimsamsa" },
      { table: "chatvarimsamsa_data", key: "chatvarimsamsa" },
      { table: "trimsamsa_data", key: "trimsamsa" },
      // Add other divisional charts as necessary
    ];

    const divisionalChartDataPromises = divisionalCharts.map((chart) => {
      const query = `SELECT * FROM ${chart.table} WHERE birth_id = ?`;
      return new Promise((resolve, reject) => {
        db.query(query, [birthId], (err, data) => {
          if (err) return reject(err);
          resolve({ [chart.key]: data });
        });
      });
    });

    const divisionalChartResults = await Promise.all(
      divisionalChartDataPromises
    );
    const divisionalChartData = divisionalChartResults.reduce((acc, result) => {
      return { ...acc, ...result };
    }, {});

    const karakasQuery = `SELECT * FROM karakas WHERE birth_id=?
    `;
    const karakasData = await new Promise((resolve, reject) => {
      db.query(karakasQuery, [birthId], (err, result) => {
        if (err) return reject(err);
        resolve(result);
      });
    });

    const houseKeys = [
      "first_house",
      "second_house",
      "third_house",
      "fourth_house",
      "fifth_house",
      "sixth_house",
      "seventh_house",
      "eighth_house",
      "ninth_house",
      "tenth_house",
      "eleventh_house",
      "twelfth_house",
    ];
    const houseDataPromises = houseKeys.map((key, index) => {
      const query = `SELECT * FROM houses WHERE birth_id = ? AND house_number = ?`;
      return new Promise((resolve, reject) => {
        db.query(query, [birthId, index + 1], (err, data) => {
          if (err) return reject(err);

          // Debug: Log each response
          console.log(`Data for ${key}:`, data);
          resolve({ [key]: data[0] || {} }); // Handle case when data is empty
        });
      });
    });
    const houseData = await Promise.all(houseDataPromises);

    const interpretation = `SELECT * FROM planet_interpretations
WHERE birth_id = ?
ORDER BY FIELD(planet_name, 'Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu');
`;
    const planetInterData = await new Promise((resolve, reject) => {
      db.query(interpretation, [birthId], (err, result) => {
        if (err) return reject(err);
        resolve(result);
      });
    });

    const gocharDataQuery = `SELECT * FROM gochar_data WHERE birth_id = ?`;
    const gocharData = await new Promise((resolve, reject) => {
      db.query(gocharDataQuery, [birthId], (err, result) => {
        if (err) return reject(err);
        resolve(result);
      });
    });

    const bhavCuspQuery = `SELECT * FROM bhav_cusp WHERE birth_id = ?`;
    const bhavCuspData = await new Promise((resolve, reject) => {
      db.query(bhavCuspQuery, [birthId], (err, result) => {
        if (err) return reject(err);
        resolve(result);
      });
    });

    const moonLagnaQuery = `SELECT * FROM moon_lagna_data WHERE birth_id = ?`;
    const moonLagnaData = await new Promise((resolve, reject) => {
      db.query(moonLagnaQuery, [birthId], (err, result) => {
        if (err) return reject(err);
        resolve(result);
      });
    });
    const sunLagnaQuery = `SELECT * FROM sun_lagna_data WHERE birth_id = ?`;
    const sunLagnaData = await new Promise((resolve, reject) => {
      db.query(sunLagnaQuery, [birthId], (err, result) => {
        if (err) return reject(err);
        resolve(result);
      });
    });

    const dashaDataQuery = `
  SELECT * 
  FROM dasha_data 
  WHERE birth_id = ? 

`;

    // Using Promise to handle async query execution
    const dashaData = await new Promise((resolve, reject) => {
      db.query(dashaDataQuery, [birthId], (err, result) => {
        if (err) return reject(err);
        resolve(result);
      });
    });
    const sadeSatiQuery = `
    SELECT * 
    FROM sade_sati_panoti 
    WHERE birth_id = ? 
    ORDER BY start_date ASC
  `;

    const sadeSatiData = await new Promise((resolve, reject) => {
      db.query(sadeSatiQuery, [birthId], (err, result) => {
        if (err) return reject(err);
        resolve(result);
      });
    });

    const bhinnashtakvargaQuery = `
    SELECT * FROM bhinnashtakvarga WHERE birth_id = ?
  `;
    const bhinnashtakvargaData = await new Promise((resolve, reject) => {
      db.query(bhinnashtakvargaQuery, [birthId], (err, result) => {
        if (err) return reject(err);
        resolve(result);
      });
    });
    const sarvashtakavargaQuery = `
    SELECT * FROM sarvashtakavarga_total WHERE birth_id = ?
    `;
    const sarvashtakavargaData = await new Promise((resolve, reject) => {
      db.query(sarvashtakavargaQuery, [birthId], (err, result) => {
        if (err) return reject(err);
        resolve(result);
      });
    });

    const getPlanetAvastha = async (birthId) => {
      return new Promise((resolve, reject) => {
        const query = `
      SELECT planet_name, baladi, jagrat, deeptadi 
      FROM planetary_data 
      WHERE birth_id = ?`;

        db.query(query, [birthId], (err, results) => {
          if (err) return reject(err);
          resolve(results);
        });
      });
    };

    const planetaryAvasthaQuery = `
  SELECT planet_name, baladi, jagrat, deeptadi 
  FROM planetary_data 
  WHERE birth_id = ?
`;

    const planetaryAvasthaData = await new Promise((resolve, reject) => {
      db.query(planetaryAvasthaQuery, [birthId], (err, result) => {
        if (err) return reject(err);
        resolve(result);
      });
    });

    const fortuneStonesQuery = `SELECT * FROM fortune_stones WHERE birth_id = ?`;
    const fortuneStones = await new Promise((resolve, reject) => {
      db.query(fortuneStonesQuery, [birthId], (err, result) => {
        if (err) return reject(err);
        resolve(result);
      });
    });

    const lifeStonesQuery = `SELECT * FROM life_stones WHERE birth_id = ?`;
    const lifeStones = await new Promise((resolve, reject) => {
      db.query(lifeStonesQuery, [birthId], (err, result) => {
        if (err) return reject(err);
        resolve(result);
      });
    });

    const luckyStonesQuery = `SELECT * FROM lucky_stones WHERE birth_id = ?`;
    const luckyStones = await new Promise((resolve, reject) => {
      db.query(luckyStonesQuery, [birthId], (err, result) => {
        if (err) return reject(err);
        resolve(result);
      });
    });

    // Combine all data and send the response
    return res.status(200).json({
      message: "User data retrieved successfully",
      data: {
        birthDetails: birthDetails[0],
        akshadva: akshadvaData,
        planets: planetData,
        sadesatipanoti: sadeSatiData,
        dasha: dashaData,
        gocharData: gocharData,
        karakas: karakasData,
        houses: houseData,
        aspects: houseData.map((house) => house[Object.keys(house)[0]]),
        // Spread the divisional chart data here
        ...divisionalChartData,
        planetInter: planetInterData,
        bhavCusp: bhavCuspData,
        moonLagna: moonLagnaData,
        sunLagna: sunLagnaData,
        bhinnashtakvarga: bhinnashtakvargaData,
        sarvashtakavarga: sarvashtakavargaData,
        planetaryAvastha: planetaryAvasthaData,
        fortuneStones: fortuneStones,
        lifeStones: lifeStones,
        luckyStones: luckyStones,
      },
    });
  } catch (err) {
    return res.status(500).json({ error: `Failed to fetch user data: ${err}` });
  }
});
app.get("/my-kundalis/:userId", authenticate, async (req, res) => {
  const { userId } = req.params;
  if (parseInt(userId) !== req.user.id) {
    return res.status(403).json({ error: "Forbidden" });
  }

  try {
    const query = `
      SELECT b.*, k.id as kundali_id
      FROM kundalis k
      JOIN birth_details b
        ON k.name_input = b.name
        AND k.date_input = b.birth_date
        AND k.time_input = b.birth_time
        AND k.location_input = b.birth_place
      WHERE k.user_id = ?
      ORDER BY k.created_at DESC
    `;
    db.query(query, [userId], (err, results) => {
      if (err) return res.status(500).json({ error: "Database error" });
      res.json({ kundalis: results });
    });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});
app.delete("/my-kundalis/:id", authenticate, (req, res) => {
  const { id } = req.params;

  db.query("DELETE FROM kundalis WHERE id = ?", [id], (err, result) => {
    if (err) return res.status(500).json({ error: "Database error" });
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Kundali not found" });
    }
    res.json({ message: "Kundali deleted successfully" });
  });
});

app.post("/ashtakoot-milan", async (req, res) => {
  try {
    const { boy, girl } = req.body;

    // Call your Flask API
    const flaskResponse = await axios.post(
      "http://localhost:5000/api/ashtakoot-milan",
      { boy, girl }
    );

    // Directly return the result to frontend
    return res.json({
      message: "Kundali Milan calculated successfully",
      milan: flaskResponse.data,
    });
  } catch (error) {
    console.error("Kundali Milan API error:", error);
    return res.status(500).json({ error: "Failed to fetch kundali milan" });
  }
});

app.listen(port, () => {
  console.log(`Node.js server running on http://localhost:${port}`);
});

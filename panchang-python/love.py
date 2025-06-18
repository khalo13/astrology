from flask import Flask, request, jsonify
from datetime import datetime
import pytz
import swisseph as swe
from geopy.geocoders import Nominatim
from timezonefinder import TimezoneFinder
import math
from datetime import date, timedelta
import os
from flask_cors import CORS
import traceback
from astral.sun import sun
from astral import LocationInfo
import sys
print("Python version:", sys.version)
print("pyswisseph version:", swe.__version__)


from collections import OrderedDict

swe.set_ephe_path(os.getcwd())

swe.set_sid_mode(swe.SIDM_LAHIRI)


swe.set_ephe_path(".")


nakshatra_list = [
    "Ashwini",
    "Bharani",
    "Krittika",
    "Rohini",
    "Mrigashirsha",
    "Ardra",
    "Punarvasu",
    "Pushya",
    "Ashlesha",
    "Magha",
    "Purva Phalguni",
    "Uttara Phalguni",
    "Hasta",
    "Chitra",
    "Swati",
    "Vishakha",
    "Anuradha",
    "Jyeshtha",
    "Mula",
    "Purva Ashadha",
    "Uttara Ashadha",
    "Shravana",
    "Dhanishta",
    "Shatabhisha",
    "Purva Bhadrapada",
    "Uttara Bhadrapada",
    "Revati",
]
nakshatra_lords = [
    "Ketu",
    "Venus",
    "Sun",
    "Moon",
    "Mars",
    "Rahu",
    "Jupiter",
    "Saturn",
    "Mercury",
    "Ketu",
    "Venus",
    "Sun",
    "Moon",
    "Mars",
    "Rahu",
    "Jupiter",
    "Saturn",
    "Mercury",
    "Ketu",
    "Venus",
    "Sun",
    "Moon",
    "Mars",
    "Rahu",
    "Jupiter",
    "Saturn",
    "Mercury",
]
signs = [
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
]
sign_lords_map = {
    "Aries": "Mars",
    "Taurus": "Venus",
    "Gemini": "Mercury",
    "Cancer": "Moon",
    "Leo": "Sun",
    "Virgo": "Mercury",
    "Libra": "Venus",
    "Scorpio": "Mars",
    "Sagittarius": "Jupiter",
    "Capricorn": "Saturn",
    "Aquarius": "Saturn",
    "Pisces": "Jupiter",
}
varna_map = {
    "Kshatriya": ["Aries", "Leo", "Sagittarius"],
    "Vaishya": ["Taurus", "Virgo", "Capricorn"],
    "Shudra": ["Gemini", "Libra", "Aquarius"],
    "Brahmin": ["Cancer", "Scorpio", "Pisces"],
}
vashya_map = {
    "Chatushpada": ["Aries", "Capricorn", "Leo"],
    "Dwipad": ["Gemini", "Virgo", "Libra", "Aquarius"],
    "Jalchar": ["Cancer", "Scorpio", "Pisces"],
    "Vanchar": ["Sagittarius"],
    "Keet": ["Taurus"],
}
planets = {
    "Sun": swe.SUN,
    "Moon": swe.MOON,
    "Mercury": swe.MERCURY,
    "Venus": swe.VENUS,
    "Mars": swe.MARS,
    "Jupiter": swe.JUPITER,
    "Saturn": swe.SATURN,
    "Rahu": swe.MEAN_NODE,
    "Ketu": swe.MEAN_NODE,  # We'll add 180 degrees for Ketu
}


def get_location_details(location):
    geolocator = Nominatim(user_agent="astro_app")
    loc = geolocator.geocode(location)
    if not loc:
        raise Exception("Location not found!")

    lat, lon = loc.latitude, loc.longitude
    tf = TimezoneFinder()
    timezone_str = tf.timezone_at(lat=lat, lng=lon)
    return lat, lon, timezone_str


def get_sign_name(index):
    signs = [
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
    ]
    return signs[index % 12]


ZODIAC_SIGNS = [
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
]


def get_akshadva_details(
    jd_ut, moon_longitude, moon_sign, moon_nakshatra, sun_longitude
):
    nak_index = int(moon_longitude // (13 + 1 / 3))
    charan = int((moon_longitude % (13 + 1 / 3)) // (3 + 1 / 3)) + 1
    nakshatra_name = nakshatra_list[nak_index]

    # 🌟 Varna
    varna_map = {
        "Ashwini": "Shudra",
        "Bharani": "Kshatriya",
        "Krittika": "Vaishya",
        "Rohini": "Brahmin",
        "Mrigashira": "Brahmin",
        "Ardra": "Shudra",
        "Punarvasu": "Shudra",
        "Pushya": "Brahmin",
        "Ashlesha": "Shudra",
        "Magha": "Shudra",
        "Purva Phalguni": "Kshatriya",
        "Uttara Phalguni": "Vaishya",
        "Hasta": "Brahmin",
        "Chitra": "Kshatriya",
        "Swati": "Shudra",
        "Vishakha": "Vaishya",
        "Anuradha": "Vaishya",
        "Jyeshtha": "Shudra",
        "Mula": "Shudra",
        "Purva Ashadha": "Kshatriya",
        "Uttara Ashadha": "Vaishya",
        "Shravana": "Shudra",
        "Dhanishta": "Shudra",
        "Shatabhisha": "Shudra",
        "Purva Bhadrapada": "Kshatriya",
        "Uttara Bhadrapada": "Vaishya",
        "Revati": "Brahmin",
    }
    varna = varna_map.get(moon_nakshatra, "Unknown")

    # 🐾 Vashya
    moon_sign_index = int(moon_longitude // 30)
    vashya_map = {
        0: "Chatushpad",
        1: "Vanishchara",
        2: "Human",
        3: "Jalchar",
        4: "Chatushpad",
        5: "Human",
        6: "Human",
        7: "Keet",
        8: "Chatushpad",
        9: "Vanachara",
        10: "Jalchar",
        11: "Jalchar",
    }
    vashya = vashya_map.get(moon_sign_index, "Unknown")

    # 🐘 Yoni
    yoni_map = {
        "Ashwini": "Horse",
        "Bharani": "Elephant",
        "Krittika": "Sheep",
        "Rohini": "Serpent",
        "Mrigashira": "Serpent",
        "Ardra": "Dog",
        "Punarvasu": "Cat",
        "Pushya": "Sheep",
        "Ashlesha": "Cat",
        "Magha": "Rat",
        "Purva Phalguni": "Rat",
        "Uttara Phalguni": "Cow",
        "Hasta": "Buffalo",
        "Chitra": "Tiger",
        "Swati": "Buffalo",
        "Vishakha": "Tiger",
        "Anuradha": "Deer",
        "Jyeshtha": "Deer",
        "Mula": "Dog",
        "Purva Ashadha": "Monkey",
        "Uttara Ashadha": "Mongoose",
        "Shravana": "Monkey",
        "Dhanishta": "Lion",
        "Shatabhisha": "Horse",
        "Purva Bhadrapada": "Lion",
        "Uttara Bhadrapada": "Cow",
        "Revati": "Elephant",
    }
    yoni = yoni_map.get(moon_nakshatra, "Unknown")

    # 👥 Gan
    gan_map = {
        "Ashwini": "Deva",
        "Bharani": "Manushya",
        "Krittika": "Rakshasa",
        "Rohini": "Manushya",
        "Mrigashira": "Deva",
        "Ardra": "Manushya",
        "Punarvasu": "Deva",
        "Pushya": "Deva",
        "Ashlesha": "Rakshasa",
        "Magha": "Rakshasa",
        "Purva Phalguni": "Manushya",
        "Uttara Phalguni": "Deva",
        "Hasta": "Deva",
        "Chitra": "Rakshasa",
        "Swati": "Deva",
        "Vishakha": "Rakshasa",
        "Anuradha": "Deva",
        "Jyeshtha": "Rakshasa",
        "Mula": "Rakshasa",
        "Purva Ashadha": "Manushya",
        "Uttara Ashadha": "Manushya",
        "Shravana": "Deva",
        "Dhanishta": "Rakshasa",
        "Shatabhisha": "Rakshasa",
        "Purva Bhadrapada": "Manushya",
        "Uttara Bhadrapada": "Manushya",
        "Revati": "Deva",
    }
    gan = gan_map.get(moon_nakshatra, "Unknown")

    # ⚡ Nadi
    nadi = ["Adi", "Madhya", "Antya"][nak_index % 3]

    # 🌗 Tithi
    tithi_num = math.floor(((moon_longitude - sun_longitude) % 360) / 12) + 1

    tithi_list = [
        "Pratipada",
        "Dvitiya",
        "Tritiya",
        "Chaturthi",
        "Panchami",
        "Shashti",
        "Saptami",
        "Ashtami",
        "Navami",
        "Dashami",
        "Ekadashi",
        "Dwadashi",
        "Trayodashi",
        "Chaturdashi",
        "Purnima",
        "Pratipada",
        "Dvitiya",
        "Tritiya",
        "Chaturthi",
        "Panchami",
        "Shashti",
        "Saptami",
        "Ashtami",
        "Navami",
        "Dashami",
        "Ekadashi",
        "Dwadashi",
        "Trayodashi",
        "Chaturdashi",
        "Amavasya",
    ]

    paksha = "Shukla" if tithi_num <= 15 else "Krishna"

    tithi_name = tithi_list[(tithi_num - 1) % 15]

    # 🌟 Yoga
    yoga_sum = (sun_longitude + moon_longitude) % 360
    yoga_index = int(yoga_sum // (13 + 1 / 3))
    yoga_names = [
        "Vishkumbha",
        "Preeti",
        "Ayushman",
        "Saubhagya",
        "Shobhana",
        "Atiganda",
        "Sukarma",
        "Dhriti",
        "Shoola",
        "Ganda",
        "Vriddhi",
        "Dhruva",
        "Vyaghata",
        "Harshana",
        "Vajra",
        "Siddhi",
        "Vyatipata",
        "Variyan",
        "Parigha",
        "Shiva",
        "Siddha",
        "Sadhya",
        "Shubha",
        "Shukla",
        "Brahma",
        "Indra",
        "Vaidhriti",
    ]
    yoga = yoga_names[yoga_index]

    # 🧱 Karan
    karan_index = (tithi_num * 2) % 60
    karan_names = [
        "Balaav",
        "Kaulav",
        "Taitil",
        "Gar",
        "Vanij",
        "Vishti",
        "Shakuni",
        "Chatushpada",
        "Naga",
        "Kimstughna",
    ]
    karan = karan_names[karan_index % len(karan_names)]

    # 🌊 Tatva
    tatva_map = {
        0: "Fire",  # Aries
        1: "Earth",  # Taurus
        2: "Air",  # Gemini
        3: "Water",  # Cancer
        4: "Fire",  # Leo
        5: "Earth",  # Virgo
        6: "Air",  # Libra
        7: "Water",  # Scorpio
        8: "Fire",  # Sagittarius
        9: "Earth",  # Capricorn
        10: "Air",  # Aquarius
        11: "Water",  # Pisces
    }

    # Use the moon_sign_index (derived from moon longitude or other means)
    tatva = tatva_map.get(moon_sign_index, "Unknown")
    # 💰 Paya
    paya_map = {
        0: "Copper",  # Aries
        1: "Silver",  # Taurus
        2: "Gold",  # Gemini
        3: "Iron",  # Cancer
        4: "Copper",  # Leo
        5: "Silver",  # Virgo
        6: "Gold",  # Libra
        7: "Iron",  # Scorpio
        8: "Copper",  # Sagittarius
        9: "Silver",  # Capricorn
        10: "Gold",  # Aquarius
        11: "Iron",  # Pisces
    }
    paya = paya_map.get(moon_sign_index, "Unknown")
    nakshatra_to_name_alphabet = {
        "Ashwini": "A",
        "Bharani": "Aa",
        "Krittika": "Ee",
        "Rohini": "O",
        "Mrigashira": "Ma",
        "Ardra": "Ka",
        "Punarvasu": "Ke",
        "Pushya": "Hu",
        "Ashlesha": "He",
        "Magha": "Ma",
        "Purva Phalguni": "Mo",
        "Uttara Phalguni": "Ta",
        "Hasta": "Pa",
        "Chitra": "Pe",
        "Swati": "Ra",
        "Vishakha": "Ri",
        "Anuradha": "Ru",
        "Jyeshtha": "Re",
        "Mula": "Ra",
        "Purva Ashadha": "La",
        "Uttara Ashadha": "Na",
        "Shravana": "Nu",
        "Dhanishta": "Ne",
        "Shatabhisha": "No",
        "Purva Bhadrapada": "Pa",
        "Uttara Bhadrapada": "Pu",
        "Revati": "De",
    }
    name_alphabet = nakshatra_to_name_alphabet.get(moon_nakshatra, "Unknown")

    # Name alphabet mapping based on Nakshatra and Charan
    name_alphabet_map = {
        "Ashwini": ["Chu", "Che", "Cho", "La"],
        "Bharani": ["Li", "Lu", "Le", "Lo"],
        "Krittika": ["A", "E", "U", "Ae"],
        "Rohini": ["O", "Va", "Vi", "Vu"],
        "Mrigashirsha": ["Ve", "Vo", "Ka", "Ki"],
        "Ardra": ["Ku", "Gha", "Nga", "Ca"],
        "Punarvasu": ["Ke", "Ko", "Ha", "Hi"],
        "Pushya": ["Hu", "He", "Ho", "Da"],
        "Ashlesha": ["Di", "Du", "De", "Do"],
        "Magha": ["Ma", "Mi", "Mu", "Me"],
        "Purva Phalguni": ["Mo", "Ta", "Ti", "Tu"],
        "Uttara Phalguni": ["Te", "To", "Pa", "Pi"],
        "Hasta": ["Pu", "Sha", "Na", "Tha"],
        "Chitra": ["Pe", "Po", "Ra", "Ri"],
        "Swati": ["Ru", "Re", "Ro", "Ta"],
        "Vishakha": ["Ti", "Tu", "Te", "To"],
        "Anuradha": ["Na", "Ni", "Nu", "Ne"],
        "Jyeshtha": ["No", "Ya", "Yi", "Yu"],
        "Mula": ["Ye", "Yo", "Ba", "Bi"],
        "Purva Ashadha": ["Bu", "Dha", "Pha", "Da"],
        "Uttara Ashadha": ["Be", "Bo", "Ja", "Ji"],
        "Shravana": ["Ju", "Je", "Jo", "Kha"],
        "Dhanishta": ["Ga", "Gi", "Gu", "Ge"],
        "Shatabhisha": ["Go", "Sa", "Si", "Su"],
        "Purva Bhadrapada": ["Se", "So", "Da", "Di"],
        "Uttara Bhadrapada": ["Du", "Tha", "Jha", "Na"],
        "Revati": ["De", "Do", "Cha", "Chi"],
    }

    # Determine the name alphabet based on Nakshatra and Charan
    name_alphabet = name_alphabet_map.get(nakshatra_name, ["Unknown"])[charan - 1]

    return {
        "Sign": moon_sign,
        "Nakshatra-Charan": f"{nakshatra_name} - Charan {charan}",
        "Varna": varna,
        "Vashya": vashya,
        "Yoni": yoni,
        "Gan": gan,
        "Nadi": nadi,
        "Tithi": f"{paksha} {tithi_name}",
        "Yoga": yoga,
        "Paksha": paksha,
        "Yoga": yoga,
        "Karan": karan,
        "Tatva": tatva,
        "Paya": paya,
        "Name-Alphabet": name_alphabet,
    }


def get_ascendant(jd_ut, lat, lon):
    swe.set_sid_mode(swe.SIDM_LAHIRI)  # Sidereal
    house_system = b"P"  # Placidus
    cusps, ascmc = swe.houses_ex(jd_ut, lat, lon, house_system, swe.FLG_SIDEREAL)
    asc_deg = ascmc[0]  # ASC degree
    asc_sign_index = int(asc_deg // 30)
    asc_sign = ZODIAC_SIGNS[asc_sign_index]
    asc_deg_in_sign = asc_deg % 30

    # Calculate nakshatra index (each nakshatra is 13°20' = 13.333...)
    nakshatra_degree = 13 + 1 / 3
    nakshatra_index = int(asc_deg // nakshatra_degree)
    nakshatra_name = nakshatra_list[nakshatra_index]
    nakshatra_lord = nakshatra_lords[nakshatra_index]

    return {
        "ascendant_degree": round(asc_deg_in_sign, 2),
        "ascendant_sign": asc_sign,
        "ascendant_longitude": asc_deg,
        "asc_sign_index": asc_sign_index,
        "ascendant_nakshatra": nakshatra_name,
        "ascendant_nakshatra_lord": nakshatra_lord,
    }


def get_house_number(planet_longitude, ascendant_longitude):
    asc_sign_index = int(ascendant_longitude // 30)  # Ascendant's sign index
    planet_sign_index = int(planet_longitude // 30)  # Planet's sign index
    house_number = (
        planet_sign_index - asc_sign_index
    ) % 12 + 1  # Calculate house number
    return house_number


def get_planet_data(jd_ut, lat, lon):
    swe.set_sid_mode(swe.SIDM_LAHIRI)
    results = []

    sun_longitude = swe.calc_ut(jd_ut, planets["Sun"], swe.FLG_SIDEREAL)[0][0]
    ascendant_data = get_ascendant(jd_ut, lat, lon)
    ascendant_longitude = ascendant_data["ascendant_longitude"]
    ascendant_sign = ascendant_data["ascendant_sign"]

    for name, planet in planets.items():
        pos = swe.calc_ut(jd_ut, planet, swe.FLG_SIDEREAL | swe.FLG_SPEED)[0]
        lon = pos[0]
        speed = pos[3]

        if name == "Ketu":
            lon = (lon + 180) % 360

        retrograde = speed < 0
        sign_index = int(lon // 30)
        sign = signs[sign_index]
        degree_in_sign = lon % 30
        nak_index = int(lon // (13 + 1 / 3))
        nakshatra = nakshatra_list[nak_index]
        nakshatra_lord = nakshatra_lords[nak_index]
        combustion = get_combustion_status(lon, sun_longitude, name)
        strength = get_strength_based_avastha(sign, name, degree_in_sign)
        jagrat, baladi, deeptadi = calculate_avastha(name, degree_in_sign, sign)
        house_number = get_house_number(lon, ascendant_longitude)

        results.append(
            {
                "planet": name,
                "sign": sign,
                "house_number": house_number,
                "degree_in_sign": round(degree_in_sign, 2),
                "longitude": round(lon, 2),
                "nakshatra": nakshatra,
                "nakshatra_lord": nakshatra_lord,
                "absolute_longitude": round(lon, 2),
                "retrograde": retrograde,
                "strength": strength,
                "combustion": combustion,
                "jagrat": jagrat,
                "baladi": baladi,
                "deeptadi": deeptadi,
                "functional_nature": None,  # Placeholder, to be updated below
            }
        )

    moon_data = next((p for p in results if p["planet"] == "Moon"), None)
    if not moon_data:
        raise ValueError("Moon data is missing from planetary calculations.")
    moon_phase = "waxing" if moon_data["longitude"] > sun_longitude else "waning"

    for entry in results:
        strength = entry["strength"]
        entry["functional_nature"] = determine_functional_nature(
            planet=entry["planet"],
            house=entry["house_number"],
            ascendant_sign=ascendant_sign,
            moon_phase=moon_phase if entry["planet"] == "Moon" else None,
        )

    return results


def get_bhav_chalit_chart(jd_ut, lat, lon, astro_data):
    """
    Generate the Bhav Chalit Chart data.

    Args:
        jd_ut (float): Julian Day in Universal Time.
        lat (float): Latitude of the location.
        lon (float): Longitude of the location.
        astro_data (list): List of planetary data.

    Returns:
        list: Bhav Chalit Chart data as a list of dictionaries.
    """
    cusp_details = get_cusp_details(jd_ut, lat, lon)
    bhav_chalit_chart = []

    # Iterate through astro_data and assign each planet to a cusp
    for planet_data in astro_data:
        planet_name = planet_data["planet"]
        planet_longitude = planet_data["absolute_longitude"]
        sign = planet_data["sign"]
        sign_lord = sign_lords_map[sign]
        star_lord = planet_data["nakshatra_lord"]
        sub_lord = get_sub_lord(planet_longitude)

        # Determine the cusp number based on BPHS rules
        cusp_number = 0
        for i, cusp in enumerate(cusp_details):
            next_cusp_degree = cusp_details[(i + 1) % 12][
                "Degree"
            ]  # Wrap around for the 12th cusp
            if cusp["Degree"] <= planet_longitude < next_cusp_degree:
                cusp_number = cusp["Cusp"]
                break
            elif (
                cusp["Degree"] > next_cusp_degree
            ):  # Handle cusp wrapping (e.g., 29° Pisces to 0° Aries)
                if (
                    planet_longitude >= cusp["Degree"]
                    or planet_longitude < next_cusp_degree
                ):
                    cusp_number = cusp["Cusp"]
                    break

        # Append the planet details with the cusp number
        bhav_chalit_chart.append(
            {
                "Planet": planet_name,
                "Cusp": cusp_number,
                "Sign": sign,
                "Sign Lord": sign_lord,
                "Star Lord": star_lord,
                "Sub Lord": sub_lord,
            }
        )

    return bhav_chalit_chart


def get_combustion_status(planet_longitude, sun_longitude, planet_name):
    distance = abs(planet_longitude - sun_longitude) % 360
    if planet_name == "Mercury" and distance <= 14:
        if distance <= 3:
            return "Highly Combust"
        elif distance >= 3 and distance <= 14:
            return "Combust"
    elif planet_name == "Venus" and distance <= 10:
        return "Combust"
    elif planet_name in ["Mars", "Jupiter", "Saturn"] and distance <= 8:
        return "Combust"
    elif planet_name == "Moon" and distance <= 12:
        return "Combust"
    else:
        return "Not Combust"


def get_strength_based_avastha(sign, planet_name, degree_in_sign):

    sign_lords = {
        "Aries": "Mars",
        "Taurus": "Venus",
        "Gemini": "Mercury",
        "Cancer": "Moon",
        "Leo": "Sun",
        "Virgo": "Mercury",
        "Libra": "Venus",
        "Scorpio": "Mars",
        "Sagittarius": "Jupiter",
        "Capricorn": "Saturn",
        "Aquarius": "Saturn",
        "Pisces": "Jupiter",
    }

    exalted_signs = {
        "Sun": "Aries",
        "Moon": "Taurus",
        "Mars": "Capricorn",
        "Mercury": "Virgo",
        "Jupiter": "Cancer",
        "Venus": "Pisces",
        "Saturn": "Libra",
        "Rahu": "Taurus",
        "Ketu": "Scorpio",
    }
    debilitated_signs = {
        "Sun": "Libra",
        "Moon": "Scorpio",
        "Mars": "Cancer",
        "Mercury": "Pisces",
        "Jupiter": "Capricorn",
        "Venus": "Virgo",
        "Saturn": "Aries",
        "Rahu": "Scorpio",
        "Ketu": "Taurus",
    }
    mooltrikona_signs = {
        "Sun": (120, 130),  # Leo: 120° to 130°
        "Moon": (30, 40),  # Taurus: 30° to 40°
        "Mars": (0, 12),  # Aries: 0° to 12°
        "Mercury": (165, 180),  # Virgo: 165° to 180°
        "Jupiter": (240, 255),  # Sagittarius: 240° to 255°
        "Venus": (180, 195),  # Libra: 180° to 195°
        "Saturn": (300, 315),  # Aquarius: 300° to 315°
    }

    own_signs = {
        "Sun": ["Leo"],
        "Moon": ["Cancer"],
        "Mars": ["Aries", "Scorpio"],
        "Mercury": ["Gemini", "Virgo"],
        "Jupiter": ["Sagittarius", "Pisces"],
        "Venus": ["Taurus", "Libra"],
        "Saturn": ["Capricorn", "Aquarius"],
        "Rahu": [],
        "Ketu": [],
    }

    permanent_friends = {
        "Sun": ["Moon", "Mars", "Jupiter"],
        "Moon": ["Sun", "Mercury"],
        "Mars": ["Sun", "Moon", "Jupiter"],
        "Mercury": ["Sun", "Venus"],
        "Jupiter": ["Sun", "Moon", "Mars"],
        "Venus": ["Mercury", "Saturn"],
        "Saturn": ["Mercury", "Venus"],
        "Rahu": ["Venus", "Saturn", "Mercury"],
        "Ketu": ["Mars", "Venus", "Saturn"],
    }

    permanent_neutrals = {
        "Sun": ["Mercury"],
        "Moon": ["Mars", "Jupiter", "Venus", "Saturn"],
        "Mars": ["Venus", "Saturn"],
        "Mercury": ["Mars", "Jupiter", "Saturn"],
        "Jupiter": ["Saturn"],
        "Venus": ["Mars", "Jupiter"],
        "Saturn": ["Jupiter"],
        "Rahu": ["Jupiter", "Mars"],
        "Ketu": ["Jupiter", "Mercury"],
    }

    permanent_enemies = {
        "Sun": ["Venus", "Saturn"],
        "Moon": [],
        "Mars": ["Mercury"],
        "Mercury": ["Moon"],
        "Jupiter": ["Mercury", "Venus"],
        "Venus": ["Sun", "Moon"],
        "Saturn": ["Sun", "Moon", "Mars"],
        "Rahu": ["Sun", "Moon"],
        "Ketu": ["Sun", "Moon"],
    }

    # Get the lord of the sign the planet is in
    sign_lord = sign_lords.get(sign)

    # Step 1: Check Exaltation
    if sign == exalted_signs.get(planet_name, ""):
        return "Exalted"
    if sign == debilitated_signs.get(planet_name, ""):
        return "Debilitated"

    # Step 2: Check Mooltrikona
    mooltrikona_range = mooltrikona_signs.get(planet_name, None)
    if (
        mooltrikona_range
        and sign == sign_lords.get(sign)
        and mooltrikona_range[0] <= degree_in_sign < mooltrikona_range[1]
    ):
        return "Mooltrikona"

    # Step 3: Check Own Sign
    if sign in own_signs.get(planet_name, []):
        return "Own Sign"

    # Step 4: Apply Compound Friendship
    if sign_lord:
        # From planet to lord
        if sign_lord in permanent_friends.get(planet_name, []):
            planet_to_lord = "Friends"
        elif sign_lord in permanent_neutrals.get(planet_name, []):
            planet_to_lord = "Neutrals"
        else:
            planet_to_lord = "Enemies"

        # From lord to planet
        if planet_name in permanent_friends.get(sign_lord, []):
            lord_to_planet = "Friends"
        elif planet_name in permanent_neutrals.get(sign_lord, []):
            lord_to_planet = "Neutrals"
        else:
            lord_to_planet = "Enemies"

        # Final compound relationship
        if planet_to_lord == "Friends" and lord_to_planet == "Friends":
            return "Friendly Sign"
        elif (planet_to_lord == "Friends" and lord_to_planet == "Neutrals") or (
            planet_to_lord == "Neutrals" and lord_to_planet == "Friends"
        ):
            return "Friendly Sign"
        elif planet_to_lord == "Enemies" and lord_to_planet == "Enemies":
            return "Enemy Sign"
        elif (planet_to_lord == "Enemies" and lord_to_planet == "Neutrals") or (
            planet_to_lord == "Neutrals" and lord_to_planet == "Enemies"
        ):
            return "Enemy Sign"
        else:
            return "Neutral Sign"


# Vimshottari Dasha Lord Sequence and their years
vimshottari_lords = [
    "Ketu",
    "Venus",
    "Sun",
    "Moon",
    "Mars",
    "Rahu",
    "Jupiter",
    "Saturn",
    "Mercury",
]
vimshottari_durations = {
    "Ketu": 7,
    "Venus": 20,
    "Sun": 6,
    "Moon": 10,
    "Mars": 7,
    "Rahu": 18,
    "Jupiter": 16,
    "Saturn": 19,
    "Mercury": 17,
}


def get_sub_lord(cusp_deg):
    nak_degree = 13 + 1 / 3  # 13°20′ = 13.333...
    total_minutes = nak_degree * 60  # 800 minutes

    # Which nakshatra this cusp lies in
    nak_index = int(cusp_deg // nak_degree)
    nak_start_deg = nak_index * nak_degree
    offset_deg = cusp_deg - nak_start_deg
    offset_minutes = offset_deg * 60

    # Get the Nakshatra lord (Main Dasha Lord)
    main_lord = nakshatra_lords[nak_index]
    sequence = vimshottari_lords
    dasha_seq = (
        sequence[sequence.index(main_lord) :] + sequence[: sequence.index(main_lord)]
    )

    total_dasha_years = sum([vimshottari_durations[planet] for planet in dasha_seq])
    dasha_parts = [
        (planet, (vimshottari_durations[planet] / total_dasha_years) * total_minutes)
        for planet in dasha_seq
    ]

    progress = 0
    for planet, span in dasha_parts:
        if offset_minutes <= progress + span:
            return planet
        progress += span
    return dasha_parts[-1][0]  # Fallback to last planet


def get_cusp_details(jd_ut, lat, lon):
    swe.set_sid_mode(swe.SIDM_LAHIRI)  # Sidereal mode
    house_system = b"P"  # Placidus house system

    try:
        cusps, ascmc = swe.houses_ex(jd_ut, lat, lon, house_system, swe.FLG_SIDEREAL)
    except Exception as e:
        raise ValueError(f"Error calculating cusps: {e}")

    # Handle cases where cusps array has fewer than 13 elements
    if len(cusps) < 13:

        # Fill missing cusps with placeholder values (e.g., 0.0)
        cusps = (0.0,) + cusps + (0.0,) * (13 - len(cusps))

    # Fixed mapping of zodiac signs to their lords
    sign_lords_map = {
        "Aries": "Mars",
        "Taurus": "Venus",
        "Gemini": "Mercury",
        "Cancer": "Moon",
        "Leo": "Sun",
        "Virgo": "Mercury",
        "Libra": "Venus",
        "Scorpio": "Mars",
        "Sagittarius": "Jupiter",
        "Capricorn": "Saturn",
        "Aquarius": "Saturn",
        "Pisces": "Jupiter",
    }

    cusp_details = []
    for i in range(1, 13):  # Loop through 12 cusps (indices 1 to 12)
        cusp_degree = cusps[i]  # Get cusp degree
        sign_index = int(cusp_degree // 30)  # Determine the sign index
        sign = signs[sign_index]  # Get the sign name
        sign_lord = sign_lords_map[sign]  # Get the correct sign lord

        # Calculate Nakshatra (Star Lord)
        nak_index = int(cusp_degree // (13 + 1 / 3))  # Each Nakshatra spans 13°20'
        star_lord = nakshatra_lords[nak_index]

        sub_lord = get_sub_lord(cusp_degree)

        cusp_details.append(
            {
                "Cusp": i,
                "Degree": round(cusp_degree, 2),
                "Sign": sign,
                "Sign Lord": sign_lord,
                "Star Lord": star_lord,
                "Sub Lord": sub_lord,
            }
        )

    return cusp_details


# 🌟 Calculate Ruling Planets
def calculate_ruling_planets(astro_data, ascendant, jd_ut):
    # Moon's Ruling Planets
    moon_data = next(p for p in astro_data if p["planet"] == "Moon")
    moon_long = moon_data["absolute_longitude"]
    moon_sign_index = int(moon_long // 30)
    moon_sign = signs[moon_sign_index]
    moon_sign_lord = sign_lords_map[moon_sign]
    moon_star_lord = nakshatra_lords[int(moon_long // (13 + 1 / 3))]
    moon_sub_lord = get_sub_lord(moon_long)

    # Ascendant's Ruling Planets
    asc_long = ascendant["ascendant_longitude"]
    asc_sign_index = int(asc_long // 30)
    asc_sign = signs[asc_sign_index]
    asc_sign_lord = sign_lords_map[asc_sign]
    asc_star_lord = nakshatra_lords[int(asc_long // (13 + 1 / 3))]
    asc_sub_lord = get_sub_lord(asc_long)

    # Day Lord
    weekday = int((jd_ut + 1.5) % 7)  # Julian Day to weekday (0=Sunday, 6=Saturday)
    day_lords = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn"]
    day_lord = day_lords[weekday]

    # Return Ruling Planets
    return {
        "Moon": {
            "Sign Lord": moon_sign_lord,
            "Star Lord": moon_star_lord,
            "Sub Lord": moon_sub_lord,
        },
        "Ascendant": {
            "Sign Lord": asc_sign_lord,
            "Star Lord": asc_star_lord,
            "Sub Lord": asc_sub_lord,
        },
        "Day Lord": day_lord,
    }


def calculate_avastha(planet_name, degree_in_sign, sign):
    """
    Calculate Jagrat (State), Baladi (Age), and Deeptadi (Strength) Avasthas according to BPHS.
    """

    exalted_signs = {
        "Sun": "Aries",
        "Moon": "Taurus",
        "Mars": "Capricorn",
        "Mercury": "Virgo",
        "Jupiter": "Cancer",
        "Venus": "Pisces",
        "Saturn": "Libra",
    }

    debilitated_signs = {
        "Sun": "Libra",
        "Moon": "Scorpio",
        "Mars": "Cancer",
        "Mercury": "Pisces",
        "Jupiter": "Capricorn",
        "Venus": "Virgo",
        "Saturn": "Aries",
    }

    own_signs = {
        "Sun": ["Leo"],
        "Moon": ["Cancer"],
        "Mars": ["Aries", "Scorpio"],
        "Mercury": ["Gemini", "Virgo"],
        "Jupiter": ["Sagittarius", "Pisces"],
        "Venus": ["Taurus", "Libra"],
        "Saturn": ["Capricorn", "Aquarius"],
    }

    permanent_friends = {
        "Sun": ["Moon", "Mars", "Jupiter"],
        "Moon": ["Sun", "Mercury"],
        "Mars": ["Sun", "Moon", "Jupiter"],
        "Mercury": ["Sun", "Venus"],
        "Jupiter": ["Sun", "Moon", "Mars"],
        "Venus": ["Mercury", "Saturn"],
        "Saturn": ["Mercury", "Venus"],
        "Rahu": ["Venus", "Saturn", "Mercury"],
        "Ketu": ["Mars", "Venus", "Saturn"],
    }

    permanent_neutrals = {
        "Sun": ["Mercury"],
        "Moon": ["Mars", "Jupiter", "Venus", "Saturn"],
        "Mars": ["Venus", "Saturn"],
        "Mercury": ["Mars", "Jupiter", "Saturn"],
        "Jupiter": ["Saturn"],
        "Venus": ["Mars", "Jupiter"],
        "Saturn": ["Jupiter"],
        "Rahu": ["Jupiter", "Mars"],
        "Ketu": ["Jupiter", "Mercury"],
    }

    permanent_enemies = {
        "Sun": ["Venus", "Saturn"],
        "Moon": [],
        "Mars": ["Mercury"],
        "Mercury": ["Moon"],
        "Jupiter": ["Mercury", "Venus"],
        "Venus": ["Sun", "Moon"],
        "Saturn": ["Sun", "Moon", "Mars"],
        "Rahu": ["Sun", "Moon"],
        "Ketu": ["Sun", "Moon"],
    }

    # Deeptadi Avastha (Strength)
    if sign == exalted_signs.get(planet_name, ""):
        deeptadi = "Deepta"  # Exalted
    elif sign in own_signs.get(planet_name, []):
        deeptadi = "Swastha"  # Own Sign
    else:
        sign_lord = sign_lords_map.get(sign, "")
        if sign_lord in permanent_friends.get(planet_name, []):
            deeptadi = "Pramudita"  # Thick Friend's Sign
        elif sign_lord in permanent_neutrals.get(planet_name, []):
            deeptadi = "Deena"  # Neutral's Sign
        elif sign_lord in permanent_enemies.get(planet_name, []):
            deeptadi = "Khala"  # Enemy's Sign
        else:
            deeptadi = "Khal"  # Default Neutral

    # Jagrat Avastha (State of wakefulness)
    if sign == exalted_signs.get(planet_name, "") or sign in own_signs.get(
        planet_name, []
    ):
        jagrat = "Jagrat"  # Awake
    elif sign in debilitated_signs.values():
        jagrat = "Susupta"  # Sleeping
    else:
        jagrat = "Swapna"  # Dreaming (Other signs)

    # Baladi Avastha (Age-based strength with even/odd logic)
    even_signs = ["Taurus", "Cancer", "Virgo", "Scorpio", "Capricorn", "Pisces"]
    avastha_order = ["Bala", "Kumara", "Yuva", "Vriddha", "Mrita"]
    segment = int(degree_in_sign // 6)
    if sign in even_signs:
        baladi = avastha_order[::-1][segment]  # Reverse for even signs
    else:
        baladi = avastha_order[segment]  # Normal for odd signs

    return jagrat, baladi, deeptadi


def get_relative_sign_distance(from_sign, to_sign):
    return (to_sign - from_sign) % 12 or 12


def get_house_from_ascendant(planet_sign, ascendant_sign):

    return ((planet_sign - ascendant_sign) % 12) + 1


def calculate_navamsa_sign_bphs(planet_longitude):
    """
    Calculate the Navamsa sign number (1-12) for a given planet's longitude as per BPHS rules.
    """
    sign_index = int(planet_longitude // 30)  # 0 = Aries, ..., 11 = Pisces
    degree_in_sign = planet_longitude % 30

    # Determine starting point based on sign type
    if sign_index in [0, 3, 6, 9]:  # Movable
        navamsa_start = sign_index
    elif sign_index in [1, 4, 7, 10]:  # Fixed
        navamsa_start = (sign_index + 8) % 12  # 9th from the sign
    elif sign_index in [2, 5, 8, 11]:  # Dual
        navamsa_start = (sign_index + 4) % 12  # 5th from the sign

    # Determine which of the 9 Navamsas (3°20′ each) it falls into
    navamsa_division = int(degree_in_sign // (30 / 9))

    # Final Navamsa sign index
    navamsa_sign_index = (navamsa_start + navamsa_division) % 12

    return navamsa_sign_index + 1  # 1 = Aries, ..., 12 = Pisces


def get_navamsa_data_bphs(astro_data, ascendant_longitude):
    # Calculate Navamsa sign for the ascendant
    ascendant_navamsa_sign_number = calculate_navamsa_sign_bphs(ascendant_longitude)
    ascendant_navamsa_sign = ZODIAC_SIGNS[
        ascendant_navamsa_sign_number - 1
    ]  # Convert number to name

    navamsa_data = {
        "Ascendant": {
            "Navamsa Sign": ascendant_navamsa_sign,
            "House": 1,  # Ascendant is always the 1st house
        }
    }

    for planet_data in astro_data:
        planet_name = planet_data["planet"]
        planet_longitude = planet_data["absolute_longitude"]
        navamsa_sign_number = calculate_navamsa_sign_bphs(planet_longitude)
        navamsa_sign = ZODIAC_SIGNS[navamsa_sign_number - 1]  # Convert number to name
        house = get_house_from_ascendant(
            navamsa_sign_number, ascendant_navamsa_sign_number
        )

        navamsa_data[planet_name] = {"Navamsa Sign": navamsa_sign, "House": house}

    return navamsa_data


def calculate_dasamsa_sign_bphs(planet_longitude):
    """
    Calculate the Dasamsa (D10) sign number (1-12) for a given planet's longitude as per BPHS rules.
    """
    # Determine the zodiac sign (0 = Aries, 1 = Taurus, ..., 11 = Pisces)
    sign_index = int(planet_longitude // 30)
    degree_in_sign = planet_longitude % 30

    # Determine the type of sign (Odd or Even)
    if sign_index % 2 == 0:  # Odd signs (Aries, Gemini, etc.)
        dasamsa_start = sign_index
    else:  # Even signs (Taurus, Cancer, etc.)
        dasamsa_start = (sign_index + 8) % 12  # 9th sign from the current sign

    # Calculate Dasamsa division (1-10)
    dasamsa_division = int(degree_in_sign // 3)  # Each Dasamsa spans 3°

    # Determine the Dasamsa sign index
    dasamsa_sign_index = (dasamsa_start + dasamsa_division) % 12

    # Return the Dasamsa sign number (1-12)
    return dasamsa_sign_index + 1


def get_dasamsa_data_bphs(astro_data, ascendant_longitude):
    # Calculate Navamsa sign for the ascendant
    ascendant_dasamsa_sign_number = calculate_dasamsa_sign_bphs(ascendant_longitude)
    ascendant_dasamsa_sign = ZODIAC_SIGNS[
        ascendant_dasamsa_sign_number - 1
    ]  # Convert number to name

    dasamsa_data = {
        "Ascendant": {
            "Dasamsa Sign": ascendant_dasamsa_sign,
            "House": 1,  # Ascendant is always the 1st house
        }
    }

    for planet_data in astro_data:
        planet_name = planet_data["planet"]
        planet_longitude = planet_data["absolute_longitude"]
        dasamsa_sign_number = calculate_dasamsa_sign_bphs(planet_longitude)
        dasamsa_sign = ZODIAC_SIGNS[dasamsa_sign_number - 1]  # Convert number to name
        house = get_house_from_ascendant(
            dasamsa_sign_number, ascendant_dasamsa_sign_number
        )

        dasamsa_data[planet_name] = {"Dasamsa Sign": dasamsa_sign, "House": house}

    return dasamsa_data


def calculate_dvadasamsa_sign_bphs(planet_longitude):
    # Determine the zodiac sign (0 = Aries, 1 = Taurus, ..., 11 = Pisces)
    sign_index = int(planet_longitude // 30)
    degree_in_sign = planet_longitude % 30

    # Calculate Dvadasamsa division (1-12)
    dvadasamsa_division = int(degree_in_sign // 2.5)  # Each Dvadasamsa spans 2°30′

    # Determine the Dvadasamsa sign index
    dvadasamsa_sign_index = (sign_index + dvadasamsa_division) % 12

    # Return the Dvadasamsa sign number (1-12)
    return dvadasamsa_sign_index + 1


def get_dvadasamsa_data_bphs(astro_data, ascendant_longitude):
    # Calculate Navamsa sign for the ascendant
    ascendant_dvadasamsa_sign_number = calculate_dvadasamsa_sign_bphs(
        ascendant_longitude
    )
    ascendant_dvadasamsa_sign = ZODIAC_SIGNS[
        ascendant_dvadasamsa_sign_number - 1
    ]  # Convert number to name

    dvadasamsa_data = {
        "Ascendant": {
            "Dvadasamsa Sign": ascendant_dvadasamsa_sign,
            "House": 1,  # Ascendant is always the 1st house
        }
    }

    for planet_data in astro_data:
        planet_name = planet_data["planet"]
        planet_longitude = planet_data["absolute_longitude"]
        dvadasamsa_sign_number = calculate_navamsa_sign_bphs(planet_longitude)
        dvadasamsa_sign = ZODIAC_SIGNS[
            dvadasamsa_sign_number - 1
        ]  # Convert number to name
        house = get_house_from_ascendant(
            dvadasamsa_sign_number, ascendant_dvadasamsa_sign_number
        )

        dvadasamsa_data[planet_name] = {
            "Dvadasamsa Sign": dvadasamsa_sign,
            "House": house,
        }

    return dvadasamsa_data


def calculate_shodasamsa_sign_bphs(planet_longitude):
    """
    Calculate the Shodasamsa (D16) sign number (1-12) for a given planet's longitude as per BPHS rules.
    """
    # Determine the zodiac sign (0 = Aries, 1 = Taurus, ..., 11 = Pisces)
    sign_index = int(planet_longitude // 30)
    degree_in_sign = planet_longitude % 30

    # Determine the type of sign (Movable, Fixed, Dual)
    if sign_index in [0, 3, 6, 9]:  # Movable signs: Aries, Cancer, Libra, Capricorn
        shodasamsa_start = 0  # Aries
    elif sign_index in [1, 4, 7, 10]:  # Fixed signs: Taurus, Leo, Scorpio, Aquarius
        shodasamsa_start = 4  # Leo
    elif sign_index in [2, 5, 8, 11]:  # Dual signs: Gemini, Virgo, Sagittarius, Pisces
        shodasamsa_start = 8  # Sagittarius

    # Calculate Shodasamsa division (1-16)
    shodasamsa_division = int(
        degree_in_sign // 1.875
    )  # Eac`h Shod`asamsa spans 1°52'30"

    # Determine the Shodasamsa sign index
    shodasamsa_sign_index = (shodasamsa_start + shodasamsa_division) % 12

    # Return the Shodasamsa sign number (1-12)
    return shodasamsa_sign_index + 1


def get_shodasamsa_data_bphs(astro_data, ascendant_longitude):
    # Calculate Navamsa sign for the ascendant
    ascendant_shodasamsa_sign_number = calculate_shodasamsa_sign_bphs(
        ascendant_longitude
    )
    ascendant_shodasamsa_sign = ZODIAC_SIGNS[
        ascendant_shodasamsa_sign_number - 1
    ]  # Convert number to name

    shodasamsa_data = {
        "Ascendant": {
            "Shodasamsa Sign": ascendant_shodasamsa_sign,
            "House": 1,  # Ascendant is always the 1st house
        }
    }

    for planet_data in astro_data:
        planet_name = planet_data["planet"]
        planet_longitude = planet_data["absolute_longitude"]
        shodasamsa_sign_number = calculate_navamsa_sign_bphs(planet_longitude)
        shodasamsa_sign = ZODIAC_SIGNS[
            shodasamsa_sign_number - 1
        ]  # Convert number to name
        house = get_house_from_ascendant(
            shodasamsa_sign_number, ascendant_shodasamsa_sign_number
        )

        shodasamsa_data[planet_name] = {
            "Shodasamsa Sign": shodasamsa_sign,
            "House": house,
        }

    return shodasamsa_data


def calculate_vimsamsa_sign_bphs(planet_longitude):
    """
    Calculate the Vimsamsa (D20) sign number (1-12) for a given planet's longitude as per BPHS.
    Each division is 1°30′ = 1.5° of a sign (20 parts per sign).
    Start counting from:
        - Aries for Movable signs (Aries, Cancer, Libra, Capricorn)
        - Sagittarius for Fixed signs (Taurus, Leo, Scorpio, Aquarius)
        - Leo for Dual signs (Gemini, Virgo, Sagittarius, Pisces)
    """
    sign_index = int(planet_longitude // 30)  # 0 = Aries, ..., 11 = Pisces
    degree_in_sign = planet_longitude % 30  # Degree within current sign

    # Determine starting sign based on nature of sign
    if sign_index in [0, 3, 6, 9]:  # Movable signs
        start_sign_index = 0  # Aries
    elif sign_index in [1, 4, 7, 10]:  # Fixed signs
        start_sign_index = 8  # Sagittarius
    else:  # Dual signs
        start_sign_index = 4  # Leo

    # Each Vimsamsa = 1.5°, so get the division index (0 to 19)
    division_index = int(degree_in_sign // 1.5)

    # Vimsamsa sign = start + division_index (mod 12)
    d20_sign_index = (start_sign_index + division_index) % 12

    # Return 1-based sign number
    return d20_sign_index + 1


def get_vimsamsa_data_bphs(astro_data, ascendant_longitude):
    # Calculate Navamsa sign for the ascendant
    ascendant_vimsamsa_sign_number = calculate_vimsamsa_sign_bphs(ascendant_longitude)
    ascendant_vimsamsa_sign = ZODIAC_SIGNS[
        ascendant_vimsamsa_sign_number - 1
    ]  # Convert number to name

    vimsamsa_data = {
        "Ascendant": {
            "Vimsamsa Sign": ascendant_vimsamsa_sign,
            "House": 1,  # Ascendant is always the 1st house
        }
    }

    for planet_data in astro_data:
        planet_name = planet_data["planet"]
        planet_longitude = planet_data["absolute_longitude"]
        vimsamsa_sign_number = calculate_navamsa_sign_bphs(planet_longitude)
        vimsamsa_sign = ZODIAC_SIGNS[vimsamsa_sign_number - 1]  # Convert number to name
        house = get_house_from_ascendant(
            vimsamsa_sign_number, ascendant_vimsamsa_sign_number
        )

        vimsamsa_data[planet_name] = {"Vimsamsa Sign": vimsamsa_sign, "House": house}

    return vimsamsa_data


def calculate_siddhamsa_sign_bphs(planet_longitude):
    # Zodiac sign names (for reference, optional)
    signs = [
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
    ]

    # Determine the sign index and degree within the sign
    sign_index = int(planet_longitude // 30)
    degree_in_sign = planet_longitude - (sign_index * 30)

    # List of odd and even sign indexes
    odd_signs = ["Aries", "Gemini", "Leo", "Libra", "Sagittarius", "Aquarius"]
    even_signs = ["Taurus", "Cancer", "Virgo", "Scorpio", "Capricorn", "Pisces"]

    current_sign = signs[sign_index]

    # Determine the starting sign based on odd/even without using modulo
    if current_sign in odd_signs:
        siddhamsa_start = 4  # Leo (index 4)
    else:
        siddhamsa_start = 3  # Cancer (index 3)

    # Siddhamsa part (1°15' = 1.25°), determine which of the 24 divisions
    part = 0
    boundary = 0.0
    while boundary < 30:
        if degree_in_sign >= boundary and degree_in_sign < boundary + 1.25:
            break
        part += 1
        boundary += 1.25

    # Move from starting sign according to division
    siddhamsa_sign_index = siddhamsa_start
    count = 0
    while count < part:
        siddhamsa_sign_index += 1
        if siddhamsa_sign_index > 11:
            siddhamsa_sign_index = 0
        count += 1

    return siddhamsa_sign_index + 1  # Return 1-based sign number


def get_siddhamsa_data_bphs(astro_data, ascendant_longitude):
    # Calculate Navamsa sign for the ascendant
    ascendant_siddhamsa_sign_number = calculate_siddhamsa_sign_bphs(ascendant_longitude)
    ascendant_siddhamsa_sign = ZODIAC_SIGNS[
        ascendant_siddhamsa_sign_number - 1
    ]  # Convert number to name

    siddhamsa_data = {
        "Ascendant": {
            "Siddhamsa Sign": ascendant_siddhamsa_sign,
            "House": 1,  # Ascendant is always the 1st house
        }
    }

    for planet_data in astro_data:
        planet_name = planet_data["planet"]
        planet_longitude = planet_data["absolute_longitude"]
        siddhamsa_sign_number = calculate_navamsa_sign_bphs(planet_longitude)
        siddhamsa_sign = ZODIAC_SIGNS[
            siddhamsa_sign_number - 1
        ]  # Convert number to name
        house = get_house_from_ascendant(
            siddhamsa_sign_number, ascendant_siddhamsa_sign_number
        )

        siddhamsa_data[planet_name] = {"Siddhamsa Sign": siddhamsa_sign, "House": house}

    return siddhamsa_data


def calculate_hora_sign_bphs(planet_longitude):
    """
    Calculate the Hora (D2) sign number (1-12) for a given planet's longitude as per BPHS.
    Odd signs: 0°–15° = Sun's Hora (Leo), 15°–30° = Moon's Hora (Cancer)
    Even signs: 0°–15° = Moon's Hora (Cancer), 15°–30° = Sun's Hora (Leo)
    """
    # Define signs
    signs = [
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
    ]

    # Odd and Even signs classification
    odd_signs = {"Aries", "Gemini", "Leo", "Libra", "Sagittarius", "Aquarius"}
    even_signs = {"Taurus", "Cancer", "Virgo", "Scorpio", "Capricorn", "Pisces"}

    # Determine sign index and degree within the sign
    sign_index = int(planet_longitude // 30)
    degree_in_sign = planet_longitude - (sign_index * 30)
    current_sign = signs[sign_index]

    # BPHS Hora calculation based on sign type and degree range
    if current_sign in odd_signs:
        hora_sign = 5 if degree_in_sign < 15 else 4  # Leo (5), Cancer (4)
    else:
        hora_sign = 4 if degree_in_sign < 15 else 5  # Cancer (4), Leo (5)

    return hora_sign


def get_hora_data_bphs(astro_data, ascendant_longitude):
    # Calculate Navamsa sign for the ascendant
    ascendant_hora_sign_number = calculate_hora_sign_bphs(ascendant_longitude)
    ascendant_hora_sign = ZODIAC_SIGNS[
        ascendant_hora_sign_number - 1
    ]  # Convert number to name

    hora_data = {
        "Ascendant": {
            "Hora Sign": ascendant_hora_sign,
            "House": 1,  # Ascendant is always the 1st house
        }
    }

    for planet_data in astro_data:
        planet_name = planet_data["planet"]
        planet_longitude = planet_data["absolute_longitude"]
        hora_sign_number = calculate_hora_sign_bphs(planet_longitude)
        hora_sign = ZODIAC_SIGNS[hora_sign_number - 1]  # Convert number to name
        house = get_house_from_ascendant(hora_sign_number, ascendant_hora_sign_number)

        hora_data[planet_name] = {"Hora Sign": hora_sign, "House": house}

    return hora_data


def calculate_drekkana_sign_bphs(planet_longitude):
    """
    Calculate the Drekkana (D3) sign number (1-12) for a given planet's longitude based on BPHS logic.

    Each sign is divided into 3 parts:
    - 0°–10°  → Lord of the same sign
    - 10°–20° → Lord of the 5th sign from current sign
    - 20°–30° → Lord of the 9th sign from current sign
    """
    # Rasi lords as per standard Vedic order
    sign_lords = {
        1: "Mars",  # Aries
        2: "Venus",  # Taurus
        3: "Mercury",  # Gemini
        4: "Moon",  # Cancer
        5: "Sun",  # Leo
        6: "Mercury",  # Virgo
        7: "Venus",  # Libra
        8: "Mars",  # Scorpio
        9: "Jupiter",  # Sagittarius
        10: "Saturn",  # Capricorn
        11: "Saturn",  # Aquarius
        12: "Jupiter",  # Pisces
    }

    planet_degree = planet_longitude % 30
    sign_num = int(planet_longitude // 30) + 1  # 1 to 12

    if planet_degree < 10:
        drekkana_sign = sign_num
    elif planet_degree < 20:
        drekkana_sign = (sign_num + 4 - 1) % 12 + 1  # 5th from current
    else:
        drekkana_sign = (sign_num + 8 - 1) % 12 + 1  # 9th from current

    return drekkana_sign


def get_drekkana_data_bphs(astro_data, ascendant_longitude):
    # Calculate Navamsa sign for the ascendant
    ascendant_drekkana_sign_number = calculate_drekkana_sign_bphs(ascendant_longitude)
    ascendant_drekkana_sign = ZODIAC_SIGNS[
        ascendant_drekkana_sign_number - 1
    ]  # Convert number to name

    drekkana_data = {
        "Ascendant": {
            "Drekkana Sign": ascendant_drekkana_sign,
            "House": 1,  # Ascendant is always the 1st house
        }
    }

    for planet_data in astro_data:
        planet_name = planet_data["planet"]
        planet_longitude = planet_data["absolute_longitude"]
        drekkana_sign_number = calculate_drekkana_sign_bphs(planet_longitude)
        drekkana_sign = ZODIAC_SIGNS[drekkana_sign_number - 1]  # Convert number to name
        house = get_house_from_ascendant(
            drekkana_sign_number, ascendant_drekkana_sign_number
        )

        drekkana_data[planet_name] = {"Drekkana Sign": drekkana_sign, "House": house}

    return drekkana_data


def calculate_chaturthamsa_sign_bphs(planet_longitude):
    """
    Calculate Chaturthamsa (D4) sign based on BPHS rules.
    Each sign is divided into 4 parts of 7°30′ (7.5°).
    The ruling sign of each quarter is:
      - 1st part (0–7.5°) → same sign
      - 2nd part (7.5–15°) → 4th from current sign
      - 3rd part (15–22.5°) → 7th from current sign
      - 4th part (22.5–30°) → 10th from current sign
    """
    degree_in_sign = planet_longitude % 30
    sign_num = int(planet_longitude // 30) + 1  # 1 to 12

    if degree_in_sign < 7.5:
        d4_sign = sign_num
    elif degree_in_sign < 15:
        d4_sign = (sign_num + 3 - 1) % 12 + 1  # 4th from sign
    elif degree_in_sign < 22.5:
        d4_sign = (sign_num + 6 - 1) % 12 + 1  # 7th from sign
    else:
        d4_sign = (sign_num + 9 - 1) % 12 + 1  # 10th from sign

    return d4_sign


def get_chaturthamsa_data_bphs(astro_data, ascendant_longitude):
    # Calculate Navamsa sign for the ascendant
    ascendant_chaturthamsa_sign_number = calculate_chaturthamsa_sign_bphs(
        ascendant_longitude
    )
    ascendant_chaturthamsa_sign = ZODIAC_SIGNS[
        ascendant_chaturthamsa_sign_number - 1
    ]  # Convert number to name

    chaturthamsa_data = {
        "Ascendant": {
            "Chaturthamsa Sign": ascendant_chaturthamsa_sign,
            "House": 1,  # Ascendant is always the 1st house
        }
    }

    for planet_data in astro_data:
        planet_name = planet_data["planet"]
        planet_longitude = planet_data["absolute_longitude"]
        chaturthamsa_sign_number = calculate_chaturthamsa_sign_bphs(planet_longitude)
        chaturthamsa_sign = ZODIAC_SIGNS[
            chaturthamsa_sign_number - 1
        ]  # Convert number to name
        house = get_house_from_ascendant(
            chaturthamsa_sign_number, ascendant_chaturthamsa_sign_number
        )

        chaturthamsa_data[planet_name] = {
            "Chaturthamsa Sign": chaturthamsa_sign,
            "House": house,
        }

    return chaturthamsa_data


def calculate_saptamsa_sign_bphs(planet_longitude):
    degrees_in_sign = planet_longitude % 30
    sign_num = int(planet_longitude // 30) + 1  # 1–12 (Aries to Pisces)

    # Determine which of the 7 divisions the planet is in (0–6)
    saptamsa_index = int(degrees_in_sign // (30 / 7))

    if sign_num % 2 == 1:  # Odd sign
        d7_sign = (sign_num + saptamsa_index - 1) % 12 + 1
    else:  # Even sign
        start_sign = (sign_num + 6 - 1) % 12 + 1  # 7th from the sign
        d7_sign = (start_sign + saptamsa_index - 1) % 12 + 1

    return d7_sign


def get_saptamsa_data_bphs(astro_data, ascendant_longitude):
    # Calculate Navamsa sign for the ascendant
    ascendant_saptamsa_sign_number = calculate_saptamsa_sign_bphs(ascendant_longitude)
    ascendant_saptamsa_sign = ZODIAC_SIGNS[
        ascendant_saptamsa_sign_number - 1
    ]  # Convert number to name

    saptamsa_data = {
        "Ascendant": {
            "Saptamsa Sign": ascendant_saptamsa_sign,
            "House": 1,  # Ascendant is always the 1st house
        }
    }

    for planet_data in astro_data:
        planet_name = planet_data["planet"]
        planet_longitude = planet_data["absolute_longitude"]
        saptamsa_sign_number = calculate_saptamsa_sign_bphs(planet_longitude)
        saptamsa_sign = ZODIAC_SIGNS[saptamsa_sign_number - 1]  # Convert number to name
        house = get_house_from_ascendant(
            saptamsa_sign_number, ascendant_saptamsa_sign_number
        )

        saptamsa_data[planet_name] = {"Saptamsa Sign": saptamsa_sign, "House": house}

    return saptamsa_data


def calculate_bhamsa_sign_bphs(planet_longitude):
    """
    Calculate Bhamsa (Saptavimsamsa / D27) sign based on BPHS rules.

    - Each sign is divided into 27 parts (1°6′40″ each).
    - Distribution starts from:
        Fire signs → Aries (1)
        Earth signs → Cancer (4)
        Air signs → Libra (7)
        Water signs → Capricorn (10)
    - Deities assigned in direct order for odd signs, reverse order for even signs.
    """

    # Bhamsa division size
    division_size = 30 / 27  # ≈ 1.111111...

    # Determine position in current sign
    degrees_in_sign = planet_longitude % 30
    sign_num = int(planet_longitude // 30) + 1  # 1 = Aries, ..., 12 = Pisces

    # Bhamsa index within sign (0 to 26)
    bhamsa_index = int(degrees_in_sign // division_size)

    # Determine start sign based on element
    if sign_num in [1, 5, 9]:  # Fire (Aries, Leo, Sagittarius)
        start_sign = 1  # Aries
    elif sign_num in [2, 6, 10]:  # Earth (Taurus, Virgo, Capricorn)
        start_sign = 4  # Cancer
    elif sign_num in [3, 7, 11]:  # Air (Gemini, Libra, Aquarius)
        start_sign = 7  # Libra
    elif sign_num in [4, 8, 12]:  # Water (Cancer, Scorpio, Pisces)
        start_sign = 10  # Capricorn
    else:
        start_sign = 1  # Default fallback

    # Final D27 sign
    d27_sign = (start_sign + bhamsa_index - 1) % 12 + 1

    return d27_sign


def get_bhamsa_data_bphs(astro_data, ascendant_longitude):
    # Calculate Navamsa sign for the ascendant
    ascendant_bhamsa_sign_number = calculate_bhamsa_sign_bphs(ascendant_longitude)
    ascendant_bhamsa_sign = ZODIAC_SIGNS[
        ascendant_bhamsa_sign_number - 1
    ]  # Convert number to name

    bhamsa_data = {
        "Ascendant": {
            "Bhamsa Sign": ascendant_bhamsa_sign,
            "House": 1,  # Ascendant is always the 1st house
        }
    }

    for planet_data in astro_data:
        planet_name = planet_data["planet"]
        planet_longitude = planet_data["absolute_longitude"]
        bhamsa_sign_number = calculate_bhamsa_sign_bphs(planet_longitude)
        bhamsa_sign = ZODIAC_SIGNS[bhamsa_sign_number - 1]  # Convert number to name
        house = get_house_from_ascendant(
            bhamsa_sign_number, ascendant_bhamsa_sign_number
        )

        bhamsa_data[planet_name] = {"Bhamsa Sign": bhamsa_sign, "House": house}

    return bhamsa_data


def calculate_trimsamsa_sign_bphs(planet_longitude):
    """
    Calculate Trimsamsa (D30) sign based on BPHS rules.

    - Each sign is divided into 5 unequal parts:
      * Odd signs (Aries, Gemini, Leo, etc.): Mars (5°), Saturn (5°), Jupiter (8°), Mercury (7°), Venus (5°)
      * Even signs (Taurus, Cancer, Virgo, etc.): Venus (5°), Mercury (7°), Jupiter (8°), Saturn (5°), Mars (5°)
    - The sign assignments follow:
      * Odd signs: Aries, Aquarius, Sagittarius, Gemini, Libra
      * Even signs: Taurus, Virgo, Pisces, Capricorn, Scorpio
    """

    trimsamsa_degrees_odd = [5, 5, 8, 7, 5]  # Mars, Saturn, Jupiter, Mercury, Venus
    trimsamsa_degrees_even = [5, 7, 8, 5, 5]  # Venus, Mercury, Jupiter, Saturn, Mars

    trimsamsa_signs_odd = [
        1,
        11,
        9,
        3,
        7,
    ]  # Aries, Aquarius, Sagittarius, Gemini, Libra
    trimsamsa_signs_even = [
        2,
        6,
        12,
        10,
        8,
    ]  # Taurus, Virgo, Pisces, Capricorn, Scorpio

    # Determine sign number (1–12) and degrees in that sign
    sign_num = int(planet_longitude // 30) + 1
    degrees_in_sign = planet_longitude % 30

    # Select division structure based on odd/even sign
    if sign_num % 2 == 1:  # Odd signs
        trimsamsa_degrees = trimsamsa_degrees_odd
        trimsamsa_signs = trimsamsa_signs_odd
    else:  # Even signs
        trimsamsa_degrees = trimsamsa_degrees_even
        trimsamsa_signs = trimsamsa_signs_even

    # Determine which Trimsamsa division the planet falls into
    accumulated_degrees = 0
    for i, d30_sign in enumerate(trimsamsa_signs):
        accumulated_degrees += trimsamsa_degrees[i]
        if degrees_in_sign < accumulated_degrees:
            return d30_sign  # Returns the D30 sign

    return None  # Fallback (should never occur)


def get_trimsamsa_data_bphs(astro_data, ascendant_longitude):
    # Calculate Navamsa sign for the ascendant
    ascendant_trimsamsa_sign_number = calculate_trimsamsa_sign_bphs(ascendant_longitude)
    ascendant_trimsamsa_sign = ZODIAC_SIGNS[
        ascendant_trimsamsa_sign_number - 1
    ]  # Convert number to name

    trimsamsa_data = {
        "Ascendant": {
            "Trimsamsa Sign": ascendant_trimsamsa_sign,
            "House": 1,  # Ascendant is always the 1st house
        }
    }

    for planet_data in astro_data:
        planet_name = planet_data["planet"]
        planet_longitude = planet_data["absolute_longitude"]
        trimsamsa_sign_number = calculate_trimsamsa_sign_bphs(planet_longitude)
        trimsamsa_sign = ZODIAC_SIGNS[
            trimsamsa_sign_number - 1
        ]  # Convert number to name
        house = get_house_from_ascendant(
            trimsamsa_sign_number, ascendant_trimsamsa_sign_number
        )

        trimsamsa_data[planet_name] = {"Trimsamsa Sign": trimsamsa_sign, "House": house}

    return trimsamsa_data


def calculate_chatvarimsamsa_sign_bphs(planet_longitude):
    """
    Calculate Chatvarimsamsa (D40 / Khavedamsa) sign based on BPHS.

    - Each sign is divided into 40 parts (each 45′ or 0.75°).
    - Odd signs: count D40 from Aries (1).
    - Even signs: count D40 from Libra (7).
    """

    # Determine base values
    sign_num = int(planet_longitude // 30) + 1
    degrees_in_sign = planet_longitude % 30

    # Each D40 division = 0.75°
    division_number = int(degrees_in_sign // 0.75) + 1  # 1 to 40

    # Determine starting sign
    if sign_num % 2 == 1:  # Odd signs → start from Aries
        start_sign = 1
    else:  # Even signs → start from Libra
        start_sign = 7

    # Final D40 sign
    d40_sign = (start_sign + division_number - 1) % 12
    return 12 if d40_sign == 0 else d40_sign


def get_chatvarimsamsa_data_bphs(astro_data, ascendant_longitude):
    # Calculate Navamsa sign for the ascendant
    ascendant_chatvarimsamsa_sign_number = calculate_chatvarimsamsa_sign_bphs(
        ascendant_longitude
    )
    ascendant_chatvarimsamsa_sign = ZODIAC_SIGNS[
        ascendant_chatvarimsamsa_sign_number - 1
    ]  # Convert number to name

    chatvarimsamsa_data = {
        "Ascendant": {
            "Chatvarimsamsa Sign": ascendant_chatvarimsamsa_sign,
            "House": 1,  # Ascendant is always the 1st house
        }
    }

    for planet_data in astro_data:
        planet_name = planet_data["planet"]
        planet_longitude = planet_data["absolute_longitude"]
        chatvarimsamsa_sign_number = calculate_chatvarimsamsa_sign_bphs(
            planet_longitude
        )
        chatvarimsamsa_sign = ZODIAC_SIGNS[
            chatvarimsamsa_sign_number - 1
        ]  # Convert number to name
        house = get_house_from_ascendant(
            chatvarimsamsa_sign_number, ascendant_chatvarimsamsa_sign_number
        )

        chatvarimsamsa_data[planet_name] = {
            "Chatvarimsamsa Sign": chatvarimsamsa_sign,
            "House": house,
        }

    return chatvarimsamsa_data


def calculate_akshavedamsa_sign_bphs(planet_longitude):
    """
    Calculate Akshavedamsa (D45) sign based on BPHS.

    - Each sign is divided into 45 parts (40' or 0.6666... degrees).
    - Distribution start:
        Movable (Aries, Cancer, Libra, Capricorn)   → start from Aries (1)
        Fixed   (Taurus, Leo, Scorpio, Aquarius)    → start from Leo (5)
        Dual    (Gemini, Virgo, Sagittarius, Pisces)→ start from Sagittarius (9)
    """

    # Sign number: 1–12
    sign_num = int(planet_longitude // 30) + 1
    degrees_in_sign = planet_longitude % 30

    # Akshavedamsa division = 0.666...°
    division_number = int(degrees_in_sign // (30 / 45)) + 1  # 1 to 45

    # Determine sign type
    if sign_num in [1, 4, 7, 10]:  # Movable signs
        start_sign = 1  # Aries
    elif sign_num in [2, 5, 8, 11]:  # Fixed signs
        start_sign = 5  # Leo
    elif sign_num in [3, 6, 9, 12]:  # Dual signs
        start_sign = 9  # Sagittarius
    else:
        start_sign = 1  # Fallback

    # Final D45 sign
    d45_sign = (start_sign + division_number - 1) % 12
    return 12 if d45_sign == 0 else d45_sign


def get_akshavedamsa_data_bphs(astro_data, ascendant_longitude):
    # Calculate Navamsa sign for the ascendant
    ascendant_akshavedamsa_sign_number = calculate_akshavedamsa_sign_bphs(
        ascendant_longitude
    )
    ascendant_akshavedamsa_sign = ZODIAC_SIGNS[
        ascendant_akshavedamsa_sign_number - 1
    ]  # Convert number to name

    akshavedamsa_data = {
        "Ascendant": {
            "Akshavedamsa Sign": ascendant_akshavedamsa_sign,
            "House": 1,  # Ascendant is always the 1st house
        }
    }

    for planet_data in astro_data:
        planet_name = planet_data["planet"]
        planet_longitude = planet_data["absolute_longitude"]
        akshavedamsa_sign_number = calculate_akshavedamsa_sign_bphs(planet_longitude)
        akshavedamsa_sign = ZODIAC_SIGNS[
            akshavedamsa_sign_number - 1
        ]  # Convert number to name
        house = get_house_from_ascendant(
            akshavedamsa_sign_number, ascendant_akshavedamsa_sign_number
        )

        akshavedamsa_data[planet_name] = {
            "Akshavedamsa Sign": akshavedamsa_sign,
            "House": house,
        }

    return akshavedamsa_data


def calculate_shashtiamsa_sign_bphs(planet_longitude):
    """
    Calculate Shashtiamsa (D60) sign as per BPHS method.

    Parameters:
        planet_longitude (float): Absolute longitude in degrees.

    Returns:
        int: D60 sign (1–12)
    """
    # Step 1: Get degrees within the sign
    degrees_in_sign = planet_longitude % 30
    sign_num = int(planet_longitude // 30) + 1  # Original sign (1–12)

    # Step 2: Multiply degrees by 2, ignore minutes
    double_deg = int(degrees_in_sign * 2)  # Only integer part

    # Step 3: Divide by 12, get remainder
    remainder = double_deg % 12

    # Step 4: Add 1 to get offset
    offset = remainder + 1

    # Step 5: Count forward that many signs from current sign
    d60_sign = (sign_num + offset - 1) % 12
    return 12 if d60_sign == 0 else d60_sign


def get_shashtiamsa_data_bphs(astro_data, ascendant_longitude):
    # Calculate Navamsa sign for the ascendant
    ascendant_shashtiamsa_sign_number = calculate_shashtiamsa_sign_bphs(
        ascendant_longitude
    )
    ascendant_shashtiamsa_sign = ZODIAC_SIGNS[
        ascendant_shashtiamsa_sign_number - 1
    ]  # Convert number to name

    shashtiamsa_data = {
        "Ascendant": {
            "Shashtiamsa Sign": ascendant_shashtiamsa_sign,
            "House": 1,  # Ascendant is always the 1st house
        }
    }

    for planet_data in astro_data:
        planet_name = planet_data["planet"]
        planet_longitude = planet_data["absolute_longitude"]
        shashtiamsa_sign_number = calculate_shashtiamsa_sign_bphs(planet_longitude)
        shashtiamsa_sign = ZODIAC_SIGNS[shashtiamsa_sign_number - 1]
        house = get_house_from_ascendant(
            shashtiamsa_sign_number, ascendant_shashtiamsa_sign_number
        )

        shashtiamsa_data[planet_name] = {
            "Shashtiamsa Sign": shashtiamsa_sign,
            "House": house,
        }

    return shashtiamsa_data


natural_benefics = ["Jupiter", "Venus", "Mercury", "Moon"]
natural_malefics = ["Sun", "Saturn", "Mars", "Rahu", "Ketu", "Moon"]


def calculate_aspects_simple(planet_data, ascendant_longitude):
    aspects = []
    special_aspects = {
        "Mars": [4, 8],  # Mars has 4th and 8th aspects
        "Jupiter": [5, 9],  # Jupiter has 5th and 9th aspects
        "Saturn": [3, 10],  # Saturn has 3rd and 10th aspects
        "Rahu": [5, 9],  # Rahu has 5th and 9th aspects
        "Ketu": [3, 10],  # Ketu has 3rd and 10th aspects
    }

    def wrap_house_number(house):
        """Ensure house numbers wrap around between 1 and 12."""
        return (house - 1) % 12 + 1

    # Map house numbers to planets (store multiple planets in a list)
    house_to_planets = {}
    for p in planet_data:
        planet_name = p["planet"]
        planet_longitude = p["absolute_longitude"]
        house_number = get_house_number(planet_longitude, ascendant_longitude)
        if house_number not in house_to_planets:
            house_to_planets[house_number] = []
        house_to_planets[house_number].append(planet_name)

    # Map house numbers to zodiac signs
    house_to_signs = {}
    for house in range(1, 13):
        sign_index = int((ascendant_longitude + (house - 1) * 30) // 30) % 12
        zodiac_sign = [
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
        ][sign_index]
        house_to_signs[house] = zodiac_sign

    for p1 in planet_data:
        planet1 = p1["planet"]
        planet_longitude = p1["absolute_longitude"]
        house1 = get_house_number(
            planet_longitude, ascendant_longitude
        )  # Calculate house number dynamically

        # Standard 7th aspect (all planets)
        house_aspected = wrap_house_number(house1 + 6)  # 7 houses forward
        aspected_planets = house_to_planets.get(
            house_aspected, ["Empty"]
        )  # Get the planets in the aspected house
        if (
            house_aspected == 1
        ):  # Include "Lagna" if the aspected house is the 1st house
            aspected_planets = ["Lagna"] + aspected_planets
        zodiac_sign = house_to_signs[
            house_aspected
        ]  # Get the zodiac sign for the aspected house
        aspects.append(
            {
                "planet": planet1,
                "aspect": 7,
                "house_aspected": house_aspected,
                "zodiac_sign": zodiac_sign,
                "aspected_planets": aspected_planets,
            }
        )

        # Special aspects for Mars, Jupiter, Saturn
        if planet1 in special_aspects:
            for aspect in special_aspects[planet1]:
                house_aspected = wrap_house_number(house1 + (aspect - 1))
                aspected_planets = house_to_planets.get(
                    house_aspected, ["Empty"]
                )  # Get the planets in the aspected house
                if (
                    house_aspected == 1
                ):  # Include "Lagna" if the aspected house is the 1st house
                    aspected_planets = ["Lagna"] + aspected_planets
                zodiac_sign = house_to_signs[
                    house_aspected
                ]  # Get the zodiac sign for the aspected house
                aspects.append(
                    {
                        "planet": planet1,
                        "aspect": f"{aspect}",
                        "house_aspected": house_aspected,
                        "zodiac_sign": zodiac_sign,
                        "aspected_planets": aspected_planets,
                    }
                )

    return aspects


def get_house_rulers(ascendant_longitude):
    """
    Get a table for houses 1 to 12 showing the zodiac sign for each house
    (starting from the ascendant) and its ruling planet based on BPHS rules.

    Args:
        ascendant_longitude (float): The longitude of the ascendant.

    Returns:
        list: A list of dictionaries containing house, zodiac sign, and ruler planet.
    """
    signs_list = [
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
    ]
    sign_lords_map = {
        "Aries": "Mars",
        "Taurus": "Venus",
        "Gemini": "Mercury",
        "Cancer": "Moon",
        "Leo": "Sun",
        "Virgo": "Mercury",
        "Libra": "Venus",
        "Scorpio": "Mars",
        "Sagittarius": "Jupiter",
        "Capricorn": "Saturn",
        "Aquarius": "Saturn",
        "Pisces": "Jupiter",
    }

    # Determine the ascendant's sign index (0 for Aries, 1 for Taurus, etc.)
    asc_sign_index = int(ascendant_longitude // 30) % 12

    house_rulers = []
    for house in range(1, 13):
        # Each house is 30° apart; offset the ascendant's sign index by (house - 1)
        sign_index = (asc_sign_index + house - 1) % 12
        zodiac_sign = signs_list[sign_index]
        ruler = sign_lords_map[zodiac_sign]
        house_rulers.append(
            {"House": house, "Zodiac Sign": zodiac_sign, "Ruler Planet": ruler}
        )

    return house_rulers


ZODIAC_SIGN_TO_INDEX = {
    "Aries": 0,
    "Taurus": 1,
    "Gemini": 2,
    "Cancer": 3,
    "Leo": 4,
    "Virgo": 5,
    "Libra": 6,
    "Scorpio": 7,
    "Sagittarius": 8,
    "Capricorn": 9,
    "Aquarius": 10,
    "Pisces": 11,
}
FUNCTIONAL_NATURES_BY_ASCENDANT = {
    "Aries": {
        "benefic": ["Sun", "Jupiter", "Mars"],
        "malefic": ["Mercury", "Venus", "Saturn"],
        "neutral": ["Moon"],
    },
    "Taurus": {
        "benefic": ["Saturn", "Mercury"],
        "malefic": ["Jupiter", "Mars", "Sun"],
        "neutral": ["Moon", "Venus"],
    },
    "Gemini": {
        "benefic": ["Venus", "Saturn"],
        "malefic": ["Mars", "Jupiter", "Sun"],
        "neutral": ["Moon", "Mercury"],
    },
    "Cancer": {
        "benefic": ["Mars", "Jupiter", "Moon"],
        "malefic": ["Saturn", "Mercury", "Venus"],
        "neutral": ["Sun"],
    },
    "Leo": {
        "benefic": ["Mars", "Sun", "Jupiter"],
        "malefic": ["Venus", "Mercury", "Saturn"],
        "neutral": ["Moon"],
    },
    "Virgo": {
        "benefic": ["Venus", "Mercury", "Saturn"],
        "malefic": ["Mars", "Moon", "Jupiter"],
        "neutral": ["Sun"],
    },
    "Libra": {
        "benefic": ["Saturn", "Mercury"],
        "malefic": ["Sun", "Jupiter", "Mars"],
        "neutral": ["Moon", "Venus"],
    },
    "Scorpio": {
        "benefic": ["Sun", "Jupiter", "Moon"],
        "malefic": ["Venus", "Mercury", "Saturn"],
        "neutral": ["Mars"],
    },
    "Sagittarius": {
        "benefic": ["Sun", "Mars", "Jupiter"],
        "malefic": ["Venus", "Mercury", "Saturn"],
        "neutral": ["Moon"],
    },
    "Capricorn": {
        "benefic": ["Venus", "Mercury", "Saturn"],
        "malefic": ["Mars", "Jupiter", "Moon"],
        "neutral": ["Sun"],
    },
    "Aquarius": {
        "benefic": ["Venus", "Saturn", "Mercury"],
        "malefic": ["Moon", "Jupiter", "Mars"],
        "neutral": ["Sun"],
    },
    "Pisces": {
        "benefic": ["Mars", "Moon", "Jupiter"],
        "malefic": ["Venus", "Saturn", "Sun"],
        "neutral": ["Mercury"],
    },
}


def get_house_rulership(planet, ascendant_sign):
    """
    Determine the functional nature of a planet based on house rulership.
    BPHS Rules:
    - Lords of Trikonas (5, 9) are functionally benefic.
    - Lords of Dusthanas (6, 8, 12) are functionally malefic.
    - Lords of Kendras (1, 4, 7, 10) are neutral unless owning a benefic/malefic house.
    - Lords of 3rd and 11th houses are malefic.
    """
    # Convert ascendant_sign from string to index
    ascendant_index = ZODIAC_SIGN_TO_INDEX[ascendant_sign]

    # Map houses to zodiac signs based on ascendant
    house_to_sign = {
        1: ascendant_index,
        2: (ascendant_index + 1) % 12,
        3: (ascendant_index + 2) % 12,
        4: (ascendant_index + 3) % 12,
        5: (ascendant_index + 4) % 12,
        6: (ascendant_index + 5) % 12,
        7: (ascendant_index + 6) % 12,
        8: (ascendant_index + 7) % 12,
        9: (ascendant_index + 8) % 12,
        10: (ascendant_index + 9) % 12,
        11: (ascendant_index + 10) % 12,
        12: (ascendant_index + 11) % 12,
    }

    # Map houses to planets based on their rulership
    house_to_planet = {
        house: sign_lords_map[ZODIAC_SIGNS[sign]]
        for house, sign in house_to_sign.items()
    }

    # Determine the houses ruled by the planet
    ruled_houses = [house for house, lord in house_to_planet.items() if lord == planet]

    # Determine functional nature based on ruled houses
    if any(house in [5, 9] for house in ruled_houses):  # Trikona lords
        return "Functional Benefic"
    if any(house in [6, 8, 12] for house in ruled_houses):  # Dusthana lords
        return "Functional Malefic"
    if any(house in [3, 11] for house in ruled_houses):  # Malefic houses
        return "Functional Malefic"
    if any(house in [1, 4, 7, 10] for house in ruled_houses):  # Kendras
        return "Neutral"
    return "Neutral"


def adjust_for_kendradhipati_dosha(planet, ascendant_sign, ruled_houses):
    if all(house in [1, 4, 7, 10] for house in ruled_houses):
        if planet == "Jupiter" and ascendant_sign in ["Virgo", "Gemini"]:
            return "Malefic"
        if planet == "Venus" and ascendant_sign in ["Capricorn", "Leo"]:
            return "Malefic"
    if planet == "Saturn" and ascendant_sign in ["Taurus", "Libra"]:
        return "Functional Benefic"
    return None


def determine_functional_nature(
    planet,
    house,
    ascendant_sign,
    *,
    moon_phase=None,
    mercury_with_malefics=False,
    is_conjunct_malefics=False,
    is_conjunct_benefics=False,
):
    # Step 1: Start with classical functional nature
    functional_map = FUNCTIONAL_NATURES_BY_ASCENDANT.get(ascendant_sign, {})
    if planet in functional_map.get("benefic", []):
        functional_nature = "Functional Benefic"
    elif planet in functional_map.get("malefic", []):
        functional_nature = "Functional Malefic"
    else:
        functional_nature = "Neutral"

    # Step 2: Adjust for Kendradhipati Dosha
    ruled_houses = get_house_rulership(planet, ascendant_sign)
    kendradhipati_adjustment = adjust_for_kendradhipati_dosha(
        planet, ascendant_sign, ruled_houses
    )
    if kendradhipati_adjustment:
        functional_nature = kendradhipati_adjustment

    # Step 3: Modify for natural nature
    if planet == "Moon":
        if moon_phase == "waxing":
            natural_nature = "Benefic"
        elif moon_phase == "waning":
            natural_nature = "Malefic"
        else:
            natural_nature = "Neutral"
    elif planet == "Mercury":
        natural_nature = "Malefic" if mercury_with_malefics else "Benefic"
    else:
        if planet in natural_benefics:
            natural_nature = "Benefic"
        elif planet in natural_malefics:
            natural_nature = "Malefic"
        else:
            natural_nature = "Neutral"

    # Step 4: Prioritize natural nature for the Moon
    if planet == "Moon" and moon_phase == "waxing":
        nature = "Benefic"
    else:
        # Priority to functional nature
        if functional_nature == "Functional Benefic":
            nature = "Benefic"
        elif functional_nature == "Functional Malefic":
            nature = "Malefic"
        else:
            nature = natural_nature

    # Step 5: Adjust for conjunctions/aspects
    if is_conjunct_malefics:
        nature = "Malefic"
    if is_conjunct_benefics:
        nature = "Benefic"

    return nature


def calculate_vimshottari_dasha(moon_longitude, birth_date):
    """
    Calculate the Vimshottari Mahadasha periods starting from the birth date,
    considering that the Mahadasha may already be running before the birth.
    """
    dasha_sequence = []

    # Get the starting Dasha Lord and remaining duration
    starting_lord, remaining_years = get_starting_dasha_lord(moon_longitude)

    # Calculate the start date of the current Mahadasha
    current_dasha_duration = vimshottari_durations[starting_lord]
    dasha_start_date = birth_date - timedelta(
        days=(current_dasha_duration - remaining_years) * 365.2425
    )

    # Add the current Mahadasha
    dasha_end_date = dasha_start_date + timedelta(
        days=current_dasha_duration * 365.2425
    )
    dasha_sequence.append((starting_lord, dasha_start_date, dasha_end_date))

    # Move to the next Dasha
    current_date = dasha_end_date
    remaining_lords = (
        vimshottari_lords[vimshottari_lords.index(starting_lord) + 1 :]
        + vimshottari_lords[: vimshottari_lords.index(starting_lord)]
    )

    # Iterate through the remaining Dashas
    for lord in remaining_lords:
        duration_years = vimshottari_durations[lord]
        end_date = current_date + timedelta(days=duration_years * 365.2425)
        dasha_sequence.append((lord, current_date, end_date))
        current_date = end_date

        # Stop if the end date exceeds a reasonable limit (e.g., 120 years from birth)
        if current_date > birth_date + timedelta(days=120 * 365.2425):
            break

    return dasha_sequence


def calculate_antardasha(dasha_lord, start_date, duration_years):
    """
    Calculate the Antardasha periods within a Mahadasha.
    """
    antardasha_sequence = []
    current_date = start_date
    total_days = duration_years * 365.2425  # Convert Mahadasha duration to days

    # Iterate through Vimshottari lords in the correct order starting from the Mahadasha lord
    starting_index = vimshottari_lords.index(dasha_lord)
    antardasha_lords = (
        vimshottari_lords[starting_index:] + vimshottari_lords[:starting_index]
    )

    for lord in antardasha_lords:
        # Calculate the Antardasha duration in days
        antardasha_days = (
            vimshottari_durations[lord] / 120
        ) * total_days  # 120 is the total Vimshottari cycle
        end_date = current_date + timedelta(days=antardasha_days)
        antardasha_sequence.append((lord, current_date, end_date))
        current_date = end_date

    return antardasha_sequence


def get_starting_dasha_lord(moon_longitude):
    """
    Get the starting Dasha Lord and remaining years based on the Moon's longitude.
    """
    dasha_sequence = [
        ("Ketu", 7),
        ("Venus", 20),
        ("Sun", 6),
        ("Moon", 10),
        ("Mars", 7),
        ("Rahu", 18),
        ("Jupiter", 16),
        ("Saturn", 19),
        ("Mercury", 17),
    ]

    # Find the starting lord based on the moon's position in the nakshatra
    nakshatra_degree = 13 + 1 / 3  # Each Nakshatra spans 13°20'
    nakshatra_index = int(moon_longitude // nakshatra_degree)
    nakshatra_lord = vimshottari_lords[nakshatra_index % 9]

    # Calculate the remaining duration of the starting Dasha
    nakshatra_start = nakshatra_index * nakshatra_degree
    position_in_nakshatra = moon_longitude - nakshatra_start
    remaining_fraction = (nakshatra_degree - position_in_nakshatra) / nakshatra_degree
    remaining_years = remaining_fraction * vimshottari_durations[nakshatra_lord]

    return nakshatra_lord, remaining_years


def get_vimshottari_dasha_with_antardasha(vimshottari_dasha):
    """
    Get the Vimshottari Dasha periods with nested Antardashas.
    """
    dasha_data = []

    for mahadasha in vimshottari_dasha:
        mahadasha_lord, mahadasha_start, mahadasha_end = mahadasha
        mahadasha_entry = {
            "Dasha Lord": mahadasha_lord,
            "Start Date": mahadasha_start.strftime("%Y-%m-%d"),
            "End Date": mahadasha_end.strftime("%Y-%m-%d"),
            "Antardashas": [],
        }

        # Calculate Antardashas for the current Mahadasha
        antardasha = calculate_antardasha(
            mahadasha_lord,
            mahadasha_start,
            (mahadasha_end - mahadasha_start).days / 365.25,
        )
        for antardasha_lord, antardasha_start, antardasha_end in antardasha:
            mahadasha_entry["Antardashas"].append(
                {
                    "Antardasha Lord": antardasha_lord,
                    "Start Date": antardasha_start.strftime("%Y-%m-%d"),
                    "End Date": antardasha_end.strftime("%Y-%m-%d"),
                }
            )

        dasha_data.append(mahadasha_entry)

    return dasha_data


def get_venus_mahadasha_description(sign, house):
    """
    Generate a descriptive interpretation for Venus Mahadasha based on its sign and house placement.

    Args:
        sign (str): The zodiac sign where Venus is placed.
        house (int): The house number where Venus is placed.

    Returns:
        str: A detailed description of Venus Mahadasha.
    """
    # General description for Venus Mahadasha
    description = f"During Venus Mahadasha, the planet Venus, placed in the {house}th house in the sign of {sign}, brings significant influence on your life. Venus, the planet of love, beauty, luxury, and relationships, enhances creativity, harmony, and material comforts during this period. "

    # House-specific effects
    house_effects = {
        1: "Venus in the 1st house makes you charming, attractive, and socially graceful. You may gain recognition for your beauty, creativity, and ability to connect with others.",
        2: "Venus in the 2nd house brings financial stability, a love for luxury, and harmonious family relationships. You may acquire wealth through artistic or creative pursuits.",
        3: "Venus in the 3rd house enhances communication skills, creativity, and relationships with siblings. You may excel in writing, media, or artistic endeavors.",
        4: "Venus in the 4th house brings harmony to your home life. You may acquire property, enjoy luxurious comforts, and have a strong emotional connection with your family.",
        5: "Venus in the 5th house enhances creativity, romance, and love for the arts. You may experience joy through children, artistic pursuits, or romantic relationships.",
        6: "Venus in the 6th house may bring challenges in relationships or health, but it also enhances your ability to find beauty in service and daily routines.",
        7: "Venus in the 7th house strengthens partnerships and marriage. You may attract a loving and harmonious partner, and relationships will play a central role in your life.",
        8: "Venus in the 8th house brings transformation through relationships and shared resources. You may develop an interest in the occult, mysteries, or deep emotional connections.",
        9: "Venus in the 9th house enhances your love for travel, philosophy, and higher learning. You may find joy in exploring foreign cultures or spiritual pursuits.",
        10: "Venus in the 10th house brings success and recognition in your career. You may excel in fields related to beauty, art, or diplomacy, and gain a high social status.",
        11: "Venus in the 11th house brings gains through social networks, friendships, and artistic collaborations. You may achieve your aspirations with the help of influential people.",
        12: "Venus in the 12th house enhances spiritual growth, creativity, and love for solitude. You may experience hidden or secretive relationships and find joy in artistic or spiritual pursuits.",
    }
    description += house_effects.get(house, "")

    # Sign-specific effects
    sign_effects = {
        "Aries": "Venus in Aries brings boldness and passion to your relationships. You may seek excitement and adventure in love and creative pursuits.",
        "Taurus": "Venus in Taurus, its own sign, enhances stability, sensuality, and a love for material comforts. You may enjoy financial growth and emotional security.",
        "Gemini": "Venus in Gemini makes you communicative and flirtatious. You may excel in writing, media, or intellectual pursuits, and enjoy variety in relationships.",
        "Cancer": "Venus in Cancer brings emotional depth and nurturing qualities to your relationships. You may find joy in family life and creative expression.",
        "Leo": "Venus in Leo enhances your charisma, creativity, and love for the spotlight. You may gain recognition for your artistic talents and enjoy romantic relationships.",
        "Virgo": "Venus in Virgo, its debilitated sign, may bring challenges in expressing love and affection. However, it enhances your practical approach to relationships and creativity.",
        "Libra": "Venus in Libra, its exalted sign, brings harmony, balance, and beauty to your life. You may excel in relationships, diplomacy, and artistic pursuits.",
        "Scorpio": "Venus in Scorpio brings intensity and passion to your relationships. You may experience transformative love and develop a deep interest in the mysteries of life.",
        "Sagittarius": "Venus in Sagittarius enhances your love for adventure, travel, and philosophy. You may find joy in exploring new cultures and expanding your horizons.",
        "Capricorn": "Venus in Capricorn brings a practical and disciplined approach to love and relationships. You may achieve success in career and long-term commitments.",
        "Aquarius": "Venus in Aquarius enhances your love for innovation, freedom, and unconventional relationships. You may excel in social causes and creative collaborations.",
        "Pisces": "Venus in Pisces, its exalted sign, brings compassion, spirituality, and artistic brilliance. You may experience deep emotional connections and creative inspiration.",
    }
    description += " " + sign_effects.get(sign, "")

    return description


def refine_transition_jd(jd_low, jd_high, check_func, tol=0.0001):
    """
    Refine the transition JD where check_func(jd) changes value between jd_low and jd_high.
    Uses binary search within tolerance tol (in Julian days).
    check_func should return a boolean or discrete state.
    """
    val_low = check_func(jd_low)
    val_high = check_func(jd_high)
    if val_low == val_high:
        return jd_high  # No transition in range

    while jd_high - jd_low > tol:
        jd_mid = (jd_low + jd_high) / 2.0
        val_mid = check_func(jd_mid)
        if val_mid == val_low:
            jd_low = jd_mid
        else:
            jd_high = jd_mid

    return jd_high


def calculate_sade_sati_and_panoti_phases(moon_longitude, birth_date):
    swe.set_sid_mode(swe.SIDM_LAHIRI)

    moon_sign_index = int(moon_longitude // 30)

    end_date = birth_date + timedelta(days=int(100 * 365.25))
    jd_start = swe.julday(birth_date.year, birth_date.month, birth_date.day)
    jd_end = swe.julday(end_date.year, end_date.month, end_date.day)

    def get_saturn_sign(jd_ut):
        lon = swe.calc_ut(jd_ut, swe.SATURN, swe.FLG_SIDEREAL)[0][0]
        return int(lon // 30)

    def is_saturn_retrograde(jd_ut):
        return swe.calc_ut(jd_ut, swe.SATURN, swe.FLG_SIDEREAL)[1] < 0

    def jd_to_datetime(jd):
        y, m, d, frac = swe.revjul(jd)
        hours = int(frac * 24)
        minutes = int((frac * 24 - hours) * 60)
        seconds = int((((frac * 24 - hours) * 60) - minutes) * 60)
        return datetime(y, m, int(d), hours, minutes, seconds)

    phases = []
    sade_sati_started = False

    current_jd = jd_start
    current_sign = get_saturn_sign(current_jd)
    current_retro = is_saturn_retrograde(current_jd)
    phase_start_jd = current_jd

    while current_jd <= jd_end:
        next_jd = current_jd + 1

        next_sign = get_saturn_sign(next_jd)
        next_retro = is_saturn_retrograde(next_jd)

        sign_changed = next_sign != current_sign
        retro_changed = next_retro != current_retro

        if sign_changed or retro_changed:
            # Refine the exact JD of transition:
            def check_func(jd):
                # Returns a tuple (sign, retro) for comparison
                return (get_saturn_sign(jd), is_saturn_retrograde(jd))

            def transition_check(jd):
                # Binary search wants a bool, so return True if sign/retro same as current, else False
                s, r = check_func(jd)
                return s == current_sign and r == current_retro

            exact_transition_jd = refine_transition_jd(
                current_jd, next_jd, transition_check
            )

            rel_pos = (current_sign - moon_sign_index) % 12

            phase_type = None
            if rel_pos == 11:
                phase_type = "Sade Sati Rising"
                sade_sati_started = True
            elif rel_pos == 0:
                phase_type = "Sade Sati Peak"
                sade_sati_started = True
            elif rel_pos == 1:
                phase_type = "Sade Sati Setting"
                sade_sati_started = True
            elif rel_pos in [3, 7] and sade_sati_started:
                phase_type = "Small Panoti"

            if phase_type:
                phases.append(
                    {
                        "phase": phase_type,
                        "sign": get_sign_name(current_sign),
                        "start": jd_to_datetime(phase_start_jd).strftime("%B %d, %Y"),
                        "end": jd_to_datetime(exact_transition_jd).strftime(
                            "%B %d, %Y"
                        ),
                    }
                )

            phase_start_jd = exact_transition_jd
            current_sign = next_sign
            current_retro = next_retro

            current_jd = next_jd
        else:
            current_jd = next_jd

    # Final phase close
    rel_pos = (current_sign - moon_sign_index) % 12
    phase_type = None
    if rel_pos == 11:
        phase_type = "Sade Sati Rising"
        sade_sati_started = True
    elif rel_pos == 0:
        phase_type = "Sade Sati Peak"
        sade_sati_started = True
    elif rel_pos == 1:
        phase_type = "Sade Sati Setting"
        sade_sati_started = True
    elif rel_pos in [3, 7] and sade_sati_started:
        phase_type = "Small Panoti"

    if phase_type:
        phases.append(
            {
                "phase": phase_type,
                "sign": get_sign_name(current_sign),
                "start": jd_to_datetime(phase_start_jd).strftime("%B %d, %Y"),
                "end": jd_to_datetime(jd_end).strftime("%B %d, %Y"),
            }
        )

    phases.sort(key=lambda x: datetime.strptime(x["start"], "%B %d, %Y"))
    return phases


def get_sade_sati_and_panoti_phases(moon_longitude, birth_date):
    swe.set_sid_mode(swe.SIDM_LAHIRI)
    moon_sign_index = int(moon_longitude // 30)

    # Analyze 100 years of Saturn transit
    end_date = birth_date + timedelta(days=int(100 * 365.25))
    jd_start = swe.julday(birth_date.year, birth_date.month, birth_date.day)
    jd_end = swe.julday(end_date.year, end_date.month, end_date.day)

    def get_saturn_sign(jd_ut):
        saturn_long = swe.calc_ut(jd_ut, swe.SATURN, swe.FLG_SIDEREAL)[0][0]
        return int(saturn_long // 30)

    def jd_to_date(jd):
        y, m, d, _ = swe.revjul(jd)
        return date(y, m, int(d))

    # ...existing code...
    sade_sati_phases = []
    small_panoti_periods = []

    current_jd = jd_start
    current_sign = get_saturn_sign(current_jd)
    phase_start_date = jd_to_date(current_jd)
    phase_sign = current_sign  # Track the sign for the phase

    sade_sati_started = False

    while current_jd <= jd_end:
        next_jd = current_jd + 1
        next_sign = get_saturn_sign(next_jd)

        if next_sign != current_sign:
            phase_end_date = jd_to_date(next_jd - 1)
            rel_pos = (current_sign - moon_sign_index) % 12

            if rel_pos == 11:
                sade_sati_phases.append(
                    ("Sade Sati Rising", phase_start_date, phase_end_date, current_sign)
                )
                sade_sati_started = True
            elif rel_pos == 0:
                sade_sati_phases.append(
                    ("Sade Sati Peak", phase_start_date, phase_end_date, current_sign)
                )
                sade_sati_started = True
            elif rel_pos == 1:
                sade_sati_phases.append(
                    (
                        "Sade Sati Setting",
                        phase_start_date,
                        phase_end_date,
                        current_sign,
                    )
                )
                sade_sati_started = True
            elif rel_pos in [3, 7] and sade_sati_started:
                small_panoti_periods.append(
                    ("Small Panoti", phase_start_date, phase_end_date, current_sign)
                )

            phase_start_date = jd_to_date(next_jd)
            current_sign = next_sign

        current_jd = next_jd

    # Final phase check
    rel_pos = (current_sign - moon_sign_index) % 12
    final_end = jd_to_date(jd_end)
    if rel_pos == 11:
        sade_sati_phases.append(
            ("Sade Sati Rising", phase_start_date, final_end, current_sign)
        )
    elif rel_pos == 0:
        sade_sati_phases.append(
            ("Sade Sati Peak", phase_start_date, final_end, current_sign)
        )
    elif rel_pos == 1:
        sade_sati_phases.append(
            ("Sade Sati Setting", phase_start_date, final_end, current_sign)
        )
    elif rel_pos in [3, 7] and sade_sati_started:
        small_panoti_periods.append(
            ("Small Panoti", phase_start_date, final_end, current_sign)
        )

    # Combine and sort
    all_phases = sade_sati_phases + small_panoti_periods
    all_phases.sort(key=lambda x: x[1])

    return [
        {
            "phase": phase,
            "sign": get_sign_name(sign),
            "start": start.strftime("%B %d, %Y"),
            "end": end.strftime("%B %d, %Y"),
        }
        for phase, start, end, sign in all_phases
    ]
    # ...existing code...


def calculate_karakas(astro_data):
    """
    Calculate Karakas based on degrees, minutes, and seconds within the sign.
    This uses BPHS rule: highest position in sign gets Atma Karaka, etc.
    """

    def degree_key(p):
        deg = int(p["degree_in_sign"])
        minutes = int((p["degree_in_sign"] - deg) * 60)
        seconds = int((((p["degree_in_sign"] - deg) * 60) - minutes) * 60)
        return (deg, minutes, seconds)

    # Only include Sun to Rahu
    filtered_planets = [
        p
        for p in astro_data
        if p["planet"]
        in ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn", "Rahu"]
    ]

    # Sort by degree_in_sign, then minutes, then seconds – descending
    sorted_planets = sorted(filtered_planets, key=degree_key, reverse=True)

    # Assign Karakas
    karakas = {
        "Atma Karaka": {
            "planet": sorted_planets[0]["planet"],
            "sign": sorted_planets[0]["sign"],
        },
        "Amatya Karaka": {
            "planet": sorted_planets[1]["planet"],
            "sign": sorted_planets[1]["sign"],
        },
        "Bhratru Karaka": {
            "planet": sorted_planets[2]["planet"],
            "sign": sorted_planets[2]["sign"],
        },
        "Matru Karaka": {
            "planet": sorted_planets[3]["planet"],
            "sign": sorted_planets[3]["sign"],
        },
        "Putra Karaka": {
            "planet": sorted_planets[4]["planet"],
            "sign": sorted_planets[4]["sign"],
        },
        "Gnati Karaka": {
            "planet": sorted_planets[5]["planet"],
            "sign": sorted_planets[5]["sign"],
        },
        "Dara Karaka": {
            "planet": sorted_planets[6]["planet"],
            "sign": sorted_planets[6]["sign"],
        },
    }

    # Optional: include Pitru Karaka for 8-karaka system
    if len(sorted_planets) > 7:
        karakas["Pitru Karaka"] = {
            "planet": sorted_planets[7]["planet"],
            "sign": sorted_planets[7]["sign"],
        }

    return karakas


def calculate_planet_strength_in_dcharts(
    planet_name, planet_longitude, ascendant_longitude
):
    """
    Calculate the strength of a planet in all divisional charts (D-charts).

    Args:
        planet_name (str): Name of the planet (e.g., "Sun").
        planet_longitude (float): Absolute longitude of the planet in degrees.
        ascendant_longitude (float): Ascendant longitude in degrees.

    Returns:
        dict: Strength of the planet in all divisional charts.
    """
    divisional_charts_strength = {}

    # Calculate strengths in various divisional charts
    divisional_charts_strength["Rasi"] = get_strength_based_avastha(
        get_sign_name(int(planet_longitude // 30)), planet_name, planet_longitude % 30
    )
    divisional_charts_strength["Navamsa"] = get_strength_based_avastha(
        get_sign_name(calculate_navamsa_sign_bphs(planet_longitude) - 1),
        planet_name,
        planet_longitude % (30 / 9),
    )
    divisional_charts_strength["Dasamsa"] = get_strength_based_avastha(
        get_sign_name(calculate_dasamsa_sign_bphs(planet_longitude) - 1),
        planet_name,
        planet_longitude % (30 / 10),
    )
    divisional_charts_strength["Drekkana"] = get_strength_based_avastha(
        get_sign_name(calculate_drekkana_sign_bphs(planet_longitude) - 1),
        planet_name,
        planet_longitude % (30 / 3),
    )
    divisional_charts_strength["Saptamsa"] = get_strength_based_avastha(
        get_sign_name(calculate_saptamsa_sign_bphs(planet_longitude) - 1),
        planet_name,
        planet_longitude % (30 / 7),
    )
    divisional_charts_strength["Dvadasamsa"] = get_strength_based_avastha(
        get_sign_name(calculate_dvadasamsa_sign_bphs(planet_longitude) - 1),
        planet_name,
        planet_longitude % (30 / 12),
    )
    divisional_charts_strength["Trimsamsa"] = get_strength_based_avastha(
        get_sign_name(calculate_trimsamsa_sign_bphs(planet_longitude) - 1),
        planet_name,
        planet_longitude % (30 / 30),
    )

    divisional_charts_strength["Shodasamsa"] = get_strength_based_avastha(
        get_sign_name(calculate_shodasamsa_sign_bphs(planet_longitude) - 1),
        planet_name,
        planet_longitude % (30 / 16),
    )
    divisional_charts_strength["Bhamsa"] = get_strength_based_avastha(
        get_sign_name(calculate_bhamsa_sign_bphs(planet_longitude) - 1),
        planet_name,
        planet_longitude % (30 / 27),
    )
    divisional_charts_strength["Shashtiamsa"] = get_strength_based_avastha(
        get_sign_name(calculate_shashtiamsa_sign_bphs(planet_longitude) - 1),
        planet_name,
        planet_longitude % (30 / 60),
    )
    divisional_charts_strength["Chaturthamsa"] = get_strength_based_avastha(
        get_sign_name(calculate_chaturthamsa_sign_bphs(planet_longitude) - 1),
        planet_name,
        planet_longitude % (30 / 4),
    )
    divisional_charts_strength["Akshavedamsa"] = get_strength_based_avastha(
        get_sign_name(calculate_akshavedamsa_sign_bphs(planet_longitude) - 1),
        planet_name,
        planet_longitude % (30 / 8),
    )
    divisional_charts_strength["Hora"] = get_strength_based_avastha(
        get_sign_name(calculate_hora_sign_bphs(planet_longitude) - 1),
        planet_name,
        planet_longitude % (30 / 2),
    )

    return divisional_charts_strength


# Define ascendant_traits globally
ascendant_traits = {
    "Aries": "dynamic, bold, and energetic",
    "Taurus": "steady, patient, and sensual",
    "Gemini": "intelligent, curious, and sociable",
    "Cancer": "sensitive, nurturing, and intuitive",
    "Leo": "confident, generous, and creative",
    "Virgo": "analytical, practical, and detail-oriented",
    "Libra": "graceful, diplomatic, and harmonious",
    "Scorpio": "intense, secretive, and passionate",
    "Sagittarius": "optimistic, adventurous, and wise",
    "Capricorn": "disciplined, serious, and ambitious",
    "Aquarius": "innovative, unique, and idealistic",
    "Pisces": "dreamy, compassionate, and artistic",
}


def get_first_house_effects(ascendant_sign, astro_data, aspects):
    # Planetary personality effects when influencing the 1st house (via aspect or placement)
    planet_influence = {
        "Sun": "adds vitality, ego strength, and a strong identity.",
        "Moon": "brings emotional depth, intuition, and sensitivity.",
        "Mars": "brings courage, assertiveness, and aggressive energy.",
        "Mercury": "enhances intelligence, wit, and adaptability.",
        "Jupiter": "adds optimism, wisdom, and growth-oriented mindset.",
        "Venus": "enhances charm, beauty, and social grace.",
        "Saturn": "adds seriousness, discipline, and cautious behavior.",
        "Rahu": "adds ambition, unconventional thinking, and charisma.",
        "Ketu": "brings detachment, spiritual orientation, and inner focus.",
    }

    first_lord_house_effects = {
        1: "indicates strong self-focus, confidence, and leadership.",
        2: "connects the personality with speech, wealth, and family values.",
        3: "gives a communicative, bold, and adventurous nature.",
        4: "ties personality with emotional roots, home, and security.",
        5: "adds creativity, intelligence, and a romantic or expressive personality.",
        6: "can bring a service-oriented, disciplined, or struggle-filled personality.",
        7: "orients personality toward partnerships and public life.",
        8: "gives a mysterious, transformative, or research-inclined personality.",
        9: "creates a philosophical, lucky, and dharma-driven personality.",
        10: "focuses personality toward career, ambition, and responsibility.",
        11: "brings a social, goal-oriented, and friend-loving personality.",
        12: "leads to a spiritual, reclusive, or foreign-influenced personality.",
    }

    first_lord_sign_effects = {
        "Aries": "The native expresses themselves in a bold and direct manner.",
        "Taurus": "The personality tends to be calm, sensual, and stable.",
        "Gemini": "Brings adaptability, curiosity, and clever communication.",
        "Cancer": "Creates a sensitive, nurturing, and protective nature.",
        "Leo": "Gives pride, creativity, and a need to shine.",
        "Virgo": "Brings detail-orientation, intellect, and critical thinking.",
        "Libra": "Creates diplomacy, charm, and a balanced outlook.",
        "Scorpio": "Makes the native intense, private, and strategic.",
        "Sagittarius": "Gives an adventurous, optimistic, and philosophical personality.",
        "Capricorn": "Brings discipline, ambition, and a practical nature.",
        "Aquarius": "Makes the native idealistic, progressive, and humanitarian.",
        "Pisces": "Creates a dreamy, intuitive, and compassionate personality.",
    }

    aspect_effects = []  # will hold text for each planet aspecting 1st house

    # Get 1st house lord info
    first_house_lord = sign_lords_map[ascendant_sign]
    lord_placement = next(
        (p for p in astro_data if p["planet"] == first_house_lord), None
    )

    # Collect only planet names in the first house
    planets_in_first_house = [p["planet"] for p in astro_data if p["house_number"] == 1]

    # --- Description begins ---
    desc = []

    # Ascendant trait
    if ascendant_sign in ascendant_traits:
        desc.append(
            f"The Ascendant is {ascendant_sign}, making the native {ascendant_traits[ascendant_sign]}."
        )

    # Planet in 1st house
    if planets_in_first_house:
        desc.append(
            "Planets in the 1st house: " + ", ".join(planets_in_first_house) + "."
        )
        for planet in planets_in_first_house:
            effect = planet_influence.get(
                planet, "has a strong impact on the personality."
            )
            desc.append(f"{planet} {effect}")
    else:
        desc.append(
            "There are no planets in the 1st house, so the personality is shaped mainly by the Ascendant sign and its lord."
        )

    # Planet aspecting 1st house
    first_house_aspects = [a for a in aspects if a["house_aspected"] == 1]
    for asp in first_house_aspects:
        planet = asp["planet"]
        aspect_number = asp["aspect"]
        influence = planet_influence.get(planet, "has a general influence.")
        aspect_effects.append(
            f"{planet} aspects the 1st house with a {aspect_number}th aspect, {influence}"
        )

        # Add interpretation of Lagna lord placement
    if lord_placement:
        house = lord_placement["house_number"]
        sign = lord_placement["sign"]
        lord_house_meaning = first_lord_house_effects.get(house, "")
        lord_sign_meaning = first_lord_sign_effects.get(sign, "")

        desc.append(
            f"The lord of the 1st house, {first_house_lord}, is placed in {sign} in the {house}th house. "
            f"{lord_sign_meaning} This placement {lord_house_meaning}"
        )

    return {
        "first_house_sign": ascendant_sign,
        "first_house_lord": {
            "planet": first_house_lord,
            "sign": lord_placement["sign"] if lord_placement else None,
            "house_number": lord_placement["house_number"] if lord_placement else None,
        },
        "planets_in_first_house": planets_in_first_house,
        "planets_aspecting_first_house": first_house_aspects,
        "interpretation": " ".join(desc),
    }


def get_second_house_effects(ascendant_sign, astro_data, aspects):
    # Effects of planets influencing the 2nd house (by aspect or placement)
    planet_influence = {
        "Sun": "brings focus on pride in speech, family, and wealth.",
        "Moon": "adds emotional attachment to family and nurturing speech.",
        "Mars": "adds assertiveness in communication and active earning.",
        "Mercury": "enhances clever speech, intellect, and financial skills.",
        "Jupiter": "brings wealth, wisdom in speech, and family harmony.",
        "Venus": "adds sweetness to speech, love for comforts, and charm.",
        "Saturn": "adds seriousness, frugality, and possible family distance.",
        "Rahu": "brings material ambition, unusual speech, and craving for wealth.",
        "Ketu": "creates detachment from wealth or speech, spiritualizing values.",
    }

    second_lord_house_effects = {
        1: "connects wealth and speech with the self and personal identity.",
        2: "gives strong family bonds and stable wealth-building ability.",
        3: "indicates earning through communication, courage, or siblings.",
        4: "connects wealth with property, emotions, and family values.",
        5: "brings financial gains through intellect, creativity, or children.",
        6: "can lead to expenses through debts or disputes in the family.",
        7: "ties income with business partnerships or spouse support.",
        8: "may bring inherited wealth or sudden financial ups/downs.",
        9: "creates a dharmic and fortunate flow of wealth through ethics.",
        10: "shows income from career, authority, or government-related fields.",
        11: "gives gains through networks, social circles, and ambitions.",
        12: "may indicate expenditure, foreign income, or spiritual wealth.",
    }

    second_lord_sign_effects = {
        "Aries": "indicates quick-spending habits and energetic communication.",
        "Taurus": "brings stability, material comfort, and sweet speech.",
        "Gemini": "enhances communicative skills, trading, and clever speech.",
        "Cancer": "adds emotional tone to speech and attachment to family.",
        "Leo": "brings pride in heritage, authoritative speech, and luxury focus.",
        "Virgo": "indicates analytical speech, business skills, and practicality.",
        "Libra": "gives diplomatic speech and balance in material pursuits.",
        "Scorpio": "adds intensity to speech, secretiveness, and complex family ties.",
        "Sagittarius": "gives philosophical or righteous values and wealth potential.",
        "Capricorn": "brings structured, disciplined speech and financial responsibility.",
        "Aquarius": "shows unconventional sources of wealth and detached speech.",
        "Pisces": "indicates imaginative speech and spiritual value of wealth.",
    }

    aspect_effects = []

    second_house_sign_index = (ZODIAC_SIGN_TO_INDEX[ascendant_sign] + 1) % 12
    second_house_sign = get_sign_name(second_house_sign_index)

    second_house_lord = sign_lords_map[second_house_sign]
    lord_placement = next(
        (p for p in astro_data if p["planet"] == second_house_lord), None
    )

    planets_in_second_house = [p for p in astro_data if p["house_number"] == 2]

    desc = []

    desc.append(
        f"The 2nd house falls in {second_house_sign}, focusing on wealth, speech, values, and family life."
    )

    # Planets placed in 2nd house
    if planets_in_second_house:
        desc.append(
            "Planets in the 2nd house: "
            + ", ".join(p["planet"] for p in planets_in_second_house)
            + "."
        )
        for p in planets_in_second_house:
            effect = planet_influence.get(
                p["planet"], "has a strong effect on wealth and speech."
            )
            desc.append(f"{p['planet']} {effect}")
    else:
        desc.append(
            "There are no planets in the 2nd house, so its qualities depend on the house lord and aspects."
        )

    # Planets aspecting 2nd house
    second_house_aspects = [a for a in aspects if a["house_aspected"] == 2]
    for asp in second_house_aspects:
        planet = asp["planet"]
        aspect_number = asp["aspect"]
        influence = planet_influence.get(planet, "has a general influence.")
        aspect_effects.append(
            f"{planet} aspects the 2nd house with a {aspect_number}th aspect, {influence}"
        )

    desc.extend(aspect_effects)

    # Add interpretation of 2nd lord placement
    if lord_placement:
        house = lord_placement["house_number"]
        sign = lord_placement["sign"]
        house_effect = second_lord_house_effects.get(house, "")
        sign_effect = second_lord_sign_effects.get(sign, "")
        desc.append(
            f"The 2nd house lord, {second_house_lord}, is placed in {sign} in the {house}th house. "
            f"{sign_effect} This placement {house_effect}"
        )

    return {
        "second_house_sign": second_house_sign,
        "second_house_lord": {
            "planet": second_house_lord,
            "sign": lord_placement["sign"] if lord_placement else None,
            "house_number": lord_placement["house_number"] if lord_placement else None,
        },
        "planets_in_second_house": planets_in_second_house,
        "planets_aspecting_second_house": second_house_aspects,
        "interpretation": " ".join(desc),
    }


def get_third_house_effects(ascendant_sign, astro_data, aspects):
    planet_influence = {
        "Sun": "brings confidence in communication and strong willpower.",
        "Moon": "adds emotional sensitivity to communication and closeness with siblings.",
        "Mars": "gives courage, energy, and strong sibling dynamics.",
        "Mercury": "enhances communication, writing, and intellectual skills.",
        "Jupiter": "brings wisdom, optimism, and noble communication.",
        "Venus": "adds charm, artistic skills, and love for siblings or travel.",
        "Saturn": "brings discipline, cautious expression, and reserved communication.",
        "Rahu": "adds ambition, tech-savviness, and unconventional skills.",
        "Ketu": "creates detachment, spiritual skills, or hidden talents.",
    }

    third_lord_house_effects = {
        1: "connects skills and communication with self-expression and personal courage.",
        2: "shows effort toward wealth, speech skills, or family responsibilities.",
        3: "gives strong self-expression and sibling connections.",
        4: "relates skills to home, education, or emotional strength.",
        5: "brings creativity, writing talents, or romantic communication.",
        6: "can cause sibling rivalry, disputes, or service-oriented expression.",
        7: "links communication to partnerships, business, or spouse.",
        8: "brings secretive communication, research skills, or sudden travel.",
        9: "connects skills to higher learning, religion, or fortune.",
        10: "shows effort in career, public speaking, or professional writing.",
        11: "brings gains from communication, networks, or tech.",
        12: "can cause hidden skills, spiritual travel, or foreign expression.",
    }

    third_lord_sign_effects = {
        "Aries": "gives bold, action-oriented communication and adventurous skills.",
        "Taurus": "adds steady speech, artistic talent, and musical skills.",
        "Gemini": "enhances wit, speech, writing, and media-savviness.",
        "Cancer": "brings emotional expression and attachment to siblings.",
        "Leo": "adds dramatic expression, leadership through communication.",
        "Virgo": "indicates precise speech, logical writing, and analysis.",
        "Libra": "adds diplomacy, fairness, and aesthetic communication.",
        "Scorpio": "brings secretive, intense, or investigative speech.",
        "Sagittarius": "adds philosophical views, inspirational communication.",
        "Capricorn": "shows mature speech, serious tone, and structured skills.",
        "Aquarius": "adds progressive, tech-driven or reformative communication.",
        "Pisces": "brings imaginative, poetic, or dreamy communication.",
    }

    aspect_effects = []

    third_house_sign_index = (ZODIAC_SIGN_TO_INDEX[ascendant_sign] + 2) % 12
    third_house_sign = get_sign_name(third_house_sign_index)

    third_house_lord = sign_lords_map[third_house_sign]
    lord_placement = next(
        (p for p in astro_data if p["planet"] == third_house_lord), None
    )

    planets_in_third_house = [p["planet"] for p in astro_data if p["house_number"] == 3]

    desc = []

    desc.append(
        f"The 3rd house falls in {third_house_sign}, focusing on communication, courage, siblings, and effort."
    )

    # Planets in 3rd house
    if planets_in_third_house:
        desc.append(
            "Planets in the 3rd house: " + ", ".join(planets_in_third_house) + "."
        )
        for planet in planets_in_third_house:
            effect = planet_influence.get(
                planet, "has a strong effect on courage and communication."
            )
            desc.append(f"{planet} {effect}")
    else:
        desc.append(
            "There are no planets in the 3rd house, so its traits depend on the house lord and aspects."
        )

    # Planets aspecting 3rd house
    third_house_aspects = [a for a in aspects if a["house_aspected"] == 3]
    for asp in third_house_aspects:
        planet = asp["planet"]
        aspect_number = asp["aspect"]
        influence = planet_influence.get(planet, "has a general influence.")
        aspect_effects.append(
            f"{planet} aspects the 3rd house with a {aspect_number}th aspect, {influence}"
        )

    desc.extend(aspect_effects)

    # 3rd lord placement analysis
    if lord_placement:
        house = lord_placement["house_number"]
        sign = lord_placement["sign"]
        house_effect = third_lord_house_effects.get(house, "")
        sign_effect = third_lord_sign_effects.get(sign, "")
        desc.append(
            f"The 3rd house lord, {third_house_lord}, is placed in {sign} in the {house}th house. "
            f"{sign_effect} This placement {house_effect}"
        )

    return {
        "third_house_sign": third_house_sign,
        "third_house_lord": {
            "planet": third_house_lord,
            "sign": lord_placement["sign"] if lord_placement else None,
            "house_number": lord_placement["house_number"] if lord_placement else None,
        },
        "planets_in_third_house": planets_in_third_house,
        "planets_aspecting_third_house": third_house_aspects,
        "interpretation": " ".join(desc),
    }


def get_fourth_house_effects(ascendant_sign, astro_data, aspects):
    # Effects of planets influencing the 4th house (by aspect or placement)
    planet_influence = {
        "Sun": "brings pride in home and lineage, but can create emotional dryness.",
        "Moon": "gives strong attachment to home, mother, and emotional peace.",
        "Mars": "adds energy to property matters, but can cause domestic conflict.",
        "Mercury": "enhances communication at home and brings analytical comfort.",
        "Jupiter": "brings harmony, learning environment, and motherly blessings.",
        "Venus": "adds luxury, beauty, and emotional softness in home life.",
        "Saturn": "may delay comforts, create emotional blockages, or separation from mother.",
        "Rahu": "brings foreign or unconventional home settings and inner restlessness.",
        "Ketu": "creates detachment from domestic life, or interest in spiritual seclusion.",
    }

    fourth_lord_house_effects = {
        1: "connects emotional peace with the self; may live near birthplace.",
        2: "shows gains from family property and values-based home environment.",
        3: "indicates changes of residence and emotional bonds with siblings.",
        4: "strong comfort and inner stability, attachment to mother and property.",
        5: "brings joy at home, creativity in environment, and maternal intelligence.",
        6: "may bring challenges at home or health issues to mother.",
        7: "connects comforts with spouse or foreign residence.",
        8: "may show sudden changes in residence or property inheritance issues.",
        9: "brings spiritual and moral values into the home life.",
        10: "connects career with homeland, or stress between work and comfort.",
        11: "gains from property or real estate networks; emotional support from friends.",
        12: "indicates emotional seclusion, distant residence, or spiritual home life.",
    }

    fourth_lord_sign_effects = {
        "Aries": "adds active domestic life and desire to control the home.",
        "Taurus": "brings beauty, comfort, and financial stability at home.",
        "Gemini": "indicates a communicative, dynamic home environment.",
        "Cancer": "very strong placement—deep emotional security and maternal care.",
        "Leo": "brings pride in family background and desire to display status.",
        "Virgo": "creates orderly, analytical, or critical home environment.",
        "Libra": "brings balance, peace, and harmony at home.",
        "Scorpio": "indicates intensity, secrecy, or transformational home events.",
        "Sagittarius": "gives philosophical and spacious home life, love for learning.",
        "Capricorn": "indicates discipline, simplicity, or burden in domestic matters.",
        "Aquarius": "adds innovation or detachment in domestic environment.",
        "Pisces": "shows spiritual, dreamy, or emotionally fluid home conditions.",
    }

    aspect_effects = []

    fourth_house_sign_index = (ZODIAC_SIGN_TO_INDEX[ascendant_sign] + 3) % 12
    fourth_house_sign = get_sign_name(fourth_house_sign_index)

    fourth_house_lord = sign_lords_map[fourth_house_sign]
    lord_placement = next(
        (p for p in astro_data if p["planet"] == fourth_house_lord), None
    )

    planets_in_fourth_house = [
        p["planet"] for p in astro_data if p["house_number"] == 4
    ]

    desc = []
    desc.append(
        f"The 4th house falls in {fourth_house_sign}, focusing on home, emotional security, mother, property, and comforts."
    )

    # Planets placed in 4th house
    if planets_in_fourth_house:
        desc.append(
            "Planets in the 4th house: " + ", ".join(planets_in_fourth_house) + "."
        )
        for planet in planets_in_fourth_house:
            effect = planet_influence.get(
                planet, "influences the emotional and domestic sphere."
            )
            desc.append(f"{planet} {effect}")
    else:
        desc.append(
            "There are no planets in the 4th house, so its outcomes rely on the house lord and aspects."
        )

    # Planets aspecting 4th house
    fourth_house_aspects = [a for a in aspects if a["house_aspected"] == 4]
    for asp in fourth_house_aspects:
        planet = asp["planet"]
        aspect_number = asp["aspect"]
        influence = planet_influence.get(planet, "has a general influence.")
        aspect_effects.append(
            f"{planet} aspects the 4th house with a {aspect_number}th aspect, {influence}"
        )

    desc.extend(aspect_effects)

    # Add interpretation of 4th lord placement
    if lord_placement:
        house = lord_placement["house_number"]
        sign = lord_placement["sign"]
        house_effect = fourth_lord_house_effects.get(house, "")
        sign_effect = fourth_lord_sign_effects.get(sign, "")
        desc.append(
            f"The 4th house lord, {fourth_house_lord}, is placed in {sign} in the {house}th house. "
            f"{sign_effect} This placement {house_effect}"
        )

    return {
        "fourth_house_sign": fourth_house_sign,
        "fourth_house_lord": {
            "planet": fourth_house_lord,
            "sign": lord_placement["sign"] if lord_placement else None,
            "house_number": lord_placement["house_number"] if lord_placement else None,
        },
        "planets_in_fourth_house": planets_in_fourth_house,  # now just names
        "planets_aspecting_fourth_house": fourth_house_aspects,
        "interpretation": " ".join(desc),
    }


def get_fifth_house_effects(ascendant_sign, astro_data, aspects):
    # Effects of planets influencing the 5th house (by aspect or placement)
    planet_influence = {
        "Sun": "brings pride in children, strong intelligence, but can cause ego issues.",
        "Moon": "gives emotional bonding with children and creative intuition.",
        "Mars": "adds passion, competitive drive, but possible conflicts in romance.",
        "Mercury": "enhances intellect, humor, and communication in creative work.",
        "Jupiter": "gives strong spiritual and moral intelligence, good for children.",
        "Venus": "brings romance, charm, love for art and pleasure in creativity.",
        "Saturn": "may delay children or romance, but gives disciplined creativity.",
        "Rahu": "brings unconventional or sudden romantic experiences, sharp intellect.",
        "Ketu": "gives spiritual detachment or karmic lessons related to children.",
    }

    fifth_lord_house_effects = {
        1: "makes the native creative, intelligent, and self-expressive.",
        2: "brings gains from creative work and value-based romance or children.",
        3: "adds courage and expression to creativity, may write or perform.",
        4: "connects creative joy with home and emotional environment.",
        5: "very strong—natural creativity, good progeny and sharp intellect.",
        6: "may bring challenges in childbirth or conflicts in love.",
        7: "romantic involvement may become serious; success via partner.",
        8: "gives deep transformation through children or creative pursuits.",
        9: "brings fortune and luck through children, teaching, or dharma.",
        10: "makes creative pursuits visible in career or public image.",
        11: "gains from creativity, network support for love and children.",
        12: "romance or children may involve distant lands or inner sacrifice.",
    }

    fifth_lord_sign_effects = {
        "Aries": "adds bold, spontaneous creativity and intense romance.",
        "Taurus": "brings stable love life, fondness for music and arts.",
        "Gemini": "gives witty, intellectual creativity and dual nature in love.",
        "Cancer": "emotional, nurturing romantic nature and protective parenting.",
        "Leo": "natural placement—strong leadership, pride in children and creation.",
        "Virgo": "analytical mind, but may overthink love and parenting.",
        "Libra": "brings charm, balance, and aesthetics in creativity and romance.",
        "Scorpio": "intense, passionate and sometimes secretive love or creative style.",
        "Sagittarius": "gives philosophical and joyful nature with creative teaching.",
        "Capricorn": "disciplined creativity, delayed joy or structured romantic life.",
        "Aquarius": "brings innovative, futuristic creativity and nontraditional love.",
        "Pisces": "gives dreamy, spiritual, and emotional artistic expression.",
    }

    aspect_effects = []

    fifth_house_sign_index = (ZODIAC_SIGN_TO_INDEX[ascendant_sign] + 4) % 12
    fifth_house_sign = get_sign_name(fifth_house_sign_index)

    fifth_house_lord = sign_lords_map[fifth_house_sign]
    lord_placement = next(
        (p for p in astro_data if p["planet"] == fifth_house_lord), None
    )

    planets_in_fifth_house = [p["planet"] for p in astro_data if p["house_number"] == 5]

    desc = []
    desc.append(
        f"The 5th house falls in {fifth_house_sign}, representing creativity, intelligence, children, romance, and past-life merit."
    )

    # Planets placed in 5th house
    if planets_in_fifth_house:
        desc.append(
            "Planets in the 5th house: " + ", ".join(planets_in_fifth_house) + "."
        )
        for planet in planets_in_fifth_house:
            effect = planet_influence.get(
                planet, "influences creativity, romance, or intelligence."
            )
            desc.append(f"{planet} {effect}")
    else:
        desc.append(
            "There are no planets in the 5th house, so its results depend more on the house lord and aspects."
        )

    # Planets aspecting 5th house
    fifth_house_aspects = [a for a in aspects if a["house_aspected"] == 5]
    for asp in fifth_house_aspects:
        planet = asp["planet"]
        aspect_number = asp["aspect"]
        influence = planet_influence.get(planet, "has a general influence.")
        aspect_effects.append(
            f"{planet} aspects the 5th house with a {aspect_number}th aspect, {influence}"
        )

    desc.extend(aspect_effects)

    # Add interpretation of 5th lord placement
    if lord_placement:
        house = lord_placement["house_number"]
        sign = lord_placement["sign"]
        house_effect = fifth_lord_house_effects.get(house, "")
        sign_effect = fifth_lord_sign_effects.get(sign, "")
        desc.append(
            f"The 5th house lord, {fifth_house_lord}, is placed in {sign} in the {house}th house. "
            f"{sign_effect} This placement {house_effect}"
        )

    return {
        "fifth_house_sign": fifth_house_sign,
        "fifth_house_lord": {
            "planet": fifth_house_lord,
            "sign": lord_placement["sign"] if lord_placement else None,
            "house_number": lord_placement["house_number"] if lord_placement else None,
        },
        "planets_in_fifth_house": planets_in_fifth_house,
        "planets_aspecting_fifth_house": fifth_house_aspects,
        "interpretation": " ".join(desc),
    }


def get_sixth_house_effects(ascendant_sign, astro_data, aspects):
    # Effects of planets influencing the 6th house (by aspect or placement)
    planet_influence = {
        "Sun": "brings a strong drive to serve, but may create conflicts or power struggles in work.",
        "Moon": "gives emotional sensitivity to daily work, health, and service, but may cause mood swings.",
        "Mars": "adds strong energy, assertiveness, and conflict in work or health matters.",
        "Mercury": "enhances communication skills in work environment and health matters, but may lead to stress.",
        "Jupiter": "brings wisdom in handling service-oriented tasks and health matters, with luck in overcoming challenges.",
        "Venus": "brings charm, grace, and diplomacy in work and service, but may lead to indulgence in health.",
        "Saturn": "indicates discipline, responsibility, and often delays in health or service; works hard under pressure.",
        "Rahu": "brings unexpected challenges in work and health, but can give unconventional solutions.",
        "Ketu": "indicates spiritual detachment from material work, but can bring health issues or karmic lessons.",
    }

    sixth_lord_house_effects = {
        1: "gives a proactive approach to overcoming obstacles in work and health.",
        2: "indicates financial involvement in health or service-related professions.",
        3: "brings adaptability and intelligence in managing work-related tasks and health issues.",
        4: "creates emotional attachment to service or health, may face family challenges in work.",
        5: "indicates creative solutions in work and health, with joy found in overcoming obstacles.",
        6: "strong placement—native faces challenges head-on in work, health, or service.",
        7: "connects challenges in work or health with spouse or partnerships.",
        8: "brings deep transformation through overcoming health or service-related challenges.",
        9: "gives good fortune in overcoming obstacles related to health or work.",
        10: "indicates career challenges or success through disciplined hard work and service.",
        11: "gains from overcoming obstacles in health or service; strong social support in work.",
        12: "indicates hidden challenges or subconscious health issues, or a desire to escape routine work.",
    }

    sixth_lord_sign_effects = {
        "Aries": "adds a dynamic, assertive approach to overcoming work and health challenges.",
        "Taurus": "brings patience and persistence in service, may face stubbornness in health matters.",
        "Gemini": "indicates adaptability and intelligence in handling service and health, but may struggle with consistency.",
        "Cancer": "gives emotional involvement in service or health matters, strong need for security in work.",
        "Leo": "brings a strong sense of duty and pride in work or health-related matters, but may be prone to overwork.",
        "Virgo": "indicates analytical approach to health and work, with a focus on details and service.",
        "Libra": "brings diplomacy and balance to work and health matters, with focus on harmony in service.",
        "Scorpio": "creates intense focus on overcoming challenges, with transformative experiences in work or health.",
        "Sagittarius": "gives a philosophical approach to health and service, with joy in overcoming challenges.",
        "Capricorn": "strong placement for hard work and responsibility in service and health, with disciplined efforts.",
        "Aquarius": "indicates unconventional approaches to service and health, with a desire for independence.",
        "Pisces": "brings spiritual or intuitive approach to work and health, but may face escapist tendencies.",
    }

    aspect_effects = []

    sixth_house_sign_index = (ZODIAC_SIGN_TO_INDEX[ascendant_sign] + 5) % 12
    sixth_house_sign = get_sign_name(sixth_house_sign_index)

    sixth_house_lord = sign_lords_map[sixth_house_sign]
    lord_placement = next(
        (p for p in astro_data if p["planet"] == sixth_house_lord), None
    )

    planets_in_sixth_house = [p["planet"] for p in astro_data if p["house_number"] == 6]

    desc = []
    desc.append(
        f"The 6th house falls in {sixth_house_sign}, representing health, daily work, service, and obstacles."
    )

    # Planets placed in 6th house
    if planets_in_sixth_house:
        desc.append(
            "Planets in the 6th house: " + ", ".join(planets_in_sixth_house) + "."
        )
        for planet in planets_in_sixth_house:
            effect = planet_influence.get(
                planet, "influences health, service, or overcoming obstacles."
            )
            desc.append(f"{planet} {effect}")
    else:
        desc.append(
            "There are no planets in the 6th house, so its results depend more on the house lord and aspects."
        )

    # Planets aspecting 6th house
    sixth_house_aspects = [a for a in aspects if a["house_aspected"] == 6]
    for asp in sixth_house_aspects:
        planet = asp["planet"]
        aspect_number = asp["aspect"]
        influence = planet_influence.get(planet, "has a general influence.")
        aspect_effects.append(
            f"{planet} aspects the 6th house with a {aspect_number}th aspect, {influence}"
        )

    desc.extend(aspect_effects)

    # Add interpretation of 6th lord placement
    if lord_placement:
        house = lord_placement["house_number"]
        sign = lord_placement["sign"]
        house_effect = sixth_lord_house_effects.get(house, "")
        sign_effect = sixth_lord_sign_effects.get(sign, "")
        desc.append(
            f"The 6th house lord, {sixth_house_lord}, is placed in {sign} in the {house}th house. "
            f"{sign_effect} This placement {house_effect}"
        )

    return {
        "sixth_house_sign": sixth_house_sign,
        "sixth_house_lord": {
            "planet": sixth_house_lord,
            "sign": lord_placement["sign"] if lord_placement else None,
            "house_number": lord_placement["house_number"] if lord_placement else None,
        },
        "planets_in_sixth_house": planets_in_sixth_house,
        "planets_aspecting_sixth_house": sixth_house_aspects,
        "interpretation": " ".join(desc),
    }


def get_seventh_house_effects(ascendant_sign, astro_data, aspects):
    # Effects of planets influencing the 7th house (by aspect or placement)
    planet_influence = {
        "Sun": "brings a strong need for recognition and pride in partnerships, but may cause power struggles.",
        "Moon": "adds emotional depth to relationships, creating strong attachments with a desire for emotional security.",
        "Mars": "brings assertiveness, energy, and passion in partnerships, but may create conflict or competitiveness.",
        "Mercury": "enhances communication, adaptability, and intellectual connection in relationships.",
        "Jupiter": "brings luck, wisdom, and expansion in relationships, often providing moral or spiritual guidance.",
        "Venus": "creates harmony, affection, and love in partnerships, with a strong desire for beauty and comfort.",
        "Saturn": "indicates serious, committed relationships, but may bring delays or restrictions in marriage or partnerships.",
        "Rahu": "indicates unconventional or foreign partnerships, often leading to karmic or transformative relationships.",
        "Ketu": "shows detachment or spiritual disinterest in material partnerships, leading to unconventional or independent relationships.",
    }

    seventh_lord_house_effects = {
        1: "strong personal identity, but challenges in relationships; partners mirror the self.",
        2: "shows gains through partnerships, particularly in financial or material matters.",
        3: "brings relationships based on intellectual or communicative connection, with emphasis on shared knowledge.",
        4: "indicates emotional attachment to partners, with potential challenges in home or family life.",
        5: "brings creativity, joy, and affection in relationships, often leading to love or romantic partnerships.",
        6: "shows challenges in partnerships or marriages, often requiring compromise and effort to overcome obstacles.",
        7: "indicates a strong need for balance and harmony in partnerships, with a focus on unity.",
        8: "creates intense, transformative relationships, with potential for deep emotional or financial connection.",
        9: "brings expansion or philosophical growth through relationships, often with a spiritual partner.",
        10: "indicates career-focused relationships, where the partnership may directly influence professional life.",
        11: "gains from friendships or networks in relationships, with a strong connection to social circles or groups.",
        12: "indicates spiritual or hidden partnerships, or a need for emotional or physical seclusion in relationships.",
    }

    seventh_lord_sign_effects = {
        "Aries": "brings dynamic, passionate, and assertive relationships, with a need for independence in partnerships.",
        "Taurus": "creates steady, practical, and sensual relationships, with an emphasis on security and material comforts.",
        "Gemini": "indicates intellectual, communicative, and adaptable relationships, with a desire for variety in partnerships.",
        "Cancer": "brings deep emotional connection and attachment to partnerships, with a nurturing, protective quality.",
        "Leo": "creates dramatic, affectionate, and proud relationships, with an emphasis on recognition and admiration.",
        "Virgo": "indicates practical, analytical, and service-oriented relationships, with a focus on improving the partner.",
        "Libra": "strong placement for harmonious, balanced, and diplomatic relationships, with a focus on fairness.",
        "Scorpio": "creates intense, passionate, and transformative relationships, often involving power struggles or deep emotional connection.",
        "Sagittarius": "indicates philosophical, adventurous, and freedom-loving relationships, with a desire for growth and exploration.",
        "Capricorn": "brings disciplined, committed, and serious relationships, often with a focus on status and stability.",
        "Aquarius": "indicates unconventional, progressive, and independent relationships, with a focus on friendship and equality.",
        "Pisces": "creates spiritual, dreamy, and emotionally fluid relationships, with a focus on emotional or intuitive connection.",
    }

    aspect_effects = []

    seventh_house_sign_index = (ZODIAC_SIGN_TO_INDEX[ascendant_sign] + 6) % 12
    seventh_house_sign = get_sign_name(seventh_house_sign_index)

    seventh_house_lord = sign_lords_map[seventh_house_sign]
    lord_placement = next(
        (p for p in astro_data if p["planet"] == seventh_house_lord), None
    )

    planets_in_seventh_house = [
        p["planet"] for p in astro_data if p["house_number"] == 7
    ]

    desc = []
    desc.append(
        f"The 7th house falls in {seventh_house_sign}, representing partnerships, marriage, and public relationships."
    )

    # Planets placed in 7th house
    if planets_in_seventh_house:
        desc.append(
            "Planets in the 7th house: " + ", ".join(planets_in_seventh_house) + "."
        )
        for planet in planets_in_seventh_house:
            effect = planet_influence.get(
                planet, "influences relationships and partnerships."
            )
            desc.append(f"{planet} {effect}")
    else:
        desc.append(
            "There are no planets in the 7th house, so its results depend more on the house lord and aspects."
        )

    # Planets aspecting 7th house
    seventh_house_aspects = [a for a in aspects if a["house_aspected"] == 7]
    for asp in seventh_house_aspects:
        planet = asp["planet"]
        aspect_number = asp["aspect"]
        influence = planet_influence.get(planet, "has a general influence.")
        aspect_effects.append(
            f"{planet} aspects the 7th house with a {aspect_number}th aspect, {influence}"
        )

    desc.extend(aspect_effects)

    # Add interpretation of 7th lord placement
    if lord_placement:
        house = lord_placement["house_number"]
        sign = lord_placement["sign"]
        house_effect = seventh_lord_house_effects.get(house, "")
        sign_effect = seventh_lord_sign_effects.get(sign, "")
        desc.append(
            f"The 7th house lord, {seventh_house_lord}, is placed in {sign} in the {house}th house. "
            f"{sign_effect} This placement {house_effect}"
        )

    return {
        "seventh_house_sign": seventh_house_sign,
        "seventh_house_lord": {
            "planet": seventh_house_lord,
            "sign": lord_placement["sign"] if lord_placement else None,
            "house_number": lord_placement["house_number"] if lord_placement else None,
        },
        "planets_in_seventh_house": planets_in_seventh_house,
        "planets_aspecting_seventh_house": seventh_house_aspects,
        "interpretation": " ".join(desc),
    }


def get_eighth_house_effects(ascendant_sign, astro_data, aspects):
    # Effects of planets influencing the 8th house (by aspect or placement)
    planet_influence = {
        "Sun": "brings transformative power, but may also indicate power struggles or hidden conflicts.",
        "Moon": "adds emotional intensity, deep psychological transformation, and secretive tendencies.",
        "Mars": "creates a drive for intense experiences, including conflict, sexuality, and a desire for transformation.",
        "Mercury": "brings an analytical or intellectual approach to secrets, shared resources, and transformation.",
        "Jupiter": "expands opportunities for deep transformation, growth through crisis, and spiritual rebirth.",
        "Venus": "indicates transformation through relationships or shared resources, often with an element of attraction or seduction.",
        "Saturn": "brings a serious, disciplined approach to transformation and crisis, but may bring delays or blockages.",
        "Rahu": "induces karmic transformations, often linked to deep-rooted fears or the desire for radical change.",
        "Ketu": "indicates spiritual or psychological detachment, often leading to mystical or occult experiences.",
    }

    eighth_lord_house_effects = {
        1: "personal transformation linked to self-awareness, may lead to profound rebirth or crises.",
        2: "gains or losses from shared resources or inheritance, with a focus on financial transformations.",
        3: "brings transformative experiences related to communication, siblings, or short journeys.",
        4: "emotional transformations related to home, family, or mother, possibly through crisis or deep-rooted issues.",
        5: "transformation through creativity, children, or love affairs, often involving deep psychological growth.",
        6: "challenges or crises related to health, daily routines, or service-oriented work, often requiring self-discipline.",
        7: "transformative experiences in relationships or marriage, often through power struggles or deep intimacy.",
        8: "strong focus on deep psychological or spiritual transformation, possibly through crises or facing fears.",
        9: "spiritual growth or transformation through philosophical pursuits, higher education, or long-distance travel.",
        10: "career-related transformation, often through facing challenges or using power and authority.",
        11: "gains through transformation of social networks, friendships, or group associations.",
        12: "spiritual or psychological transformation linked to isolation, hidden matters, or subconscious processes.",
    }

    eighth_lord_sign_effects = {
        "Aries": "indicates a forceful, dynamic approach to transformation, often through crisis or action.",
        "Taurus": "brings stability to transformations, but may involve a slow or materialistic approach to change.",
        "Gemini": "creates intellectual or communicative transformation, often through psychological exploration.",
        "Cancer": "deep emotional transformations, often linked to home, family, and maternal roots.",
        "Leo": "brings dramatic transformations, often involving personal identity or creative self-expression.",
        "Virgo": "transformations linked to health, service, or analytical processes, with a focus on practicality.",
        "Libra": "creates relational transformations, often through partnership dynamics or issues with balance.",
        "Scorpio": "strong placement, deep psychological, emotional, or spiritual transformations, often intense and profound.",
        "Sagittarius": "transformation through philosophy, higher learning, or a quest for meaning and truth.",
        "Capricorn": "transformations linked to career, authority, or societal status, often through discipline and hard work.",
        "Aquarius": "innovative transformations, often through unconventional approaches, group dynamics, or social causes.",
        "Pisces": "spiritual transformations, often linked to mysticism, dreams, or subconscious processes.",
    }

    aspect_effects = []

    eighth_house_sign_index = (ZODIAC_SIGN_TO_INDEX[ascendant_sign] + 7) % 12
    eighth_house_sign = get_sign_name(eighth_house_sign_index)

    eighth_house_lord = sign_lords_map[eighth_house_sign]
    lord_placement = next(
        (p for p in astro_data if p["planet"] == eighth_house_lord), None
    )

    planets_in_eighth_house = [
        p["planet"] for p in astro_data if p["house_number"] == 8
    ]

    desc = []
    desc.append(
        f"The 8th house falls in {eighth_house_sign}, representing transformation, shared resources, and hidden matters."
    )

    # Planets placed in 8th house
    if planets_in_eighth_house:
        desc.append(
            "Planets in the 8th house: " + ", ".join(planets_in_eighth_house) + "."
        )
        for planet in planets_in_eighth_house:
            effect = planet_influence.get(
                planet,
                "influences transformation, crisis, and deep psychological matters.",
            )
            desc.append(f"{planet} {effect}")
    else:
        desc.append(
            "There are no planets in the 8th house, so its outcomes rely on the house lord and aspects."
        )

    # Planets aspecting 8th house
    eighth_house_aspects = [a for a in aspects if a["house_aspected"] == 8]
    for asp in eighth_house_aspects:
        planet = asp["planet"]
        aspect_number = asp["aspect"]
        influence = planet_influence.get(planet, "has a general influence.")
        aspect_effects.append(
            f"{planet} aspects the 8th house with a {aspect_number}th aspect, {influence}"
        )

    desc.extend(aspect_effects)

    # Add interpretation of 8th lord placement
    if lord_placement:
        house = lord_placement["house_number"]
        sign = lord_placement["sign"]
        house_effect = eighth_lord_house_effects.get(house, "")
        sign_effect = eighth_lord_sign_effects.get(sign, "")
        desc.append(
            f"The 8th house lord, {eighth_house_lord}, is placed in {sign} in the {house}th house. "
            f"{sign_effect} This placement {house_effect}"
        )

    return {
        "eighth_house_sign": eighth_house_sign,
        "eighth_house_lord": {
            "planet": eighth_house_lord,
            "sign": lord_placement["sign"] if lord_placement else None,
            "house_number": lord_placement["house_number"] if lord_placement else None,
        },
        "planets_in_eighth_house": planets_in_eighth_house,
        "planets_aspecting_eighth_house": eighth_house_aspects,
        "interpretation": " ".join(desc),
    }


def get_ninth_house_effects(ascendant_sign, astro_data, aspects):
    # Effects of planets influencing the 9th house (by aspect or placement)
    planet_influence = {
        "Sun": "brings a strong sense of purpose, faith, and connection to higher truths.",
        "Moon": "creates emotional devotion to philosophical or spiritual beliefs, and a love for travel.",
        "Mars": "adds energetic drive towards spiritual growth, higher learning, and foreign travels.",
        "Mercury": "enhances intellectual pursuits related to philosophy, higher education, and communication across cultures.",
        "Jupiter": "brings wisdom, expansion of spiritual or philosophical knowledge, and success in long-distance travels.",
        "Venus": "creates love for beauty, art, and culture in higher learning or long journeys, often with an idealistic outlook.",
        "Saturn": "brings discipline and structure to philosophical beliefs or higher education, but can indicate challenges in these areas.",
        "Rahu": "inspires unconventional beliefs, philosophical restlessness, and a desire for foreign or spiritual experiences.",
        "Ketu": "induces a spiritual, detached approach to philosophy and higher learning, often in a quest for inner truth.",
    }

    ninth_lord_house_effects = {
        1: "philosophy and spirituality linked to self-expression, a focus on personal growth through learning.",
        2: "gains or loss through higher education or foreign connections, potentially influencing personal wealth.",
        3: "communication and intellectual exchange play a key role in one's spiritual journey or beliefs.",
        4: "philosophical beliefs tied to emotional roots, possibly linked to family values or ancestral heritage.",
        5: "spiritual growth through creativity, learning, or teaching; also a strong connection to religious practices.",
        6: "challenges in philosophical or spiritual pursuits, possibly due to service work or health-related restrictions.",
        7: "relationships or marriage may strongly influence spiritual or philosophical development, or lead to foreign travels.",
        8: "deep, transformative spiritual experiences or learning through crises or secrets, often linked to foreign lands.",
        9: "spirituality and higher learning are central, bringing strong beliefs, faith, or wisdom through expansive travels.",
        10: "career and status linked to philosophical or spiritual pursuits, potentially through teaching or foreign connections.",
        11: "gains through group associations or networks related to higher learning or spiritual knowledge.",
        12: "spiritual practices or philosophical beliefs are linked to isolation, foreign lands, or subconscious transformation.",
    }

    ninth_lord_sign_effects = {
        "Aries": "indicates a dynamic, active approach to spirituality, with a strong focus on personal growth and leadership.",
        "Taurus": "brings a grounded, stable approach to spiritual and philosophical matters, seeking tangible results.",
        "Gemini": "indicates intellectual and communicative pursuit of knowledge, love for learning, and travel.",
        "Cancer": "spiritual beliefs and practices are tied to emotional connections, home, and family values.",
        "Leo": "spiritual growth or higher learning through creativity, self-expression, and leadership roles.",
        "Virgo": "intellectual or philosophical pursuits grounded in practicality, service, and attention to detail.",
        "Libra": "spiritual growth through relationships, harmony, and a quest for balance in philosophical or religious matters.",
        "Scorpio": "intense, transformative spiritual experiences linked to depth, secrecy, and personal transformation.",
        "Sagittarius": "strong spiritual or philosophical inclination, love for travel, learning, and teaching higher knowledge.",
        "Capricorn": "practical, disciplined approach to spiritual or philosophical matters, with a focus on structure and results.",
        "Aquarius": "innovative, unconventional spiritual or philosophical beliefs, often related to social causes or humanitarian ideals.",
        "Pisces": "spiritual, dreamy, and intuitive approach to philosophy, often with a deep connection to the unseen or mystical realms.",
    }

    aspect_effects = []

    ninth_house_sign_index = (ZODIAC_SIGN_TO_INDEX[ascendant_sign] + 8) % 12
    ninth_house_sign = get_sign_name(ninth_house_sign_index)

    ninth_house_lord = sign_lords_map[ninth_house_sign]
    lord_placement = next(
        (p for p in astro_data if p["planet"] == ninth_house_lord), None
    )

    planets_in_ninth_house = [p["planet"] for p in astro_data if p["house_number"] == 9]

    desc = []
    desc.append(
        f"The 9th house falls in {ninth_house_sign}, focusing on philosophy, higher learning, spirituality, and long-distance travel."
    )

    # Planets placed in 9th house
    if planets_in_ninth_house:
        desc.append(
            "Planets in the 9th house: " + ", ".join(planets_in_ninth_house) + "."
        )
        for planet in planets_in_ninth_house:
            effect = planet_influence.get(
                planet,
                "influences one's belief systems, philosophy, and higher knowledge.",
            )
            desc.append(f"{planet} {effect}")
    else:
        desc.append(
            "There are no planets in the 9th house, so its outcomes rely on the house lord and aspects."
        )

    # Planets aspecting 9th house
    ninth_house_aspects = [a for a in aspects if a["house_aspected"] == 9]
    for asp in ninth_house_aspects:
        planet = asp["planet"]
        aspect_number = asp["aspect"]
        influence = planet_influence.get(planet, "has a general influence.")
        aspect_effects.append(
            f"{planet} aspects the 9th house with a {aspect_number}th aspect, {influence}"
        )

    desc.extend(aspect_effects)

    # Add interpretation of 9th lord placement
    if lord_placement:
        house = lord_placement["house_number"]
        sign = lord_placement["sign"]
        house_effect = ninth_lord_house_effects.get(house, "")
        sign_effect = ninth_lord_sign_effects.get(sign, "")
        desc.append(
            f"The 9th house lord, {ninth_house_lord}, is placed in {sign} in the {house}th house. "
            f"{sign_effect} This placement {house_effect}"
        )

    return {
        "ninth_house_sign": ninth_house_sign,
        "ninth_house_lord": {
            "planet": ninth_house_lord,
            "sign": lord_placement["sign"] if lord_placement else None,
            "house_number": lord_placement["house_number"] if lord_placement else None,
        },
        "planets_in_ninth_house": planets_in_ninth_house,
        "planets_aspecting_ninth_house": ninth_house_aspects,
        "interpretation": " ".join(desc),
    }


def get_tenth_house_effects(ascendant_sign, astro_data, aspects):
    # Effects of planets influencing the 10th house (by aspect or placement)
    planet_influence = {
        "Sun": "brings leadership, recognition, and a strong sense of duty or authority in one's career.",
        "Moon": "creates emotional attachment to career, with a need for emotional fulfillment through professional success.",
        "Mars": "adds ambition, energy, and assertiveness to one's career, often leading to leadership roles or competitive fields.",
        "Mercury": "enhances communication, analytical skills, and adaptability in the career, often linked to intellectual fields.",
        "Jupiter": "brings success, expansion, and wisdom in one's career, often linked to teaching, law, or higher education.",
        "Venus": "adds charm, creativity, and diplomacy to one's career, often linked to arts, beauty, or social relationships.",
        "Saturn": "brings discipline, hard work, and responsibility, often leading to slow but steady career growth or authority positions.",
        "Rahu": "inspires a desire for unconventional or foreign career paths, often leading to unexpected fame or recognition.",
        "Ketu": "induces a detached, spiritual approach to career, possibly leading to non-traditional or selfless work.",
    }

    tenth_lord_house_effects = {
        1: "career linked to personal self-expression, leadership, or individual initiatives.",
        2: "gains or loss from career through communication, intellect, or personal resources.",
        3: "indicates a career in communication, writing, or skills-based professions, with a focus on mental agility.",
        4: "career linked to home, family, or real estate, possibly in nurturing or care-related roles.",
        5: "creative career success, often in teaching, entertainment, or intellectual fields requiring creative expression.",
        6: "career challenges, especially linked to service, health, or competition; often in fields requiring discipline.",
        7: "career linked to partnerships, business relations, or service-based professions, with a focus on collaboration.",
        8: "career in transformation, crisis management, or hidden professions, often linked to research or investigation.",
        9: "success in career through travel, higher education, or teaching roles; often linked to philosophy or law.",
        10: "career success, public life, and authority; one of the most significant houses for professional matters.",
        11: "gains or recognition from professional networks or social associations, often linked to humanitarian work.",
        12: "career related to spiritual work, isolation, or working behind the scenes, possibly in foreign lands.",
    }

    tenth_lord_sign_effects = {
        "Aries": "career driven by action, leadership, and competition; often in fields requiring assertiveness and quick decisions.",
        "Taurus": "career focused on stability, practicality, and financial success; strong connection to material wealth or the arts.",
        "Gemini": "career in communication, technology, writing, or intellectual pursuits, often involving multitasking or networking.",
        "Cancer": "career in nurturing or care-related fields, often linked to home, family, or hospitality industries.",
        "Leo": "career focused on leadership, self-expression, and recognition, often in creative or entertainment fields.",
        "Virgo": "career in service, health, or detail-oriented professions, often involving analysis or organization.",
        "Libra": "career in law, social relationships, or creative fields, often requiring diplomacy and collaboration.",
        "Scorpio": "career in research, transformation, or deep analytical work, often involving crisis management or psychology.",
        "Sagittarius": "career in travel, education, teaching, or philosophical pursuits, often related to foreign affairs.",
        "Capricorn": "career in business, finance, or authority-driven roles, requiring hard work, discipline, and long-term planning.",
        "Aquarius": "career in technology, innovation, social causes, or unconventional fields, often linked to humanitarian work.",
        "Pisces": "career in spiritual, artistic, or creative fields, or working in isolation or behind the scenes.",
    }

    aspect_effects = []

    tenth_house_sign_index = (ZODIAC_SIGN_TO_INDEX[ascendant_sign] + 9) % 12
    tenth_house_sign = get_sign_name(tenth_house_sign_index)

    tenth_house_lord = sign_lords_map[tenth_house_sign]
    lord_placement = next(
        (p for p in astro_data if p["planet"] == tenth_house_lord), None
    )

    planets_in_tenth_house = [
        p["planet"] for p in astro_data if p["house_number"] == 10
    ]

    desc = []
    desc.append(
        f"The 10th house falls in {tenth_house_sign}, focusing on career, social status, authority, and public life."
    )

    # Planets placed in 10th house
    if planets_in_tenth_house:
        desc.append(
            "Planets in the 10th house: " + ", ".join(planets_in_tenth_house) + "."
        )
        for planet in planets_in_tenth_house:
            effect = planet_influence.get(
                planet, "influences one's career, reputation, and authority."
            )
            desc.append(f"{planet} {effect}")
    else:
        desc.append(
            "There are no planets in the 10th house, so its outcomes rely on the house lord and aspects."
        )

    # Planets aspecting 10th house
    tenth_house_aspects = [a for a in aspects if a["house_aspected"] == 10]
    for asp in tenth_house_aspects:
        planet = asp["planet"]
        aspect_number = asp["aspect"]
        influence = planet_influence.get(planet, "has a general influence.")
        aspect_effects.append(
            f"{planet} aspects the 10th house with a {aspect_number}th aspect, {influence}"
        )

    desc.extend(aspect_effects)

    # Add interpretation of 10th lord placement
    if lord_placement:
        house = lord_placement["house_number"]
        sign = lord_placement["sign"]
        house_effect = tenth_lord_house_effects.get(house, "")
        sign_effect = tenth_lord_sign_effects.get(sign, "")
        desc.append(
            f"The 10th house lord, {tenth_house_lord}, is placed in {sign} in the {house}th house. "
            f"{sign_effect} This placement {house_effect}"
        )

    return {
        "tenth_house_sign": tenth_house_sign,
        "tenth_house_lord": {
            "planet": tenth_house_lord,
            "sign": lord_placement["sign"] if lord_placement else None,
            "house_number": lord_placement["house_number"] if lord_placement else None,
        },
        "planets_in_tenth_house": planets_in_tenth_house,
        "planets_aspecting_tenth_house": tenth_house_aspects,
        "interpretation": " ".join(desc),
    }


def get_eleventh_house_effects(ascendant_sign, astro_data, aspects):
    # Effects of planets influencing the 11th house (by aspect or placement)
    planet_influence = {
        "Sun": "brings recognition, social influence, and gains from associations or groups.",
        "Moon": "creates emotional fulfillment from friendships and social networks, with a need for supportive groups.",
        "Mars": "adds drive, assertiveness, and competitive energy to social circles, often leading to leadership in groups.",
        "Mercury": "enhances communication, networking, and intellectual connections in social groups.",
        "Jupiter": "brings abundance, wisdom, and growth through social networks, friendships, or humanitarian causes.",
        "Venus": "adds charm, creativity, and diplomacy in social settings, often linked to love or artistic groups.",
        "Saturn": "may bring slow but steady gains through social networks or friendships, often requiring effort or hard work.",
        "Rahu": "inspires unconventional, transformative, or foreign connections in social or professional networks.",
        "Ketu": "induces detachment or spiritual pursuits, possibly withdrawing from traditional social circles.",
    }

    eleventh_lord_house_effects = {
        1: "gains or success through personal efforts and self-expression, often linked to one's individuality.",
        2: "financial gains or social advancement through family or material resources.",
        3: "gains from communication, intellectual work, or connections with siblings and close peers.",
        4: "gains from home, family, or emotional connections, possibly inheriting property or wealth.",
        5: "gains through creativity, education, or love-based endeavors, often linked to children or speculative ventures.",
        6: "gains through service, competition, or addressing challenges, possibly linked to health or social work.",
        7: "gains through partnerships, collaborations, or service-oriented professions.",
        8: "gains from inheritance, transformation, or involvement in shared resources or joint ventures.",
        9: "gains from travel, education, or higher knowledge, possibly linked to philosophy or law.",
        10: "gains through career success, authority, or recognition in the public sphere.",
        11: "gains through social networks, group efforts, or humanitarian endeavors, often linked to social causes.",
        12: "gains through spiritual or hidden pursuits, possibly from foreign lands or work behind the scenes.",
    }

    eleventh_lord_sign_effects = {
        "Aries": "gains through direct action, leadership, or competitive environments, often tied to independence.",
        "Taurus": "gains through stability, financial security, or artistic endeavors, often in material or sensual fields.",
        "Gemini": "gains from intellectual work, communication, or social networking, often linked to quick adaptability.",
        "Cancer": "gains from home, family, or emotional connections, possibly from maternal or nurturing sources.",
        "Leo": "gains from creativity, self-expression, or leadership, often linked to fame, love, or artistic pursuits.",
        "Virgo": "gains from service, health, or analytical work, often linked to practical, meticulous efforts.",
        "Libra": "gains from partnerships, social balance, or beauty-related endeavors, often in collaborative settings.",
        "Scorpio": "gains through transformation, shared resources, or deep, intense connections in professional or personal life.",
        "Sagittarius": "gains from travel, education, or philosophical endeavors, often linked to law or higher knowledge.",
        "Capricorn": "gains from hard work, structure, and discipline, often in professional, career, or authority roles.",
        "Aquarius": "gains from social causes, innovation, or community efforts, often in unconventional or progressive fields.",
        "Pisces": "gains from spiritual pursuits, creativity, or work behind the scenes, possibly linked to charity or artistic endeavors.",
    }

    aspect_effects = []

    eleventh_house_sign_index = (ZODIAC_SIGN_TO_INDEX[ascendant_sign] + 10) % 12
    eleventh_house_sign = get_sign_name(eleventh_house_sign_index)

    eleventh_house_lord = sign_lords_map[eleventh_house_sign]
    lord_placement = next(
        (p for p in astro_data if p["planet"] == eleventh_house_lord), None
    )

    planets_in_eleventh_house = [
        p["planet"] for p in astro_data if p["house_number"] == 11
    ]

    desc = []
    desc.append(
        f"The 11th house falls in {eleventh_house_sign}, focusing on friendships, social networks, aspirations, and gains."
    )

    # Planets placed in 11th house
    if planets_in_eleventh_house:
        desc.append(
            "Planets in the 11th house: " + ", ".join(planets_in_eleventh_house) + "."
        )
        for planet in planets_in_eleventh_house:
            effect = planet_influence.get(
                planet,
                "influences one's social interactions, aspirations, and material gains.",
            )
            desc.append(f"{planet} {effect}")
    else:
        desc.append(
            "There are no planets in the 11th house, so its outcomes rely on the house lord and aspects."
        )

    # Planets aspecting 11th house
    eleventh_house_aspects = [a for a in aspects if a["house_aspected"] == 11]
    for asp in eleventh_house_aspects:
        planet = asp["planet"]
        aspect_number = asp["aspect"]
        influence = planet_influence.get(planet, "has a general influence.")
        aspect_effects.append(
            f"{planet} aspects the 11th house with a {aspect_number}th aspect, {influence}"
        )

    desc.extend(aspect_effects)

    # Add interpretation of 11th lord placement
    if lord_placement:
        house = lord_placement["house_number"]
        sign = lord_placement["sign"]
        house_effect = eleventh_lord_house_effects.get(house, "")
        sign_effect = eleventh_lord_sign_effects.get(sign, "")
        desc.append(
            f"The 11th house lord, {eleventh_house_lord}, is placed in {sign} in the {house}th house. "
            f"{sign_effect} This placement {house_effect}"
        )

    return {
        "eleventh_house_sign": eleventh_house_sign,
        "eleventh_house_lord": {
            "planet": eleventh_house_lord,
            "sign": lord_placement["sign"] if lord_placement else None,
            "house_number": lord_placement["house_number"] if lord_placement else None,
        },
        "planets_in_eleventh_house": planets_in_eleventh_house,
        "planets_aspecting_eleventh_house": eleventh_house_aspects,
        "interpretation": " ".join(desc),
    }


def get_twelfth_house_effects(ascendant_sign, astro_data, aspects):
    # Effects of planets influencing the 12th house (by aspect or placement)
    planet_influence = {
        "Sun": "can indicate spiritual pursuits or isolation, often tied to the subconscious and hidden enemies.",
        "Moon": "creates emotional depth, intuition, and a need for seclusion, linked to the subconscious mind.",
        "Mars": "can bring hidden anger or aggression, possibly linked to secret enemies or covert activities.",
        "Mercury": "enhances intellectual pursuits in isolation, possibly linked to secret knowledge or spiritual study.",
        "Jupiter": "indicates spiritual growth, philosophical exploration, or gains from foreign places and hidden wisdom.",
        "Venus": "suggests love or artistic expression in secret or private settings, possibly tied to hidden desires.",
        "Saturn": "brings discipline or isolation in spiritual or behind-the-scenes matters, possibly indicating long-term seclusion.",
        "Rahu": "indicates obsession with secret or hidden matters, possibly involving foreign influences or unconventional spiritual paths.",
        "Ketu": "induces detachment or spiritual focus, leading to self-exploration, often through solitude or subconscious realms.",
    }

    twelfth_lord_house_effects = {
        1: "may bring self-undoing through isolation or subconscious tendencies, often linked to personal habits.",
        2: "gains from hidden resources or through spiritual endeavors, possibly from foreign lands or secret knowledge.",
        3: "challenges through isolation or communication difficulties, possibly linked to siblings or close peers.",
        4: "gains or challenges from emotional isolation, hidden family matters, or private emotional world.",
        5: "spiritual growth or creativity through solitary pursuits or hidden talents, possibly linked to children or speculative ventures.",
        6: "may bring hidden enemies or challenges in secret work or health matters, often tied to behind-the-scenes efforts.",
        7: "hidden conflicts or spiritual lessons from partnerships or marriage, possibly linked to foreign partners.",
        8: "gains or losses through hidden sources of power, transformation, or shared resources, often in secret or spiritual contexts.",
        9: "spiritual growth or wisdom from isolation, possibly linked to foreign journeys or philosophical exploration.",
        10: "gains or challenges in public life tied to hidden factors, possibly involving a secret career or behind-the-scenes work.",
        11: "hidden social connections or secret aspirations, possibly linked to humanitarian or spiritual groups.",
        12: "intensified spiritual or subconscious life, often linked to secluded or hidden places, with a focus on self-exploration.",
    }

    twelfth_lord_sign_effects = {
        "Aries": "indicates self-assertion in private or spiritual matters, possibly involving hidden or aggressive tendencies.",
        "Taurus": "brings a need for material security in solitude, or spiritual growth through indulgence in comfort or art.",
        "Gemini": "indicates intellectual pursuits in solitude, or spiritual growth through communication and learning.",
        "Cancer": "spiritual growth through emotional depth or attachment to family, often linked to a private, maternal world.",
        "Leo": "spiritual or creative pursuits tied to personal recognition or hidden leadership, possibly in secret or behind-the-scenes.",
        "Virgo": "spiritual growth through analysis, service, or self-discipline, often requiring private or solitary work.",
        "Libra": "spiritual or creative fulfillment through balanced solitude, possibly linked to artistic or relationship-based secrecy.",
        "Scorpio": "intense spiritual transformation or growth through hidden emotional or sexual experiences, often in solitude.",
        "Sagittarius": "spiritual growth through philosophical exploration or long-distance travel, possibly tied to hidden or foreign places.",
        "Capricorn": "spiritual or material growth through solitude, discipline, or hidden work in professional or authoritative fields.",
        "Aquarius": "spiritual growth through unconventional, isolated paths, possibly involving technology or humanitarian ideals.",
        "Pisces": "spiritual fulfillment through isolation, creativity, or artistic expression, often linked to deep emotional or spiritual bonds.",
    }

    aspect_effects = []

    twelfth_house_sign_index = (ZODIAC_SIGN_TO_INDEX[ascendant_sign] + 11) % 12
    twelfth_house_sign = get_sign_name(twelfth_house_sign_index)

    twelfth_house_lord = sign_lords_map[twelfth_house_sign]
    lord_placement = next(
        (p for p in astro_data if p["planet"] == twelfth_house_lord), None
    )

    planets_in_twelfth_house = [
        p["planet"] for p in astro_data if p["house_number"] == 12
    ]

    desc = []
    desc.append(
        f"The 12th house falls in {twelfth_house_sign}, focusing on spirituality, isolation, subconscious mind, and hidden matters."
    )

    # Planets placed in 12th house
    if planets_in_twelfth_house:
        desc.append(
            "Planets in the 12th house: " + ", ".join(planets_in_twelfth_house) + "."
        )
        for planet in planets_in_twelfth_house:
            effect = planet_influence.get(
                planet,
                "influences one's spiritual pursuits, isolation, or hidden matters.",
            )
            desc.append(f"{planet} {effect}")
    else:
        desc.append(
            "There are no planets in the 12th house, so its outcomes rely on the house lord and aspects."
        )

    # Planets aspecting 12th house
    twelfth_house_aspects = [a for a in aspects if a["house_aspected"] == 12]
    for asp in twelfth_house_aspects:
        planet = asp["planet"]
        aspect_number = asp["aspect"]
        influence = planet_influence.get(planet, "has a general influence.")
        aspect_effects.append(
            f"{planet} aspects the 12th house with a {aspect_number}th aspect, {influence}"
        )

    desc.extend(aspect_effects)

    # Add interpretation of 12th lord placement
    if lord_placement:
        house = lord_placement["house_number"]
        sign = lord_placement["sign"]
        house_effect = twelfth_lord_house_effects.get(house, "")
        sign_effect = twelfth_lord_sign_effects.get(sign, "")
        desc.append(
            f"The 12th house lord, {twelfth_house_lord}, is placed in {sign} in the {house}th house. "
            f"{sign_effect} This placement {house_effect}"
        )

    return {
        "twelfth_house_sign": twelfth_house_sign,
        "twelfth_house_lord": {
            "planet": twelfth_house_lord,
            "sign": lord_placement["sign"] if lord_placement else None,
            "house_number": lord_placement["house_number"] if lord_placement else None,
        },
        "planets_in_twelfth_house": planets_in_twelfth_house,
        "planets_aspecting_twelfth_house": twelfth_house_aspects,
        "interpretation": " ".join(desc),
    }


def ordinal(n):
    return f"{n}{'th' if 11<=n<=13 else {1:'st',2:'nd',3:'rd'}.get(n%10, 'th')}"


def get_sun_interpretation(astro_data, aspects):
    """
    Generate a detailed interpretation of the Sun's placement in the chart based on its house, sign, aspects, and strength.

    Args:
        astro_data (list): List of planetary data from `get_planet_data`.
        ascendant_sign (str): The Ascendant sign of the chart.
        aspects (list): List of planetary aspects.

    Returns:
        str: A detailed interpretation of the Sun's placement.
    """
    # Extract Sun data
    sun_data = next((p for p in astro_data if p["planet"] == "Sun"), {})
    if not sun_data:
        return "Sun data is missing from the chart."

    # Extract Sun details
    sun_sign = sun_data.get("sign", "Unknown")
    sun_house = sun_data.get("house_number", "Unknown")
    sun_strength = sun_data.get("strength", "Average")
    sun_aspects = [a for a in aspects if a["planet"] == "Sun"]

    # Base interpretation
    interpretation = []
    if isinstance(sun_house, int):
        house_text = ordinal(sun_house)
    else:
        house_text = str(sun_house)

    interpretation.append(
        f"The planet Sun is placed in the {house_text} house of your birth chart, positioned in the zodiac sign of {sun_sign}."
    )

    # House-specific effects
    house_effects = {
        1: "This position enhances your vitality, self-expression, and leadership abilities. It gives you a strong presence, though it may sometimes create ego-related challenges.",
        2: "This placement connects your identity with values, speech, and finances. You may be proud of your possessions and voice, but also must avoid over-attachment to wealth.",
        3: "Sun in the 3rd house energizes communication, courage, and short journeys. It strengthens sibling bonds and supports self-expression in bold ways.",
        4: "This can bring deep connections to home, mother, and inner peace, but may also create restlessness or dissatisfaction within domestic life.",
        5: "Creativity, children, intelligence, and pride in one's talents become central themes. Be cautious of overconfidence or rigid beliefs.",
        6: "Sun here emphasizes competition, service, and defeating enemies. It gives the ability to overcome adversity but can create clashes in the workplace.",
        7: "A strong focus on partnerships, marriage, and public dealings. Assertiveness here must be balanced with cooperation to avoid dominance struggles.",
        8: "This indicates intensity, sudden changes, and a focus on hidden knowledge or inheritance. Transformation plays a key role in your life.",
        9: "Sun in the 9th house supports dharma, spirituality, and higher learning. A natural leader in academic or religious domains, but needs humility.",
        10: "This is a powerful placement for career, fame, and authority. It grants leadership, though ego conflicts with bosses or father can arise.",
        11: "You have aspirations to lead in social groups and achieve gains through networks. Be wary of pride in friendships or group dominance.",
        12: "Sun in this house leads to introspection, spiritual growth, and possible isolation. Fame may come later in life; self-sacrifice yields success.",
    }
    if isinstance(sun_house, int):
        interpretation.append(house_effects.get(sun_house, ""))

    # Sign-specific effects
    sign_effects = {
        "Aries": "The Sun is exalted in Aries, boosting confidence, initiative, and strong willpower.",
        "Taurus": "The Sun in Taurus brings steady determination, material focus, and a love of beauty, though sometimes inflexible.",
        "Gemini": "This enhances intellect, communication, and versatility, but may create restlessness or scattered focus.",
        "Cancer": "Emotional depth and connection to family become prominent. The Sun here reflects protective and nurturing tendencies.",
        "Leo": "Being in its own sign, the Sun in Leo gives natural authority, leadership, and creative brilliance.",
        "Virgo": "A practical, analytical Sun that shines through service, detail, and humility. Beware of overthinking or harsh self-criticism.",
        "Libra": "The Sun is debilitated in Libra, which may lead to reliance on others for validation, though it fosters diplomacy.",
        "Scorpio": "Gives intense willpower, secrecy, and transformational power. The native may command silently but powerfully.",
        "Sagittarius": "Enthusiastic, righteous, and expansive, the Sun here brings moral authority and a thirst for knowledge.",
        "Capricorn": "Ambition, discipline, and respect for structure define this Sun. Emotional restraint may come with career focus.",
        "Aquarius": "Sun here supports humanitarian thinking and futuristic vision, though it may struggle with conformity or authority.",
        "Pisces": "A spiritual and imaginative Sun. Deep inner life, artistic tendencies, and emotional vulnerability are common.",
    }
    interpretation.append(sign_effects.get(sun_sign, ""))

    # Strength interpretation
    strength_phrases = {
        "Exalted": "The Sun is exalted, bringing maximum strength, vitality, and a highly auspicious influence.",
        "Debilitated": "The Sun is debilitated, which may challenge self-esteem and vitality unless supported by other factors.",
        "Own Sign": "The Sun is in its own sign, which strengthens self-confidence, authority, and leadership ability.",
    }
    interpretation.append(
        strength_phrases.get(
            sun_strength,
            f"The Sun's strength is marked as {sun_strength}, influencing its functional role.",
        )
    )

    # Concluding line
    interpretation.append(
        "Overall, this placement reflects your desire to shine and be recognized, though balancing ego with service will be essential for long-term success."
    )

    return " ".join(interpretation)


def get_moon_interpretation(astro_data, aspects):
    """
    Generate a detailed interpretation of the Moon's placement in the chart based on its house, sign, aspects, and strength.

    Args:
        astro_data (list): List of planetary data from `get_planet_data`.
        ascendant_sign (str): The Ascendant sign of the chart.
        aspects (list): List of planetary aspects.

    Returns:
        str: A detailed interpretation of the Moon's placement.
    """
    moon_data = next((p for p in astro_data if p["planet"] == "Moon"), {})
    if not moon_data:
        return "Moon data is missing from the chart."

    moon_sign = moon_data.get("sign", "Unknown")
    moon_house = moon_data.get("house_number", "Unknown")
    moon_strength = moon_data.get("strength", "Average")
    moon_aspects = [a for a in aspects if a["planet"] == "Moon"]

    interpretation = []
    if isinstance(moon_house, int):
        house_text = ordinal(moon_house)
    else:
        house_text = str(moon_house)

    interpretation.append(
        f"The planet Moon is placed in the {house_text} house of your birth chart, positioned in the zodiac sign of {moon_sign}."
    )

    house_effects = {
        1: "This placement gives emotional sensitivity and a strong sense of identity tied to feelings. You are likely intuitive and nurturing.",
        2: "Moon in the 2nd house connects emotions to speech, family, and wealth. You may find comfort in food or material security.",
        3: "A communicative and courageous mind. You express your emotions boldly, and relationships with siblings are significant.",
        4: "This is a strong placement for emotional stability, love of home, and connection to the mother. A peaceful domestic life is vital.",
        5: "Emotions are expressed creatively. This placement supports a deep love for children, romance, and arts.",
        6: "Emotions might be conflicted due to service, health, or enemies. Inner balance is needed to overcome emotional struggles.",
        7: "You are emotionally drawn to partnerships and tend to seek balance through others. Needs maturity in emotional expectations.",
        8: "This indicates deep emotional intensity, psychological depth, and a connection to occult, mystery, or sudden changes.",
        9: "Moon here gives emotional inspiration through philosophy, travel, and spirituality. You seek higher truths with devotion.",
        10: "A strong public image and desire for emotional recognition in career. Mother's influence plays a big role in ambitions.",
        11: "You are emotionally tied to friendships, social causes, and your aspirations. Gains come through networks and alliances.",
        12: "A deeply intuitive and private Moon. You may have spiritual or escapist tendencies, seeking peace through solitude or foreign lands.",
    }
    if isinstance(moon_house, int):
        interpretation.append(house_effects.get(moon_house, ""))

    sign_effects = {
        "Aries": "Moon in Aries brings quick emotions and passionate reactions. You're brave but may need to control emotional impulsiveness.",
        "Taurus": "The Moon is exalted in Taurus, giving emotional stability, comfort-loving nature, and nurturing tendencies.",
        "Gemini": "Emotionally curious and communicative, you express feelings through words and thought. Mind is always active.",
        "Cancer": "Being in its own sign, Moon in Cancer gives deep emotional connection, intuition, and strong ties to home and family.",
        "Leo": "You have dramatic emotional expression and a need for attention. Loyalty is strong, but ego can affect feelings.",
        "Virgo": "You process emotions logically and practically, which can cause emotional suppression or overthinking.",
        "Libra": "Emotionally balanced and diplomatic, but sometimes dependent on others for validation and harmony.",
        "Scorpio": "Moon is debilitated here. It gives emotional intensity, secrecy, and resilience, but can cause internal emotional battles.",
        "Sagittarius": "You find emotional fulfillment through truth, learning, and freedom. Optimistic but sometimes blunt.",
        "Capricorn": "Emotionally reserved and responsible. You seek security through structure, though feelings may be buried.",
        "Aquarius": "You are emotionally attached to ideals, causes, and communities. Feelings are detached or abstracted.",
        "Pisces": "A dreamy, sensitive Moon. Highly intuitive and compassionate, but may need grounding from escapist tendencies.",
    }
    interpretation.append(sign_effects.get(moon_sign, ""))

    strength_phrases = {
        "Exalted": "The Moon is exalted, offering emotional strength, calm, and prosperity.",
        "Debilitated": "The Moon is debilitated, which may bring emotional turbulence or hypersensitivity unless well-supported.",
        "Own Sign": "The Moon is in its own sign, which enhances emotional intuition, nurturing instincts, and mental peace.",
    }
    interpretation.append(
        strength_phrases.get(
            moon_strength,
            f"The Moon's strength is marked as {moon_strength}, influencing its emotional impact.",
        )
    )

    interpretation.append(
        "Overall, the Moon reflects your emotional world, instinctual reactions, and sense of comfort and belonging. Nurturing this side brings harmony."
    )

    return " ".join(interpretation)


def get_mars_interpretation(astro_data, aspects):
    """
    Generate a detailed interpretation of Mars's placement in the chart based on its house, sign, aspects, and strength.

    Args:
        astro_data (list): List of planetary data from `get_planet_data`.
        aspects (list): List of planetary aspects.

    Returns:
        str: A detailed interpretation of Mars's placement.
    """
    mars_data = next((p for p in astro_data if p["planet"] == "Mars"), {})
    if not mars_data:
        return "Mars data is missing from the chart."

    mars_sign = mars_data.get("sign", "Unknown")
    mars_house = mars_data.get("house_number", "Unknown")
    mars_strength = mars_data.get("strength", "Average")
    mars_aspects = [a for a in aspects if a["planet"] == "Mars"]

    interpretation = []
    if isinstance(mars_house, int):
        house_text = ordinal(mars_house)
    else:
        house_text = str(mars_house)

    interpretation.append(
        f"The planet Mars is placed in the {house_text} house of your birth chart, positioned in the zodiac sign of {mars_sign}."
    )

    house_effects = {
        1: "Mars in the 1st house gives courage, determination, and a dynamic personality. You are assertive and action-oriented.",
        2: "Mars in the 2nd house may make speech harsh but gives drive for earning wealth. Family matters can be intense.",
        3: "This is a strong placement for courage, communication, and younger siblings. You are bold in speech and action.",
        4: "This can cause inner restlessness at home. May indicate aggression or disputes in domestic life or with mother.",
        5: "Passionate and impulsive in love, and strong drive toward creativity and children. Sports and competitiveness are favored.",
        6: "Mars is strong here, giving ability to overcome enemies, win legal battles, and improve health through effort.",
        7: "Mars here needs maturity in partnerships. May indicate conflicts or dominance in relationships unless balanced.",
        8: "Mars here gives interest in occult and secrets, but may bring sudden upheavals or accidents. Intense and transformative.",
        9: "This placement gives energetic pursuit of higher knowledge, travel, and philosophy. Can be dogmatic or righteous.",
        10: "A strong Mars here gives ambition and leadership in career. Excellent for competitive fields and engineering roles.",
        11: "Mars brings drive toward goals and networking. Gains can come through male friends, sports, or assertive actions.",
        12: "Energy may be directed inward or toward hidden matters. Can lead to secret enemies or self-undoing if not channeled wisely.",
    }
    if isinstance(mars_house, int):
        interpretation.append(house_effects.get(mars_house, ""))

    sign_effects = {
        "Aries": "Mars in Aries is in its own sign, giving high energy, courage, and a pioneering spirit. You are quick to act.",
        "Taurus": "Mars in Taurus gives stamina and persistence. You act steadily but can be stubborn and sensually motivated.",
        "Gemini": "This placement makes you mentally active and sharp. You argue with vigor and pursue multiple tasks at once.",
        "Cancer": "Mars is debilitated here. Emotional impulsiveness or passive-aggression may arise unless handled constructively.",
        "Leo": "A fiery and confident Mars. Gives leadership qualities and passion. You act with pride and creativity.",
        "Virgo": "Mars in Virgo gives practical energy and attention to detail. Good for precise tasks and organized action.",
        "Libra": "Mars is uncomfortable in Libra. You may struggle to assert yourself or overcompensate in relationships.",
        "Scorpio": "Mars is in its own sign here. Gives depth, strategic power, and passion. You act with intensity and secrecy.",
        "Sagittarius": "You act on beliefs and principles. Energetic, adventurous, and bold in expressing your ideals.",
        "Capricorn": "Mars is exalted in Capricorn, giving disciplined energy, strategic thinking, and strong work ethic.",
        "Aquarius": "Mars here gives drive toward innovation and group goals. Action is future-oriented but emotionally detached.",
        "Pisces": "Mars in Pisces gives imagination-driven action. You may be idealistic, spiritual, or prone to fantasy.",
    }
    interpretation.append(sign_effects.get(mars_sign, ""))

    strength_phrases = {
        "Exalted": "Mars is exalted, enhancing its positive qualities of endurance, leadership, and victory in efforts.",
        "Debilitated": "Mars is debilitated, which may reduce energy or cause frustrations unless balanced by support.",
        "Own Sign": "Mars is in its own sign, strengthening courage, passion, and initiative.",
    }
    interpretation.append(
        strength_phrases.get(
            mars_strength,
            f"Mars's strength is marked as {mars_strength}, influencing its assertive nature.",
        )
    )

    interpretation.append(
        "Overall, Mars represents your drive, energy, aggression, and courage. Understanding and channeling Mars well brings achievement and resilience."
    )

    return " ".join(interpretation)


def get_mercury_interpretation(astro_data, aspects):
    """
    Generate a detailed interpretation of Mercury's placement in the chart based on its house, sign, aspects, and strength.

    Args:
        astro_data (list): List of planetary data from `get_planet_data`.
        aspects (list): List of planetary aspects.

    Returns:
        str: A detailed interpretation of Mercury's placement.
    """
    mercury_data = next((p for p in astro_data if p["planet"] == "Mercury"), {})
    if not mercury_data:
        return "Mercury data is missing from the chart."

    mercury_sign = mercury_data.get("sign", "Unknown")
    mercury_house = mercury_data.get("house_number", "Unknown")
    mercury_strength = mercury_data.get("strength", "Average")
    mercury_aspects = [a for a in aspects if a["planet"] == "Mercury"]

    interpretation = []
    if isinstance(mercury_house, int):
        house_text = ordinal(mercury_house)
    else:
        house_text = str(mercury_house)

    interpretation.append(
        f"The planet Mercury is placed in the {house_text} house of your birth chart, positioned in the zodiac sign of {mercury_sign}."
    )

    house_effects = {
        1: "Mercury in the 1st house gives a quick mind, strong communication skills, and curiosity. You express ideas easily and are mentally active.",
        2: "Mercury in the 2nd house influences your speech and finances. You can be financially clever and communicative in family matters.",
        3: "A great placement for communication, short travels, and relations with siblings. Your thinking is adaptable and versatile.",
        4: "Mercury here helps with intellectual pursuits in family life. It makes you curious about your roots and inner security.",
        5: "This placement enhances your creativity and intelligence, particularly in areas like writing, teaching, and arts.",
        6: "Mercury in the 6th house brings analytical skills to work, health, and service. You thrive in mentally stimulating environments.",
        7: "Mercury in the 7th house gives strong communication in partnerships. Ideal for relationships, business, and negotiations.",
        8: "Mercury in the 8th house makes you interested in deep and hidden matters, including psychology, research, and transformation.",
        9: "Mercury in the 9th house enhances intellectual curiosity for higher learning, travel, and philosophy. You seek knowledge and wisdom.",
        10: "Mercury in the 10th house gives intellectual capacity for career. Ideal for business, communication, and leadership roles.",
        11: "Mercury in the 11th house favors intellectual engagement in groups and social causes. Good for networking and gaining through friendships.",
        12: "Mercury here makes you introspective and reserved. You may be interested in spiritual or psychological matters but keep ideas private.",
    }
    if isinstance(mercury_house, int):
        interpretation.append(house_effects.get(mercury_house, ""))

    sign_effects = {
        "Aries": "Mercury in Aries gives sharp and quick thinking, but you may be impulsive in communication. A direct and straightforward style of expression.",
        "Taurus": "Mercury in Taurus gives a steady, practical mind. You prefer to think things through and are methodical in communication.",
        "Gemini": "Mercury in Gemini, its own sign, brings excellent communication skills. You are intellectually curious and have a versatile mind.",
        "Cancer": "Mercury in Cancer makes the mind emotionally driven. You communicate intuitively and may be sensitive in how you express yourself.",
        "Leo": "Mercury in Leo gives a creative and dramatic style of communication. You may enjoy expressing yourself and having an audience.",
        "Virgo": "Mercury in Virgo, its exalted sign, gives a highly analytical and detailed mind. You excel in critical thinking and problem-solving.",
        "Libra": "Mercury in Libra brings diplomacy and a balanced approach to communication. You have strong intellectual relationships and value fairness.",
        "Scorpio": "Mercury in Scorpio gives an intense and probing mind. You think deeply and may excel in research or uncovering hidden truths.",
        "Sagittarius": "Mercury in Sagittarius brings a broad and adventurous outlook. You communicate your beliefs and ideals openly and expansively.",
        "Capricorn": "Mercury in Capricorn brings a practical, disciplined mind. You communicate logically and excel in structured, strategic thinking.",
        "Aquarius": "Mercury in Aquarius gives a forward-thinking, innovative mind. You are intellectually independent and may be interested in unconventional ideas.",
        "Pisces": "Mercury in Pisces gives a dreamy and imaginative mind. You communicate intuitively and may excel in creative or artistic pursuits.",
    }
    interpretation.append(sign_effects.get(mercury_sign, ""))

    strength_phrases = {
        "Exalted": "Mercury is exalted in Virgo, enhancing its qualities of precision, intellect, and communication. A highly favorable placement for mental clarity.",
        "Debilitated": "Mercury is debilitated in Pisces, which may cause confusion or misunderstandings in communication. It may lead to a lack of clarity or focus.",
        "Own Sign": "Mercury in Gemini or Virgo gives an intelligent and articulate personality, enhancing communication and mental agility.",
    }
    interpretation.append(
        strength_phrases.get(
            mercury_strength,
            f"Mercury's strength is marked as {mercury_strength}, influencing your mental and communicative abilities.",
        )
    )

    interpretation.append(
        "Overall, Mercury represents your intellect, communication, reasoning, and analytical skills. Understanding how Mercury functions in your chart can enhance your cognitive abilities and mental expression."
    )

    return " ".join(interpretation)


def get_venus_interpretation(astro_data, aspects):
    """
    Generate a detailed interpretation of Venus's placement in the chart based on its house, sign, aspects, and strength.

    Args:
        astro_data (list): List of planetary data from `get_planet_data`.
        aspects (list): List of planetary aspects.

    Returns:
        str: A detailed interpretation of Venus's placement.
    """
    venus_data = next((p for p in astro_data if p["planet"] == "Venus"), {})
    if not venus_data:
        return "Venus data is missing from the chart."

    venus_sign = venus_data.get("sign", "Unknown")
    venus_house = venus_data.get("house_number", "Unknown")
    venus_strength = venus_data.get("strength", "Average")
    venus_aspects = [a for a in aspects if a["planet"] == "Venus"]

    interpretation = []
    if isinstance(venus_house, int):
        house_text = ordinal(venus_house)
    else:
        house_text = str(venus_house)

    interpretation.append(
        f"The planet Venus is placed in the {house_text} house of your birth chart, positioned in the zodiac sign of {venus_sign}."
    )

    house_effects = {
        1: "Venus in the 1st house gives charm, attractiveness, and a natural grace. You have a love for beauty and tend to attract attention.",
        2: "Venus in the 2nd house influences your values and finances. You may have a good eye for art and beauty, and your wealth can come through creative pursuits.",
        3: "Venus in the 3rd house enhances communication, relationships with siblings, and short travels. You are charming in speech and enjoy connecting with others.",
        4: "Venus in the 4th house brings harmony to your home and family life. You may find emotional fulfillment in domestic matters and appreciate comfort and luxury.",
        5: "Venus in the 5th house gives strong creative and romantic potential. You are likely to enjoy artistic hobbies, love affairs, and pursuits that bring joy.",
        6: "Venus in the 6th house influences health, work, and service. You may seek beauty in your daily routines, and relationships at work can be harmonious.",
        7: "Venus in the 7th house indicates a harmonious and romantic partner. This placement favors marriage, long-term relationships, and diplomacy in partnerships.",
        8: "Venus in the 8th house gives an interest in the mysterious or taboo. You may experience deep transformations in relationships or shared resources.",
        9: "Venus in the 9th house enhances your love for travel, philosophy, and higher education. You are attracted to foreign cultures or ideas that broaden your mind.",
        10: "Venus in the 10th house gives a love for your career and public life. You may excel in fields related to beauty, fashion, art, or diplomacy.",
        11: "Venus in the 11th house gives charm and popularity in social circles. You are drawn to friends with similar artistic or romantic interests.",
        12: "Venus in the 12th house can bring hidden love affairs or a secretive approach to relationships. You may have a love for solitude and a deeply spiritual nature.",
    }
    if isinstance(venus_house, int):
        interpretation.append(house_effects.get(venus_house, ""))

    sign_effects = {
        "Aries": "Venus in Aries brings a bold and passionate approach to love and beauty. You are direct and energetic in relationships, often seeking excitement and new experiences.",
        "Taurus": "Venus in Taurus, its own sign, brings stability, sensuality, and a love for the material pleasures of life. You value loyalty and comfort in relationships.",
        "Gemini": "Venus in Gemini makes you communicative and flirtatious in love. You seek intellectual stimulation and variety in your relationships.",
        "Cancer": "Venus in Cancer makes love and beauty deeply emotional and nurturing. You may be protective in relationships and find comfort in family matters.",
        "Leo": "Venus in Leo brings passion and drama to love. You are generous in relationships and seek admiration and respect from your partner.",
        "Virgo": "Venus in Virgo brings a practical and detail-oriented approach to love. You may be reserved in expressing affection, but your love is grounded and reliable.",
        "Libra": "Venus in Libra, its exalted sign, brings a natural sense of harmony, balance, and diplomacy. You seek beauty in relationships and have a strong desire for fairness and equality.",
        "Scorpio": "Venus in Scorpio gives deep, intense, and transformative love. You are passionate and often seek profound emotional connections in relationships.",
        "Sagittarius": "Venus in Sagittarius brings an adventurous and free-spirited approach to love. You seek fun, excitement, and exploration in relationships.",
        "Capricorn": "Venus in Capricorn gives a serious, disciplined approach to love. You value stability and may seek long-term commitments with practical partners.",
        "Aquarius": "Venus in Aquarius brings a unique, independent approach to love. You seek unconventional relationships and value intellectual connection over emotional bonding.",
        "Pisces": "Venus in Pisces gives a dreamy and idealistic approach to love. You are compassionate and romantic, often seeking to merge with your partner on a spiritual level.",
    }
    interpretation.append(sign_effects.get(venus_sign, ""))

    strength_phrases = {
        "Exalted": "Venus is exalted in Pisces, enhancing its qualities of love, beauty, and artistic expression. It brings a compassionate and romantic nature.",
        "Debilitated": "Venus is debilitated in Virgo, which may cause difficulties in love, material pursuits, or a tendency toward criticism in relationships.",
        "Own Sign": "Venus in Taurus or Libra enhances its qualities of charm, creativity, and balance. This placement favors harmonious relationships and aesthetic pursuits.",
    }
    interpretation.append(
        strength_phrases.get(
            venus_strength,
            f"Venus's strength is marked as {venus_strength}, influencing your approach to love and beauty.",
        )
    )

    interpretation.append(
        "Overall, Venus represents your approach to love, beauty, relationships, and harmony. Understanding how Venus functions in your chart can enhance your appreciation for art, beauty, and emotional connections."
    )

    return " ".join(interpretation)


def get_jupiter_interpretation(astro_data, aspects):
    """
    Generate a detailed interpretation of Jupiter's placement in the chart based on its house, sign, aspects, and strength.

    Args:
        astro_data (list): List of planetary data from `get_planet_data`.
        aspects (list): List of planetary aspects.

    Returns:
        str: A detailed interpretation of Jupiter's placement.
    """
    jupiter_data = next((p for p in astro_data if p["planet"] == "Jupiter"), {})
    if not jupiter_data:
        return "Jupiter data is missing from the chart."

    jupiter_sign = jupiter_data.get("sign", "Unknown")
    jupiter_house = jupiter_data.get("house_number", "Unknown")
    jupiter_strength = jupiter_data.get("strength", "Average")
    jupiter_aspects = [a for a in aspects if a["planet"] == "Jupiter"]

    interpretation = []
    if isinstance(jupiter_house, int):
        house_text = ordinal(jupiter_house)
    else:
        house_text = str(jupiter_house)

    interpretation.append(
        f"Jupiter is placed in the {house_text} house of your birth chart, positioned in the zodiac sign of {jupiter_sign}."
    )

    house_effects = {
        1: "Jupiter in the 1st house brings an expansive, optimistic, and generous personality. You are likely to be philosophical, broad-minded, and idealistic. This placement often leads to a strong desire for personal growth and development.",
        2: "Jupiter in the 2nd house indicates a natural attraction to wealth, prosperity, and material success. You may possess a strong sense of values and ethics and may experience growth through financial matters or possessions.",
        3: "Jupiter in the 3rd house enhances communication skills, curiosity, and the ability to connect with others. You may be interested in learning, travel, and mental exploration, and are likely to have an optimistic outlook on life.",
        4: "Jupiter in the 4th house brings a love for family, home, and emotional security. This placement often leads to a deep sense of comfort, and you may find happiness through home life and nurturing others.",
        5: "Jupiter in the 5th house blesses you with creativity, a love for fun, and a strong connection to children or romantic relationships. You may experience growth through creative self-expression or speculative ventures like gambling or investments.",
        6: "Jupiter in the 6th house promotes growth through work, service, and health. This placement indicates a desire to improve oneself and others, particularly in health, work-related activities, and service to others.",
        7: "Jupiter in the 7th house indicates growth and expansion through partnerships and marriage. You may attract generous, philosophical, or wise partners who help you expand your horizons. Legal matters or contracts may also play a key role in your life.",
        8: "Jupiter in the 8th house brings an interest in deep transformation, psychology, and hidden knowledge. You may experience personal growth through crises or intense, life-changing experiences that transform your perspective on life.",
        9: "Jupiter in the 9th house enhances your desire for travel, higher learning, and philosophical exploration. You may be drawn to spiritual or intellectual pursuits that broaden your understanding of the world and deepen your worldview.",
        10: "Jupiter in the 10th house favors career growth and professional success. This placement often leads to recognition and leadership roles, and you may experience success through your public image or through teaching, mentoring, or guiding others.",
        11: "Jupiter in the 11th house brings growth through friendships, social networks, and community involvement. You may attract expansive, wise, or influential friends and associates who help you achieve your dreams or humanitarian goals.",
        12: "Jupiter in the 12th house indicates growth through introspection, spirituality, and service to others. You may feel a deep connection to the subconscious mind, mysticism, or hidden matters, and personal growth often comes through retreat or isolation.",
    }
    if isinstance(jupiter_house, int):
        interpretation.append(house_effects.get(jupiter_house, ""))

    sign_effects = {
        "Aries": "Jupiter in Aries brings an expansive, adventurous spirit. You may have a pioneering, enthusiastic approach to life, driven by the desire for independence and new experiences. However, this placement can sometimes lead to a lack of patience or impulsive decisions.",
        "Taurus": "Jupiter in Taurus enhances your desire for stability, comfort, and material success. You may experience growth through accumulating wealth or resources, and you likely appreciate beauty, nature, and the simple pleasures of life.",
        "Gemini": "Jupiter in Gemini fosters a love for learning, communication, and intellectual exploration. You may be naturally curious and enjoy sharing ideas with others. However, there can be a tendency to scatter your energies or be inconsistent.",
        "Cancer": "Jupiter in Cancer indicates growth through family, nurturing, and emotional connections. You are likely to find comfort and fulfillment in creating a secure, loving home, and you may be drawn to taking care of others or protecting loved ones.",
        "Leo": "Jupiter in Leo brings a generous, confident, and creative energy. You may experience growth through self-expression, leadership, or recognition. You likely have a strong sense of pride and seek opportunities to shine and inspire others.",
        "Virgo": "Jupiter in Virgo promotes growth through service, work, and attention to detail. You may find success in practical pursuits, focusing on improving yourself and others. However, there can be a tendency to overanalyze or be overly critical.",
        "Libra": "Jupiter in Libra fosters growth through partnerships, relationships, and a sense of balance. You may seek harmony and justice, and you may find success through collaborations or legal matters. However, this placement can sometimes lead to indecision or an overemphasis on others' needs.",
        "Scorpio": "Jupiter in Scorpio brings deep transformation, emotional intensity, and a thirst for hidden knowledge. You may experience growth through psychological or spiritual exploration, and you may have a deep interest in mystery, power, or transformation.",
        "Sagittarius": "Jupiter in Sagittarius, its own sign, brings an abundance of optimism, adventure, and philosophical depth. You are likely to seek personal growth through travel, higher learning, and expanding your worldview. This placement is highly favorable for broadening your horizons.",
        "Capricorn": "Jupiter in Capricorn indicates growth through discipline, ambition, and hard work. You may find success through practical achievements, professional pursuits, and long-term planning. However, you may also face challenges with authority figures or self-doubt.",
        "Aquarius": "Jupiter in Aquarius brings growth through innovative ideas, social causes, and progressive thinking. You may be drawn to unconventional paths and may experience expansion through networking, technology, or humanitarian efforts.",
        "Pisces": "Jupiter in Pisces, its exalted sign, brings spiritual growth, compassion, and creativity. You may be drawn to artistic, mystical, or charitable pursuits, and personal growth often comes through intuition, imagination, and selfless service to others.",
    }
    interpretation.append(sign_effects.get(jupiter_sign, ""))

    strength_phrases = {
        "Exalted": "Jupiter is exalted in Cancer, which enhances its qualities of wisdom, compassion, and spiritual insight. This placement brings a strong desire for emotional growth, nurturing, and a sense of family or home.",
        "Debilitated": "Jupiter is debilitated in Capricorn, which can make it difficult to express its expansive qualities. This placement may lead to challenges in personal growth, particularly in areas related to ambition, success, or material pursuits.",
        "Own Sign": "Jupiter in Sagittarius, its own sign, brings an abundance of optimism, philosophical depth, and a love for exploration. This is a highly favorable placement for personal growth, higher learning, and travel.",
    }
    interpretation.append(
        strength_phrases.get(
            jupiter_strength,
            f"Jupiter's strength is marked as {jupiter_strength}, influencing your philosophical and spiritual growth.",
        )
    )

    interpretation.append(
        "Overall, Jupiter represents wisdom, growth, expansion, and philosophy. It brings opportunities for prosperity, higher learning, and spiritual development, but may also lead to excess or overconfidence if its energy is not managed properly."
    )

    return " ".join(interpretation)


def get_saturn_interpretation(astro_data, aspects):
    """
    Generate a detailed interpretation of Saturn's placement in the chart based on its house, sign, aspects, and strength.

    Args:
        astro_data (list): List of planetary data from `get_planet_data`.
        aspects (list): List of planetary aspects.

    Returns:
        str: A detailed interpretation of Saturn's placement.
    """
    saturn_data = next((p for p in astro_data if p["planet"] == "Saturn"), {})
    if not saturn_data:
        return "Saturn data is missing from the chart."

    saturn_sign = saturn_data.get("sign", "Unknown")
    saturn_house = saturn_data.get("house_number", "Unknown")
    saturn_strength = saturn_data.get("strength", "Average")
    saturn_aspects = [a for a in aspects if a["planet"] == "Saturn"]

    interpretation = []
    if isinstance(saturn_house, int):
        house_text = ordinal(saturn_house)
    else:
        house_text = str(saturn_house)

    interpretation.append(
        f"The planet Saturn is placed in the {house_text} house of your birth chart, positioned in the zodiac sign of {saturn_sign}."
    )

    house_effects = {
        1: "Saturn in the 1st house can give a serious and reserved personality. You may feel a sense of responsibility and maturity from a young age.",
        2: "Saturn in the 2nd house can indicate financial struggles or a cautious approach to material wealth. You value stability and tend to work hard for what you have.",
        3: "Saturn in the 3rd house can make communication serious or reserved. You may have a disciplined mind, but struggles with siblings or neighbors could arise.",
        4: "Saturn in the 4th house can indicate emotional restriction or challenges at home. Family matters may feel burdensome or demanding.",
        5: "Saturn in the 5th house may create challenges in romance, creativity, and children. However, it can bring discipline and maturity to artistic pursuits.",
        6: "Saturn in the 6th house gives a strong work ethic and a need for order in daily routines. It may also indicate health concerns that require long-term attention.",
        7: "Saturn in the 7th house can make relationships serious, often leading to delayed or challenging partnerships. You seek commitment, but may face difficulties in marriage.",
        8: "Saturn in the 8th house can bring deep transformation through crises. There may be a sense of responsibility toward shared resources or intense, karmic relationships.",
        9: "Saturn in the 9th house may bring a disciplined approach to higher education, philosophy, and travel. However, it can also bring struggles with beliefs or foreign experiences.",
        10: "Saturn in the 10th house gives a strong focus on career and public reputation. This placement is often seen in individuals who are determined and ambitious in their profession.",
        11: "Saturn in the 11th house may bring a serious approach to friendships and social networks. You may feel a sense of responsibility toward group goals or face challenges in group dynamics.",
        12: "Saturn in the 12th house often indicates hidden or subconscious struggles. There can be a sense of isolation, or an affinity for spiritual practices that require discipline.",
    }
    if isinstance(saturn_house, int):
        interpretation.append(house_effects.get(saturn_house, ""))

    sign_effects = {
        "Aries": "Saturn in Aries may cause frustration in asserting yourself. There can be a conflict between the need for independence and the desire for discipline and control.",
        "Taurus": "Saturn in Taurus brings a steady, methodical approach to life. This placement favors patience and persistence but may also lead to stubbornness or attachment to material things.",
        "Gemini": "Saturn in Gemini may create challenges in communication, making it feel like you need to put in extra effort to express your thoughts. Intellectual pursuits can be a source of discipline and structure.",
        "Cancer": "Saturn in Cancer brings emotional restrictions or a sense of duty toward family and home. There may be challenges in finding emotional stability, but it can lead to deep emotional resilience over time.",
        "Leo": "Saturn in Leo may limit self-expression or create a sense of inadequacy in seeking recognition. However, this placement also brings a strong sense of responsibility toward leadership or creative pursuits.",
        "Virgo": "Saturn in Virgo enhances practicality and attention to detail. You have a strong desire for perfection and order, but this can also lead to overwork or self-criticism.",
        "Libra": "Saturn in Libra brings a serious approach to relationships and partnerships. There may be delays or challenges in love, but it can also indicate a strong sense of fairness and justice in partnerships.",
        "Scorpio": "Saturn in Scorpio gives a deep, intense nature and a strong desire for control. You may experience transformational experiences through crises or power struggles, but you can also build great strength through adversity.",
        "Sagittarius": "Saturn in Sagittarius gives a disciplined approach to higher knowledge, travel, and philosophy. This placement favors long-term learning and structured exploration, but may create a sense of limitation around freedom or beliefs.",
        "Capricorn": "Saturn in Capricorn is in its own sign, making you ambitious, disciplined, and focused on success. You have a strong sense of duty and a methodical approach to achieving your goals.",
        "Aquarius": "Saturn in Aquarius brings a unique, forward-thinking approach to structure. You may feel a sense of responsibility toward humanitarian causes or social reforms, but can also face isolation due to unconventional ideas.",
        "Pisces": "Saturn in Pisces may bring challenges in dealing with emotions or spirituality. There can be a sense of confusion or limitation, but this placement also calls for disciplined creativity or spiritual practice.",
    }
    interpretation.append(sign_effects.get(saturn_sign, ""))

    strength_phrases = {
        "Exalted": "Saturn is exalted in Libra, which enhances its qualities of discipline, structure, and responsibility. This placement brings a strong sense of fairness and balance.",
        "Debilitated": "Saturn is debilitated in Aries, which may cause frustrations in asserting yourself or taking initiative. However, with effort, you can overcome these challenges and develop resilience.",
        "Own Sign": "Saturn in Capricorn brings an exalted quality to its own traits of discipline, focus, and responsibility. This placement indicates a strong ability to work toward long-term goals.",
    }
    interpretation.append(
        strength_phrases.get(
            saturn_strength,
            f"Saturn's strength is marked as {saturn_strength}, influencing your perseverance and approach to responsibility.",
        )
    )

    interpretation.append(
        "Overall, Saturn represents structure, responsibility, perseverance, and discipline. It can bring obstacles but also teaches patience and resilience over time."
    )

    return " ".join(interpretation)


def get_rahu_interpretation(astro_data, aspects):
    """
    Generate a detailed interpretation of Rahu's placement in the chart based on its house, sign, aspects, and strength.

    Args:
        astro_data (list): List of planetary data from `get_planet_data`.
        aspects (list): List of planetary aspects.

    Returns:
        str: A detailed interpretation of Rahu's placement.
    """
    rahu_data = next((p for p in astro_data if p["planet"] == "Rahu"), {})
    if not rahu_data:
        return "Rahu data is missing from the chart."

    rahu_sign = rahu_data.get("sign", "Unknown")
    rahu_house = rahu_data.get("house_number", "Unknown")
    rahu_strength = rahu_data.get("strength", "Average")
    rahu_aspects = [a for a in aspects if a["planet"] == "Rahu"]

    interpretation = []
    if isinstance(rahu_house, int):
        house_text = ordinal(rahu_house)
    else:
        house_text = str(rahu_house)

    interpretation.append(
        f"Rahu is placed in the {house_text} house of your birth chart, positioned in the zodiac sign of {rahu_sign}."
    )

    house_effects = {
        1: "Rahu in the 1st house indicates a strong desire for self-expression and independence. There may be an obsession with your image or identity, and you may feel driven to constantly reinvent yourself.",
        2: "Rahu in the 2nd house can bring an intense focus on material wealth and possessions. There may be unusual or nontraditional ways of earning, and you may face fluctuations in financial stability.",
        3: "Rahu in the 3rd house brings an unconventional approach to communication, learning, and siblings. You may have a strong desire to break boundaries in how you think or communicate.",
        4: "Rahu in the 4th house often causes a sense of instability or restlessness at home. There may be a strong desire to find emotional security but an inability to settle down comfortably.",
        5: "Rahu in the 5th house can bring a unique or unconventional approach to creativity, children, and romance. It may lead to a fascination with speculative activities or intense, transformative experiences in love and creativity.",
        6: "Rahu in the 6th house may indicate a strong desire to excel in work, health, and service. It can also bring struggles with enemies or health-related issues, requiring you to work hard for balance.",
        7: "Rahu in the 7th house can bring obsession with partnerships, marriage, and public relationships. There may be a tendency to attract unusual or unconventional partners, or intense desire for recognition through relationships.",
        8: "Rahu in the 8th house signifies transformation through crises or deep psychological issues. This placement can indicate sudden, intense experiences or a fascination with taboo subjects like death, occultism, or mysteries.",
        9: "Rahu in the 9th house brings an intense interest in higher learning, philosophy, and travel. There can be a desire to break traditional boundaries in beliefs, and you may experience unorthodox or transformative travel experiences.",
        10: "Rahu in the 10th house may bring a strong ambition to achieve recognition and success in your career. You may be driven to seek unconventional paths to fame or authority, or experience sudden rises and falls in your professional life.",
        11: "Rahu in the 11th house indicates a desire to achieve big dreams through social connections, networks, or humanitarian causes. You may experience fluctuations in friendships and group dynamics but feel driven to associate with innovative or forward-thinking people.",
        12: "Rahu in the 12th house can bring an obsession with spirituality, hidden matters, or isolation. You may face a deep internal conflict between the desire for material gains and the pull toward the subconscious or mystical realms.",
    }
    if isinstance(rahu_house, int):
        interpretation.append(house_effects.get(rahu_house, ""))

    sign_effects = {
        "Aries": "Rahu in Aries brings a bold, assertive approach to achieving desires. There can be an impulsive nature, seeking new experiences and risks. However, Rahu's position here may also indicate tendencies toward impatience or aggression.",
        "Taurus": "Rahu in Taurus drives a desire for material possessions, comfort, and stability. This placement can bring a focus on accumulating wealth, but it may also lead to attachment or obsession with sensory pleasures.",
        "Gemini": "Rahu in Gemini can make you intellectually curious, with a desire for unconventional learning and communication. There can be a tendency toward inconsistency, as Rahu may bring scattered energies, though it favors quick thinking and adaptability.",
        "Cancer": "Rahu in Cancer brings a deep emotional desire for security and connection with family or roots. However, it can create instability in your emotional life, often leading to a sense of restlessness or longing for a sense of belonging.",
        "Leo": "Rahu in Leo leads to a strong desire for recognition, fame, and leadership. You may feel driven to stand out or to express yourself creatively, but may also struggle with ego-related issues or challenges in receiving the attention you desire.",
        "Virgo": "Rahu in Virgo indicates an obsession with perfection, analysis, and order. You may seek recognition through intellectual or work-related pursuits, but it can also bring difficulties with perfectionism and self-criticism.",
        "Libra": "Rahu in Libra brings a desire for balance and harmony in relationships. There may be a fascination with beauty, art, or social justice, but it can also indicate challenges in forming stable, committed partnerships.",
        "Scorpio": "Rahu in Scorpio indicates a strong drive for transformation, power, and control. This placement brings an intense focus on matters of intimacy, psychology, and the unknown, often driving you to explore the depths of life and relationships.",
        "Sagittarius": "Rahu in Sagittarius gives a strong desire for freedom, exploration, and higher knowledge. This placement indicates a passion for adventure and travel, but it may also bring challenges with overindulgence or reckless behavior.",
        "Capricorn": "Rahu in Capricorn indicates a strong drive for success, achievement, and recognition in the material world. This placement brings ambition and the desire to make a lasting impact, but can also lead to overwork and a sense of emptiness if success is not achieved.",
        "Aquarius": "Rahu in Aquarius brings a desire for innovation, originality, and progress. You may be drawn to unconventional ideas or humanitarian causes, but may also struggle with eccentricity or isolation from others due to your unique ideas.",
        "Pisces": "Rahu in Pisces brings a deep desire for spirituality, compassion, and creativity. This placement indicates a yearning to explore the mystical or imaginative realms, but it may also cause confusion, escapism, or a lack of clear direction.",
    }
    interpretation.append(sign_effects.get(rahu_sign, ""))

    strength_phrases = {
        "Exalted": "Rahu is exalted in Taurus, which brings a strong drive for material success and security. This placement enhances Rahu's qualities of ambition and desire, particularly in the material world.",
        "Debilitated": "Rahu is debilitated in Scorpio, which can lead to difficulties in dealing with power struggles, transformation, and psychological matters. You may face challenges in overcoming deep fears or subconscious influences.",
        "Own Sign": "Rahu in Aquarius brings an innovative and unconventional approach to achieving goals. You may feel driven to break societal norms and pursue unique, progressive ideas.",
    }
    interpretation.append(
        strength_phrases.get(
            rahu_strength,
            f"Rahu's strength is marked as {rahu_strength}, influencing your desires and aspirations.",
        )
    )

    interpretation.append(
        "Overall, Rahu represents desires, ambitions, and the unconventional path to success. It can lead to obsession, instability, and challenges, but also offers opportunities for growth through breaking boundaries and seeking new experiences."
    )

    return " ".join(interpretation)


def get_ketu_interpretation(astro_data, aspects):
    """
    Generate a detailed interpretation of Ketu's placement in the chart based on its house, sign, aspects, and strength.

    Args:
        astro_data (list): List of planetary data from `get_planet_data`.
        aspects (list): List of planetary aspects.

    Returns:
        str: A detailed interpretation of Ketu's placement.
    """
    ketu_data = next((p for p in astro_data if p["planet"] == "Ketu"), {})
    if not ketu_data:
        return "Ketu data is missing from the chart."

    ketu_sign = ketu_data.get("sign", "Unknown")
    ketu_house = ketu_data.get("house_number", "Unknown")
    ketu_strength = ketu_data.get("strength", "Average")
    ketu_aspects = [a for a in aspects if a["planet"] == "Ketu"]

    interpretation = []
    if isinstance(ketu_house, int):
        house_text = ordinal(ketu_house)
    else:
        house_text = str(ketu_house)

    interpretation.append(
        f"Ketu is placed in the {house_text} house of your birth chart, positioned in the zodiac sign of {ketu_sign}."
    )

    house_effects = {
        1: "Ketu in the 1st house indicates a deep, spiritual, or karmic connection to the self. You may feel detached from your physical identity or have a tendency toward introspection and self-analysis. There may be a desire to explore spiritual or otherworldly pursuits, sometimes at the cost of personal materialism.",
        2: "Ketu in the 2nd house affects your material possessions, values, and speech. There may be a sense of detachment or indifference towards wealth and the accumulation of material goods. It could lead to unconventional ways of earning money or an unusual relationship with family and speech.",
        3: "Ketu in the 3rd house signifies a spiritual or karmic approach to communication, travel, and intellectual pursuits. You may feel detached from day-to-day interactions, and may have an interest in esoteric knowledge, inner exploration, or the deep meaning behind ordinary activities.",
        4: "Ketu in the 4th house influences your home, emotions, and family life. This placement may indicate detachment from your family or home life, a sense of disconnection, or a desire for solitude. You may feel an internal urge for emotional security but have difficulty finding it through conventional means.",
        5: "Ketu in the 5th house brings a unique, sometimes detached, perspective on creativity, romance, and children. You may experience past-life karmic influences or find unconventional ways to express your creativity. It may also indicate detachment from pleasure or the pursuit of joy.",
        6: "Ketu in the 6th house affects health, service, and daily work routines. There may be a desire to withdraw from conventional work or service-oriented activities. You may seek spiritual or unconventional methods of healing or helping others. Health issues may also arise due to past-life karmic influences.",
        7: "Ketu in the 7th house influences relationships, marriage, and partnerships. You may feel detached or disinterested in conventional relationships, preferring instead spiritual or unconventional unions. There may be a tendency to seek deep, transformative connections or to withdraw from relationships altogether.",
        8: "Ketu in the 8th house brings a deep, introspective, and spiritual approach to transformation, death, and hidden matters. This placement often indicates a deep connection with the mysteries of life and a strong karmic influence on shared resources, inheritance, or psychological matters.",
        9: "Ketu in the 9th house indicates a past-life connection with higher education, philosophy, and long-distance travel. You may feel a detachment from traditional religious or philosophical beliefs, often seeking your own spiritual path. There may also be a deep inner exploration of the meaning of life and your place in the universe.",
        10: "Ketu in the 10th house influences career, social status, and your public image. There may be a sense of detachment from the traditional career path or an unconventional approach to your professional life. You may have a deep desire for spiritual growth, but it may come at the cost of material success or public recognition.",
        11: "Ketu in the 11th house brings a sense of detachment from friendships, social networks, and group activities. You may feel disconnected from social goals or collective aspirations, often preferring spiritual or individual pursuits over group efforts. There may also be a karmic influence on your hopes and dreams for the future.",
        12: "Ketu in the 12th house signifies deep spiritual growth, introspection, and a connection to the subconscious mind. This placement often leads to a desire for solitude or retreat, where you can explore the inner realms of consciousness. It can indicate karmic closure and the need to let go of attachments in this lifetime.",
    }
    if isinstance(ketu_house, int):
        interpretation.append(house_effects.get(ketu_house, ""))

    sign_effects = {
        "Aries": "Ketu in Aries brings a strong, independent, and sometimes impulsive energy. You may feel a deep need to assert yourself, but also a sense of detachment from personal desires. This placement can lead to a desire for spiritual independence and self-discovery, but also a struggle with impulsive tendencies.",
        "Taurus": "Ketu in Taurus signifies detachment from material possessions, wealth, and comfort. There may be a spiritual inclination to seek inner peace rather than material gain. This placement can indicate a past-life connection to financial or family matters, with a need to break free from earthly attachments.",
        "Gemini": "Ketu in Gemini brings a detachment from intellectual pursuits, communication, and the exchange of ideas. You may feel a sense of internal conflict or desire for solitude, but also an urge to explore deep knowledge or hidden truths. There is often a search for deeper meaning beyond surface-level information.",
        "Cancer": "Ketu in Cancer signifies detachment from emotional security, family, or home life. You may feel a deep connection to your inner emotional world, but also a sense of disconnection from conventional family structures. This placement can bring a desire to explore spiritual or emotional depths.",
        "Leo": "Ketu in Leo brings detachment from personal recognition, self-expression, and pride. You may feel a need to withdraw from the spotlight, seeking spiritual growth rather than fame or social status. There may also be a karmic link to leadership or creative roles that requires letting go of ego-driven ambitions.",
        "Virgo": "Ketu in Virgo signifies detachment from daily routines, work, and practical matters. You may seek deeper meaning in your service or work, or have an unconventional approach to health and wellness. There is often a need to let go of perfectionism or an overly analytical mindset.",
        "Libra": "Ketu in Libra brings a spiritual detachment from relationships, partnerships, and social harmony. You may feel disconnected from conventional relationships, seeking instead deep, transformative connections. There may be a need to break free from societal expectations around love and partnership.",
        "Scorpio": "Ketu in Scorpio brings a deep, introspective energy that seeks to understand the mysteries of life, death, and transformation. You may feel detached from emotional attachments or material pursuits, seeking instead spiritual or psychological growth. This placement often involves karmic lessons around shared resources or power dynamics.",
        "Sagittarius": "Ketu in Sagittarius brings a spiritual detachment from traditional beliefs, higher learning, and philosophical systems. You may feel disconnected from conventional religions or ideologies, seeking your own spiritual path. This placement can lead to deep philosophical insights, often gained through personal experience or inner exploration.",
        "Capricorn": "Ketu in Capricorn brings detachment from material success, career ambition, or social status. You may feel a need to break free from traditional structures and find spiritual fulfillment beyond worldly achievements. There is often a karmic influence on authority figures or professional life.",
        "Aquarius": "Ketu in Aquarius signifies detachment from social networks, friendships, or group activities. You may feel disconnected from collective goals or humanitarian efforts, seeking instead personal or spiritual growth. This placement often indicates a need to let go of idealistic or futuristic goals in favor of inner peace.",
        "Pisces": "Ketu in Pisces brings deep spiritual energy, a connection to the subconscious mind, and a desire for selfless service. You may feel detached from the material world, seeking instead spiritual or artistic pursuits. This placement can indicate karmic closure and the need to let go of attachments to the physical world.",
    }
    interpretation.append(sign_effects.get(ketu_sign, ""))

    strength_phrases = {
        "Exalted": "Ketu is exalted in Scorpio, enhancing its transformative and spiritual qualities. This placement brings a deep connection to the subconscious mind, mystical insights, and a strong urge to let go of past attachments.",
        "Debilitated": "Ketu is debilitated in Taurus, which may lead to difficulty in detaching from material or emotional attachments. This placement can bring karmic lessons related to possessions, family, or personal values.",
        "Own Sign": "Ketu in Scorpio, its own sign, amplifies its transformative and spiritual energy. This placement encourages deep introspection, psychological growth, and a desire for inner transformation.",
    }
    interpretation.append(
        strength_phrases.get(
            ketu_strength,
            f"Ketu's strength is marked as {ketu_strength}, influencing your spiritual growth and karmic lessons.",
        )
    )

    interpretation.append(
        "Overall, Ketu represents spiritual growth, detachment, and karmic lessons. It often indicates areas where we need to let go of attachments or material desires in order to progress spiritually."
    )

    return " ".join(interpretation)


def get_lagna_chart_from_body(body_name, astro_data):
    """
    Returns a lagna chart using the specified body (Moon or Sun) as the ascendant.
    """
    # Find the planet data for the given body
    body_data = next((p for p in astro_data if p["planet"] == body_name), None)
    if not body_data:
        raise ValueError(f"{body_name} data not found in astro_data.")

    asc_longitude = body_data["absolute_longitude"]
    asc_sign_index = int(asc_longitude // 30)
    asc_sign = ZODIAC_SIGNS[asc_sign_index]
    asc_deg_in_sign = asc_longitude % 30

    # Calculate Nakshatra for the new ascendant
    nakshatra_degree = 13 + 1 / 3
    nakshatra_index = int(asc_longitude // nakshatra_degree)
    nakshatra_name = nakshatra_list[nakshatra_index]
    nakshatra_lord = nakshatra_lords[nakshatra_index]

    # Recalculate house numbers for all planets
    planets = []
    for p in astro_data:
        planet_long = p["absolute_longitude"]
        planet_sign_index = int(planet_long // 30)
        # House number relative to new ascendant
        house_number = ((planet_sign_index - asc_sign_index) % 12) + 1
        planet_copy = dict(p)
        planet_copy["house_number"] = house_number
        planets.append(planet_copy)

    return {
        "ascendant": {
            "asc_sign_index": asc_sign_index,
            "ascendant_degree": round(asc_deg_in_sign, 2),
            "ascendant_longitude": asc_longitude,
            "ascendant_nakshatra": nakshatra_name,
            "ascendant_nakshatra_lord": nakshatra_lord,
            "ascendant_sign": asc_sign,
        },
        "planets": planets,
    }


def calculate_ashtakavarga(astro_data, ascendant_longitude, reference_planet):
    """
    Generalized Bhinnashtakavarga calculator for any planet.
    `reference_planet` determines which planet's rules to use (e.g., "Sun", "Moon", etc.)
    """

    rashis = [
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
    ]
    planet_names = [
        "Sun",
        "Moon",
        "Mars",
        "Mercury",
        "Jupiter",
        "Venus",
        "Saturn",
        "Ascendant",
    ]
    sign_to_index = {name: idx for idx, name in enumerate(rashis)}

    # Bindu rules for all reference planets
    all_bindu_rules = {
        "Sun": {
            "Sun": [1, 2, 4, 7, 8, 9, 10, 11],
            "Moon": [3, 6, 10, 11],
            "Mars": [1, 2, 4, 7, 8, 9, 10, 11],
            "Mercury": [3, 5, 6, 9, 10, 11, 12],
            "Jupiter": [5, 6, 9, 11],
            "Venus": [6, 7, 12],
            "Saturn": [1, 2, 4, 7, 8, 9, 10, 11],
            "Ascendant": [3, 4, 6, 10, 11, 12],
        },
        "Moon": {
            "Sun": [3, 6, 7, 8, 10, 11],
            "Moon": [1, 3, 6, 7, 10, 11],
            "Mars": [2, 3, 5, 6, 9, 10, 11],
            "Mercury": [1, 3, 4, 5, 7, 8, 10, 11],
            "Jupiter": [1, 4, 7, 8, 10, 11, 12],
            "Venus": [3, 4, 5, 7, 9, 10, 11],
            "Saturn": [3, 5, 6, 11],
            "Ascendant": [3, 6, 10, 11],
        },
        "Mars": {
            "Saturn": [1, 4, 7, 8, 9, 10, 11],
            "Jupiter": [6, 10, 11, 12],
            "Mars": [1, 2, 4, 7, 8, 10, 11],
            "Sun": [3, 5, 6, 10, 11],
            "Venus": [6, 8, 11, 12],
            "Mercury": [3, 5, 6, 11],
            "Moon": [3, 6, 11],
            "Ascendant": [1, 3, 6, 10, 11],
        },
        "Mercury": {
            "Saturn": [1, 2, 4, 7, 8, 9, 10, 11],
            "Jupiter": [6, 8, 11, 12],
            "Mars": [1, 2, 4, 7, 8, 9, 10, 11],
            "Sun": [5, 6, 9, 11, 12],
            "Venus": [1, 2, 3, 4, 5, 8, 9, 11],
            "Mercury": [1, 3, 5, 6, 9, 10, 11, 12],
            "Moon": [2, 4, 6, 8, 10, 11],
            "Ascendant": [1, 2, 4, 6, 8, 10, 11],
        },
        "Jupiter": {
            "Sun": [1, 2, 3, 4, 7, 8, 9, 10, 11],
            "Moon": [2, 5, 7, 9, 11],
            "Mars": [1, 2, 4, 7, 8, 10, 11],
            "Mercury": [1, 2, 4, 5, 6, 9, 10, 11],
            "Jupiter": [1, 2, 3, 4, 7, 8, 10, 11],
            "Venus": [2, 5, 6, 9, 10, 11],
            "Saturn": [3, 5, 6, 12],
            "Ascendant": [1, 2, 4, 5, 6, 7, 9, 10, 11],
        },
        "Venus": {
            "Saturn": [3, 4, 5, 8, 9, 10, 11],
            "Jupiter": [5, 8, 9, 10, 11],
            "Mars": [3, 4, 6, 9, 11, 12],
            "Sun": [8, 11, 12],
            "Venus": [1, 2, 3, 4, 5, 8, 9, 10, 11],
            "Mercury": [3, 5, 6, 9, 11],
            "Moon": [1, 2, 3, 4, 5, 8, 9, 11, 12],
            "Ascendant": [1, 2, 3, 4, 5, 8, 9, 11],
        },
        "Saturn": {
            "Sun": [1, 2, 4, 7, 8, 10, 11],
            "Moon": [3, 6, 11],
            "Mars": [3, 5, 6, 10, 11, 12],
            "Mercury": [6, 8, 9, 10, 11, 12],
            "Jupiter": [5, 6, 11, 12],
            "Venus": [6, 11, 12],
            "Saturn": [3, 5, 6, 11],
            "Ascendant": [1, 3, 4, 6, 10, 11],
        },
    }

    bindu_rules = all_bindu_rules.get(reference_planet)
    if not bindu_rules:
        raise ValueError(f"No bindu rules defined for {reference_planet}")

    def gives_bindu(planet_sign_idx, rashi_idx, houses):
        return any((planet_sign_idx + h - 1) % 12 == rashi_idx for h in houses)

    # Build planet to sign index map
    planet_sign_index = {}
    for p in astro_data:
        pname = p["planet"]
        if pname in planet_names:
            sign_idx = sign_to_index.get(p["sign"])
            planet_sign_index[pname] = sign_idx

    # Add Ascendant
    planet_sign_index["Ascendant"] = int(ascendant_longitude // 30) % 12

    # Create the ashtakavarga table
    table = []
    for rashi_idx, rashi in enumerate(rashis):
        row = {"Rashi": rashi}
        total = 0
        for pname in planet_names:
            p_sign = planet_sign_index.get(pname)
            if p_sign is None:
                row[pname] = 0
                continue
            bindu = 1 if gives_bindu(p_sign, rashi_idx, bindu_rules[pname]) else 0
            row[pname] = bindu
            total += bindu
        row["Total"] = total
        table.append(row)

    overall_total = sum(row["Total"] for row in table)
    return table, overall_total


def calculate_sarvashtakavarga(astro_data, ascendant_longitude):
    rashis = [
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
    ]
    planets = [
        "Sun",
        "Moon",
        "Mars",
        "Mercury",
        "Jupiter",
        "Venus",
        "Saturn",
        "Ascendant",
    ]

    sav_dict = {rashi: 0 for rashi in rashis}

    for planet in planets:
        try:
            bav_table, _ = calculate_ashtakavarga(
                astro_data, ascendant_longitude, planet
            )
            for row in bav_table:
                sav_dict[row["Rashi"]] += row["Total"]
        except ValueError:
            pass  # Skip if rules for planet not found

    # Return as a list of dicts in zodiac order
    return [{"sign": rashi, "value": sav_dict[rashi]} for rashi in rashis]


GEMSTONE_DETAILS = {
    "Ruby": {
        "planet": "Sun",
        "how_to_wear": "Gold, on ring finger (Sunday morning)",
        "mantra": "ॐ ह्रं ह्रीं ह्रौं सः सूर्याय नमः ।",
    },
    "Pearl": {
        "planet": "Moon",
        "how_to_wear": "Silver, on little finger (Monday morning)",
        "mantra": "ॐ श्रं श्रीं श्रौं सः चन्द्राय नमः ।",
    },
    "Red Coral": {
        "planet": "Mars",
        "how_to_wear": "Gold or Copper, on ring finger (Tuesday morning)",
        "mantra": "ॐ क्रं क्रीं क्रौं सः भौमाय नमः ।",
    },
    "Emerald": {
        "planet": "Mercury",
        "how_to_wear": "Gold, on little finger (Wednesday morning)",
        "mantra": "ॐ ब्रं ब्रीं ब्रोउं सः बुधाय नमः ।",
    },
    "Yellow Sapphire": {
        "planet": "Jupiter",
        "how_to_wear": "Gold, on index finger (Thursday morning)",
        "mantra": "ॐ ग्रं ग्रीं ग्रौं सः गुरवे नमः ।",
    },
    "Diamond": {
        "planet": "Venus",
        "how_to_wear": "Silver or Platinum, on ring finger (Friday morning)",
        "mantra": "ॐ द्रं द्रीं द्रोउं सः शुक्राय नमः ।",
    },
    "Blue Sapphire": {
        "planet": "Saturn",
        "how_to_wear": "Silver, on middle finger (Saturday morning)",
        "mantra": "ॐ प्रं प्रीं प्रौं सः शनैश्चराय नमः ।",
    },
    "Hessonite Garnet (Gomed)": {
        "planet": "Rahu",
        "how_to_wear": "Panchdhatu or Silver, on middle finger (Saturday evening during Rahu Kaal)",
        "mantra": "ॐ भ्रं भ्रीं भ्रौं सः राहवे नमः ।",
    },
    "Cat's Eye (Lehsunia)": {
        "planet": "Ketu",
        "how_to_wear": "Panchdhatu or Silver, on little finger (Tuesday evening)",
        "mantra": "ॐ श्रं श्रीं श्रौं सः केतवे नमः । ",
    },
}


def get_gemstone_for_planet(planet):
    for gem, details in GEMSTONE_DETAILS.items():
        if details["planet"] == planet:
            return gem
    return "None"


def get_gemstone_details(planet, gem):
    detail = GEMSTONE_DETAILS.get(gem, {})
    return {
        "planet": planet,
        "gem": gem,
        "how_to_wear": detail.get("how_to_wear", "Consult astrologer"),
        "mantra": detail.get("mantra", "Mantra not found"),
    }


def get_gemstone_for_planet(planet):
    for gem, details in GEMSTONE_DETAILS.items():
        if details["planet"] == planet:
            return gem
    return "None"


def get_life_fortune_lucky_stones(ascendant_sign, astro_data):
    # Life Stone: Ascendant lord
    asc_lord = sign_lords_map[ascendant_sign]
    asc_gem = get_gemstone_for_planet(asc_lord)
    life_details = GEMSTONE_DETAILS.get(asc_gem, {})
    life_stone_desc = (
        f"A Life Stone is a gem for the Lagna lord, which the native can wear throughout life. "
        f"It influences self-image, wealth, education, health, business, spouse, and intellect. "
        f"The lord of the {ascendant_sign} ascendant (Lagna) is {asc_lord}, and to please {asc_lord}, "
        f"the person born with {ascendant_sign} Ascendant must wear {asc_gem}."
    )

    # Fortune Stone: 9th house lord
    ninth_house_sign_index = (ZODIAC_SIGN_TO_INDEX[ascendant_sign] + 8) % 12
    ninth_house_sign = get_sign_name(ninth_house_sign_index)
    ninth_lord = sign_lords_map[ninth_house_sign]
    ninth_gem = get_gemstone_for_planet(ninth_lord)
    fortune_details = GEMSTONE_DETAILS.get(ninth_gem, {})
    fortune_stone_desc = (
        f"The Bhagya Stone is suggested based on the lord of the 9th house (fortune). "
        f"It helps attract luck when most needed and enhances prosperity in life. "
        f"For {ascendant_sign} Ascendant, the 9th house is {ninth_house_sign}, ruled by {ninth_lord}. "
        f"Hence, the Bhagya Stone is {ninth_gem}."
    )

    # Lucky Stones: Functional benefics for ascendant
    benefics = FUNCTIONAL_NATURES_BY_ASCENDANT.get(ascendant_sign, {}).get(
        "benefic", []
    )
    lucky_stones = []
    added_gems = {asc_gem, ninth_gem}

    for planet in benefics:
        gem = get_gemstone_for_planet(planet)
        if gem not in added_gems:
            details = GEMSTONE_DETAILS.get(gem, {})
            lucky_stones.append(
                {
                    "gem": gem,
                    "how_to_wear": details.get("how_to_wear", "Consult astrologer"),
                    "mantra": details.get("mantra", "Mantra not found"),
                    "description": (
                        f"A Lucky gemstone is worn to enhance a native's luck and open new doors to success. "
                        f"It ensures blessings from favorable planets. Since {planet} is benefic for {ascendant_sign}, "
                        f"the lucky stone is {gem}."
                    ),
                }
            )
            added_gems.add(gem)

    return {
        "life_stone": {
            "description": life_stone_desc,
            "gem": asc_gem,
            "how_to_wear": life_details.get("how_to_wear", "Consult astrologer"),
            "mantra": life_details.get("mantra", "Mantra not found"),
        },
        "fortune_stone": {
            "description": fortune_stone_desc,
            "gem": ninth_gem,
            "how_to_wear": fortune_details.get("how_to_wear", "Consult astrologer"),
            "mantra": fortune_details.get("mantra", "Mantra not found"),
        },
        "lucky_stones": lucky_stones,
    }


def get_sunrise_sunset(date_str, lat, lon, timezone_str):
    """
    Returns sunrise and sunset time as strings in local time for the given date and location using astral.
    """
    tz = pytz.timezone(timezone_str)
    dt = datetime.strptime(date_str, "%Y-%m-%d")
    city = LocationInfo(
        name="Custom", region="", timezone=timezone_str, latitude=lat, longitude=lon
    )
    s = sun(city.observer, date=dt.date(), tzinfo=tz)
    sunrise = s["sunrise"].strftime("%I:%M %p")
    sunset = s["sunset"].strftime("%I:%M %p")
    return sunrise, sunset


def get_rahu_kalam(sunrise, sunset, date_str):
    # Determine weekday from date_str
    weekday = datetime.strptime(date_str, "%Y-%m-%d").strftime("%A")
    rahu_kalam_table = [7, 1, 6, 4, 5, 3, 2]
    idx = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
    ].index(weekday)
    segment = rahu_kalam_table[idx]
    sunrise_dt = datetime.strptime(sunrise, "%I:%M %p")
    sunset_dt = datetime.strptime(sunset, "%I:%M %p")
    day_minutes = int((sunset_dt - sunrise_dt).total_seconds() // 60)
    segment_length = day_minutes // 8
    start = (sunrise_dt + timedelta(minutes=segment * segment_length)).strftime(
        "%I:%M %p"
    )
    end = (sunrise_dt + timedelta(minutes=(segment + 1) * segment_length)).strftime(
        "%I:%M %p"
    )
    return f"{start} – {end}"


def get_yamaganda(sunrise, sunset, weekday):
    yamaganda_table = [4, 3, 2, 1, 0, 6, 5]
    idx = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
    ].index(weekday)
    segment = yamaganda_table[idx]
    sunrise_dt = datetime.strptime(sunrise, "%I:%M %p")
    sunset_dt = datetime.strptime(sunset, "%I:%M %p")
    day_minutes = int((sunset_dt - sunrise_dt).total_seconds() // 60)
    segment_length = day_minutes // 8
    start = (sunrise_dt + timedelta(minutes=segment * segment_length)).strftime(
        "%I:%M %p"
    )
    end = (sunrise_dt + timedelta(minutes=(segment + 1) * segment_length)).strftime(
        "%I:%M %p"
    )
    return f"{start} – {end}"


def get_gulika(sunrise, sunset, weekday):
    gulika_table = [6, 5, 4, 3, 2, 1, 0]
    idx = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
    ].index(weekday)
    segment = gulika_table[idx]
    sunrise_dt = datetime.strptime(sunrise, "%I:%M %p")
    sunset_dt = datetime.strptime(sunset, "%I:%M %p")
    day_minutes = int((sunset_dt - sunrise_dt).total_seconds() // 60)
    segment_length = day_minutes // 8
    start = (sunrise_dt + timedelta(minutes=segment * segment_length)).strftime(
        "%I:%M %p"
    )
    end = (sunrise_dt + timedelta(minutes=(segment + 1) * segment_length)).strftime(
        "%I:%M %p"
    )
    return f"{start} – {end}"


def get_abhijit_muhurat(sunrise, sunset):
    sunrise_dt = datetime.strptime(sunrise, "%I:%M %p")
    sunset_dt = datetime.strptime(sunset, "%I:%M %p")
    day_length = int((sunset_dt - sunrise_dt).total_seconds() // 60)
    abhijit_start = sunrise_dt + timedelta(minutes=(day_length // 2) - 24)
    abhijit_end = abhijit_start + timedelta(minutes=48)
    return f"{abhijit_start.strftime('%I:%M %p')} – {abhijit_end.strftime('%I:%M %p')}"


def get_brahma_muhurat(sunrise):
    sunrise_dt = datetime.strptime(sunrise, "%I:%M %p")
    start = (sunrise_dt - timedelta(minutes=96)).strftime("%I:%M %p")
    end = (sunrise_dt - timedelta(minutes=48)).strftime("%I:%M %p")
    return f"{start} – {end}"


def get_lunar_month(dt):
    # Placeholder: always Jyeshta for demo, you can compute based on Sun/Moon positions
    return {"amanta": "Jyeshta", "purnimanta": "Jyeshta"}


def get_ritu(dt):
    # Placeholder: always Grishma for demo, you can compute based on Sun's longitude
    return {"vedic": "Grishma (Summer)", "drik": "Grishma (Summer)"}


def get_saka_year(dt):
    # Saka year = Gregorian year - 78 (starts in March)
    year = dt.year
    month = dt.month
    if month >= 3:
        saka = year - 78
    else:
        saka = year - 79
    return f"{saka}"


def get_panchang_for_date(date_str):
    lat = 28.6139
    lon = 77.2090
    timezone_str = "Asia/Kolkata"
    tz = pytz.timezone(timezone_str)
    sunrise, sunset = get_sunrise_sunset(date_str, lat, lon, timezone_str)
    dt = tz.localize(datetime.strptime(f"{date_str} {sunrise}", "%Y-%m-%d %I:%M %p"))
    jd_ut = swe.julday(dt.year, dt.month, dt.day, dt.hour + dt.minute / 60.0)
    astro_data = get_planet_data(jd_ut, lat, lon)
    sun_data = next(p for p in astro_data if p["planet"] == "Sun")
    moon_data = next(p for p in astro_data if p["planet"] == "Moon")
    akshadva = get_akshadva_details(
        jd_ut,
        moon_data["longitude"],
        moon_data["sign"],
        moon_data["nakshatra"],
        sun_data["longitude"],
    )

    # Compute Vara (weekday)
    weekday = dt.strftime("%A")
    vara = {
        "Sunday": "Raviwar",
        "Monday": "Somwar",
        "Tuesday": "Mangalwar",
        "Wednesday": "Budhwar",
        "Thursday": "Guruvar",
        "Friday": "Shukrawar",
        "Saturday": "Shaniwar",
    }.get(weekday, weekday)

    # Rahu Kalam, Yamaganda, Gulika, Abhijit, Brahma Muhurat
    rahu_kalam = get_rahu_kalam(sunrise, sunset, date_str)
    yamaganda = get_yamaganda(sunrise, sunset, weekday)
    gulika = get_gulika(sunrise, sunset, weekday)
    abhijit = get_abhijit_muhurat(sunrise, sunset)
    brahma_muhurat = get_brahma_muhurat(sunrise)

    # Saka year, lunar month, ritu
    saka_year = get_saka_year(dt)
    lunar_month = get_lunar_month(dt)
    ritu = get_ritu(dt)

    # Compose Panchang dict with dynamic values
    return {
        "date": date_str,
        "sunrise": sunrise,
        "sunset": sunset,
        "vara": vara,
        "tithi": akshadva["Tithi"],
        "yoga": akshadva["Yoga"],
        "nakshatra": akshadva["Nakshatra-Charan"],
        "moon_sign": moon_data["sign"],
        "sun_sign": sun_data["sign"],
        "rahu_kalam": rahu_kalam,
        "yamaganda": yamaganda,
        "gulika": gulika,
        "abhijit_muhurat": abhijit,
        "brahma_muhurat": brahma_muhurat,
        "saka_year": saka_year,
        "lunar_month": lunar_month,
        "ritu": ritu,
        # Add more computed fields as needed
    }

def get_mangal_dosh_status(astro_data):
    """
    Returns a dict with 'status' as 'Manglik' or 'Not Manglik', and a reason based on Mars position.
    """
    try:
        mars = next((p for p in astro_data if p["planet"] == "Mars"), None)
        if not mars or "house_number" not in mars:
            return {
                "status": "Unknown",
                "reason": "Mars data not available or house number missing."
            }

        dosha_houses = {1, 2, 4, 7, 8, 12}
        if mars["house_number"] in dosha_houses:
            return {
                "status": "Manglik",
                "reason": f"Mars is in the {mars['house_number']}th house, which causes Mangal Dosh."
            }
        else:
            return {
                "status": "Not Manglik",
                "reason": f"Mars is in the {mars['house_number']}th house, which does not cause Mangal Dosh."
            }

    except Exception as e:
        return {
            "status": "Unknown",
            "reason": f"Error determining Mangal Dosh: {str(e)}"
        }
VEDIC_NUMEROLOGY_MEANINGS = {
    1: "Sun – Leadership, willpower, individuality. Ruled by Surya.",
    2: "Moon – Sensitivity, diplomacy, peace. Ruled by Chandra.",
    3: "Jupiter – Wisdom, creativity, growth. Ruled by Guru.",
    4: "Rahu – Innovation, instability, karmic influences.",
    5: "Mercury – Communication, adaptability, intellect. Ruled by Budh.",
    6: "Venus – Harmony, beauty, material pleasures. Ruled by Shukra.",
    7: "Ketu – Spirituality, isolation, mysticism.",
    8: "Saturn – Discipline, ambition, karmic justice. Ruled by Shani.",
    9: "Mars – Courage, passion, action. Ruled by Mangal.",
}

def reduce_to_digit(n):
    """Reduce a number to a single digit or master number (11, 22, 33)."""
    while n > 9 and n not in (11, 22, 33):
        n = sum(int(d) for d in str(n))
    return n

def calculate_root_number(date_str):
    """Calculate Root Number (Mulank) from the day of birth (DD in YYYY-MM-DD)."""
    try:
        day = int(date_str.split('-')[2])
        return reduce_to_digit(day)
    except Exception:
        return None

def calculate_destiny_number(full_name):
    """Calculate Destiny (Expression/Bhagyank) Number using the Chaldean system."""
    def letter_to_chaldean_number(letter):
        letter = letter.upper()
        mapping = {
            1: "A", 2: "BCK", 3: "GJL", 4: "DM", 5: "ENH",
            6: "UVWX", 7: "OZ", 8: "FP", 9: "IRQSTY"
        }
        for num, letters in mapping.items():
            if letter in letters:
                return num
        return 0

    total = sum(letter_to_chaldean_number(c) for c in full_name if c.isalpha())
    return reduce_to_digit(total)

def calculate_life_path_number(date_str):
    """Calculate Life Path (Bhagyank) Number from full date of birth (YYYY-MM-DD)."""
    try:
        y, m, d = map(int, date_str.split('-'))
        total = sum(int(digit) for digit in str(y)) + sum(int(digit) for digit in str(m)) + sum(int(digit) for digit in str(d))
        return reduce_to_digit(total)
    except Exception:
        return None


app = Flask(__name__)
# Allow cross-origin requests
CORS(app)


@app.route("/api/data", methods=["POST"])
def api_data():
    # Allow cross-origin requests
    data = request.json
    print(
        "Received data:", data
    )  # Print incoming data to see what's actually being received

    try:
        data = request.get_json()

          # 🔐 Required input check
        if not data or not all(
            k in data for k in ("date_input", "time_input", "latitude", "longitude")
        ):
            return (
                jsonify(
                    {
                        "error": "Missing required input: 'date_input', 'time_input', 'latitude', or 'longitude'"
                    }
                ),
                400,
            )

        date_input = data["date_input"]
        time_input = data["time_input"]
        lat = float(data["latitude"])
        lon = float(data["longitude"])

        # 📆 Parse datetime
        try:
            birth_naive = datetime.strptime(
                f"{date_input} {time_input}", "%Y-%m-%d %I:%M %p"
            )
        except ValueError as e:
            return jsonify({"error": f"Error parsing datetime: {e}"}), 400

        # 🌍 Timezone (optional: use UTC or let user provide)
        # If you want to use UTC:
        birth_dt = birth_naive.replace(tzinfo=pytz.utc)
        birth_dt_utc = birth_dt

        jd_ut = swe.julday(
            birth_dt_utc.year,
            birth_dt_utc.month,
            birth_dt_utc.day,
            birth_dt_utc.hour
            + birth_dt_utc.minute / 60.0
            + birth_dt_utc.second / 3600.0,
        )

        # 🪐 Birth Chart
        astro_data = get_planet_data(jd_ut, lat, lon)
        ascendant = get_ascendant(jd_ut, lat, lon)
        moon_data = next(p for p in astro_data if p["planet"] == "Moon")
        sun_data = next(p for p in astro_data if p["planet"] == "Sun")
        moon_nakshatra = moon_data["nakshatra"]
        moon_sign = moon_data["sign"]
        sun_sign = sun_data["sign"]
        akshadva = get_akshadva_details(
            jd_ut,
            moon_data["longitude"],
            moon_sign,
            moon_nakshatra,
            sun_data["longitude"],
        )
        cusp_details = get_cusp_details(jd_ut, lat, lon)
        aspects = calculate_aspects_simple(astro_data, ascendant["ascendant_longitude"])
        vimshottari_dasha = get_vimshottari_dasha_with_antardasha(
            calculate_vimshottari_dasha(
                moon_data["absolute_longitude"], birth_dt.date()
            )
        )
        moon_longitude = moon_data["absolute_longitude"]

        # 🏠 Bhav Chalit Chart
        bhav_chalit_chart = get_bhav_chalit_chart(jd_ut, lat, lon, astro_data)

        # ♻ Sign-to-House Map
        asc_sign = ascendant["ascendant_sign"]
        # ♻ Sign-to-House Map
        asc_sign_index = ZODIAC_SIGN_TO_INDEX[
            asc_sign
        ]  # Convert ascendant sign to its index
        sign_to_house = {(asc_sign_index + i) % 12: i + 1 for i in range(12)}

        # 🌐 Gochar chart
        now = datetime.now(pytz.utc)
        jd_now = swe.julday(
            now.year, now.month, now.day, now.hour + now.minute / 60 + now.second / 3600
        )
        gochar_data = get_planet_data(jd_now, lat, lon)

        # 🌐 Gochar chart
        gochar_chart = []
        for planet in gochar_data:
            rashi = planet[
                "sign"
            ]  # This is already the zodiac sign name (e.g., "Aries")
            gochar_chart.append(
                {
                    "Planet": planet["planet"],
                    "Sign": rashi,  # Use the sign name directly
                    "Degree": round(planet["degree_in_sign"], 2),
                    "Nakshatra": (
                        planet["nakshatra"]["name"]
                        if isinstance(planet["nakshatra"], dict)
                        else str(planet["nakshatra"])
                    ),
                    "House": sign_to_house.get(
                        ZODIAC_SIGN_TO_INDEX[rashi]
                    ),  # Convert sign name to index for house lookup
                    "Retrograde": planet["retrograde"],
                }
            )
            result = {"gochar_chart": gochar_chart, "gochar_ascendant_sign": asc_sign}

        # 🌙 Sade Sati and Panoti Phases
        sade_sati_panoti = get_sade_sati_and_panoti_phases(
            moon_longitude, birth_dt.date()
        )

        # 🌟 Karakas
        karakas = calculate_karakas(astro_data)
        hora = get_hora_data_bphs(astro_data, ascendant["ascendant_longitude"])
        drekkana = get_drekkana_data_bphs(astro_data, ascendant["ascendant_longitude"])
        navmasa = get_navamsa_data_bphs(astro_data, ascendant["ascendant_longitude"])
        dasamsa = get_dasamsa_data_bphs(astro_data, ascendant["ascendant_longitude"])
        bhamsa = get_bhamsa_data_bphs(astro_data, ascendant["ascendant_longitude"])
        shashtiamsa = get_shashtiamsa_data_bphs(
            astro_data, ascendant["ascendant_longitude"]
        )
        saptamsa = get_saptamsa_data_bphs(astro_data, ascendant["ascendant_longitude"])
        shodasamsa = get_shodasamsa_data_bphs(
            astro_data, ascendant["ascendant_longitude"]
        )
        trimsamsa = get_trimsamsa_data_bphs(
            astro_data, ascendant["ascendant_longitude"]
        )
        akshavedamsa = get_akshavedamsa_data_bphs(
            astro_data, ascendant["ascendant_longitude"]
        )
        siddhamsa = get_siddhamsa_data_bphs(
            astro_data, ascendant["ascendant_longitude"]
        )
        chaturthamsa = get_chaturthamsa_data_bphs(
            astro_data, ascendant["ascendant_longitude"]
        )
        chatvarimsamsa = get_chatvarimsamsa_data_bphs(
            astro_data, ascendant["ascendant_longitude"]
        )
        vimsamsa = get_vimsamsa_data_bphs(astro_data, ascendant["ascendant_longitude"])
        dvadasamsa = get_dvadasamsa_data_bphs(
            astro_data, ascendant["ascendant_longitude"]
        )

        # 🌟 Calculate Strength in Divisional Charts for Each Planet
        divisional_chart_strengths = {}
        for planet in astro_data:
            planet_name = planet["planet"]
            planet_longitude = planet["absolute_longitude"]
            divisional_chart_strengths[planet_name] = (
                calculate_planet_strength_in_dcharts(
                    planet_name, planet_longitude, ascendant["ascendant_longitude"]
                )
            )

        moon_lagna_chart = get_lagna_chart_from_body("Moon", astro_data)
        sun_lagna_chart = get_lagna_chart_from_body("Sun", astro_data)
        ruling_planet = calculate_ruling_planets(astro_data, ascendant, jd_ut)

        # 📦 Response
        result = {
     
            "datetime": {
                "local_time": birth_dt.strftime("%Y-%m-%d %I:%M %p"),
                "utc_time": birth_dt_utc.strftime("%Y-%m-%d %I:%M %p"),
                "julian_day": jd_ut,
            },
            "ayanamsa": swe.get_ayanamsa_ut(jd_ut),
            "ascendant": ascendant,
            "moon": {
                "longitude": moon_longitude,
                "nakshatra": moon_nakshatra,
                "sign": moon_sign,
            },
            "sun": {"sign": sun_sign},
            "akshadva": {
                "akshadva": akshadva,
            },
            "lagna-chart": {"ascendant": ascendant, "planets": astro_data},
            "cusp_details": cusp_details,
            "aspects": aspects,
            "vimshottari_dasha": vimshottari_dasha,
            "sade_sati_panoti": sade_sati_panoti,  # Include Sade Sati and Panoti phases
            "karakas": karakas,  # Include Karakas
            "navmasa": navmasa,
            "dasamsa": dasamsa,
            "bhamsa": bhamsa,
            "shashtiamsa": shashtiamsa,
            "akshavedamsa": akshavedamsa,
            "siddhamsa": siddhamsa,
            "chaturthamsa": chaturthamsa,
            "dvadasamsa": dvadasamsa,
            "saptamsa": saptamsa,
            "shodasamsa": shodasamsa,
            "trimsamsa": trimsamsa,
            "chatvarimsamsa": chatvarimsamsa,
            "hora": hora,
            "vimsamsa": vimsamsa,
            "drekkana": drekkana,
            "gochar_chart": gochar_chart,
            "bhav_chalit_chart": bhav_chalit_chart,
            "divisional_chart_strengths": divisional_chart_strengths,
            "first_house": get_first_house_effects(asc_sign, astro_data, aspects),
            "second_house": get_second_house_effects(asc_sign, astro_data, aspects),
            "third_house": get_third_house_effects(asc_sign, astro_data, aspects),
            "fourth_house": get_fourth_house_effects(asc_sign, astro_data, aspects),
            "fifth_house": get_fifth_house_effects(asc_sign, astro_data, aspects),
            "sixth_house": get_sixth_house_effects(asc_sign, astro_data, aspects),
            "seventh_house": get_seventh_house_effects(asc_sign, astro_data, aspects),
            "eighth_house": get_eighth_house_effects(asc_sign, astro_data, aspects),
            "ninth_house": get_ninth_house_effects(asc_sign, astro_data, aspects),
            "tenth_house": get_tenth_house_effects(asc_sign, astro_data, aspects),
            "eleventh_house": get_eleventh_house_effects(asc_sign, astro_data, aspects),
            "twelfth_house": get_twelfth_house_effects(asc_sign, astro_data, aspects),
            "sun_interpretation": get_sun_interpretation(astro_data, aspects),
            "moon_interpretation": get_moon_interpretation(astro_data, aspects),
            "mars_interpretation": get_mars_interpretation(astro_data, aspects),
            "venus_interpretation": get_venus_interpretation(astro_data, aspects),
            "mercury_interpretation": get_mercury_interpretation(astro_data, aspects),
            "jupiter_interpretation": get_jupiter_interpretation(astro_data, aspects),
            "saturn_interpretation": get_saturn_interpretation(astro_data, aspects),
            "rahu_interpretation": get_rahu_interpretation(astro_data, aspects),
            "ketu_interpretation": get_ketu_interpretation(astro_data, aspects),
            "moon_lagna_chart": moon_lagna_chart,
            "sun_lagna_chart": sun_lagna_chart,
            "ruling_planet": ruling_planet,
            "sun_ashtakavarga": calculate_ashtakavarga(
                astro_data, ascendant["ascendant_longitude"], "Sun"
            ),
            "moon_ashtakavarga": calculate_ashtakavarga(
                astro_data, ascendant["ascendant_longitude"], "Moon"
            ),
            "mars_ashtakavarga": calculate_ashtakavarga(
                astro_data, ascendant["ascendant_longitude"], "Mars"
            ),
            "mercury_ashtakavarga": calculate_ashtakavarga(
                astro_data, ascendant["ascendant_longitude"], "Mercury"
            ),
            "jupiter_ashtakavarga": calculate_ashtakavarga(
                astro_data, ascendant["ascendant_longitude"], "Jupiter"
            ),
            "venus_ashtakavarga": calculate_ashtakavarga(
                astro_data, ascendant["ascendant_longitude"], "Venus"
            ),
            "saturn_ashtakavarga": calculate_ashtakavarga(
                astro_data, ascendant["ascendant_longitude"], "Saturn"
            ),
            "sarvashtakavarga_total": calculate_sarvashtakavarga(
                astro_data, ascendant["ascendant_longitude"]
            ),
            "gemstones": get_life_fortune_lucky_stones(asc_sign, astro_data),
        }

        return jsonify(result)

    except Exception as e:
        print("⚠️ INTERNAL SERVER ERROR:")
        print(traceback.format_exc())

        return jsonify({"message": "Data received", "data": data})


@app.route("/api/panchang", methods=["GET"])
def api_panchang():
    try:
        # Use your preferred timezone, for example 'Asia/Kolkata'
        tz = pytz.timezone("Asia/Kolkata")
        today = datetime.now(tz).date()

        # You can convert the date to string or format as needed
        date_str = today.strftime("%Y-%m-%d")

        # Call your existing Panchang calculation function here:
        panchang = get_panchang_for_date(
            date_str
        )  # You need to implement or reuse this

        return jsonify(panchang)

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/ashtakoot-milan", methods=["POST"])
def api_ashtakoot_milan():
    """
    Minimal Ashtakoot Milan using only get_location_details and get_akshadva_details.
    """
    try:
        data = request.get_json()
        if not data or "boy" not in data or "girl" not in data:
            return jsonify({"error": "Missing 'boy' or 'girl' input"}), 400

        def get_akshadva_for_person(person):
            date_input = person["date_input"]
            time_input = person["time_input"]
            location_input = person["location_input"]

            # 📆 Parse datetime
            try:
                birth_naive = datetime.strptime(
                    f"{date_input} {time_input}", "%Y-%m-%d %I:%M %p"
                )
            except ValueError as e:
                raise Exception(f"Error parsing datetime: {e}")

            # 🌍 Location + Timezone
            lat, lon, timezone_str = get_location_details(location_input)
            tz = pytz.timezone(timezone_str)
            birth_dt = tz.localize(birth_naive)
            birth_dt_utc = birth_dt.astimezone(pytz.utc)

            jd_ut = swe.julday(
                birth_dt_utc.year,
                birth_dt_utc.month,
                birth_dt_utc.day,
                birth_dt_utc.hour
                + birth_dt_utc.minute / 60.0
                + birth_dt_utc.second / 3600.0,
            )

            astro_data = get_planet_data(jd_ut, lat, lon)
            moon = next(p for p in astro_data if p["planet"] == "Moon")
            sun = next(p for p in astro_data if p["planet"] == "Sun")
            akshadva = get_akshadva_details(
                jd_ut,
                moon["absolute_longitude"],
                moon["sign"],
                moon["nakshatra"],
                sun["absolute_longitude"],
            )
            mangal_dosh = get_mangal_dosh_status(astro_data)
            return {
                "moon_sign": moon["sign"],
                "moon_nakshatra": moon["nakshatra"],
                "moon_longitude": moon["absolute_longitude"],
                "akshadva": akshadva,
                "mangal_dosh": mangal_dosh,
            }

        boy = get_akshadva_for_person(data["boy"])
        girl = get_akshadva_for_person(data["girl"])

        # Ashtakoot points calculation (minimal, using only akshadva dicts)
        def ashtakoot_score(boy, girl):
            b, g = boy["akshadva"], girl["akshadva"]
            # 1. Varna (1)
            varna = 1 if b["Varna"] == g["Varna"] else 0
            # 2. Vashya (2)
            vashya_points = {
            # Same Vashya type
            ("Chatushpad", "Chatushpad"): 2,
            ("Jalchar", "Jalchar"): 2,
            ("Vanchar", "Vanchar"): 2,
            ("Manav", "Manav"): 2,
            ("Keet", "Keet"): 2,

            # Friendly combinations
            ("Chatushpad", "Jalchar"): 1,
            ("Chatushpad", "Vanchar"): 1,
            ("Jalchar", "Vanchar"): 1,
            ("Manav", "Keet"): 1,

            # Incompatible pairs (everything else defaults to 0 via your fallback logic)
        }

            vashya = vashya_points.get((b["Vashya"], g["Vashya"])) or vashya_points.get((g["Vashya"], b["Vashya"]), 0)


            # 3. Tara (3)
            nak_deg = 13 + 1 / 3
            b_nak = int(boy["moon_longitude"] // nak_deg)
            g_nak = int(girl["moon_longitude"] // nak_deg)
            tara_index = (g_nak - b_nak + 27) % 27
            tara_type = tara_index % 9
            tara_point_map = {
                0: 0,  # Janma
                1: 1.5,  # Sampat
                2: 0,    # Vipat
                3: 1.5,  # Kshema
                4: 0,    # Pratyari
                5: 1.5,  # Sadhana
                6: 0,    # Naidhana
                7: 1.5,  # Mitra
                8: 1.5,  # Parama Mitra
            }
            tara = tara_point_map.get(tara_type, 0)

            # 4. Yoni (4) # Points: 4 = Same, 3 = Friendly, 2 = Neutral, 1/0 = Incompatible

            yoni_matrix = {
                ("Horse", "Horse"): 4,
                ("Horse", "Elephant"): 2,
                ("Horse", "Sheep"): 2,
                ("Horse", "Serpent"): 1,
                ("Horse", "Dog"): 2,
                ("Horse", "Cat"): 2,
                ("Horse", "Rat"): 2,
                ("Horse", "Cow"): 3,
                ("Horse", "Buffalo"): 2,
                ("Horse", "Tiger"): 2,
                ("Horse", "Deer"): 3,
                ("Horse", "Monkey"): 2,
                ("Horse", "Mongoose"): 1,
                ("Horse", "Lion"): 2,

                ("Elephant", "Elephant"): 4,
                ("Elephant", "Sheep"): 2,
                ("Elephant", "Serpent"): 1,
                ("Elephant", "Dog"): 1,
                ("Elephant", "Cat"): 1,
                ("Elephant", "Rat"): 2,
                ("Elephant", "Cow"): 2,
                ("Elephant", "Buffalo"): 2,
                ("Elephant", "Tiger"): 1,
                ("Elephant", "Deer"): 2,
                ("Elephant", "Monkey"): 3,
                ("Elephant", "Mongoose"): 2,
                ("Elephant", "Lion"): 0,

                ("Sheep", "Sheep"): 4,
                ("Sheep", "Serpent"): 1,
                ("Sheep", "Dog"): 2,
                ("Sheep", "Cat"): 1,
                ("Sheep", "Rat"): 2,
                ("Sheep", "Cow"): 3,
                ("Sheep", "Buffalo"): 2,
                ("Sheep", "Tiger"): 1,
                ("Sheep", "Deer"): 3,
                ("Sheep", "Monkey"): 2,
                ("Sheep", "Mongoose"): 2,
                ("Sheep", "Lion"): 1,

                ("Serpent", "Serpent"): 4,
                ("Serpent", "Dog"): 1,
                ("Serpent", "Cat"): 2,
                ("Serpent", "Rat"): 2,
                ("Serpent", "Cow"): 1,
                ("Serpent", "Buffalo"): 2,
                ("Serpent", "Tiger"): 1,
                ("Serpent", "Deer"): 2,
                ("Serpent", "Monkey"): 1,
                ("Serpent", "Mongoose"): 1,
                ("Serpent", "Lion"): 1,

                ("Dog", "Dog"): 4,
                ("Dog", "Cat"): 2,
                ("Dog", "Rat"): 1,
                ("Dog", "Cow"): 2,
                ("Dog", "Buffalo"): 3,
                ("Dog", "Tiger"): 0,
                ("Dog", "Deer"): 2,
                ("Dog", "Monkey"): 2,
                ("Dog", "Mongoose"): 2,
                ("Dog", "Lion"): 1,

                ("Cat", "Cat"): 4,
                ("Cat", "Rat"): 3,
                ("Cat", "Cow"): 0,
                ("Cat", "Buffalo"): 2,
                ("Cat", "Tiger"): 1,
                ("Cat", "Deer"): 2,
                ("Cat", "Monkey"): 1,
                ("Cat", "Mongoose"): 1,
                ("Cat", "Lion"): 1,

                ("Rat", "Rat"): 4,
                ("Rat", "Cow"): 3,
                ("Rat", "Buffalo"): 2,
                ("Rat", "Tiger"): 2,
                ("Rat", "Deer"): 2,
                ("Rat", "Monkey"): 2,
                ("Rat", "Mongoose"): 1,
                ("Rat", "Lion"): 1,

                ("Cow", "Cow"): 4,
                ("Cow", "Buffalo"): 3,
                ("Cow", "Tiger"): 2,
                ("Cow", "Deer"): 3,
                ("Cow", "Monkey"): 2,
                ("Cow", "Mongoose"): 2,
                ("Cow", "Lion"): 3,

                ("Buffalo", "Buffalo"): 4,
                ("Buffalo", "Tiger"): 2,
                ("Buffalo", "Deer"): 2,
                ("Buffalo", "Monkey"): 2,
                ("Buffalo", "Mongoose"): 2,
                ("Buffalo", "Lion"): 1,

                ("Tiger", "Tiger"): 4,
                ("Tiger", "Deer"): 2,
                ("Tiger", "Monkey"): 3,
                ("Tiger", "Mongoose"): 1,
                ("Tiger", "Lion"): 2,

                ("Deer", "Deer"): 4,
                ("Deer", "Monkey"): 2,
                ("Deer", "Mongoose"): 2,
                ("Deer", "Lion"): 2,

                ("Monkey", "Monkey"): 4,
                ("Monkey", "Mongoose"): 1,
                ("Monkey", "Lion"): 2,
                ("Monkey","Elephant"): 3,

                ("Mongoose", "Mongoose"): 4,
                ("Mongoose", "Lion"): 2,

                ("Lion", "Lion"): 4,
            }

            yoni = yoni_matrix.get((b["Yoni"], g["Yoni"])) or yoni_matrix.get((g["Yoni"], b["Yoni"]), 0)


            # 5. Graha Maitri (5)
            boy_lord = sign_lords_map.get(boy["moon_sign"])
            girl_lord = sign_lords_map.get(girl["moon_sign"])
            graha_maitri = 5 if boy_lord == girl_lord else 0
            # 6. Gana (6)
            gana_matrix = {
            ("Deva", "Deva"): 6,
            ("Deva", "Manushya"): 5,
            ("Manushya", "Deva"): 5,
            ("Manushya", "Manushya"): 6,
            ("Rakshasa", "Rakshasa"): 6,
            ("Rakshasa", "Manushya"): 1,
            ("Manushya", "Rakshasa"): 1,
            ("Deva", "Rakshasa"): 0,
            ("Rakshasa", "Deva"): 0,
            }
            gana = gana_matrix.get((b["Gan"], g["Gan"]), 0)

            # 7. Bhakoot (7)
            sign_index = {"Aries": 0, "Taurus": 1, "Gemini": 2, "Cancer": 3, "Leo": 4, "Virgo": 5,
                          "Libra": 6, "Scorpio": 7, "Sagittarius": 8, "Capricorn": 9, "Aquarius": 10, "Pisces": 11}
            b_idx = sign_index.get(boy["moon_sign"], 0)
            g_idx = sign_index.get(girl["moon_sign"], 0)
            bhakoot = 7 if abs(b_idx - g_idx) not in [6, 8, 12] else 0
            # 8. Nadi (8)
            nadi = 8 if b["Nadi"] != g["Nadi"] else 0
            total = varna + vashya + tara + yoni + graha_maitri + gana + bhakoot + nadi
            return {
                "varna": varna, "vashya": vashya, "tara": tara, "yoni": yoni,
                "graha_maitri": graha_maitri, "gana": gana, "bhakoot": bhakoot, "nadi": nadi,
                "total": total, "max": 36
            }

        score = ashtakoot_score(boy, girl)
   
        guna_table = [
            {
                
                "Guna": "Varna Koot",
                "Girl": girl["akshadva"]["Varna"],
                "Boy": boy["akshadva"]["Varna"],
                "Obtained Point": score["varna"],
                "Maximum Point": 1,
                "Area Of Life": "Aptitude",
            },
            {
                
                "Guna": "Vasya Koot",
                "Girl": girl["akshadva"]["Vashya"],
                "Boy": boy["akshadva"]["Vashya"],
                "Obtained Point": score["vashya"],
                "Maximum Point": 2,
                "Area Of Life": "Amenability",
            },
            {
            
                "Guna": "Tara Koot",
                "Girl": girl["moon_nakshatra"],
                "Boy": boy["moon_nakshatra"],
                "Obtained Point": score["tara"],
                "Maximum Point": 3,
                "Area Of Life": "Compassion",
            },
            {
                
                "Guna": "Yoni Koot",
                "Girl": girl["akshadva"]["Yoni"],
                "Boy": boy["akshadva"]["Yoni"],
                "Obtained Point": score["yoni"],
                "Maximum Point": 4,
                "Area Of Life": "Chemistry",
            },
            {
                
                "Guna": "Graha Maitri",
                "Girl": sign_lords_map.get(girl["moon_sign"], ""),
                "Boy": sign_lords_map.get(boy["moon_sign"], ""),
                "Obtained Point": score["graha_maitri"],
                "Maximum Point": 5,
                "Area Of Life": "Affection",
            },
            {
                
                "Guna": "Gana Koot",
                "Girl": girl["akshadva"]["Gan"],
                "Boy": boy["akshadva"]["Gan"],
                "Obtained Point": score["gana"],
                "Maximum Point": 6,
                "Area Of Life": "Temperament",
            },
            {
                
                "Guna": "Bhakoot Koot",
                "Girl": girl["moon_sign"],
                "Boy": boy["moon_sign"],
                "Obtained Point": score["bhakoot"],
                "Maximum Point": 7,
                "Area Of Life": "Love",
            },
            {
                
                "Guna": "Nadi Koot",
                "Girl": girl["akshadva"]["Nadi"],
                "Boy": boy["akshadva"]["Nadi"],
                "Obtained Point": score["nadi"],
                "Maximum Point": 8,
                "Area Of Life": "Progeny",
            },
        ]

        result = {
            "guna_milan_table": guna_table,
            "total_points": score["total"],
            "maximum_points": score["max"],
            "boy_mangal_dosh": boy["mangal_dosh"],
            "girl_mangal_dosh": girl["mangal_dosh"],
            
            
        }

        return jsonify(result)


    except Exception as e:
        print("Ashtakoot Milan error:", e)
        return jsonify({"error": str(e)}), 500


@app.route("/api/gemstone", methods=["POST"])
def api_gemstone():
    """
    Returns gemstone recommendations based on user birth details.
    Expects JSON with 'date_input', 'time_input', 'location_input'.
    """
    try:
        data = request.get_json()
        if not data or not all(k in data for k in ("date_input", "time_input", "location_input")):
            return jsonify({"error": "Missing required input: 'date_input', 'time_input', or 'location_input'"}), 400

        date_input = data["date_input"]
        time_input = data["time_input"]
        location_input = data["location_input"]

        # Parse datetime
        try:
            birth_naive = datetime.strptime(f"{date_input} {time_input}", "%Y-%m-%d %I:%M %p")
        except ValueError as e:
            return jsonify({"error": f"Error parsing datetime: {e}"}), 400

        # Location + Timezone
        lat, lon, timezone_str = get_location_details(location_input)
        tz = pytz.timezone(timezone_str)
        birth_dt = tz.localize(birth_naive)
        birth_dt_utc = birth_dt.astimezone(pytz.utc)

        jd_ut = swe.julday(
            birth_dt_utc.year,
            birth_dt_utc.month,
            birth_dt_utc.day,
            birth_dt_utc.hour + birth_dt_utc.minute / 60.0 + birth_dt_utc.second / 3600.0,
        )

        # Get ascendant and astro data
        astro_data = get_planet_data(jd_ut, lat, lon)
        ascendant = get_ascendant(jd_ut, lat, lon)
        asc_sign = ascendant["ascendant_sign"]

        # Get gemstone recommendations
        gemstones = get_life_fortune_lucky_stones(asc_sign, astro_data)

        return jsonify({
            
            "gemstones": gemstones
        })

    except Exception as e:
        print("Gemstone API error:", e)
        return jsonify({"error": str(e)}), 500

@app.route("/api/numerology", methods=["POST"])
def api_numerology():
    """
    Numerology API: Returns Root, Life Path, Destiny, Personality, Expression, Soul Urge, Subconscious Self, and Challenge numbers.
    Expects JSON: { "full_name": "John Doe", "date_of_birth": "1990-01-31" }
    """
    try:
        data = request.get_json()
        if not data or not all(k in data for k in ("full_name", "date_of_birth")):
            return jsonify({"error": "Missing 'full_name' or 'date_of_birth'"}), 400

        full_name = data["full_name"]
        date_of_birth = data["date_of_birth"]

        root_number = calculate_root_number(date_of_birth)
        life_path_number = calculate_life_path_number(date_of_birth)
        destiny_number = calculate_destiny_number(full_name)
        personality_number = calculate_personality_number(full_name)
        expression_number = calculate_expression_number(full_name)
        soul_urge_number = calculate_soul_urge_number(full_name)
        subconscious_self_number = calculate_subconscious_self_number(full_name)
        challenge_numbers = calculate_challenge_numbers(date_of_birth)

        if life_path_number is None or root_number is None:
            return jsonify({"error": "Invalid date_of_birth format. Use YYYY-MM-DD."}), 400

        return jsonify({
            "full_name": full_name,
            "date_of_birth": date_of_birth,
            "root_number": root_number,
            "life_path_number": life_path_number,
            "destiny_number": destiny_number,
            "personality_number": personality_number,
            "expression_number": expression_number,
            "soul_urge_number": soul_urge_number,
            "subconscious_self_number": subconscious_self_number,
            "challenge_numbers": challenge_numbers,
            "root_number_meaning": VEDIC_NUMEROLOGY_MEANINGS.get(root_number, ""),
            "life_path_meaning": VEDIC_NUMEROLOGY_MEANINGS.get(life_path_number, ""),
            "destiny_meaning": VEDIC_NUMEROLOGY_MEANINGS.get(destiny_number, ""),
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# --- Numerology Helper Functions ---

def calculate_personality_number(full_name):
    """Sum of consonants in the full name (Pythagorean system)."""
    def letter_to_number(letter):
        letter = letter.upper()
        mapping = {
            1: "AJS", 2: "BKT", 3: "CLU", 4: "DMV", 5: "ENW",
            6: "FOX", 7: "GPY", 8: "HQZ", 9: "IR"
        }
        for num, letters in mapping.items():
            if letter in letters:
                return num
        return 0
    vowels = "AEIOU"
    total = sum(letter_to_number(c) for c in full_name if c.isalpha() and c.upper() not in vowels)
    return reduce_to_digit(total)

def calculate_expression_number(full_name):
    """Sum of all letters in the full name (Pythagorean system)."""
    def letter_to_number(letter):
        letter = letter.upper()
        mapping = {
            1: "AJS", 2: "BKT", 3: "CLU", 4: "DMV", 5: "ENW",
            6: "FOX", 7: "GPY", 8: "HQZ", 9: "IR"
        }
        for num, letters in mapping.items():
            if letter in letters:
                return num
        return 0
    total = sum(letter_to_number(c) for c in full_name if c.isalpha())
    return reduce_to_digit(total)

def calculate_soul_urge_number(full_name):
    """Sum of vowels in the full name (Pythagorean system)."""
    def letter_to_number(letter):
        letter = letter.upper()
        mapping = {
            1: "A", 5: "E", 9: "I", 6: "O", 3: "U", 7: "Y"
        }
        for num, letters in mapping.items():
            if letter in letters:
                return num
        return 0
    vowels = "AEIOUY"
    total = sum(letter_to_number(c) for c in full_name if c.upper() in vowels)
    return reduce_to_digit(total)

def calculate_subconscious_self_number(full_name):
    """Count of different letters used in the full name (Pythagorean system)."""
    letters = set(c.upper() for c in full_name if c.isalpha())
    return reduce_to_digit(len(letters))

def calculate_challenge_numbers(date_str):
    """Calculate the four Challenge Numbers from date of birth (YYYY-MM-DD)."""
    try:
        y, m, d = map(int, date_str.split('-'))
        d1 = reduce_to_digit(d)
        m1 = reduce_to_digit(m)
        y1 = reduce_to_digit(y)
        first = abs(d1 - m1)
        second = abs(d1 - y1)
        third = abs(m1 - y1)
        fourth = abs(first - third)
        return [reduce_to_digit(n) for n in [first, second, third, fourth]]
    except Exception:
        return []

if __name__ == "__main__":
    app.run(debug=True)

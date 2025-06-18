import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Kundali from "./pages/Kundali";
import "bootstrap-icons/font/bootstrap-icons.css";
import Navbar from "./components/Navbar";
import About from "./pages/About";
import Sun from "./pages/sun";
import Moon from "./pages/moon";
import Mars from "./pages/mars";
import Mercury from "./pages/mercury";
import Jupiter from "./pages/jupiter";
import Venus from "./pages/venus";
import Saturn from "./pages/saturn";
import Rahu from "./pages/rahu";
import Ketu from "./pages/ketu";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import AshtakavargaChart from "./components/AshtakavargaChart";
import ZodiacDetails from "./pages/ZodiacDetails";
import Footer from "./components/Footer";
import AshtakootMilan from "./pages/AshtakootMilan";
import Marriage from "./pages/Marriage";
import GrihaPraveshMahurat from "./pages/GrihaPravesh";
import NaamkaranMuhurat from "./pages/Naamkaran";
import GoldBuying from "./pages/GoldBuying";
import VehiclePurchase from "./pages/VehiclePurchase";
import MundanMahurat from "./pages/Mundan";
import GemstoneCalculator from "./pages/Gemstone";
import NumerologyCalculator from "./pages/Numerology"; 



function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/kundali/:birthId" element={<Kundali />} />
        <Route path="/about" element={<About />} />
        <Route path="/sun" element={<Sun />} />
        <Route path="/moon" element={<Moon />} />
        <Route path="/mars" element={<Mars />} />
        <Route path="/mercury" element={<Mercury />} />
        <Route path="/jupiter" element={<Jupiter />} />
        <Route path="/venus" element={<Venus />} />
        <Route path="/saturn" element={<Saturn />} />
        <Route path="/rahu" element={<Rahu />} />
        <Route path="/ketu" element={<Ketu />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/ashtakavarga" element={<AshtakavargaChart />} />
        <Route path="/zodiac/:rashiName" element={<ZodiacDetails />} />
        <Route path="/ashtakootmilan" element={<AshtakootMilan />} />
        <Route path="/muhurat-2025/marriage" element={<Marriage />} />
        <Route path="/muhurat-2025/griha-pravesh" element={<GrihaPraveshMahurat />} />
        <Route path="/muhurat-2025/naamkaran" element={<NaamkaranMuhurat />} />
        <Route path="/muhurat-2025/gold-buying" element={<GoldBuying />} />
        <Route path="/muhurat-2025/vehicle-purchase" element={<VehiclePurchase />} />
        <Route path="/muhurat-2025/mundan" element={<MundanMahurat />} />
        <Route path="/gemstone" element={<GemstoneCalculator />} />
        <Route path="/numerology" element={<NumerologyCalculator />} />
        
        







      </Routes>
      <Footer />
    </Router>
  );
}

export default App;

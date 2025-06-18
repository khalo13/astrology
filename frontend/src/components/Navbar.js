import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Navbar.css";
import logo from "../assets/LOGO.png";
import "bootstrap-icons/font/bootstrap-icons.css";
import { useAuth } from "../pages/AuthContext";

function Navbar() {
  const { isAuthenticated, logout } = useAuth(); // Use AuthContext for authentication state
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen((prev) => !prev);
  };

  const navigate = useNavigate();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleProfileClick = () => {
    if (!isAuthenticated) {
      navigate("/login");
    } else {
      setDropdownOpen((prev) => !prev);
    }
  };

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    navigate("/");
  };

  return (
    <nav className="navbar">
      {/*Logo*/}
      <div className="navbar-logo">
        <Link to="/" className="navbar-logo">
          <img src={logo} alt="logo" />
        </Link>
      </div>

      {/* ...existing code... */}
      <div className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
        <i className={menuOpen ? "bi bi-x-lg" : "bi bi-list"}></i>
      </div>

      <div className={`navbar-links${menuOpen ? " open" : ""}`}>
        <Link to="/about" className="navbar-link" onClick={() => setMenuOpen(false)}>
          About
        </Link>
        <span
          className="navbar-link"
          style={{ cursor: "pointer" }}
          onClick={() => {
            if (window.location.pathname !== "/") {
              navigate("/", { state: { scrollTo: "form-section" } });
              setTimeout(() => {
                const el = document.getElementById("form-section");
                if (el) el.scrollIntoView({ behavior: "smooth" });
              }, 300); // Adjust delay if needed
            } else {
              const el = document.getElementById("form-section");
              if (el) el.scrollIntoView({ behavior: "smooth" });
            }
            setMenuOpen(false)
          }}
          
        >
          Kundali Analysis
        </span>
        <span
          className="navbar-link"
          style={{ cursor: "pointer" }}
          onClick={() => {
            if (window.location.pathname !== "/") {
              navigate("/", { state: { scrollTo: "rashi-scroll-wrapper" } });
              setTimeout(() => {
                const el = document.getElementById("rashi-scroll-wrapper");
                if (el) el.scrollIntoView({ behavior: "smooth" });
              }, 300); // Adjust delay if needed
            } else {
              const el = document.getElementById("rashi-scroll-wrapper");
              if (el) el.scrollIntoView({ behavior: "smooth" });
            }
            setMenuOpen(false)
          }}
        >
          Rashifal
        </span>
        <Link to="/ashtakootmilan" className="navbar-link" onClick={() => setMenuOpen(false)}>
          Kundali Milan
        </Link>
        <button className="language-toggle" title="Toggle Language">
          अ / A
        </button>
      </div>
      <div className="navbar-auth" ref={dropdownRef}>
        <button
          className="profile-btn"
          title="Profile"
          onClick={handleProfileClick}
          style={{ background: "none", border: "none", cursor: "pointer" }}
        >
          <i className="bi bi-person-circle profile-icon"></i>
        </button>
        {isAuthenticated && dropdownOpen && (
          <div className="profile-dropdown">
            <Link to="/profile" onClick={() => setDropdownOpen(false)} >
              Profile
            </Link>
            <Link to="/support" onClick={() => setDropdownOpen(false)}>
              Customer Support
            </Link>
            <button onClick={handleLogout} className="logout-btn">
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;

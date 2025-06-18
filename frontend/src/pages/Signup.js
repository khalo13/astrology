import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../pages/AuthContext";

function Signup() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showWelcome, setShowWelcome] = useState(false); // NEW
  const { signup } = useAuth();
  const navigate = useNavigate();
  

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const success = await signup(email, password, name);
    console.log("Signup success value:", success);
    if (success) {
      setShowWelcome(true);
      setTimeout(() => {
        setShowWelcome(false);
        navigate("/");
      }, 2000);
    } else {
      setError("Signup failed. Try again.");
    }
  };

  return (
    <div
      style={{
        maxWidth: "400px",
        margin: "80px auto",
        padding: "24px",
        backgroundColor: "#fff",
        borderRadius: "12px",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
        fontFamily: "'Segoe UI', sans-serif",
      }}
    >
      <h2 style={{ textAlign: "center", marginBottom: "20px", color: "#333" }}>
        Sign Up
      </h2>

      {showWelcome && (
        <div
          style={{
            position: "fixed",
            top: "20%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            background: "#e6ffed",
            border: "2px solid #4caf50",
            borderRadius: "8px",
            padding: "24px 40px",
            zIndex: 1000,
            boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
            textAlign: "center",
          }}
        >
          <h3 style={{ marginBottom: "8px", color: "#2e7d32" }}>
            Welcome, {name}!
          </h3>
          <p style={{ color: "#333" }}>Your account has been created.</p>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column" }}
      >
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          style={{
            padding: "12px 14px",
            marginBottom: "16px",
            border: "1px solid #ccc",
            borderRadius: "8px",
            fontSize: "16px",
          }}
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{
            padding: "12px 14px",
            marginBottom: "16px",
            border: "1px solid #ccc",
            borderRadius: "8px",
            fontSize: "16px",
          }}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{
            padding: "12px 14px",
            marginBottom: "16px",
            border: "1px solid #ccc",
            borderRadius: "8px",
            fontSize: "16px",
          }}
        />
        <button
          type="submit"
          style={{
            padding: "12px",
            backgroundColor: "#7f56d9",
            color: "#fff",
            fontSize: "16px",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
          }}
        >
          Sign Up
        </button>
      </form>

      {error && (
        <p style={{ color: "red", marginTop: "10px", textAlign: "center" }}>
          {error}
        </p>
      )}

      <p style={{ textAlign: "center", marginTop: "16px" }}>
        Already have an account?{" "}
        <Link to="/login" style={{ color: "#7f56d9", textDecoration: "none" }}>
          Login
        </Link>
      </p>
    </div>
  );
}

export default Signup;

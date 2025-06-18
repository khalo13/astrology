import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../pages/AuthContext";

function Login() {
  const [useOtpLogin, setUseOtpLogin] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);

  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  // Email/Password Login
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!useOtpLogin) {
      const success = await login(email, password);
      if (success) {
        navigate("/");
      } else {
        setError("Login failed. Check credentials.");
      }
    } else {
      if (!otpSent) {
        // Send OTP
        const res = await fetch("http://localhost:4000/send-otp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone }),
        });
        const data = await res.json();
        if (data.success) {
          setOtpSent(true);
        } else {
          setError("Failed to send OTP");
        }
      } else {
        // Verify OTP
        const res = await fetch("http://localhost:4000/verify-otp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone, otp }),
        });
        const data = await res.json();
        if (data.success) {
          navigate("/");
        } else {
          setError("Invalid OTP");
        }
      }
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
        Login
      </h2>

      <button
        onClick={() => {
          setUseOtpLogin(!useOtpLogin);
          setError("");
        }}
        style={{
          marginBottom: "16px",
          backgroundColor: "#e0e0e0",
          border: "none",
          padding: "8px",
          borderRadius: "6px",
          cursor: "pointer",
        }}
      >
        Switch to {useOtpLogin ? "Email/Password" : "Mobile OTP"} Login
      </button>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column" }}>
        {!useOtpLogin ? (
          <>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={inputStyle}
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={inputStyle}
            />
          </>
        ) : (
          <>
            <input
              type="text"
              placeholder="Mobile Number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              style={inputStyle}
            />
            {otpSent && (
              <input
                type="text"
                placeholder="Enter OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
                style={inputStyle}
              />
            )}
          </>
        )}

        <button type="submit" style={buttonStyle}>
          {useOtpLogin ? (otpSent ? "Verify OTP" : "Send OTP") : "Login"}
        </button>
      </form>

      {error && (
        <p style={{ color: "red", marginTop: "10px", textAlign: "center" }}>{error}</p>
      )}

      <p style={{ textAlign: "center", marginTop: "16px" }}>
        Don't have an account?{" "}
        <Link to="/signup" style={{ color: "#7f56d9", textDecoration: "none" }}>
          Sign Up
        </Link>
      </p>
    </div>
  );
}

const inputStyle = {
  padding: "12px 14px",
  marginBottom: "16px",
  border: "1px solid #ccc",
  borderRadius: "8px",
  fontSize: "16px",
};

const buttonStyle = {
  padding: "12px",
  backgroundColor: "#7f56d9",
  color: "#fff",
  fontSize: "16px",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
};

export default Login;

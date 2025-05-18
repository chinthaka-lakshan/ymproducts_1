import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "./RepLogin.css";
import Replogo from "../../../assets/replogo.png"; // Adjust the path to your logo image

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await axios.post("http://localhost:8000/api/admin-login", { email, password });
      console.log("Response Data:", response.data);

      if (response.data.success) {
        localStorage.setItem("token", response.data.token);
        sessionStorage.setItem("user", JSON.stringify({ email, role: "admin" }));
        navigate("/admin-dashboard");
      } else {
        setError(response.data.message || "Invalid email or password");
      }
    } catch (error) {
      console.error("Error:", error);
      setError("Login failed. Please check the server or your network connection.");
    }

    setLoading(false);
  };

  return (
    <div className="container">
      <div className="full">
        <form onSubmit={handleSubmit}>
          <h1>Welcome Back, Admin!</h1>
          <h3>Enter your credentials to access your account</h3>

          {error && <p className="error-message">{error}</p>}

          <h2>Email Address</h2>
          <div className="input-box">
            <input
              type="email"
              required
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <h2>Password</h2>
          <div className="input-box">
            <input
              type="password"
              required
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <Link to={"/repdashboard"}>
            <button type="submit" className="btn" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </button>
          </Link>
        </form>

        <div className="logo-container">
          <img src={Replogo} alt="YM Products Logo" />
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;

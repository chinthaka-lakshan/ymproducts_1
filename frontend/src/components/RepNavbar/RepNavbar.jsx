import React, { useState, useRef, useEffect } from "react";
import "./RepNavbar.css";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import MenuIcon from '@mui/icons-material/Menu';
import { useNavigate } from "react-router-dom";
import api from "../../api/axios"; // Import your centralized axios instance

const RepNavbar = ({ onMenuClick }) => {
  const [showLogout, setShowLogout] = useState(false);
  const [repName, setRepName] = useState("Sales Rep");
  const popupRef = useRef(null);
  const navigate = useNavigate();

  // Load rep name from localStorage on component mount
  useEffect(() => {
    const storedRep = localStorage.getItem("admin_user");
    if (storedRep) {
      try {
        const repData = JSON.parse(storedRep);
        setRepName(repData.name || "Sales Rep");
      } catch (error) {
        console.error("Error parsing admin_user data:", error);
        setRepName("Sales Rep");
      }
    }
  }, []);

  const toggleLogoutPopup = (e) => {
    e.stopPropagation(); // Prevent event bubbling
    setShowLogout((prev) => !prev);
  };

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("admin_token");
      if (token) {
        await api.post("/logout"); // Using the centralized api instance
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Clear all admin-related data from localStorage
      localStorage.removeItem("admin_token");
      localStorage.removeItem("admin_user");
      localStorage.removeItem("username");
      
      // Redirect to login page
      navigate("/"); // Consider using a specific login route
      // Avoid using window.location.reload() as it's better to let React handle the navigation
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        setShowLogout(false);
      }
    };

    const handleEscapeKey = (event) => {
      if (event.key === "Escape") {
        setShowLogout(false);
      }
    };

    if (showLogout) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscapeKey);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, [showLogout]);

  return (
    <div className="RepNavbar">
      <div className="RepNavbarContainer">
        <div className="HamburgerIcon" onClick={onMenuClick} aria-label="Toggle menu">
          <MenuIcon />
        </div>
        <span className="RepNavbarTitle">SALES REP DASHBOARD</span>
        <div className="RepNavbarLog" onClick={toggleLogoutPopup} role="button" tabIndex={0}>
          <span>{repName}</span>
          <AccountCircleIcon className="RepProfileIcon" />
        </div>
      </div>

      {showLogout && (
        <div className="RepLogoutPopup">
          <div className="RepPopupContent" ref={popupRef}>
            <p>Are you sure you want to log out?</p>
            <div className="RepPopupButtons">
              <button 
                className="RepPopupLogoutButton" 
                onClick={handleLogout}
                autoFocus // Focus the logout button by default for better keyboard navigation
              >
                Logout
              </button>
              <button 
                className="RepPopupCancelButton" 
                onClick={toggleLogoutPopup}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RepNavbar;
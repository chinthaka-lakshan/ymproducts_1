import React, { useState, useRef, useEffect } from "react";
import "./RepNavbar.css";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import MenuIcon from '@mui/icons-material/Menu';
import { useNavigate } from "react-router-dom";
import axios from "axios";

const RepNavbar = ({ onMenuClick }) => {
  const [showLogout, setShowLogout] = useState(false);
  const [repName, setRepName] = useState("Sales Rep");
  const popupRef = useRef(null);
  const navigate = useNavigate();

  // Load rep name from localStorage on component mount
  useEffect(() => {
    const storedRep = localStorage.getItem("admin_user");
    if (storedRep) {
      const repData = JSON.parse(storedRep);
      setRepName(repData.name || "Sales Rep");
    }
  }, []);

  const toggleLogoutPopup = () => {
    setShowLogout((prev) => !prev);
  };

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("admin_token");
      if (token) {
        await axios.post("http://localhost:8000/api/rep/logout", {}, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        });
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Clear all admin-related data from localStorage
      localStorage.removeItem("admin_token");
      localStorage.removeItem("admin_user");
      localStorage.removeItem("username");
      
      // Redirect to login page and refresh
      navigate("/");
      window.location.reload();
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        setShowLogout(false);
      }
    };

    if (showLogout) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showLogout]);

  return (
    <div className="RepNavbar">
      <div className="RepNavbarContainer">
        <div className="HamburgerIcon" onClick={onMenuClick}>
          <MenuIcon />
        </div>
        <span className="RepNavbarTitle">SALES REP DASHBOARD</span>
        <div className="RepNavbarLog" onClick={toggleLogoutPopup}>
          <span>{repName}</span>
          <AccountCircleIcon className="RepProfileIcon" />
        </div>
      </div>

      {showLogout && (
        <div className="RepLogoutPopup">
          <div className="RepPopupContent" ref={popupRef}>
            <p>Are you sure you want to log out?</p>
            <button className="RepPopupLogoutButton" onClick={handleLogout}>
              Logout
            </button>
            <button className="RepPopupCancelButton" onClick={toggleLogoutPopup}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RepNavbar;
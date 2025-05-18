import React, { useState, useRef, useEffect } from "react";
import "./AdminNavbar.css";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import useAuth from "../../hooks/useAuth";

const AdminNavbar = () => {
  const [showLogout, setShowLogout] = useState(false);
  const popupRef = useRef(null);
  const { auth, logout } = useAuth();

  const toggleLogoutPopup = () => {
    setShowLogout((prev) => !prev);
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // Handle click outside the popup
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        setShowLogout(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="AdminNavbar">
      <div className="AdminNavbarContainer">
        <span className="NavbarTitle">
          {auth?.role === 'admin' ? 'ADMIN DASHBOARD' : 'SALES REP DASHBOARD'}
        </span>
        <div className="NavbarLog" onClick={toggleLogoutPopup}>
          <span>{auth?.name || 'User'}</span>
          <AccountCircleIcon className="ProfileIcon" />
        </div>
      </div>

      {showLogout && (
        <div className="LogoutPopup">
          <div className="PopupContent" ref={popupRef}>
            <p>Are you sure you want to log out?</p>
            <button className="PopupLogoutButton" onClick={handleLogout}>
              Logout
            </button>
            <button className="PopupCancelButton" onClick={toggleLogoutPopup}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminNavbar;
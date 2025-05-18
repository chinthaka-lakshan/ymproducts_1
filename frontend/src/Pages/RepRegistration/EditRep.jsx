import React, { useEffect, useState } from "react";
import Sidebar from "../../components/Sidebar/AdminSidebar/AdminSidebar";
import Navbar from "../../components/AdminNavbar/AdminNavbar";
import "./EditRep.css";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

const EditRep = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [repData, setRepData] = useState({
    name: "",
    email: "",
    nic: "",
    contact_number: "",
  });

  useEffect(() => {
    const fetchRepData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `http://localhost:8000/api/sales-reps/${id}`,
          {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
            }
          }
        );
        
        setRepData({
          name: response.data.data.name,
          email: response.data.data.email,
          nic: response.data.data.nic,
          contact_number: response.data.data.contact_number
        });
        
      } catch (error) {
        console.error("Error fetching rep:", error);
        alert("Failed to load representative data");
        navigate("/salesreps");
      } finally {
        setLoading(false);
      }
    };
  
    fetchRepData();
  }, [id, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setRepData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      await axios.put(
        `http://localhost:8000/api/sales-reps/${id}`,
        repData,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
          }
        }
      );
      
      alert("Representative updated successfully!");
      navigate("/salesreps");
    } catch (error) {
      console.error("Error updating representative:", error);
      alert("Failed to update representative");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="editrep-container">
        <Sidebar />
        <div className="main-content">
          <Navbar />
          <div className="loading-spinner">Loading representative data...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="editrep-container">
      <Sidebar />
      <div>
        <Navbar />
      </div>
      <div className="editregistration-form">
        <h2>Edit Representative</h2>
        <form onSubmit={handleSubmit}>
          <div className="editform-group">
            <div>
              <label>Name</label>
              <input
                type="text"
                name="name"
                value={repData.name}
                onChange={handleChange}
                placeholder="Enter name"
                required
                disabled={loading}
              />
            </div>

            <div>
              <label>Email Address</label>
              <input
                type="email"
                name="email"
                value={repData.email}
                onChange={handleChange}
                placeholder="Enter email"
                required
                disabled={loading}
              />
            </div>

            <div>
              <label>NIC</label>
              <input
                type="text"
                name="nic"
                value={repData.nic}
                onChange={handleChange}
                placeholder="Enter NIC"
                required
                disabled={loading}
              />
            </div>

            <div>
              <label>Contact Number</label>
              <input
                type="text"
                name="contact_number"
                value={repData.contact_number}
                onChange={handleChange}
                placeholder="Enter contact number"
                required
                disabled={loading}
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="editregister-btn"
            disabled={loading}
          >
            {loading ? "Saving..." : "Save Edit"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditRep;
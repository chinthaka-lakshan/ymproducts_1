import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Sidebar from "../../components/Sidebar/AdminSidebar/AdminSidebar";
import Navbar from "../../components/AdminNavbar/AdminNavbar";
import api from "../../api/axios";
import "./RepRegistration.css";

const SalesReps = () => {
  const [reps, setReps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  // SalesReps.jsx
useEffect(() => {
  const fetchSalesReps = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // 1. First ensure we have a token
      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      // 2. Verify token is still valid
      try {
        await api.get('/verify-token'); // Add this endpoint in your backend
      } catch (verifyError) {
        localStorage.removeItem('auth_token');
        throw new Error('Session expired');
      }

      // 3. Make the actual request
      const response = await api.get("/sales-reps", {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      setReps(response.data.data || response.data);
      
    } catch (err) {
      if (err.response?.status === 401 || err.message.includes('token')) {
        localStorage.removeItem('auth_token');
        navigate('/login', { 
          state: { from: location.pathname },
          replace: true 
        });
      }
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  fetchSalesReps();
}, [navigate, location]);

  const handleEdit = (id) => {
    navigate(`/edit-rep/${id}`);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this representative?")) {
      try {
        await api.delete(`/sales-reps/${id}`);
        setReps(reps.filter(rep => rep.id !== id));
      } catch (err) {
        alert(err.response?.data?.message || "Failed to delete representative");
      }
    }
  };

  if (loading) return (
    <div className="sales-reps-container">
      <Sidebar />
      <Navbar />
      <div className="sales-reps-content">
        <div className="loading-spinner">Loading...</div>
      </div>
    </div>
  );

  if (error) return (
    <div className="sales-reps-container">
      <Sidebar />
      <Navbar />
      <div className="sales-reps-content">
        <div className="error-message">Error: {error}</div>
      </div>
    </div>
  );

  return (
    <div className="sales-reps-container">
      <Sidebar />
      <Navbar />
      
      <div className="sales-reps-content">
        <div className="header">
          <h2>Sales Representatives</h2>
          <button 
            className="add-rep-btn"
            onClick={() => navigate("/register-rep")}
          >
            Add New Representative
          </button>
        </div>

        {reps.length === 0 ? (
          <div className="no-reps-message">No sales representatives found</div>
        ) : (
          <div className="reps-table">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>NIC</th>
                  <th>Contact</th>
                  <th>Registered On</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {reps.map((rep) => (
                  <tr key={rep.id}>
                    <td>{rep.id}</td>
                    <td>{rep.name}</td>
                    <td>{rep.email}</td>
                    <td>{rep.nic}</td>
                    <td>{rep.contact_number}</td>
                    <td>{new Date(rep.created_at).toLocaleDateString()}</td>
                    <td className="actions">
                      <button 
                        className="edit-btn"
                        onClick={() => handleEdit(rep.id)}
                      >
                        Edit
                      </button>
                      <button
                        className="delete-btn"
                        onClick={() => handleDelete(rep.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default SalesReps;
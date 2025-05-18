import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../api/axios';
import Sidebar from "../../components/Sidebar/AdminSidebar/AdminSidebar";
import AdminNavbar from "../../components/AdminNavbar/AdminNavbar";
import { toast } from 'react-toastify';
import './RegisterRep.css';

const RegisterRep = ({ isEdit = false }) => {
  const { id } = useParams(); // Get ID from URL for edit mode
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    nic: '',
    contact_number: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch existing data when in edit mode
  useEffect(() => {
    if (isEdit && id) {
      const fetchRepData = async () => {
        try {
          const response = await api.get(`/sales-reps/${id}`);
          setFormData(response.data.data || response.data);
        } catch (error) {
          toast.error('Failed to load representative data');
          navigate('/salesreps');
        }
      };
      fetchRepData();
    }
  }, [id, isEdit, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      if (isEdit) {
        // Edit existing rep
        await api.put(`/sales-reps/${id}`, formData);
        toast.success('Representative updated successfully!');
      } else {
        // Create new rep
        await api.post('/register-rep', formData);
        toast.success('Representative registered successfully!');
      }
      navigate('/salesreps');
    } catch (err) {
      if (err.response?.status === 422) {
        setErrors(err.response.data.errors || {});
      } else {
        toast.error(err.response?.data?.message || 
          (isEdit ? 'Update failed' : 'Registration failed'));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="SalesReps">
      <Sidebar/>
      <div className='SalesRepsContainer'>
        <AdminNavbar/>
        <div className="SalesRepsTableContainer">
          <div className="SalesRepsTableTop">
            <h1>{isEdit ? 'Edit' : 'Register New'} Sales Representative</h1>

            <form onSubmit={handleSubmit}>
              {/* Name Field */}
              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  disabled={isSubmitting}
                />
                {errors.name && <span className="error">{errors.name[0]}</span>}
              </div>

              {/* Email Field */}
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  disabled={isEdit || isSubmitting} // Disable email in edit mode
                />
                {errors.email && <span className="error">{errors.email[0]}</span>}
              </div>

              {/* Only show password field for new registration */}
              {!isEdit && (
                <div className="form-group">
                  <label>Password</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    disabled={isSubmitting}
                  />
                  {errors.password && (
                    <span className="error">
                      {errors.password[0]}
                      <br />
                      Password must contain at least 8 characters, including uppercase, lowercase, number, and special character.
                    </span>
                  )}
                </div>
              )}

              {/* NIC Field */}
              <div className="form-group">
                <label>NIC</label>
                <input
                  type="text"
                  name="nic"
                  value={formData.nic}
                  onChange={handleChange}
                  required
                  disabled={isSubmitting}
                />
                {errors.nic && <span className="error">{errors.nic[0]}</span>}
              </div>

              {/* Contact Number Field */}
              <div className="form-group">
                <label>Contact Number</label>
                <input
                  type="tel"
                  name="contact_number"
                  value={formData.contact_number}
                  onChange={handleChange}
                  required
                  disabled={isSubmitting}
                />
                {errors.contact_number && (
                  <span className="error">{errors.contact_number[0]}</span>
                )}
              </div>

              <button 
                type="submit" 
                className="submit-btn"
                disabled={isSubmitting}
              >
                {isSubmitting 
                  ? (isEdit ? 'Updating...' : 'Registering...')
                  : (isEdit ? 'Update' : 'Register')}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterRep;
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from "../../components/Sidebar/AdminSidebar/AdminSidebar";
import AdminNavbar from "../../components/AdminNavbar/AdminNavbar";
import api from '../../api/axios';
import { toast } from 'react-toastify';
import './RegisterRep.css';

const RegisterRep = () => {
  const { id } = useParams(); // Get the rep ID if editing
  const navigate = useNavigate();

  const isEdit = !!id;

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    nic: '',
    contact_number: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load rep data if editing
  useEffect(() => {
    if (isEdit) {
      const fetchData = async () => {
        try {
          const res = await api.get(`/sales-reps/${id}`);
          setFormData(res.data.data || res.data); // Load data into form
        } catch (error) {
          toast.error("Failed to load sales rep data");
          navigate('/salesreps');
        }
      };
      fetchData();
    }
  }, [id, isEdit, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (isEdit) {
        await api.put(`/sales-reps/${id}`, formData);
        toast.success("Representative updated successfully!");
      } else {
        await api.post('/register-rep', formData);
        toast.success("Representative registered successfully!");
      }
      navigate('/salesreps');
    } catch (err) {
      if (err.response?.status === 422) {
        setErrors(err.response.data.errors || {});
      } else {
        toast.error("Submission failed");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="SalesReps">
      <Sidebar />
      <div className="SalesRepsContainer">
        <AdminNavbar />
        <div className="SalesRepsTableContainer">
          <div className="SalesRepsFormWrapper">
            <div className='rep-title'>{isEdit ? 'Edit' : 'Register New'} Sales Representative</div>
            <form className='RepRegForm' onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Name</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} required />
                {errors.name && <span className="error">{errors.name[0]}</span>}
              </div>

              <div className="form-group">
                <label>Email</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} required disabled={isEdit} />
                {errors.email && <span className="error">{errors.email[0]}</span>}
              </div>

              {!isEdit && (
                <div className="form-group">
                  <label>Password</label>
                  <input type="password" name="password" value={formData.password} onChange={handleChange} required />
                  {errors.password && <span className="error">{errors.password[0]}</span>}
                </div>
              )}

              <div className="form-group">
                <label>NIC</label>
                <input type="text" name="nic" value={formData.nic} onChange={handleChange} required />
                {errors.nic && <span className="error">{errors.nic[0]}</span>}
              </div>

              <div className="form-group">
                <div className='A1'>
                   <label>Contact Number</label>
                </div>
               
                <input type="tel" name="contact_number" value={formData.contact_number} onChange={handleChange} required />
                {errors.contact_number && <span className="error">{errors.contact_number[0]}</span>}
              </div>

              <button type="submit" className="submit-btn" disabled={isSubmitting}>
                {isSubmitting ? (isEdit ? 'Updating...' : 'Registering...') : (isEdit ? 'Update' : 'Register')}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterRep;

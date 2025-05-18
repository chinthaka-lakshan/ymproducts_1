import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../api/axios"; // Using your configured axios instance
import "./SalesReps.css";
import Sidebar from "../../components/Sidebar/AdminSidebar/AdminSidebar";
import AdminNavbar from "../../components/AdminNavbar/AdminNavbar";
import { toast } from "react-toastify"; // For better error/success messages

const SalesReps = () => {
  const [representatives, setRepresentatives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const repsPerPage = 5;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRepresentatives = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Using your API instance which already has auth headers
        const response = await api.get("/sales-reps");
        
        // Ensure response data is in the expected format
        const repsData = response.data.data || response.data;
        setRepresentatives(repsData);
      } catch (error) {
        console.error("Error fetching sales representatives:", error);
        setError(error.response?.data?.message || "Failed to fetch representatives");
        
        // Handle unauthorized access
        if (error.response?.status === 401) {
          navigate("/login");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchRepresentatives();
  }, [navigate]);

  const deleteRepresentative = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this representative?");
    if (!confirmDelete) return;

    try {
      await api.delete(`/sales-reps/${id}`);
      
      // Update state without the deleted rep
      setRepresentatives(prev => prev.filter(rep => rep.id !== id));
      
      toast.success("Representative deleted successfully");
    } catch (error) {
      console.error("Error deleting representative:", error);
      toast.error(error.response?.data?.message || "Failed to delete representative");
    }
  };

  // Pagination calculations
  const indexOfLastRep = currentPage * repsPerPage;
  const indexOfFirstRep = indexOfLastRep - repsPerPage;
  const currentReps = representatives.slice(indexOfFirstRep, indexOfLastRep);
  const totalPages = Math.ceil(representatives.length / repsPerPage);

  // Format date for better readability
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="SalesReps">
      <Sidebar />
      <div className="SalesRepsContainer">
        <AdminNavbar />
        <div className="SalesRepsTableContainer">
          <div className="SalesRepsTableTop">
            <h1>Sales Representatives</h1>
            <Link to="/register-rep">
              <button className="AddButton">Register New</button>
            </Link>
          </div>
          <div className="RepsTable">
            <div className="RepsTableScroll">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Contact</th>
                    <th>NIC</th>
                    <th>Registered On</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentReps.map((rep) => (
                    <tr key={rep.id}>
                      <td>{rep.name}</td>
                      <td>{rep.email}</td>
                      <td>{rep.contact_number}</td>
                      <td>{rep.nic}</td>
                      <td>{formatDate(rep.created_at)}</td>
                      <td>
                        <div className="actions">
                          <Link
                            to={`/edit-rep/${rep.id}`}
                            className="EditButton"
                            state={{ representative: rep }}
                          >
                            Edit
                          </Link>
                          <button
                            onClick={() => deleteRepresentative(rep.id)}
                            className="DeleteButton"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="pagination-container-rep">
              <button 
                className="pagination-arrow-rep" 
                onClick={() => paginate(currentPage > 1 ? currentPage - 1 : 1)}
                disabled={currentPage === 1}
              >
                &lt;
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => (
                <button
                  key={i + 1}
                  onClick={() => paginate(i + 1)}
                  className={`pagination-number-rep ${currentPage === i + 1 ? 'active' : ''}`}
                >
                  {i + 1}
                </button>
              ))}
              {totalPages > 5 && (
                <>
                  <button className="pagination-ellipsis-rep">...</button>
                  <button 
                    className="pagination-number-rep"
                    onClick={() => paginate(totalPages)}
                  >
                    {totalPages}
                  </button>
                </>
              )}
              <button 
                className="pagination-arrow-rep" 
                onClick={() => paginate(currentPage < totalPages ? currentPage + 1 : totalPages)}
                disabled={currentPage === totalPages}
              >
                &gt;
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesReps;
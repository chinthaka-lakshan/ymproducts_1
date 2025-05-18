import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "./SalesReps.css"; // <-- Make sure the path is correct
import Sidebar from "../../components/Sidebar/AdminSidebar/AdminSidebar";
import AdminNavbar from "../../components/AdminNavbar/AdminNavbar";

const SalesReps = () => {
  const [representatives, setRepresentatives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const repsPerPage = 5;

  useEffect(() => {
    const fetchRepresentatives = async () => {
      try {
        const response = await axios.get("http://localhost:8000/api/sales-reps");
        setRepresentatives(response.data);
      } catch (error) {
        console.error("Error fetching sales representatives:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRepresentatives();
  }, []);

  const deleteRepresentative = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this representative?");
    if (!confirmDelete) return;

    try {
      await axios.delete(`http://localhost:8000/api/sales-reps/${id}`);
      setRepresentatives(prev => prev.filter(rep => rep.id !== id));
    } catch (error) {
      console.error("Error deleting representative:", error);
    }
  };

  const indexOfLastRep = currentPage * repsPerPage;
  const indexOfFirstRep = indexOfLastRep - repsPerPage;
  const currentReps = representatives.slice(indexOfFirstRep, indexOfLastRep);
  const totalPages = Math.ceil(representatives.length / repsPerPage);

  return (
    <div className="sales-reps">
      <Sidebar/>
      <div className="header-section">
        <AdminNavbar/>
        <h2>Sales Representatives</h2>
        <Link to="/repRegistration" className="add-new">
          Add-New
        </Link>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Contact Number</th>
                <th>NIC</th>
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
                  <td>
                    <div className="actions">
                      <Link to ={`/editrep/${rep.id}`}  className="edit">
                        Edit
                      </Link>
                      <button onClick={() => deleteRepresentative(rep.id)} className="delete">
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="pagination">
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i + 1}
                onClick={() => setCurrentPage(i + 1)}
                className={currentPage === i + 1 ? "active" : ""}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesReps;

import React, { useState, useRef, useEffect } from 'react';
import './RepOrders.css';
import RepSideBar from '../../components/Sidebar/RepSidebar/RepSidebar';
import RepNavbar from '../../components/RepNavbar/RepNavbar';
import SearchIcon from '@mui/icons-material/Search';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { Snackbar, Alert } from '@mui/material';

const RepOrders = () => {
  const [orders, setOrders] = useState([]);
  const [shops, setShops] = useState([]); // State for shops data
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 5;
  const userToken = localStorage.getItem("admin_token");
  const loggedUser = localStorage.getItem("username");
  const navigate = useNavigate();

  // Sidebar state
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const sidebarRef = useRef();

  // Alert state
  const [alert, setAlert] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Fetch shops data
  const fetchShops = async () => {
    try {
      const response = await api.get("/shops");
      setShops(response.data);
    } catch (error) {
      console.error("Error fetching shops:", error);
      showAlert("Failed to load shops data", "error");
    }
  };

  // Fetch orders and shops when component mounts
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        await fetchShops();
        
        const ordersResponse = await api.get("/orders");
        const filteredOrders = ordersResponse.data.filter(
          order => order.status === "Pending" || order.status === "PENDING"
        );
        
        setOrders(filteredOrders);
        setError(null);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Failed to load data");
        showAlert("Failed to load data", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Get shop name by ID
  const getShopName = (shopId) => {
    const shop = shops.find(shop => shop.id === shopId);
    return shop ? shop.shop_name : 'Unknown Shop';
  };

  // Alert helpers
  const showAlert = (message, severity = 'success') => {
    setAlert({
      open: true,
      message,
      severity
    });
  };

  const handleCloseAlert = () => {
    setAlert(prev => ({ ...prev, open: false }));
  };

  // Status change handler
  const handleStatusChange = async (id, newStatus) => {
    try {
      if (newStatus === "Accepted") {
        await api.put(`/orders/${id}/status`, { status: newStatus });
        setOrders(prevOrders => 
          prevOrders.map(order =>
            order.id === id ? { ...order, status: newStatus } : order
          )
        );
        showAlert("Order accepted successfully");
      } else if (newStatus === "Cancelled") {
        await api.delete(`/orders/${id}`);
        setOrders(prevOrders => 
          prevOrders.filter(order => order.id !== id)
        );
        showAlert("Order cancelled successfully");
      }
    } catch (error) {
      console.error("Error updating order status:", error);
      showAlert("Failed to update order status", "error");
    }
  };

  // Search filtering
  const filteredOrders = orders.filter(order => {
    const searchTerm = searchQuery.toLowerCase();
    const shopName = getShopName(order.shop_id).toLowerCase();
    return (
      shopName.includes(searchTerm) ||
      order.user_name?.toLowerCase().includes(searchTerm) ||
      order.total_price?.toString().includes(searchTerm)
    );
  });

  // Pagination logic
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Sidebar toggle
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (window.innerWidth <= 768 && sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setSidebarOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Reset to first page when search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  return (
    <div className="RepOrders">
      <RepSideBar isOpen={sidebarOpen} ref={sidebarRef} />
      <div className="RepOrdersContainer">
        <RepNavbar onMenuClick={toggleSidebar} />
        <div className="RepOrdersTableContainer">
          <div className="RepOrdersTableTop">
            <h1>Orders</h1>
          </div>

          <div className="RepOrdersTable">
            <div className='RepOrdersSearchContainer'>
              <input
                type="text"
                placeholder="Search Orders..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="RepOrdersSearchInput"
              />
              <SearchIcon className='RepOrdersSearchIcon' />
            </div>

            <div className="RepOrdersTableScroll">
              {loading ? (
                <div className="RepOrdersLoading">
                  <p>Loading orders...</p>
                </div>
              ) : error ? (
                <div className="RepOrdersError">
                  <p>{error}</p>
                  <button onClick={() => window.location.reload()}>Retry</button>
                </div>
              ) : currentOrders.length === 0 ? (
                <div className="RepOrdersEmpty">
                  <p>No orders found</p>
                </div>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Shop</th>
                      <th className="HideMobile">Rep Name</th>
                      <th className="HideTab">Total (LKR)</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentOrders.map(order => (
                      <tr key={order.id}>
                        <td>{new Date(order.created_at).toLocaleDateString()}</td>
                        <td>{getShopName(order.shop_id)}</td>
                        <td className="HideMobile">{order.user_name || 'N/A'}</td>
                        <td className="HideTab">
                          {typeof order.total_price === 'number' 
                            ? order.total_price.toFixed(2)
                            : (parseFloat(order.total_price) || 0).toFixed(2)}
                        </td>
                        <td>
                          <select 
                            value={order.status}
                            onChange={(e) => handleStatusChange(order.id, e.target.value)}
                            className={`status-select ${order.status.toLowerCase()}`}
                          >
                            <option value="Pending">Pending</option>
                            <option value="Accepted">Accept</option>
                            <option value="Cancelled">Cancel</option>
                          </select>
                        </td>
                        <td>
                          <button 
                            className="OrderTableViewButton"
                            onClick={() => navigate(`/orders/${order.id}`)}
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {!loading && !error && filteredOrders.length > 0 && (
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
            )}
          </div>
        </div>
      </div>

      <Snackbar
        open={alert.open}
        autoHideDuration={6000}
        onClose={handleCloseAlert}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseAlert} 
          severity={alert.severity}
          sx={{ width: '100%' }}
        >
          {alert.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default RepOrders;
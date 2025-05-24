import React, { useState, useRef, useEffect } from 'react';
import './RepOrders.css';
import RepSideBar from '../../components/Sidebar/RepSidebar/RepSidebar';
import RepNavbar from '../../components/RepNavbar/RepNavbar';
import SearchIcon from '@mui/icons-material/Search';
import api from '../../api/axios';
import { Snackbar, Alert } from '@mui/material';

const RepOrders = () => {
  const [orders, setOrders] = useState([]);
  const [shops, setShops] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchQuery, setSearchQuery] = useState('');

  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 5;

  const [viewingOrder, setViewingOrder] = useState(null);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const sidebarRef = useRef();

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

  // Fetch all orders
  const fetchOrders = async () => {
    try {
      const response = await api.get("/orders");
      setOrders(response.data); // Now includes all statuses
      setError(null);
    } catch (error) {
      console.error("Error fetching orders:", error);
      setError("Failed to load orders");
      showAlert("Failed to load orders", "error");
    }
  };

  // Fetch data when component mounts
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        await fetchShops();
        await fetchOrders();
      } catch (error) {
        console.error("Error fetching data:", error);
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

  const handleViewOrder = async (order) => {
    try {
      const response = await api.get(`/orders/${order.id}/items`);
      if (response.data.items?.length > 0) {
        setViewingOrder(response.data);
      }
    } catch (error) {
      console.error("Error fetching order items:", error);
    }
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
      order.total_price?.toString().includes(searchTerm) ||
      order.status?.toLowerCase().includes(searchTerm)
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
                      <th className="HideTab">Status</th>
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
                        <td className="HideTab">{order.status}</td>
                        <td>
                          <button 
                            className="OrderTableViewButton"
                            onClick={() => handleViewOrder(order)}
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

      {viewingOrder && (
        <div className="ModalBackdrop">
          <div className="Modal">
            <h2>Order Details</h2>
            <div className="ScrollableContent">
              <div className="orderdetails">
                <div className="orderdetails1">
                  <p>
                    <strong>Date:</strong> {viewingOrder.created_at}
                  </p>
                  <div className="repname">
                    <p>
                      <strong>Rep Name:</strong> {viewingOrder.user_name}
                    </p>
                  </div>
                </div>
                <div className="orderdetails2">
                  <p>
                    <strong>Shop Name:</strong> {viewingOrder.shop_id}
                  </p>
                  <p>
                    <strong>Total Amount:</strong> Rs.{viewingOrder.total_price}
                  </p>
                </div>
              </div>
              <table className="customtable">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Qty</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {viewingOrder.items.map((item, index) => (
                    <tr key={index}>
                      <td>{item.item}</td>
                      <td>{item.quantity}</td>
                      <td>
                        {(item.quantity * parseFloat(item.unitPrice)).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="Action">
              <button onClick={() => setViewingOrder(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

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
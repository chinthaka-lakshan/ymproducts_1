import React, { useState, useRef, useEffect } from 'react';
import '../RepReturns/RepReturns.css';
import SideBar from '../../components/Sidebar/AdminSidebar/AdminSidebar';
import Navbar from '../../components/AdminNavbar/AdminNavbar';
import SearchIcon from '@mui/icons-material/Search';
import { Switch, FormControlLabel } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

const API_BASE_URL = 'http://127.0.0.1:8000/api';

const Returns = () => {
  const [goodReturns, setGoodReturns] = useState([]);
  const [badReturns, setBadReturns] = useState([]);
  const [shops, setShops] = useState([]);
  const [showGoodReturns, setShowGoodReturns] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [alert, setAlert] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const navigate = useNavigate();

  // Get shop name by ID
  const getShopName = (shopId) => {
    const shop = shops.find(shop => shop.id === shopId);
    return shop ? shop.shop_name : 'Unknown Shop';
  };

  // Fetch data from API
  const fetchData = async (url) => {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data.success ? data.data : [];
    } catch (error) {
      console.error('Fetch error:', error);
      throw error;
    }
  };

  // Fetch all required data
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Fetch all data in parallel
        const [shopsData, goodReturnsData, badReturnsData] = await Promise.all([
          fetchData(`${API_BASE_URL}/shops`),
          fetchData(`${API_BASE_URL}/returns/good`),
          fetchData(`${API_BASE_URL}/returns/bad`)
        ]);

        setShops(Array.isArray(shopsData) ? shopsData : []);

        const processReturns = (returns) => {
          return (Array.isArray(returns) ? returns : []).map(rtn => ({
            ...rtn,
            return_cost: Number(rtn.return_cost) || 0,
            shop_name: rtn.shop?.shop_name || rtn.shop_name || 'Shop',
            shop_id: rtn.shop_id || (rtn.shop && rtn.shop.id) || null,
            created_at: rtn.created_at || new Date().toISOString()
          }));
        };

        setGoodReturns(processReturns(goodReturnsData));
        setBadReturns(processReturns(badReturnsData));
        setError(null);
      } catch (err) {
        console.error('Data loading error:', err);
        setError(err.message || 'Failed to load data');
        showAlert(err.message || 'Failed to load data', 'error');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

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

  // Handle view return details
  const handleViewReturn = (returnId) => {
    navigate(`/returns/${returnId}`);
  };

  // Filter and sort returns
  const returnsToFilter = showGoodReturns ? goodReturns : badReturns;

  // Search filtering for returns
  const filteredReturns = returnsToFilter.filter(rtn => {
    const searchTerm = searchQuery.toLowerCase();
    const shopName = (rtn.shop_name || '').toLowerCase();
    const createdAt = (rtn.created_at || '').toLowerCase();
    return (
      shopName.includes(searchTerm) ||
      createdAt.includes(searchTerm) ||
      (rtn.return_cost.toString() || '').includes(searchTerm)
    );
  });

  // Sidebar logic
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const sidebarRef = useRef();

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        window.innerWidth <= 768 &&
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target)
      ) {
        setSidebarOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Pagination logic
  const [currentPage, setCurrentPage] = useState(1);
  const [returnsPerPage, setReturnsPerPage] = useState(window.innerWidth <= 768 ? 10 : 6);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;

      if (width <= 480) {
        setReturnsPerPage(8);
      } else if (width > 480 && width <= 768) {
        setReturnsPerPage(10);
      } else {
        setReturnsPerPage(6);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const indexOfLastReturn = currentPage * returnsPerPage;
  const indexOfFirstReturn = indexOfLastReturn - returnsPerPage;
  const currentReturns = filteredReturns.slice(indexOfFirstReturn, indexOfLastReturn);
  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const totalPages = Math.ceil(filteredReturns.length / returnsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, showGoodReturns]);

  return (
    <div className="RepReturns">
      <SideBar isOpen={sidebarOpen} ref={sidebarRef} />
      <div className="RepReturnsContainer">
        <Navbar onMenuClick={toggleSidebar}/>
        <div className="RepReturnsTableContainer">
          <div className="RepReturnsTableTop">
            <h1>{showGoodReturns ? 'Good Returns' : 'Bad Returns'}</h1>
            <FormControlLabel className="ReturnToggleSwitch"
              control={
                <Switch
                  checked={showGoodReturns}
                  onChange={() => setShowGoodReturns(!showGoodReturns)}
                />
              }
            />
            <button className="add-new-btn" onClick={() => navigate('/addReturn')}>
              Add Return
            </button>
          </div>

          <div className="RepReturnsTable">
            <div className='RepReturnsSearchContainer'>
              <input
                type="text"
                placeholder="Search Returns..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="RepReturnsSearchInput"
              />
              <SearchIcon className='RepReturnsSearchIcon' />
            </div>

            <div className="RepReturnsTableScroll">
              {loading ? (
                <div className="RepReturnsLoading">
                  <p>Loading returns...</p>
                </div>
              ) : error ? (
                <div className="RepReturnsError">
                  <p>{error}</p>
                </div>
              ) : currentReturns.length === 0 ? (
                <div className="RepReturnsEmpty">
                  <p>No returns found</p>
                </div>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Shop</th>
                      <th className="HideTab">Total (LKR)</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentReturns.map(rtn => (
                      <tr key={rtn.id}>
                        <td>{rtn.created_at ? new Date(rtn.created_at).toLocaleDateString() : 'N/A'}</td>
                        <td>{rtn.shop_name}</td>
                        <td className="HideTab">
                          {typeof rtn.return_cost === 'number' 
                            ? rtn.return_cost.toFixed(2)
                            : (parseFloat(rtn.return_cost) || 0).toFixed(2)}
                        </td>
                        <td>
                          <button 
                            className="ReturnTableViewButton"
                            onClick={() => handleViewReturn(rtn.id)}
                            disabled={!rtn.id}
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
            
            {!loading && !error && filteredReturns.length > 0 && (
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

export default Returns;
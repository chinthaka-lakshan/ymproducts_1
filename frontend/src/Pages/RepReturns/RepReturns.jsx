import React, { useState, useRef, useEffect } from 'react';
import './RepReturns.css';
import RepSideBar from '../../components/Sidebar/RepSidebar/RepSidebar';
import RepNavbar from '../../components/RepNavbar/RepNavbar';
import SearchIcon from '@mui/icons-material/Search';
import { Switch, FormControlLabel } from '@mui/material';
import api from '../../api/axios';
import { useNavigate } from 'react-router-dom';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

const RepReturns = () => {
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

  // Fetch returns and shops from backend
  // Fetch returns and shops from backend
useEffect(() => {
  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch shops and returns in parallel
      const [shopsResponse, goodRes, badRes] = await Promise.all([
        api.get('/shops'),
        api.get('/returns/good'),
        api.get('/returns/bad')
      ]);

      // Create a shop map for quick lookup
      const shopMap = {};
      shopsResponse.data.forEach(shop => {
        shopMap[shop.id] = shop.shop_name;
      });

      const processReturns = (returns) => {
        return returns.data.data.map(rtn => {
          const shopId = rtn.shop_id || rtn.shop?.id;
          return {
            ...rtn,
            return_cost: Number(rtn.return_cost) || 0,
            shop_name: shopMap[shopId] || 'Shop',
            shop_id: shopId || null
          };
        });
      };

      setShops(shopsResponse.data);
      setGoodReturns(processReturns(goodRes));
      setBadReturns(processReturns(badRes));
      setError(null);
    } catch (err) {
      console.error('API Error:', err.response?.data || err.message);
      setError(err.response?.data?.message || 'Failed to load returns');
      showAlert(
        err.response?.data?.message || 'Server error occurred', 
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  fetchData();
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
  const shopName = rtn.shop_name.toLowerCase(); // Already processed in the data fetch
  return (
    shopName.includes(searchTerm) ||
    rtn.created_at.toLowerCase().includes(searchTerm) ||
    rtn.return_cost.toString().includes(searchTerm)
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
      <RepSideBar isOpen={sidebarOpen} ref={sidebarRef} />
      <div className="RepReturnsContainer">
        <RepNavbar onMenuClick={toggleSidebar}/>
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

      {/* Alert Snackbar */}
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

export default RepReturns;
import React, { useState, useRef, useEffect } from 'react';
import './RepReturns.css';
import RepSideBar from '../../components/Sidebar/RepSidebar/RepSidebar';
import RepNavbar from '../../components/RepNavbar/RepNavbar';
import SearchIcon from '@mui/icons-material/Search';
import { Switch, FormControlLabel } from '@mui/material';

const RepReturns = () => {
  const [goodReturns, setGoodReturns] = useState([
    { id: 1, shop_name: 'A Shop', created_at: '3/4/2027', return_cost: 1500.00 },
    { id: 2, shop_name: 'B Shop', created_at: '13/4/2025', return_cost: 2500.00 },
    { id: 3, shop_name: 'Dilshan Shop', created_at: '3/4/2025', return_cost: 1800.00 },
  ]);

  const [badReturns, setBadReturns] = useState([
    { id: 101, shop_name: 'X Shop', created_at: '4/5/2025', return_cost: 1000.00 },
    { id: 102, shop_name: 'Y Shop', created_at: '6/5/2025', return_cost: 2000.00 },
    { id: 103, shop_name: 'Z Shop', created_at: '7/5/2025', return_cost: 500.00 },
  ]);

  const [showGoodReturns, setShowGoodReturns] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const returnsToFilter = showGoodReturns ? goodReturns : badReturns;

  const filteredReturns = returnsToFilter
    .sort((a, b) => {
      const dateA = new Date(a.created_at.split('/').reverse().join('/'));
      const dateB = new Date(b.created_at.split('/').reverse().join('/'));
      return dateB - dateA;
    })
    .filter(rtn =>
      rtn.created_at.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rtn.shop_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rtn.return_cost.toString().includes(searchQuery)
    );

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

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
                      <td>{rtn.created_at}</td>
                      <td>{rtn.shop_name}</td>
                      <td className="HideTab">{rtn.total_price}</td>
                      <td><button className="ReturnTableViewButton">View</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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

export default RepReturns;
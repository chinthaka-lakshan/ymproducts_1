import React, { useState, useRef, useEffect } from 'react';
import './RepOrders.css';
import RepSideBar from '../../components/Sidebar/RepSidebar/RepSidebar';
import RepNavbar from '../../components/RepNavbar/RepNavbar';
import SearchIcon from '@mui/icons-material/Search';

const RepOrders = () => {
  const [orders, setOrders] = useState([
    { id: 1, shop_name: 'A Shop', created_at: '3/4/2027', user_name: 'ARaheem', status: 'Distributed', total_price: 1500.00 },
    { id: 2, shop_name: 'B Shop', created_at: '13/4/2025', user_name: 'BRaheem', status: 'Distributed', total_price: 2500.00 },
    { id: 3, shop_name: 'Dilshan Shop', created_at: '3/4/2025', user_name: 'DRaheem', status: 'Pending', total_price: 1800.00 },
    { id: 4, shop_name: 'C Shop', created_at: '30/4/2027', user_name: 'CRaheem', status: 'Distributed', total_price: 2500.00 },
    { id: 5, shop_name: 'F Shop', created_at: '3/2/2025', user_name: 'JRaheem', status: 'Pending', total_price: 12500.00 },
    { id: 6, shop_name: 'Y Shop', created_at: '31/1/2025', user_name: 'Raheem', status: 'Distributed', total_price: 22500.00 },
    { id: 7, shop_name: 'S Shop', created_at: '13/4/2027', user_name: 'Raheem', status: 'Cancelled', total_price: 20500.00 },
    { id: 8, shop_name: 'Wijaya Shop', created_at: '3/4/2025', user_name: 'Raheem', status: 'Cancelled', total_price: 1300.00 },
    { id: 9, shop_name: 'Q Shop', created_at: '3/4/2020', user_name: 'Raheem', status: 'Distributed', total_price: 52500.00 },
    { id: 10, shop_name: 'AB Shop', created_at: '3/4/2025', user_name: 'Raheem', status: 'Cancelled', total_price: 13500.00 },
    { id: 11, shop_name: 'CD Shop', created_at: '3/4/2025', user_name: 'Raheem', status: 'Distributed', total_price: 26500.00 },
  ].sort((a, b) => {
    const dataA = new Date(a.created_at.split('/').reverse().join('/'));
    const dataB = new Date(b.created_at.split('/').reverse().join('/'));
    return dataB - dataA;
  }));

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const sidebarRef = useRef();

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Close sidebar when clicking outside
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

  const [searchQuery, setSearchQuery] = useState('');
  const filteredOrders = orders.filter(order =>
    order.created_at.toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.shop_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.user_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.total_price.toString().includes(searchQuery) ||
    order.status.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [ordersPerPage, setOrdersPerPage] = useState(window.innerWidth <= 768 ? 10 : 6);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;

      if (width <= 480) {
        setOrdersPerPage(8); // Mobile
      } else if (width > 480 && width <= 768) {
        setOrdersPerPage(10); // Tablet
      } else {
        setOrdersPerPage(6); // Desktop
      }
    };

    handleResize(); // Initial check

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Calculate current orders to display
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);
  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  // Calculate total pages
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  return (
    <div className="RepOrders">
      <RepSideBar isOpen={sidebarOpen} ref={sidebarRef}/>
      <div className="RepOrdersContainer">
        <RepNavbar onMenuClick={toggleSidebar}/>
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
                onChange={e => setSearchQuery(e.target.value)}
                className="RepOrdersSearchInput"
              />
              <SearchIcon className='RepOrdersSearchIcon'/>
            </div>
            <div className="RepOrdersTableScroll">
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
                      <td>{order.created_at}</td>
                      <td>{order.shop_name}</td>
                      <td className="HideMobile">{order.user_name}</td>
                      <td className="HideTab">{order.total_price}</td>
                      <td>{order.status}</td>
                      <td><button className="OrderTableViewButton">View</button></td>
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

export default RepOrders;
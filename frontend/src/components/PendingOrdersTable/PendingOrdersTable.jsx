import React, { useState, useEffect } from "react";
import axios from "axios";
import "./PendingOrdersTable.css";
import { Link } from "react-router-dom";

const PendingOrdersTable = () => {
  const [data, setData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 6;
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    axios.get("http://localhost:8000/api/pending_orders")
      .then((res) => {
        const formatted = res.data.map((order) => ({
          id: order.id,
          date: new Date(order.created_at).toLocaleDateString(),
          shop: `Shop ID: ${order.shop_id}` // Update later if shop name is needed
        }));
        setData(formatted);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching orders", err);
        setLoading(false);
      });
  }, []);

  const fetchOrderDetails = (id) => {
    axios.get(`http://localhost:8000/api/orders/${id}`)
      .then((res) => {
        setSelectedOrder(res.data);
        setIsModalOpen(true);
      })
      .catch((err) => {
        console.error("Error fetching order details", err);
      });
  };

  const totalPages = Math.ceil(data.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const visibleRows = data.slice(startIndex, startIndex + rowsPerPage);

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  return (
    <div className="PendingOrdersTable">
      <span className="PendingOrdersTableTitle">Pending Orders</span>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          <table className="PendingTable">
            <thead>
              <tr>
                <th className="DateColumn">Date</th>
                <th className="ShopColumn">Shop</th>
                <th className="ButtonColumn">Action</th>
              </tr>
            </thead>
            <tbody>
              {visibleRows.map((row) => (
                <tr key={row.id}>
                  <td>{row.date}</td>
                  <td>{row.shop}</td>
                  <td>
                    <button onClick={() => fetchOrderDetails(row.id)}>
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {totalPages > 1 && (
            <div className="PendingOrdersPagination">
              <button onClick={handlePrev} disabled={currentPage === 1}>
                Prev
              </button>
              <span> Page {currentPage} of {totalPages} </span>
              <button onClick={handleNext} disabled={currentPage === totalPages}>
                Next
              </button>
            </div>
          )}
        </>
      )}

      {isModalOpen && selectedOrder && (
        <div className="ModalOverlay">
          <div className="ModalContent">
            <h3>Order Details (ID: {selectedOrder.id})</h3>
            <p><strong>Date:</strong> {new Date(selectedOrder.created_at).toLocaleString()}</p>
            <p><strong>Status:</strong> {selectedOrder.status}</p>
            <p><strong>Shop ID:</strong> {selectedOrder.shop_id}</p>
            <p><strong>Total Amount:</strong> {selectedOrder.total}</p>
            {/* Add more fields if needed */}
            <button onClick={() => setIsModalOpen(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PendingOrdersTable;

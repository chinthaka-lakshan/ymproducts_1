import React, { useState } from "react";
import "./PendingOrdersTable.css";
import { Link } from "react-router-dom";

const PendingOrdersTable = () => {

  const [data, setData] = useState([
    { id: 1, date: "2025 Jan 13", shop: "Lakshan Stores" },
    { id: 2, date: "2025 Feb 13", shop: "Hasitha Stores" },
    { id: 3, date: "2025 Mar 13", shop: "YM Stores" },
    { id: 4, date: "2025 Apr 13", shop: "Wijaya Stores" },
    { id: 5, date: "2025 May 13", shop: "CJ Stores" },
    { id: 6, date: "2025 Jan 13", shop: "Lakshan Stores" },
    { id: 7, date: "2025 Feb 13", shop: "Hasitha Stores" },
    { id: 8, date: "2025 Mar 13", shop: "YM Stores" },
    { id: 9, date: "2025 Apr 13", shop: "Wijaya Stores" },
    { id: 10, date: "2025 May 13", shop: "CJ Stores" },
    { id: 11, date: "2025 Jan 13", shop: "Lakshan Stores" },
    { id: 12, date: "2025 Feb 13", shop: "Hasitha Stores" },
    { id: 13, date: "2025 Mar 13", shop: "YM Stores" },
    { id: 14, date: "2025 Apr 13", shop: "Wijaya Stores" },
    { id: 15, date: "2025 May 13", shop: "CJ Stores" },
  ]);

  const rowsPerPage = 6;
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(data.length / rowsPerPage);

  const handleNext = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrev = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const startIndex = (currentPage - 1) * rowsPerPage;
  const visibleRows = data.slice(startIndex, startIndex + rowsPerPage);

  return (
    <div className="PendingOrdersTable">
      <span className="PendingOrdersTableTitle">Pending Orders</span>
      <table className="PendingTable">
        <thead>
          <tr>
            <th className="DateColumn">Date</th>
            <th className="ShopColumn">Shop</th>
            <th className="ButtonColumn"></th>
          </tr>
        </thead>
        <tbody>
          {visibleRows.map((row) => (
            <tr key={row.id}>
              <td>{row.date}</td>
              <td>{row.shop}</td>
              <td><button>View</button></td>
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
    </div>
  );
};

export default PendingOrdersTable;
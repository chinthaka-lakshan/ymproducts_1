import React, { useState, useEffect } from "react";
import axios from "axios";
import "./LowPurchaseStockTable.css";

const LowPurchaseStockTable = () => {
  const [data, setData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 6;

  useEffect(() => {
    axios.get("http://localhost:8000/api/purchase-stock/low")
      .then((response) => {
        setData(response.data);
      })
      .catch((error) => {
        console.error("Error fetching low stock data:", error);
      });
  }, []);

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
    <div className="LowPurchaseStockTable">
      <span className="LowPurchaseStockTableTitle">Low Purchase Stock</span>
      <table className="LowPurchaseTable">
        <thead>
          <tr>
            <th className="ItemColumn">Item</th>
            <th className="WeightColumn">Weight (kg)</th>
          </tr>
        </thead>
        <tbody>
          {visibleRows.map((row) => (
            <tr key={row.id}>
              <td>{row.item}</td>
              <td>{row.weight}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {totalPages > 1 && (
        <div className="LowStockPagination">
          <button onClick={handlePrev} disabled={currentPage === 1}>Prev</button>
          <span> Page {currentPage} of {totalPages} </span>
          <button onClick={handleNext} disabled={currentPage === totalPages}>Next</button>
        </div>
      )}
    </div>
  );
};

export default LowPurchaseStockTable;

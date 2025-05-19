import React, { useState, useEffect } from "react";
import axios from "axios";
import "./LowDistributionStockTable.css";

const LowDistributionStockTable = () => {
  const [data, setData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 6;

  useEffect(() => {
    axios.get("http://localhost:8000/api/distribution-stock/low")
      .then((response) => {
        setData(response.data);
      })
      .catch((error) => {
        console.error("Error fetching low distribution stock:", error);
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
    <div className="LowDistributionStockTable">
      <span className="LowDistributionStockTableTitle">Low Distribution Stock</span>
      <table className="LowDistributionTable">
        <thead>
          <tr>
            <th className="ItemColumn">Item</th>
            <th className="QuantityColumn">Quantity</th>
          </tr>
        </thead>
        <tbody>
          {visibleRows.map((row) => (
            <tr key={row.id}>
              <td>{row.item}</td>
              <td>{row.quantity}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {totalPages > 1 && (
        <div className="LowStockPagination">
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

export default LowDistributionStockTable;

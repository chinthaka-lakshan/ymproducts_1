import React, { useState } from "react";
import "./LowPurchaseStockTable.css";

const LowPurchaseStockTable = () => {

  const [data, setData] = useState([
    { id: 1, item: "Dry Chilli", weight: 5 },
    { id: 2, item: "Turmeric", weight: 1 },
    { id: 3, item: "Ginger", weight: 3.5 },
    { id: 4, item: "Pepper", weight: 7 },
    { id: 5, item: "Cinnamon", weight: 6 },
    { id: 6, item: "Dry Chilli", weight: 5.75 },
    { id: 7, item: "Turmeric", weight: 1 },
    { id: 8, item: "Ginger", weight: 3 },
    { id: 9, item: "Pepper", weight: 7 },
    { id: 10, item: "Cinnamon", weight: 6.4 },
    { id: 11, item: "Dry Chilli", weight: 5 },
    { id: 12, item: "Turmeric", weight: 1.25 },
    { id: 13, item: "Ginger", weight: 3.2 },
    { id: 14, item: "Pepper", weight: 7 },
    { id: 15, item: "Cinnamon", weight: 6 },
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

export default LowPurchaseStockTable;
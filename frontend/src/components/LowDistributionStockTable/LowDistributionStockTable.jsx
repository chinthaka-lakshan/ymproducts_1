import React, { useState } from "react";
import "./LowDistributionStockTable.css";

const LowDistributionStockTable = () => {

  const [data, setData] = useState([
    { id: 1, item: "Chilli Powder 50g", quantity: 10 },
    { id: 2, item: "Turmeric 50g", quantity: 12 },
    { id: 3, item: "Pepper 50g", quantity: 9 },
    { id: 4, item: "Curry Powder 100g", quantity: 11 },
    { id: 5, item: "Chilli Powder 100g", quantity: 3 },
    { id: 6, item: "Cardamom 50g", quantity: 5 },
    { id: 7, item: "Cinnamon 50g", quantity: 7 },
    { id: 8, item: "Nutmeg 50g", quantity: 4 },
    { id: 9, item: "Cloves 50g", quantity: 8 },
    { id: 10, item: "Ginger Powder 50g", quantity: 6 },
    { id: 11, item: "Chilli Powder 50g", quantity: 10 },
    { id: 12, item: "Turmeric 50g", quantity: 12 },
    { id: 13, item: "Pepper 50g", quantity: 9 },
    { id: 14, item: "Curry Powder 100g", quantity: 11 },
    { id: 15, item: "Chilli Powder 100g", quantity: 3 },
    { id: 16, item: "Cardamom 50g", quantity: 5 },
    { id: 17, item: "Cinnamon 50g", quantity: 7 },
    { id: 18, item: "Nutmeg 50g", quantity: 4 },
    { id: 19, item: "Cloves 50g", quantity: 8 },
    { id: 20, item: "Ginger Powder 50g", quantity: 6 },
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
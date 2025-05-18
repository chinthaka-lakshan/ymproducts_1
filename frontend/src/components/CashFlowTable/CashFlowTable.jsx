import React, { useState } from "react";
import { DataGrid } from "@mui/x-data-grid";
import "./CashFlowTable.css";

const CashFlowTable = () => {

  const [data, setData] = useState([
    { id: 1, month: "2025/01", income: 10, expenses: 5, profit: 5 },
    { id: 2, month: "2025/02", income: 12, expenses: 6, profit: 6 },
    { id: 3, month: "2025/03", income: 9, expenses: 4, profit: 5 },
  ]);

  const CashFlowTableColumns = [
    { field: "month", headerName: "Month", width: 150 },
    { field: "income", headerName: "Income", width: 100 },
    { field: "expenses", headerName: "Expences", width: 100 },
    { field: "profit", headerName: "Profit", width: 100 },
  ];

  return (
    <div className="CashFlowTable">
      <span className="CashFlowTableTitle">Cash Flow History</span>
      <DataGrid
        className="DataGrid"
        rows={data}
        columns={CashFlowTableColumns}
        pageSize={8}
        rowsPerPageOptions={[5]}
        getRowId={(row) => row.id}
      />
    </div>
  );
};

export default CashFlowTable;
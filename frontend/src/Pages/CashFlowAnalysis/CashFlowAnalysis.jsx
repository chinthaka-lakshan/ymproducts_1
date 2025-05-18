import React, { useState } from "react";
import "./CashFlowAnalysis.css";
import AdminSidebar from "../../components/Sidebar/AdminSidebar/AdminSidebar.jsx";
import CashFlowWidget from "../../components/CashFlowWidget/CashFlowWidget.jsx";
import CashFlowTable from "../../components/CashFlowTable/CashFlowTable.jsx";
import AdminNavbar from "../../components/AdminNavbar/AdminNavbar.jsx";
import api from "../../api/axios.js";


const CashFlowAnalysis = () => {
  const [newExpenses, setNewExpenses] = useState({
    transport: "",
    other: "",
  });

  

  const [showExpensesAddModal, setShowExpensesAddModal] = useState(false);
  const [expenses, setExpenses] = useState([]);

          const handleAddExpenses = async () => {
            try {
              // Convert input strings to numbers before sending
              const payload = {
                transport: Number(newExpenses.transport),
                other: Number(newExpenses.other),
              };

              // Use your api instance here
              const response = await api.post("/cashflows", payload);

              // Add the newly created cashflow to the expenses state
              setExpenses([...expenses, response.data.cashflow]);

              // Reset the input fields
              setNewExpenses({ transport: "", other: "" });

              alert("Expenses added successfully!");
              setShowExpensesAddModal(false);
            } catch (error) {
          if (error.response) {
            // Server responded with a status outside 2xx
            console.error("Server error response:", error.response.data);
            alert(`Failed to add expenses: ${error.response.data.message || 'Server error'}`);
          } else if (error.request) {
            // Request made but no response received
            console.error("No response received:", error.request);
            alert("Failed to add expenses: No response from server");
          } else {
            // Something else caused the error
            console.error("Error setting up request:", error.message);
            alert(`Failed to add expenses: ${error.message}`);
          }
        }

  };

  return (
    <div className="CashFlowAnalysis">
      <AdminSidebar />
      <div className="CashFlowContainer">
        <AdminNavbar />

        <div className="MonthlyCashFlow">
          <h1>
            {(() => {
              const today = new Date();
              const monthNames = [
                "January",
                "February",
                "March",
                "April",
                "May",
                "June",
                "July",
                "August",
                "September",
                "October",
                "November",
                "December",
              ];
              return monthNames[today.getMonth()];
            })()}
          </h1>
          <div className="MonthlyCashFlowWidgets">
            <CashFlowWidget type="monthlyIncome" />
            <CashFlowWidget type="monthlyExpense" />
            <CashFlowWidget type="monthlyProfit" />
          </div>
        </div>

        <div className="DailyCashFlow">
          <h1>
            {(() => {
              const today = new Date();
              const date =
                today.getFullYear() +
                "-" +
                (today.getMonth() + 1) +
                "-" +
                today.getDate();
              return date;
            })()}
          </h1>
          <div className="DailyCashFlowWidgets">
            <CashFlowWidget type="dayIncome" />
            <CashFlowWidget type="dayExpense" />
            <CashFlowWidget type="dayProfit" />
          </div>
        </div>

        <div className="ButtonsContainer">
          <button className="btn" onClick={() => setShowExpensesAddModal(true)}>
            Add Expenses
          </button>
        </div>

        <div className="TablesContainer">
          <CashFlowTable expenses={expenses} />
        </div>

        {showExpensesAddModal && (
          <div className="ModalBackdrop">
            <div className="Modal">
              <h2>Add Expenses</h2>
              <div className="transport">
                <input
                  type="text"
                  placeholder="Enter Transport Cost"
                  value={newExpenses.transport}
                  onChange={(e) =>
                    setNewExpenses({ ...newExpenses, transport: e.target.value })
                  }
                />
              </div>
              <div className="other">
                <input
                  type="text"
                  placeholder="Enter Other Cost"
                  value={newExpenses.other}
                  onChange={(e) =>
                    setNewExpenses({ ...newExpenses, other: e.target.value })
                  }
                />
              </div>
              <div className="modalbutton">
                <button
                  className="CancelButton"
                  onClick={() => setShowExpensesAddModal(false)}
                >
                  Cancel
                </button>

                <button className="saveButton" onClick={handleAddExpenses}>
                  Save
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CashFlowAnalysis;
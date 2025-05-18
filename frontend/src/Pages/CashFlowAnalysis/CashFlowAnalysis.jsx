import React, { useState } from "react";
import "./CashFlowAnalysis.css"
import AdminSidebar from "../../components/Sidebar/AdminSidebar/AdminSidebar.jsx"
import CashFlowWidget from "../../components/CashFlowWidget/CashFlowWidget.jsx"
import CashFlowTable from "../../components/CashFlowTable/CashFlowTable.jsx"
import AdminNavbar from "../../components/AdminNavbar/AdminNavbar.jsx";

const CashFlowAnalysis = () => {

   const [showAddModal, setShowAddModal] = useState(false);

  return (
    <div className="CashFlowAnalysis">
      <AdminSidebar/>
      <div className="CashFlowContainer">
        <AdminNavbar/>

        <div className="MonthlyCashFlow">
          <h1>
          {(() => {
              const today = new Date();
              const monthNames = ["January", "February", "March", "April", "May", "June",
                  "July", "August", "September", "October", "November", "December"];
              return monthNames[today.getMonth()];
          })()}
          </h1>
          <div className="MonthlyCashFlowWidgets">
              <CashFlowWidget type="monthlyIncome"/>
              <CashFlowWidget type="monthlyExpense"/>
              <CashFlowWidget type="monthlyProfit"/>
          </div>
        </div>

        <div className="DailyCashFlow">
          <h1>
          {(() => {
              const today = new Date();
              const date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
              return date;
          })()}
          </h1>
          <div className="DailyCashFlowWidgets">
              <CashFlowWidget type="dayIncome"/>
              <CashFlowWidget type="dayExpense"/>
              <CashFlowWidget type="dayProfit"/>
          </div>
        </div>

        <div className="ButtonsContainer">
          <button className="btn" onClick={() => setShowAddModal(true)}>
              Add Expenses
            </button>
        </div>

        <div className="TablesContainer">
          <CashFlowTable/>
        </div>

      {showAddModal &&(
        <div className="ModalBackdrop">
          <div className="Modal">
            <h2>Add Expenses</h2>
          </div>
        </div>
      )}


         

      </div>
    </div>
  );
};

export default CashFlowAnalysis;
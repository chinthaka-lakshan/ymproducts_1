import React from "react";
import "./AdminDashboard.css";
import AdminSidebar from "../../../components/Sidebar/AdminSidebar/AdminSidebar.jsx";
import AdminNavbar from "../../../components/AdminNavbar/AdminNavbar.jsx";
import DashboardWidget from "../../../components/DashboardWidget/DashboardWidget.jsx";
import LowPurchaseStockTable from "../../../components/LowPurchaseStockTable/LowPurchaseStockTable.jsx";
import LowDistributionStockTable from "../../../components/LowDistributionStockTable/LowDistributionStockTable.jsx";
import PendingOrdersTable from "../../../components/PendingOrdersTable/PendingOrdersTable.jsx";

const AdminDashboard = () => {

    return (
        <div className="AdminDashboard">
            <AdminSidebar/>
            <div className="AdminDashboardContainer">
                <AdminNavbar/>
                <div className="AdminDashboardWidgets">
                    <DashboardWidget type="distributionStock"/>
                    <DashboardWidget type="purchaseStock"/>
                    <DashboardWidget type="orders"/>
                    <DashboardWidget type="returns"/>
                    <DashboardWidget type="shops"/>
                </div>
                <div className="AdminTablesContainer">
                    <LowPurchaseStockTable/>
                    <LowDistributionStockTable/>
                    <PendingOrdersTable/>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
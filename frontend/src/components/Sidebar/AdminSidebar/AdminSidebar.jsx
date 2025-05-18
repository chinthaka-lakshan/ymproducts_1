import React from 'react';
import "./AdminSidebar.css";
import Logo from "../../../assets/YM.png";
import { Link, useLocation } from 'react-router-dom';
import DashboardIcon from "@mui/icons-material/Dashboard";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import InventoryIcon from "@mui/icons-material/Inventory";
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import RepeatIcon from "@mui/icons-material/Repeat";
import StorefrontIcon from "@mui/icons-material/Storefront";
import PeopleIcon from "@mui/icons-material/People";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";

const AdminSidebar = () => {
    const location = useLocation();

    return (
        <div className='AdminSidebar'>
            <div className='Top'>
                <img src={Logo} className='Logo'/>
            </div>
            <div className='Bottom'>
                <ul>
                    <Link to="/admindashboard" style={{textDecoration:"none"}}>
                        <li className={location.pathname === "/admindashboard" ? "active" : ""}>
                            <DashboardIcon className='Icon'/>
                            <span>Admin Dashboard</span>
                        </li>
                    </Link>
                    <Link to="/distributionStock" style={{textDecoration:"none"}}>
                        <li className={location.pathname === "/distributionStock" ? "active" : ""}>
                            <ShoppingCartIcon className='Icon'/>
                            <span>Distribution Stock</span>
                        </li>
                    </Link>
                    <Link to="/purchaseStock" style={{textDecoration:"none"}}>
                        <li className={location.pathname === "/purchaseStock" ? "active" : ""}>
                            <InventoryIcon className='Icon'/>
                            <span>Purchase Stock</span>
                        </li>
                    </Link>
                    <Link to="/adminOrders" style={{textDecoration:"none"}}>
                        <li className={location.pathname === "/adminOrders" ? "active" : ""}>
                            <ShoppingBagIcon className='Icon'/>
                            <span>Orders</span>
                        </li>
                    </Link>
                    <Link to="/returns" style={{textDecoration:"none"}}>
                        <li className={location.pathname === "/returns" ? "active" : ""}>
                            <RepeatIcon className='Icon'/>
                            <span>Returns</span>
                        </li>
                    </Link>
                    <Link to="/adminShops" style={{textDecoration:"none"}}>
                        <li className={location.pathname === "/adminShops" ? "active" : ""}>
                            <StorefrontIcon className='Icon'/>
                            <span>Shops</span>
                        </li>
                    </Link>
                    <Link to="/salesReps" style={{textDecoration:"none"}}>
                        <li className={location.pathname === "/salesReps" ? "active" : ""}>
                            <PeopleIcon className='Icon'/>
                            <span>Sales Reps</span>
                        </li>
                    </Link>
                    <Link to="/cashFlow" style={{textDecoration:"none"}}>
                        <li className={location.pathname === "/cashFlow" ? "active" : ""}>
                            <AttachMoneyIcon className='Icon'/>
                            <span>Cash Flow</span>
                        </li>
                    </Link>
                </ul>
            </div>
        </div>
    );
};

export default AdminSidebar;
import React from "react";
import "./DashboardWidget.css";
import StorefrontIcon from "@mui/icons-material/Storefront";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import InventoryIcon from "@mui/icons-material/Inventory";
import RepeatIcon from "@mui/icons-material/Repeat";
import StoreIcon from "@mui/icons-material/Store";
import { Link } from 'react-router-dom';

const DashboardWidget = ({ type }) => {

  let data;

  switch (type) {

    case "distributionStock":
      data = {
        path: "/distributionStock",
        title: "DISTRIBUTION STOCK",
        isMoney: false,
        text: "View Stock",
        icon: (
          <ShoppingCartIcon
            className="icon"
            style={{ color: "#616161", backgroundColor: "#daa52033" }}
          />
        ),
      };
      break;

    case "purchaseStock":
      data = {
        path: "/purchaseStock",
        title: "PURCHASE STOCK",
        isMoney: false,
        text: "View Stock",
        icon: (
          <StorefrontIcon
            className="icon"
            style={{ color: "#616161", backgroundColor: "#daa52033" }}
          />
        ),
      };
      break;

    case "orders":
      data = {
        path: "/adminOrders",
        title: "ORDERS",
        isMoney: false,
        text: "View Orders",
        icon: (
          <InventoryIcon
            className="icon"
            style={{ color: "#616161", backgroundColor: "#daa52033" }}
          />
        ),
      };
      break;

    case "returns":
      data = {
        path: "/returns",
        title: "RETURNS",
        isMoney: false,
        text: "View Returns",
        icon: (
          <RepeatIcon
            className="icon"
            style={{ color: "#616161", backgroundColor: "#daa52033" }}
          />
        ),
      };
      break;

      case "shops":
        data = {
          path: "/adminShops",
          title: "SHOPS",
          isMoney: false,
          text: "View Shops",
          icon: (
            <StoreIcon
              className="icon"
              style={{ color: "#616161", backgroundColor: "#daa52033" }}
            />
          ),
        };
        break;

    default:
      break;
  }

  return (
    <Link to={data.path}>
      <div className='DashboardWidget'>
        <div className='DashboardWidgetLeft'>
          <span className='DashboardWidgetTitle'>{data.title}</span>
        </div>
        <div className='DashboardWidgetRight'>
          {data.icon}
          <span>{data.text}</span>
        </div>
      </div>
    </Link>
  );
};

export default DashboardWidget;
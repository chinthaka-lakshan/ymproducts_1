import React from "react";
import "./CashFlowWidget.css";
import PaidIcon from '@mui/icons-material/Paid';

const CashFlowWidget = ({ type }) => {

  let data;

  switch (type) {
    case "monthlyIncome":
      data = {
        title: "MONTHLY INCOME",
        isMoney: false,
        amount: 5000.00,
      };
      break;

    case "monthlyExpense":
      data = {
        title: "MONTHLY EXPENSE",
        isMoney: false,
        amount: 5000.00,
      };
      break;

    case "monthlyProfit":
      data = {
        title: "MONTHLY PROFIT",
        isMoney: false,
        amount: 5000.00,
      };
        break;

    case "dayIncome":
      data = {
        title: "DAY INCOME",
        isMoney: false,
        amount: 5000.00,
      };
        break;

    case "dayExpense":
      data = {
        title: "DAY EXPENSE",
        isMoney: false,
        amount: 5000.00,
      };
        break;

    case "dayProfit":
      data = {
        title: "DAY PROFIT",
        isMoney: false,
        amount: 5000.00,
      };
        break;

    default:
      break;
  }

  return (
    <div className='widget'>
      <div className='left'>
        <span className='title'>{data.title}</span>
        <span className='amount'>{data.amount}</span>
      </div>
      <PaidIcon className='icon'/>
    </div>
  );
};

export default CashFlowWidget;
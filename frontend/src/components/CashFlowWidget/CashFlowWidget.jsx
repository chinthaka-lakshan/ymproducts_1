import React, { useEffect, useState } from "react";
import "./CashFlowWidget.css";
import PaidIcon from '@mui/icons-material/Paid';
import api from "../../api/axios"; // Axios instance with token support

const CashFlowWidget = ({ type }) => {
  const [amount, setAmount] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        let response;

        // Determine if the type is daily or monthly and fetch accordingly
        if (type.startsWith("monthly")) {
          response = await api.get("/cashflows/monthly-summary");
        } else if (type.startsWith("day")) {
          response = await api.get("/cashflows/daily-summary");
        }

        // Set amount based on type
        switch (type) {
          case "monthlyIncome":
          case "dayIncome":
            setAmount(response.data.income);
            break;

          case "monthlyExpense":
          case "dayExpense":
            setAmount(response.data.expenses);
            break;

          case "monthlyProfit":
          case "dayProfit":
            setAmount(response.data.profit);
            break;

          default:
            setAmount(0);
            break;
        }
      } catch (error) {
        console.error("Error fetching cash flow data:", error);
        setAmount(0); // Fallback to 0 in case of error
      }
    };

    fetchData();
  }, [type]);

  // Display title based on type
  const titleMap = {
    monthlyIncome: "MONTHLY INCOME",
    monthlyExpense: "MONTHLY EXPENSE",
    monthlyProfit: "MONTHLY PROFIT",
    dayIncome: "DAY INCOME",
    dayExpense: "DAY EXPENSE",
    dayProfit: "DAY PROFIT",
  };

  return (
    <div className='widget'>
      <div className='left'>
        <span className='title'>{titleMap[type]}</span>
        <span className='amount'>Rs. {amount.toFixed(2)}</span>
      </div>
      <PaidIcon className='icon' />
    </div>
  );
};

export default CashFlowWidget;

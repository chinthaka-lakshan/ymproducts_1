// import React from "react";
// import "./Invoice.css";
// import Sidebar from "../../components/Sidebar/AdminSidebar/AdminSidebar";
// import TopBar from "../../components/Topbar/topbar";

// const RepInvoice = () => {
//   const items = [
//     { item: "Chili Powder", weight: 50, qty: 20, unitPrice: 250 },
//     { item: "Chili Powder", weight: 100, qty: 20, unitPrice: 300 },
//     { item: "Chili Powder", weight: 250, qty: 20, unitPrice: 450 },
//     { item: "Chili Powder", weight: 500, qty: 20, unitPrice: 600 },
//   ];

//   return (
//     <div className="invoice-container">
//     <Sidebar/>
//     <TopBar/>
//       <h2 className="invoice-title">Invoice</h2>
//       <div className="invoice-table">
//         <table>
//           <thead>
//             <tr>
//               <th className="table-header">Item</th>
//               <th className="table-header">Weight</th>
//               <th className="table-header">QTY</th>
//               <th className="table-header">Unit Price</th>
//               <th className="table-header">Actions</th>
//             </tr>
//           </thead>
//           <tbody>
//             {items.map((item, index) => (
//               <tr key={index} className={index % 2 === 0 ? "row-even" : "row-odd"}>
//                 <td className="table-text">{item.item}</td>
//                 <td className="table-text">{item.weight}</td>
//                 <td className="table-text">{item.qty}</td>
//                 <td className="table-text">{item.unitPrice}</td>
//                 <td>
//                   <button className="edit-btn">Edit</button>
//                   <button className="delete-btn">Delete</button>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//       <div className="invoice-actions">
//         <button className="add-btn">Add Items</button>
//         <button className="generate-btn">Generate Invoice</button>
//       </div>
//     </div>
//   );
// };

// export default RepInvoice;


import React, { useState, useRef } from "react";
import "./RepInvoice.css";
import RepSidebar from "../../components/Sidebar/RepSidebar/RepSidebar"
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import logo from "../../assets/YMlogo.PNG"


const RepInvoice = () => {
  const [showPopup, setShowPopup] = useState(false);
  const invoiceRef = useRef();

  const items = [
    { item: "Chili Powder", weight: 50, qty: 20, unitPrice: 250 },
    { item: "Chili Powder", weight: 100, qty: 20, unitPrice: 300 },
    { item: "Chili Powder", weight: 250, qty: 20, unitPrice: 450 },
    { item: "Chili Powder", weight: 500, qty: 20, unitPrice: 600 },
  ];

  const handleGenerateInvoice = () => {
    setShowPopup(true);
  };

  const handlePrint = () => {
    html2canvas(invoiceRef.current).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      pdf.addImage(imgData, "PNG", 10, 10, 190, 0);
      pdf.save("Invoice.pdf");
    });
  };

  return (
    <div className="invoice-container1">
      <RepSidebar/>
      
      <h2 className="invoice-title1">Invoice</h2>
      <div className="invoice-table1">
        <table>
          <thead>
            <tr>
              <th>Item</th>
              <th>Weight</th>
              <th>QTY</th>
              <th>Unit Price</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={index}>
                <td>{item.item}</td>
                <td>{item.weight}g</td>
                <td>{item.qty}</td>
                <td>Rs. {item.unitPrice}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="invoice-actions1">
        <button className="add-btn1">Add Items</button>
        <button className="generate-btn1" onClick={handleGenerateInvoice}>
          Generate Invoice
        </button>
      </div>

      {showPopup && (
        <div className="invoice-popup1">
          <div className="invoice-content1" ref={invoiceRef}>
            <div className="invoice-header1">
              <img src={logo} alt="Invoice Logo" className="invoice-logo1" />
              <div>
                <h2>Shop</h2>
                <p>2025/02/01</p>
              </div>
              <div className="invoice-number1">
                <h2>Invoice</h2>
                <p>#1235</p>
              </div>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Qty</th>
                  <th>Unit Price</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => (
                  <tr key={index}>
                    <td>{item.item}</td>
                    <td>{item.qty}</td>
                    <td>Rs. {item.unitPrice}</td>
                    <td>Rs. {item.qty * item.unitPrice}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="invoice-total1">
              <p>Sub Total: Rs. 150,000</p>
              <p>Discount: 10%</p>
              <p><strong>Total Due: Rs. 135,000</strong></p>
            </div>
          </div>
          <div className="invoice-buttons1">
            <button className="print-btn1" onClick={handlePrint}>Print</button>
            <button className="close-btn1" onClick={() => setShowPopup(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RepInvoice;

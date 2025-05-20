import React, { useState, useRef, useEffect } from "react";
import "./RepDashboard.css";
import RepSidebar from "../../../components/Sidebar/RepSidebar/RepSidebar";
import RepNavbar from "../../../components/RepNavbar/RepNavbar";
import orderIcon from "../../../assets/order.png";
import returnIcon from "../../../assets/return.png";
import GoodReturnIcon from "../../../assets/GoodReturn.png";
import BadReturnIcon from "../../../assets/BadReturn.png";
import StoreFrontIcon from "@mui/icons-material/Store";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import SearchIcon from "@mui/icons-material/Search";
import api from "../../../api/axios"; // Using the centralized axios instance
import logo from "../../../assets/YM.png";
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

const RepDashboard = () => {
  // State management
  const [shops, setShops] = useState([]);
  const [items, setItems] = useState([]);
  const [selectedShop, setSelectedShop] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);
  const [isReturn, setIsReturn] = useState(false);
  const [isGood, setIsGood] = useState(false);
  const [orderToEdit, setOrderToEdit] = useState(null);
  const [totalOrderDiscount, setTotalOrderDiscount] = useState(0);
  const [returnBalance, setReturnBalance] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchShopTerm, setSearchShopTerm] = useState("");
  const [searchItemTerm, setSearchItemTerm] = useState("");

  // Modal states
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [showShopsModal, setShowShopsModal] = useState(false);
  const [showItemsModal, setShowItemsModal] = useState(false);

  const [showPopup, setShowPopup] = useState(false);
  const [invoiceData, setInvoiceData] = useState(null);

  const sidebarRef = useRef();
  const invoiceRef = useRef();

  const username = localStorage.getItem("username");

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [shopsResponse, itemsResponse] = await Promise.all([
          api.get("/shops"),
          api.get("/items"),
        ]);
        setShops(shopsResponse.data);
        setItems(itemsResponse.data);
      } catch (error) {
        console.error("Error fetching data:", error);
        alert("Failed to load data. Please refresh the page.");
      }
    };
    fetchData();
  }, []);

  // Sidebar click outside handler
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        window.innerWidth <= 768 &&
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target)
      ) {
        setSidebarOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Helper functions
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const handleAddOrderClick = () => {
    setIsReturn(false);
    setTotalOrderDiscount(0);
    setShowShopsModal(true);
  };

  const handleAddReturnClick = () => {
    setIsReturn(true);
    setShowReturnModal(true);
  };

  const handleReturnTypeSelect = (isGoodReturn) => {
    setShowReturnModal(false);
    setShowShopsModal(true);
    setIsGood(isGoodReturn);
  };

  const handleShopSelect = async (shop) => {
    setSelectedShop(shop);
    try {
      const response = await api.get(`/shops/${shop.id}/return-balance`);
      setReturnBalance(response.data.return_balance || 0);
    } catch (error) {
      console.error("Error fetching return balance", error);
      setReturnBalance(0);
    }
    setShowShopsModal(false);
    setSearchShopTerm("");
    setShowItemsModal(true);
  };

  const handleItemSelect = (item) => {
    setSelectedItems((prev) => [
      ...prev,
      {
        item,
        orderQty: 1,
        unitPrice: item.unitPrice,
        editedPrice: undefined,
      },
    ]);
  };

  const updateItemQuantity = (itemId, quantity) => {
    setSelectedItems((prev) =>
      prev.map((i) => (i.item.id === itemId ? { ...i, orderQty: quantity } : i))
    );
  };

  const removeSelectedItem = (itemId) => {
    setSelectedItems((prev) => prev.filter((i) => i.item.id !== itemId));
  };

  const handleCancelOrder = () => {
    setSelectedItems([]);
    setSelectedShop(null);
    setShowItemsModal(false);
    setSearchItemTerm("");
  };

  const handleConfirmOrder = () => {
    setOrderToEdit({
      shop: selectedShop,
      items: selectedItems,
      isReturn,
      isGood,
    });
    setShowItemsModal(false);
    setSearchItemTerm("");
    setSelectedItems([]);
    setSelectedShop(null);
    setTotalOrderDiscount(0);
  };

  const handleEditOrder = () => {
    if (orderToEdit) {
      setSelectedShop(orderToEdit.shop);
      setSelectedItems(orderToEdit.items);
      setIsReturn(orderToEdit.isReturn);
      setShowItemsModal(true);
      setOrderToEdit(null);
    }
  };

  const calculateTotals = () => {
    const itemDiscount = orderToEdit.items.reduce((sum, item) => {
      const originalPrice = parseFloat(item.unitPrice);
      const editedPrice =
        item.editedPrice !== undefined
          ? parseFloat(item.editedPrice)
          : originalPrice;
      return sum + (originalPrice - editedPrice) * item.orderQty;
    }, 0);

    const orderDiscount = parseFloat(totalOrderDiscount) || 0;
    const totalDiscount = itemDiscount + orderDiscount;
    const subtotal = orderToEdit.items.reduce((sum, item) => {
      const price =
        item.editedPrice !== undefined
          ? parseFloat(item.editedPrice)
          : parseFloat(item.unitPrice);
      return sum + price * item.orderQty;
    }, 0);

    const grandTotal = subtotal - orderDiscount;

    return {
      itemDiscount,
      orderDiscount,
      totalDiscount,
      subtotal,
      grandTotal,
    };
  };

  const handleGenerateInvoice = async () => {
    try {
      const { subtotal, totalDiscount, grandTotal } = calculateTotals();

      // Prepare invoice data
      const invoiceItems = orderToEdit.items.map(item => ({
        id: item.item.id,
        item: item.item.item,
        quantity: item.orderQty,
        unitPrice: item.editedPrice !== undefined ? 
                  parseFloat(item.editedPrice) : 
                  parseFloat(item.unitPrice),
      }));

      const invoiceSubtotal = invoiceItems.reduce(
        (sum, item) => sum + (item.quantity * item.unitPrice),
        0
      );
      
      const invoiceDiscount = totalDiscount;
      const invoiceTotal = invoiceSubtotal - invoiceDiscount;

      setInvoiceData({
        items: invoiceItems,
        subtotal: invoiceSubtotal,
        discount: invoiceDiscount,
        total: invoiceTotal,
        shop: orderToEdit.shop,
        isReturn: orderToEdit.isReturn,
        date: new Date().toLocaleDateString(),
      });

      // Show the invoice popup
      setShowPopup(true);

      // Don't clear orderToEdit yet - we want to keep it for reference
    } catch (error) {
      console.error("Error generating invoice:", error);
      alert("Failed to generate invoice. Please try again.");
    }
  };

  const handlePrint = () => {
    const input = invoiceRef.current;
    html2canvas(input).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4'); // Fixed: using jsPDF instead of pdf
      const imgWidth = 190;
      const pageHeight = 290;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 10;

      pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      pdf.save('invoice.pdf');
    });
  };

  const renderShopCards = () =>
    shops
      .filter((shop) =>
        shop.shop_name.toLowerCase().includes(searchShopTerm.toLowerCase())
      )
      .sort((a, b) => a.shop_name.localeCompare(b.shop_name))
      .map((shop) => (
        <div
          key={shop.id}
          className="ShopCard"
          onClick={() => handleShopSelect(shop)}
        >
          <h2 className="CardTitle">{shop.shop_name}</h2>
          <div className="ShopCardMiddle">
            <StoreFrontIcon className="ShopCardIcon" />
            <div className="ShopCardDetails">
              <span>{shop.location}</span>
              <span>{shop.contact}</span>
            </div>
          </div>
        </div>
      ));

  const renderItemCards = () =>
    items
      .filter((item) =>
        item.item.toLowerCase().includes(searchItemTerm.toLowerCase())
      )
      .sort((a, b) => a.item.localeCompare(b.item))
      .map((item) => {
        const selected = selectedItems.find((i) => i.item.id === item.id);
        return (
          <div key={item.id} className="DistributionItemCard">
            <h2 className="CardTitle">{item.item}</h2>
            <div className="DistributionItemCardMiddle">
              <ShoppingCartIcon className="DistributionItemCardIcon" />
              <div className="DistributionItemCardDetails">
                <span>
                  <strong>Price (LKR): </strong>
                  {item.unitPrice}
                </span>
                <span>
                  <strong>In Stock: </strong>
                  {item.quantity}
                </span>
                {selected ? (
                  <div className="SelectedItemControl">
                    <input
                      type="number"
                      min="1"
                      value={selected.orderQty}
                      onChange={(e) => {
                        const qty = parseInt(e.target.value, 10);
                        updateItemQuantity(
                          item.id,
                          isNaN(qty) ? "" : Math.max(1, qty)
                        );
                      }}
                      className="QtyInput"
                    />
                    <button
                      className="ClearQtyBtn"
                      onClick={() => removeSelectedItem(item.id)}
                    >
                      ❌
                    </button>
                  </div>
                ) : (
                  <button
                    className="SelectItemBtn"
                    onClick={() => handleItemSelect(item)}
                  >
                    Select
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      });

  const renderOrderItems = () =>
    [...orderToEdit.items]
      .sort((a, b) => a.item.item.localeCompare(b.item.item))
      .map((item, index) => {
        const unitPrice =
          item.editedPrice !== undefined ? item.editedPrice : item.unitPrice;
        return (
          <tr key={index}>
            <td>{item.item.item}</td>
            <td>{item.orderQty}</td>
            <td>
              <input
                type="number"
                min="0"
                step="0.01"
                value={unitPrice}
                onChange={(e) => {
                  const value = e.target.value;
                  if (/^\d*\.?\d{0,2}$/.test(value)) {
                    setOrderToEdit((prev) => {
                      const updatedItems = [...prev.items];
                      updatedItems[index].editedPrice = value;
                      return { ...prev, items: updatedItems };
                    });
                  }
                }}
                className="UnitPriceInput"
              />
            </td>
            <td>{(item.orderQty * unitPrice).toFixed(2)}</td>
          </tr>
        );
      });

  return (
    <div className="RepDashboard">
      <RepSidebar isOpen={sidebarOpen} ref={sidebarRef} />
      <div className="RepDashboardContainer">
        <RepNavbar onMenuClick={toggleSidebar} />

        <div className="RepButtonsContainer">
          <div className="RepButton" onClick={handleAddOrderClick}>
            <img src={orderIcon} alt="Add Order" />
            <p>Add Order</p>
          </div>
          <div className="RepButton" onClick={handleAddReturnClick}>
            <img src={returnIcon} alt="Add Return" />
            <p>Add Return</p>
          </div>
        </div>

        {/* Return Type Modal */}
        {showReturnModal && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              background: "rgba(0, 0, 0, 0.5)",
              zIindex: 1999,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <div
              style={{
                backgroundColor: "white",
                borderRadius: "10px",
                padding: "20px",
                width: "60%",
                height: "80%",
                boxShadow: "0 5px 15px rgba(0,0,0,0.3)",
                textAlign: "center",
              }}
            >
              <h2 style={{ marginBottom: "20px", fontSize: "1.5rem" }}>
                Select Return Type
              </h2>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-around",
                  marginBottom: "20px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    cursor: "pointer",
                    padding: "10px",
                    borderRadius: "8px",
                    border: "1px solid #ccc",
                    width: "300px",
                  }}
                  onClick={() => handleReturnTypeSelect(true)}
                >
                  <img
                    src={GoodReturnIcon}
                    alt="Good Return"
                    style={{ width: "300px", height: "300px", marginBottom: "10px" }}
                  />
                  <p style={{ margin: 0, color: "GrayText", fontSize: "30px" }}>Good Return</p>
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    cursor: "pointer",
                    padding: "10px",
                    borderRadius: "8px",
                    border: "1px solid #ccc",
                    width: "300px",
                  }}
                  onClick={() => handleReturnTypeSelect(false)}
                >
                  <img
                    src={BadReturnIcon}
                    alt="Bad Return"
                    style={{ width: "300px", height: "300px", marginBottom: "10px" }}
                  />
                  <p style={{ margin: 0, color: "GrayText", fontSize: "30px" }}>Bad Return</p>
                </div>
              </div>
              <div>
                <button
                  style={{
                    backgroundColor: "#ccc",
                    padding: "10px 20px",
                    border: "none",
                    borderRadius: "5px",
                    cursor: "pointer",
                  }}
                  onClick={() => setShowReturnModal(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Shops Modal */}
        {showShopsModal && (
          <div className="ModalBackdrop">
            <div className="Modal">
              <h2 className="ModalTitle">Select Shop</h2>
              <div className="SearchInputWrapper">
                <input
                  type="text"
                  placeholder="Search Shops..."
                  value={searchShopTerm}
                  onChange={(e) => setSearchShopTerm(e.target.value)}
                  className="SearchInput"
                />
                <SearchIcon className="SearchIcon" />
              </div>
              <div className="ShopsGrid">{renderShopCards()}</div>
              <div className="ModalButtons">
                <button
                  className="CancelButton"
                  onClick={() => setShowShopsModal(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Items Modal */}
        {showItemsModal && (
          <div className="ModalBackdrop">
            <div className="Modal">
              <h2 className="ModalTitle">
                {isReturn ? "Select Return Items" : "Select Items"}
              </h2>
              <div className="SearchInputWrapper">
                <input
                  type="text"
                  placeholder="Search Items..."
                  value={searchItemTerm}
                  onChange={(e) => setSearchItemTerm(e.target.value)}
                  className="SearchInput"
                />
                <SearchIcon className="SearchIcon" />
              </div>
              <div className="DistributionStockGrid">{renderItemCards()}</div>
              <div className="ModalButtons">
                <button className="CancelButton" onClick={handleCancelOrder}>
                  Cancel
                </button>
                <button className="ConfirmButton" onClick={handleConfirmOrder}>
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Confirmed Order View */}
        {orderToEdit && (
          <div className="ModalBackdrop">
            <div className="Modal">
              <h2 className="ModalTitle">
                {orderToEdit.isReturn ? "Return Items" : "Order Items"}
              </h2>
              <h3 className="ModalSubTitle">
                {orderToEdit.shop?.shop_name}
                {orderToEdit.shop?.location &&
                  ` - ${orderToEdit.shop.location}`}
              </h3>
              <div className="ConfirmedOrderTableContainer">
                <table className="ConfirmedOrderTable">
                  <thead>
                    <tr>
                      <th>Item</th>
                      <th>Quantity</th>
                      <th>Unit Price (LKR)</th>
                      <th>Total (LKR)</th>
                    </tr>
                  </thead>
                  <tbody>{renderOrderItems()}</tbody>
                  <tfoot>
                    <tr>
                      <td>Total Items: {orderToEdit.items.length}</td>
                      <td>
                        Total Units:{" "}
                        {orderToEdit.items.reduce(
                          (sum, item) => sum + Number(item.orderQty),
                          0
                        )}
                      </td>
                      <td>
                        {orderToEdit.isReturn
                          ? "Return Difference"
                          : "Item Discounts"}
                        :{" "}
                        {orderToEdit.items
                          .reduce((sum, item) => {
                            const originalPrice = parseFloat(item.unitPrice);
                            const editedPrice =
                              item.editedPrice !== undefined
                                ? parseFloat(item.editedPrice)
                                : originalPrice;
                            return (
                              sum +
                              (originalPrice - editedPrice) * item.orderQty
                            );
                          }, 0)
                          .toFixed(2)}
                      </td>
                      <td>
                        Sub Total:{" "}
                        {orderToEdit.items
                          .reduce((sum, item) => {
                            const price =
                              item.editedPrice !== undefined
                                ? parseFloat(item.editedPrice)
                                : parseFloat(item.unitPrice);
                            return sum + item.orderQty * price;
                          }, 0)
                          .toFixed(2)}
                      </td>
                    </tr>
                    {!orderToEdit.isReturn && (
                      <tr>
                        <td colSpan="2">
                          <label>Order Discount:</label>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={totalOrderDiscount}
                            onChange={(e) => {
                              const value = e.target.value;
                              if (/^\d*\.?\d{0,2}$/.test(value)) {
                                setTotalOrderDiscount(value);
                              }
                            }}
                            className="DiscountInput"
                          />
                        </td>
                        <td>
                          Total Discount:{" "}
                          {calculateTotals().totalDiscount.toFixed(2)}
                        </td>
                        <td>
                          <strong>Grand Total:</strong>{" "}
                          {calculateTotals().grandTotal.toFixed(2)}
                        </td>
                      </tr>
                    )}
                  </tfoot>
                </table>
              </div>
              <div className="ModalButtons">
                <button
                  className="CancelButton"
                  onClick={() => setOrderToEdit(null)}
                >
                  Cancel
                </button>
                <button className="EditButton" onClick={handleEditOrder}>
                  Edit {orderToEdit.isReturn ? "Return" : "Order"}
                </button>
                <button
                  className="GenerateInvoice"
                  onClick={handleGenerateInvoice}
                >
                  Generate Invoice
                </button>
              </div>
            </div>
          </div>
        )}

        {showPopup && invoiceData && (
          <div className="ModalBackdrop">
            <div className="Modal">
              <div className="invoice-content" ref={invoiceRef}>
                <div className="invoice-header">
                  <img src={logo} alt="invoice-logo" className="invoice-logo" />
                  <div>
                    <h2>{invoiceData.shop.shop_name}</h2>
                    <p>{invoiceData.date}</p>
                  </div>
                  <div className="invoice-number">
                    <h2>{invoiceData.isReturn ? "Return Invoice" : "Order Invoice"}</h2>
                    <p>#{Math.floor(Math.random() * 10000).toString().padStart(4, '0')}</p>
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
                    {invoiceData.items.map((item, index) => (
                      <tr key={index}>
                        <td>{item.item}</td>
                        <td>{item.quantity}</td>
                        <td>Rs. {item.unitPrice.toFixed(2)}</td>
                        <td>Rs. {(item.quantity * item.unitPrice).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="invoice-total">
                  <p>Sub Total: Rs. {invoiceData.subtotal.toFixed(2)}</p>
                  <p>Discount: Rs. {invoiceData.discount.toFixed(2)}</p>
                  <p>
                    <strong>Total: Rs. {invoiceData.total.toFixed(2)}</strong>
                  </p>
                </div>
              </div>
              <div className="InModalButtons">
                <button 
                  className="PrintButton" 
                  onClick={handlePrint}
                >
                  Print Invoice
                </button>
                <button 
                  className="close-btn" 
                  onClick={() => {
                    setShowPopup(false);
                    setInvoiceData(null);
                    setOrderToEdit(null); // Also clear the order
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RepDashboard;

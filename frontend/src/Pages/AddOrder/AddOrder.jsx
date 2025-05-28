import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import StoreFrontIcon from "@mui/icons-material/Store";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import SearchIcon from "@mui/icons-material/Search";
import "./AddOrder.css";
import api from "../../api/axios";
import logo from "../../assets/YM.png";
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

const AddOrder = () => {
  const [shops, setShops] = useState([]);
  const [items, setItems] = useState([]);
  const [selectedShop, setSelectedShop] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);
  const [totalOrderDiscount, setTotalOrderDiscount] = useState(0);
  const [returnBalance, setReturnBalance] = useState(0);
  const [searchShopTerm, setSearchShopTerm] = useState("");
  const [searchItemTerm, setSearchItemTerm] = useState("");
  const [isLoadingItems, setIsLoadingItems] = useState(false);
  const [itemsError, setItemsError] = useState(null);
  const [orderToEdit, setOrderToEdit] = useState(null);
  const [showShopsModal, setShowShopsModal] = useState(true);
  const [showItemsModal, setShowItemsModal] = useState(false);

  const [showPopup, setShowPopup] = useState(false);
  const [invoiceData, setInvoiceData] = useState(null);
  const invoiceRef = useRef();

  const navigate = useNavigate();

  // Fetch shops data
  useEffect(() => {
    const fetchShops = async () => {
      try {
        const token = localStorage.getItem('admin_token');
        const response = await api.get("/shops", {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        });
        setShops(response.data);
      } catch (error) {
        console.error("Error fetching shops:", error);
      }
    };
    fetchShops();
  }, []);

  // Fetch items when shop is selected
  useEffect(() => {
    const fetchItems = async () => {
      try {
        setIsLoadingItems(true);
        setItemsError(null);
        const response = await api.get("/items", {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
          }
        });
        setItems(response.data.map(item => ({
          ...item,
          id: item.id || item._id,
          item: item.item || item.name,
          unitPrice: item.unitPrice || item.price,
          quantity: item.quantity || item.stock
        })));
      } catch (error) {
        setItemsError(error.response?.data?.message || "Failed to load items");
        console.error("Items fetch error:", error);
      } finally {
        setIsLoadingItems(false);
      }
    };
    
    if (selectedShop && showItemsModal) {
      fetchItems();
    }
  }, [selectedShop, showItemsModal]);

  // Handle shop selection
  const handleShopSelect = async (shop) => {
    setSelectedShop(shop);
    try {
      const response = await api.get(`/returns/${shop.id}/balance`);
      setReturnBalance(response.data.return_balance || 0);
    } catch (error) {
      console.error("Error fetching return balance", error);
      setReturnBalance(0);
    }
    setShowShopsModal(false);
    setSearchShopTerm("");
    setShowItemsModal(true);
  };

  // Handle item selection
  const handleItemSelect = (item) => {
    setSelectedItems([
      ...selectedItems,
      { item: item, orderQty: 1, unitPrice: item.unitPrice },
    ]);
  };

  // Update item quantity
  const updateItemQuantity = (itemId, quantity) => {
    setSelectedItems((prev) =>
      prev.map((i) => (i.item.id === itemId ? { ...i, orderQty: quantity } : i))
    );
  };

  // Remove selected item
  const removeSelectedItem = (itemId) => {
    setSelectedItems((prev) => prev.filter((i) => i.item.id !== itemId));
  };

  // Cancel order
  const handleCancelOrder = () => {
    setSelectedItems([]);
    setSelectedShop(null);
    setShowItemsModal(false);
    setSearchItemTerm("");
    setTotalOrderDiscount(0);
    navigate(-1); // Go back to previous page
  };

  // Confirm order
  const handleConfirmOrder = () => {
    const confirmedOrder = {
      shop: selectedShop,
      items: selectedItems,
      isReturn: false, // This is for orders, not returns
    };
    setOrderToEdit(confirmedOrder);
    setShowItemsModal(false);
    setSearchItemTerm("");
  };

  // Edit order
  const handleEditOrder = () => {
    if (orderToEdit) {
      setSelectedShop(orderToEdit.shop);
      setSelectedItems(orderToEdit.items);
      setShowItemsModal(true);
      setOrderToEdit(null);
    }
  };

  const getReturnValue = async (shopId) => {
    try {
      const response = await api.get(`/shops/${shopId}`, {
        withCredentials: true,
      });
      return response.data.return_balance || 0; // Now using shop's balance
    } catch (error) {
      console.error(error);
      return 0;
    }
  };

  // Generate and submit order
  const handleGenerateOrder = async () => {
    try {
      const username = localStorage.getItem("username");
      const userToken = localStorage.getItem("admin_token");

      // Calculate totals
      const subTotal = orderToEdit.items.reduce(
        (sum, item) => sum + (item.editedPrice || item.unitPrice) * item.orderQty,
        0
      );

      const itemDiscount = orderToEdit.items.reduce((sum, item) => {
        const originalPrice = parseFloat(item.unitPrice);
        const editedPrice = item.editedPrice !== undefined && item.editedPrice !== "" 
          ? parseFloat(item.editedPrice) 
          : originalPrice;
        return sum + (originalPrice - editedPrice) * item.orderQty;
      }, 0);

      const orderDiscount = parseFloat(totalOrderDiscount) || 0;
      const totalDiscount = itemDiscount + orderDiscount;

      const currentReturnBalance = await getReturnValue(orderToEdit.shop.id);

      // Calculate return balance to use
      const amountAfterDiscounts = subTotal - orderDiscount;
      const returnBalanceToUse = Math.min(
        currentReturnBalance,
        amountAfterDiscounts
      );

      const grandTotal = Math.max(0, amountAfterDiscounts - returnBalanceToUse);

      const invoiceData = {
        shop: orderToEdit.shop,
        date: new Date().toLocaleDateString(),
        isReturn: orderToEdit.isReturn,
        items: orderToEdit.items.map(item => ({
          item: item.item.item,
          quantity: item.orderQty,
          unitPrice: item.editedPrice || item.unitPrice
        })),
        subTotal: subTotal,
        discount: orderDiscount,
        returnBalanceUsed: returnBalanceToUse,
        grandTotal: grandTotal
      };
      setInvoiceData(invoiceData);
      setShowPopup(true);

      // Prepare order data
      const orderData = {
        shop_id: orderToEdit.shop.id,
        total_price: grandTotal.toFixed(2),
        items: orderToEdit.items.map((item) => ({
          item_id: item.item.id,
          quantity: item.orderQty,
          item_expenses: parseFloat(item.editedPrice || item.unitPrice).toFixed(2)
        })),
        user_name: username,
        discount: totalDiscount.toFixed(2),
        return_balance_used: returnBalanceToUse.toFixed(2)
      };

      // Submit order
      const response = await api.post("/orders", orderData, {
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": `Bearer ${userToken}`
        }
      });

      console.log("Order created:", response.data);
      alert("Order created successfully!");
    } catch (error) {
      console.error("Error creating order:", error);
      alert(`Error: ${error.response?.data?.message || error.message}`);
    }
  };

  const handlePrint = () => {
    if (invoiceRef.current) {
      html2canvas(invoiceRef.current).then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF();
        const imgProps = pdf.getImageProperties(imgData);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
        
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save('invoice.pdf');
      });
    }
  };

  return (
    <div className="AddOrderContainer">
      {/* Shops Modal */}
      {showShopsModal && (
        <div className="ModalBackdrop">
          <div className="Modal">
            <h2 className="ModalTitle">Select Shop</h2>
            <div className="SearchInputWrapper">
              <input
                type="text"
                className="SearchInput"
                placeholder="Search Shops..."
                value={searchShopTerm}
                onChange={(e) => setSearchShopTerm(e.target.value)}
              />
              <SearchIcon className="SearchIcon" />
            </div>
            <div className="ScrollableContent">
              <div className="ShopsGrid">
                {[...shops]
                  .filter((shop) =>
                    shop.shop_name
                      .toLowerCase()
                      .includes(searchShopTerm.toLowerCase())
                  )
                  .sort((a, b) => a.shop_name.localeCompare(b.shop_name))
                  .map((shop, index) => (
                    <div
                      key={index}
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
                  ))}
              </div>
            </div>
            <div className="ModalButtons">
              <button
                className="CancelButton"
                onClick={() => navigate(-1)}
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
            <h2 className="ModalTitle">Select Items</h2>
            <div className="SearchInputWrapper">
              <input
                type="text"
                className="SearchInput"
                placeholder="Search Items..."
                value={searchItemTerm}
                onChange={(e) => setSearchItemTerm(e.target.value)}
              />
              <SearchIcon className="SearchIcon" />
            </div>
            <div className="ScrollableContent">
              {items.length > 0 ? (
                <div className="DistributionStockGrid">
                  {items
                    .filter((item) =>
                      item.item.toLowerCase().includes(searchItemTerm.toLowerCase())
                    )
                    .sort((a, b) => a.item.localeCompare(b.item))
                    .map((item, index) => {
                      const selected = selectedItems.find((i) => i.item.id === item.id);
                      return (
                        <div key={index} className="DistributionItemCard">
                          <h2 className="CardTitle">{item.item}</h2>
                          <div className="DistributionItemCardMiddle">
                            <ShoppingCartIcon className="DistributionItemCardIcon" />
                            <div className="DistributionItemCardDetails">
                              <span><strong>Price (LKR): </strong>{item.unitPrice}</span>
                              <span><strong>In Stock: </strong>{item.quantity}</span>
                              {selected ? (
                                <div className="SelectedItemControl">
                                  <input
                                    type="number"
                                    min="1"
                                    className="QtyInput"
                                    value={selected.orderQty}
                                    onChange={(e) => {
                                      const qty = parseInt(e.target.value, 10);
                                      updateItemQuantity(item.id, isNaN(qty) ? "" : qty);
                                    }}
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
                    })
                  }
                </div>
              ) : (
                <div className="NoItemsMessage">
                  {isLoadingItems ? 'Loading items...' : 'No items found'}
                </div>
              )}
            </div>
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

      {/* Order Confirmation View */}
      {orderToEdit && (
        <div className="ModalBackdrop">
          <div className="Modal">
            <h2 className="ModalTitle">Order Items</h2>
            <h3 className="ModalSubTitle">
              {orderToEdit.shop?.shop_name}
              {orderToEdit.shop.location ? ` - ${orderToEdit.shop.location}` : ""}
            </h3>
            <div className="ScrollableContent">
              <table className="ConfirmedOrderTable">
                <colgroup>
                  <col style={{ width: "28%" }} />
                  <col style={{ width: "22%" }} />
                  <col style={{ width: "25%" }} />
                  <col style={{ width: "25%" }} />
                </colgroup>
                <thead>
                  <tr>
                    <th>Item</th>
                    <th className="QuantityHeader">Quantity</th>
                    <th>Unit Price (LKR)</th>
                    <th>Total (LKR)</th>
                  </tr>
                </thead>
                <tbody>
                  {[...orderToEdit.items]
                    .sort((a, b) => a.item.item.localeCompare(b.item.item))
                    .map((selectedItem, index) => (
                      <tr key={index}>
                        <td>{selectedItem.item.item}</td>
                        <td>{selectedItem.orderQty}</td>
                        <td>
                          <input
                            type="number"
                            min="0"
                            value={
                              selectedItem.editedPrice !== undefined
                                ? selectedItem.editedPrice
                                : selectedItem.unitPrice
                            }
                            onChange={(e) => {
                              const value = e.target.value;
                              if (value === "") {
                                setOrderToEdit((prev) => {
                                  const updatedItems = [...prev.items];
                                  updatedItems[index].editedPrice = "";
                                  return { ...prev, items: updatedItems };
                                });
                                return;
                              }
                              const regex = /^\d*\.?\d{0,2}$/;
                              if (regex.test(value)) {
                                setOrderToEdit((prev) => {
                                  const updatedItems = [...prev.items];
                                  updatedItems[index].editedPrice = value;
                                  return { ...prev, items: updatedItems };
                                });
                              }
                            }}
                            onBlur={() => {
                              setOrderToEdit((prev) => {
                                const updatedItems = [...prev.items];
                                const currentEdited = updatedItems[index].editedPrice;
                                if (currentEdited === "" || currentEdited === undefined) {
                                  updatedItems[index].editedPrice = undefined;
                                } else {
                                  const val = parseFloat(currentEdited);
                                  updatedItems[index].editedPrice = isNaN(val)
                                    ? ""
                                    : val.toFixed(2);
                                }
                                return { ...prev, items: updatedItems };
                              });
                            }}
                            className="UnitPriceInput"
                          />
                        </td>
                        <td>
                          {(() => {
                            const unitPrice =
                              selectedItem.editedPrice !== undefined &&
                              selectedItem.editedPrice !== ""
                                ? parseFloat(selectedItem.editedPrice)
                                : parseFloat(selectedItem.unitPrice);
                            return (selectedItem.orderQty * unitPrice).toFixed(2);
                          })()}
                        </td>
                      </tr>
                    ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td>Total Items: {orderToEdit.items.length}</td>
                    <td>
                      Total Units:{" "}
                      {orderToEdit.items.reduce(
                        (sum, item) => sum + Number(item.orderQty || 0),
                        0
                      )}
                    </td>
                    <td>
                      Item Discounts:{" "}
                      {orderToEdit.items
                        .reduce((sum, item) => {
                          const originalPrice = item.unitPrice;
                          const editedUnitPrice = item.editedPrice || originalPrice;
                          const priceDifference = originalPrice - editedUnitPrice;
                          const itemDifference = priceDifference * item.orderQty;
                          return sum + itemDifference;
                        }, 0)
                        .toFixed(2)}
                    </td>
                    <td>
                      Sub Total:{" "}
                      {orderToEdit.items
                        .reduce((sum, item) => {
                          const unitPrice =
                            item.editedPrice !== undefined &&
                            item.editedPrice !== ""
                              ? parseFloat(item.editedPrice)
                              : parseFloat(item.unitPrice);
                          return sum + item.orderQty * unitPrice;
                        }, 0)
                        .toFixed(2)}
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <label>Order Discount:</label>
                      <input
                        type="text"
                        inputMode="decimal"
                        value={totalOrderDiscount}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (value === "") {
                            setTotalOrderDiscount("");
                            return;
                          }
                          const regex = /^\d*\.?\d{0,2}$/;
                          if (regex.test(value)) {
                            setTotalOrderDiscount(value);
                          }
                        }}
                        onBlur={() => {
                          if (totalOrderDiscount !== "") {
                            const parsed = parseFloat(totalOrderDiscount);
                            if (!isNaN(parsed)) {
                              setTotalOrderDiscount(parsed.toFixed(2));
                            }
                          }
                        }}
                        placeholder="0.00"
                        className="DiscountInput"
                      />
                    </td>
                    <td>
                      <label>Total Discount: </label>
                      {(() => {
                        const itemDiscount = orderToEdit.items.reduce(
                          (sum, item) => {
                            const originalPrice = parseFloat(item.unitPrice);
                            const editedPrice =
                              item.editedPrice !== undefined &&
                              item.editedPrice !== ""
                                ? parseFloat(item.editedPrice)
                                : originalPrice;
                            return (
                              sum +
                              (originalPrice - editedPrice) * item.orderQty
                            );
                          },
                          0
                        );
                        const orderDiscount = parseFloat(totalOrderDiscount || 0);
                        return (itemDiscount + orderDiscount).toFixed(2);
                      })()}
                    </td>
                    <td colSpan={2}>
                      <strong>Grand Total:</strong>{" "}
                      {(
                        (orderToEdit?.items?.reduce((sum, item) => {
                          const unitPrice =
                            item.editedPrice !== undefined &&
                            item.editedPrice !== ""
                              ? parseFloat(item.editedPrice)
                              : parseFloat(item.unitPrice);
                          return sum + item.orderQty * unitPrice;
                        }, 0) || 0) - (parseFloat(totalOrderDiscount) || 0)
                      ).toFixed(2)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
            <div className="ModalButtons">
              <button
                className="CancelButton"
                onClick={() => {setOrderToEdit(null), navigate('/adminOrders')}}
              >
                Cancel
              </button>
              <button className="EditButton" onClick={handleEditOrder}>
                Edit Order
              </button>
              <button
                className="GenerateInvoice"
                onClick={handleGenerateOrder}
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
                  <p>{invoiceData.shop.location}</p>
                </div>
                <div className="invoice-number">
                  <h2>{invoiceData.isReturn ? "Return Invoice" : "Order Invoice"}</h2>
                  <p>#{Math.floor(Math.random() * 10000).toString().padStart(4, '0')}</p>
                </div>
              </div>
              
              <table className="invoice-table">
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
                      <td>Rs. {Number(item.unitPrice).toFixed(2)}</td>
                      <td>Rs. {(item.quantity * item.unitPrice).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              <div className="invoice-summary">
                <div className="invoice-total">
                  <p>Sub Total: Rs. {Number(invoiceData.subTotal).toFixed(2)}</p>
                  {!invoiceData.isReturn && (
                    <p>Discount: Rs. {Number(invoiceData.discount).toFixed(2)}</p>
                  )}
                  {!invoiceData.isReturn && (
                    <p>Return Balance Applied: Rs. {Number(invoiceData.returnBalanceUsed).toFixed(2)}</p>
                  )}
                  {!invoiceData.isReturn && (
                    <p className="grand-total">
                      <strong>Grand Total: Rs. {Number(invoiceData.grandTotal).toFixed(2)}</strong>
                    </p>
                  )}
                </div>
              </div>
            </div>
            
            <div className="invoice-actions">
              <button className="PrintButton" onClick={handlePrint}>
                Print Invoice
              </button>
              <button className="close-btn" onClick={() => {
                setShowPopup(false);
                setInvoiceData(null);
                navigate('/adminOrders');
              }}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddOrder;
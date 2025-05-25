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
import api from '../../../api/axios';
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
  const [editingOrderId, setEditingOrderId] = useState(null);
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

  const [isLoadingItems, setIsLoadingItems] = useState(false);
  const [itemsError, setItemsError] = useState(null);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Close sidebar when clicking outside
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

  //fetch shops
  useEffect(() => {
    const fetchShops = async () => {
      try {
        const token = localStorage.getItem('admin_token'); // or your token key
        const response = await api.get("/shops", {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        });
        setShops(response.data);
      } catch (error) {
        console.error("Error:", error.response?.data || error.message);
      }
    };
    fetchShops();
  }, []);

  //fetch items
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
          // Ensure these fields exist
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
    
    // Only fetch items if we have a selected shop and items modal is open
    if (selectedShop && showItemsModal) {
      fetchItems();
    }
  }, [selectedShop, showItemsModal]); // Add dependencies

  const handleAddOrderClick = () => {
    setIsReturn(false);
    setTotalOrderDiscount(0);
    setShowShopsModal(true);
  };

  const handleAddReturnClick = () => {
    setIsReturn(true);
    setShowReturnModal(true);
  };

  const handleAddGoodReturnClick = () => {
    setShowReturnModal(false);
    setShowShopsModal(true);
    setIsGood(true);
  };

  const handleAddBadReturnClick = () => {
    setShowReturnModal(false);
    setShowShopsModal(true);
    setIsGood(false);
  };

  // Modify the handleShopSelect function to fetch return balance
  const handleShopSelect = async (shop) => {
    console.log("Shop selected:", shop);
    setSelectedShop(shop);
    try {
      console.log("Fetching return balance for shop:", shop.id);
      const response = await api.get(`/returns/${shop.id}/balance`); // Fixed: using shop.id
      console.log("Return balance response:", response.data);
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
    setSelectedItems([
      ...selectedItems,
      { item: item, orderQty: 1, unitPrice: item.unitPrice },
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
    setEditingOrderId(null);
    setTotalOrderDiscount(0);
  };

  const handleConfirmOrder = () => {
    const confirmedOrder = {
      shop: selectedShop,
      items: selectedItems,
      isReturn: isReturn,
      isGood: isGood,
    };

    setOrderToEdit(confirmedOrder); // Show confirmed view
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
      setEditingOrderId(orderToEdit.id || null); // Add this line
      setShowItemsModal(true);
      setOrderToEdit(null);
    }
  };

  const username = localStorage.getItem("username");
  const userToken = localStorage.getItem("admin_token");

  const checkAdjustedOrderCost = async (shopId, orderAmount) => {
    try {
      if (shopId != null) {
        const response = await api.get(
          `/calculate-order-cost/${shopId}/${orderAmount}`,
          { withCredentials: true }
        );
        return response.data.return_balance ?? orderAmount;
      }
    } catch (error) {
      console.error("Error fetching order cost", error);
      return orderAmount;
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

  const updateReturnBalance = async (shopId, returnValue) => {
    try {
      const response = await api.put(
        `/shops/${shopId}/return-balance`,
        { return_balance: returnValue },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userToken}`,
          },
          withCredentials: true,
        }
      );
      return response.data;
    } catch (error) {
      alert(error);
    }
  };

  const handleGenerateInvoice = async () => {
    try {
      // Calculate the total price from selected items
      const subTotal = orderToEdit.items.reduce(
        (sum, item) => sum + (item.editedPrice || item.unitPrice) * item.orderQty,
        0
      );

      // Calculate item discounts
      const itemDiscount = orderToEdit.items.reduce((sum, item) => {
        const originalPrice = parseFloat(item.unitPrice);
        const editedPrice = item.editedPrice !== undefined && item.editedPrice !== "" 
          ? parseFloat(item.editedPrice) 
          : originalPrice;
        return sum + (originalPrice - editedPrice) * item.orderQty;
      }, 0);

      // Calculate order discount
      const orderDiscount = parseFloat(totalOrderDiscount) || 0;
      const totalDiscount = itemDiscount + orderDiscount;

      const currentReturnBalance = await getReturnValue(orderToEdit.shop.id);

      // Calculate how much return balance we can use
      // It cannot exceed either the available balance or the order amount after discounts
      const amountAfterDiscounts = subTotal - orderDiscount;
      const returnBalanceToUse = Math.min(
        currentReturnBalance,
        amountAfterDiscounts
      );

      // Calculate final amount to pay
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

      if (orderToEdit.isReturn) {
        // Handle return creation
        const returnRecord = {
          shop_id: orderToEdit.shop.id,
          type: orderToEdit.isGood ? "good" : "bad",
          return_cost: subTotal.toFixed(2),
          rep_name: username,
          items: orderToEdit.items.map((item) => ({
            item_id: item.item.id,
            quantity: item.orderQty,
            unit_price: parseFloat(item.editedPrice || item.unitPrice).toFixed(2)
          })),
        };

        console.log("Submitting return:", returnRecord);
        const response = await api.post("/returns", returnRecord, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userToken}`,
          },
        });

        if (response.data) {
          alert("Return created successfully!");
          setOrderToEdit(null);
        }
      } else {
        // Handle order creation
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
          return_balance_used: returnBalanceToUse.toFixed(2) // This is crucial
        };

        console.log("Submitting order:", orderData); // Debug log
        const response = await api.post("/orders", orderData, {
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
            "Authorization": `Bearer ${userToken}`
          }
        });

        console.log("Order created:", response.data);

        // Refresh the return balance after successful order submission
        try {
          const balanceResponse = await api.get(`/returns/${orderToEdit.shop.id}/balance`);
          setReturnBalance(balanceResponse.data.return_balance || 0);
          console.log("Updated return balance:", balanceResponse.data.return_balance);
        } catch (balanceError) {
          console.error("Failed to refresh return balance:", balanceError);
        }

        setOrderToEdit(null);
        alert("Order created successfully!");
      }
    } catch (error) {
      console.error("Error creating order:", {
        message: error.message,
        response: error.response?.data,
        stack: error.stack,
      });

      if (error.response?.status === 422) {
        alert(`Validation errors:\n${JSON.stringify(error.response.data.errors, null, 2)}`);
      } else if (error.response) {
        alert(`Server error: ${error.response.data.message || error.response.statusText}`);
      } else if (error.request) {
        alert("Network error - no response received");
      } else {
        alert(`Error: ${error.message}`);
      }
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
          <div className="ModalBackdrop">
            <div className="Modal">
              <h2 className="ModalTitle">Select Return Type</h2>
              <div className="ScrollableContent">
                <div className="ReturnButtonsContainer">
                  <div
                    className="ReturnButton"
                    onClick={handleAddGoodReturnClick}
                  >
                    <img src={GoodReturnIcon} alt="Good Return" />
                    <p>Good Return</p>
                  </div>
                  <div
                    className="ReturnButton"
                    onClick={handleAddBadReturnClick}
                  >
                    <img src={BadReturnIcon} alt="Bad Return" />
                    <p>Bad Return</p>
                  </div>
                </div>
              </div>
              <div className="ModalButtons">
                <button
                  className="CancelButton"
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
                  {editingOrderId ? "Update" : isReturn ? "Confirm" : "Confirm"}
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
                {orderToEdit.shop.location
                  ? ` - ${orderToEdit.shop.location}`
                  : ""}
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
                              } // Show editedPrice if available, else fallback to original unitPrice
                              onChange={(e) => {
                                const value = e.target.value;
                                // Allow empty input (clear the field)
                                if (value === "") {
                                  setOrderToEdit((prev) => {
                                    const updatedItems = [...prev.items];
                                    updatedItems[index].editedPrice = ""; // Set to empty if cleared
                                    return { ...prev, items: updatedItems };
                                  });
                                  return;
                                }
                                // Validate and allow numbers with up to 2 decimals
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
                                  const currentEdited =
                                    updatedItems[index].editedPrice;
                                  // If the field is empty, fallback to original price
                                  if (
                                    currentEdited === "" ||
                                    currentEdited === undefined
                                  ) {
                                    updatedItems[index].editedPrice = undefined; // This will allow the input to fallback to unitPrice
                                  } else {
                                    const val = parseFloat(currentEdited);
                                    updatedItems[index].editedPrice = isNaN(val)
                                      ? ""
                                      : val.toFixed(2); // Ensure two decimal points
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
                              return (
                                selectedItem.orderQty * unitPrice
                              ).toFixed(2);
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
                      {!orderToEdit.isReturn && (
                        <td>
                          Item Discounts:{" "}
                          {orderToEdit.items
                            .reduce((sum, item) => {
                              const originalPrice = item.unitPrice; // The original price from the inventory
                              const editedUnitPrice =
                                item.editedPrice || originalPrice; // The price entered by the user
                              const priceDifference =
                                originalPrice - editedUnitPrice; // Difference between original and edited price
                              const itemDifference =
                                priceDifference * item.orderQty; // Difference for this item based on quantity
                              return sum + itemDifference;
                            }, 0)
                            .toFixed(2)}
                        </td>
                      )}
                      <td colSpan={orderToEdit.isReturn ? 2 : 1}>
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
                      {orderToEdit.isReturn ? (
                        <td colSpan="4">
                          <strong>Grand Total:</strong>{" "}
                          {orderToEdit?.items?.reduce((sum, item) => {
                            const unitPrice =
                              item.editedPrice !== undefined && item.editedPrice !== ""
                                ? parseFloat(item.editedPrice)
                                : parseFloat(item.unitPrice);
                            return sum + item.orderQty * unitPrice;
                          }, 0).toFixed(2)}
                        </td>
                      ) : (
                        <>
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
                                    item.editedPrice !== undefined && item.editedPrice !== ""
                                      ? parseFloat(item.editedPrice)
                                      : originalPrice;
                                  return sum + (originalPrice - editedPrice) * item.orderQty;
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
                              orderToEdit?.items?.reduce((sum, item) => {
                                const unitPrice =
                                  item.editedPrice !== undefined && item.editedPrice !== ""
                                    ? parseFloat(item.editedPrice)
                                    : parseFloat(item.unitPrice);
                                return sum + item.orderQty * unitPrice;
                              }, 0) - (parseFloat(totalOrderDiscount) || 0)
                            ).toFixed(2)}
                          </td>
                        </>
                      )}
                    </tr>
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
              }}>
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
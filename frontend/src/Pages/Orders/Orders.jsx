import React, { useState, useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import Sidebar from "../../components/Sidebar/AdminSidebar/AdminSidebar";
import Navbar from "../../components/AdminNavbar/AdminNavbar";
import StoreFrontIcon from "@mui/icons-material/Store";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import "./Orders.css";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import logo from "../../assets/YMlogo.PNG";
import api from '../../api/axios';

const Orders = () => {
  // State management
  const [orders, setOrders] = useState([]);
  const [shops, setShops] = useState([]);
  const [items, setItems] = useState([]);
  const [viewingOrder, setViewingOrder] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [showShopsModal, setShowShopsModal] = useState(false);
  const [showItemsModal, setShowItemsModal] = useState(false);
  const [selectedShop, setSelectedShop] = useState(null);
  const [afterShopSelected, setAfterShopSelected] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [orderToEdit, setOrderToEdit] = useState(null);
  const [editingOrderId, setEditingOrderId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const invoiceRef = useRef();
  const navigate = useNavigate();
  const ordersPerPage = 5;
  const userToken = localStorage.getItem("admin_token");
  const loggedUser = localStorage.getItem("username");

  // Fetch all data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        const [ordersRes, shopsRes, itemsRes] = await Promise.all([
          api.get('/orders'),
          api.get('/shops'),
          api.get('/items')
        ]);

        const filterOrders = ordersRes.data.filter(
          order => order.status === "Pending" || order.status === "PENDING"
        );

        setOrders(filterOrders);
        setShops(shopsRes.data);
        setItems(itemsRes.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.response?.data?.message || 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // View order details
  const handleViewOrder = async (order) => {
    try {
      const response = await api.get(`/orders/${order.id}/items`);
      if (response.data.items?.length > 0) {
        setViewingOrder(response.data);
      }
    } catch (error) {
      console.error("Error fetching order items:", error);
    }
  };

  // Update order status
  const handleStatusChange = async (id, newStatus) => {
    try {
      if (newStatus === "Accepted") {
        await api.put(`/orders/${id}/status`, { status: newStatus });
        setOrders(orders.map(order => 
          order.id === id ? { ...order, status: newStatus } : order
        ));
      } else if (newStatus === "Cancelled") {
        await api.put(`/orders/${id}/status`, { status: newStatus });
        setOrders(orders.map(order => 
          order.id === id ? { ...order, status: newStatus } : order
        ));
      }
    } catch (error) {
      console.error("Error updating order status", error);
    }
  };

  // Shop selection
  const handleShopSelect = (shop) => {
    setSelectedShop(shop);
    setShowShopsModal(false);
    setShowItemsModal(true);
  };

  // Item selection
  const handleItemSelect = (item) => {
    if (!selectedItems.some(i => i.item === item.item)) {
      setSelectedItems([...selectedItems, { ...item, orderQty: 1 }]);
    }
  };

  const updateItemQuantity = (itemName, newQty) => {
    setSelectedItems(
      selectedItems.map(item =>
        item.item === itemName ? { ...item, orderQty: parseInt(newQty) || 0 } : item
      )
    );
  };

  const removeSelectedItem = (itemName) => {
    setSelectedItems(selectedItems.filter(item => item.item !== itemName));
  };

  // Confirm order
  const handleConfirmOrder = async () => {
    if (!selectedShop || selectedItems.length === 0) return;
    
    setAfterShopSelected(selectedShop);
    const totalOrderAmount = selectedItems.reduce(
      (sum, item) => sum + item.unitPrice * item.orderQty,
      0
    );

    try {
      const adjustedCost = await checkAdjustedOrderCost(
        selectedShop.id,
        totalOrderAmount
      );

      const orderData = {
        shop_id: selectedShop.id,
        user_name: loggedUser,
        status: "Pending",
        total_price: adjustedCost,
        items: selectedItems.map(item => ({
          item_id: item.id,
          quantity: item.orderQty,
          item_expenses: item.itemExpenses || 0,
        })),
      };

      if (editingOrderId) {
        const response = await api.put(`/orders/${editingOrderId}`, orderData);
        setOrders(orders.map(order => 
          order.id === editingOrderId ? response.data : order
        ));
        setOrderToEdit(response.data);
        setEditingOrderId(null);
      } else {
        const response = await api.post('/orders', orderData);
        setOrders([...orders, response.data]);
        setOrderToEdit(response.data);
      }

      setShowItemsModal(false);
      setSelectedShop(null);
      setSelectedItems([]);
    } catch (error) {
      console.error("Error saving order:", error);
    }
  };

  // Calculate adjusted cost
  const checkAdjustedOrderCost = async (shopId, orderAmount) => {
    try {
      const response = await api.get(
        `/calculate-order-cost/${shopId}/${orderAmount}`
      );
      return response.data.return_balance ?? orderAmount;
    } catch (error) {
      console.error("Error calculating order cost", error);
      return orderAmount;
    }
  };

  // Cancel order
  const handleCancelOrder = () => {
    if (editingOrderId) {
      const originalOrder = orders.find(order => order.id === editingOrderId);
      setOrderToEdit(originalOrder);
      setEditingOrderId(null);
    }
    setShowItemsModal(false);
    setSelectedShop(null);
    setSelectedItems([]);
  };

  // Edit order
  const handleEditOrder = () => {
    if (orderToEdit) {
      setAfterShopSelected({
        id: orderToEdit.shop_id,
        shopName: orderToEdit.shop,
      });
      setSelectedShop({ 
        id: orderToEdit.shop_id,
        shopName: orderToEdit.shop 
      });
      setSelectedItems(orderToEdit.items.map(item => ({
        ...item,
        orderQty: item.quantity
      })));
      setEditingOrderId(orderToEdit.id);
      setOrderToEdit(null);
      setShowItemsModal(true);
    }
  };

  // Pagination
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = orders.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages = Math.ceil(orders.length / ordersPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Invoice generation
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

  // Invoice calculations
  const subTotal = orderToEdit?.items?.reduce(
    (sum, item) => sum + (item.quantity * item.unitPrice),
    0
  ) || 0;
  const disCountPresentage = 10;
  const disCountAmount = (subTotal * disCountPresentage) / 100;
  const totalDue = subTotal - disCountAmount;

  return (
    <div className="Orders">
      <Sidebar />
      <div className="OrdersContainer">
        <Navbar />
        <div className="order-title">
          <h1>Orders</h1>
        </div>
        <div className="btn1">
          <Link to="/adminOrdersHistory">
            <button className="history-btn">History</button>
          </Link>
        </div>
        <div className="btn2">
          <button
            className="add-new-btn"
            onClick={() => navigate('/addOrder')}>
              Add Order
          </button>
        </div>

        {loading ? (
          <div className="loading">Loading orders...</div>
        ) : error ? (
          <div className="error">{error}</div>
        ) : (
          <div className="orders-table-container">
            <table className="tableO">
              <thead>
                <tr>
                  <th>Shop</th>
                  <th>Date</th>
                  <th>Rep Name</th>
                  <th>Status</th>
                  <th>Items</th>
                  <th className="text-center" colSpan="3">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {currentOrders.length > 0 ? (
                  currentOrders.map((order) => (
                    <tr key={order.id}>
                      <td>{order.shop_id}</td>
                      <td>{order.created_at}</td>
                      <td>{order.user_name}</td>
                      <td>{order.status}</td>
                      <td>
                        {order.items
                          ? order.items
                              .map((i) => `${i.item} (${i.quantity})`)
                              .join(", ")
                          : "—"}
                      </td>
                      <td>
                        <button
                          className="btn view-btn"
                          onClick={() => handleViewOrder(order)}
                        >
                          View
                        </button>
                      </td>
                      <td>
                        <button
                          className="btn accept-btn"
                          onClick={() => handleStatusChange(order.id, "Accepted")}
                        >
                          Accept
                        </button>
                      </td>
                      <td>
                        <button
                          className="btn cancel-btn"
                          onClick={() => handleStatusChange(order.id, "Cancelled")}
                        >
                          Cancel
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8">No Orders available</td>
                  </tr>
                )}
              </tbody>
            </table>

            <div className="pagination-container-O">
              <ul className="pagination-O">
                <li
                  className={`page-item-O ${currentPage === 1 ? "disabled" : ""}`}
                >
                  <button
                    className="page-link"
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    &lt;
                  </button>
                </li>
                {[...Array(totalPages).keys()].map((number) => (
                  <li
                    key={number + 1}
                    className={`page-item ${
                      currentPage === number + 1 ? "active" : ""
                    }`}
                  >
                    <button
                      className="page-link-O"
                      onClick={() => paginate(number + 1)}
                    >
                      {number + 1}
                    </button>
                  </li>
                ))}
                <li
                  className={`page-item-O ${
                    currentPage === totalPages ? "disabled" : ""
                  }`}
                >
                  <button
                    className="page-link-O"
                    onClick={() => paginate(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    &gt;
                  </button>
                </li>
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* View Order Popup */}
      {viewingOrder && (
        <div className="ModalBackdrop">
          <div className="Modal">
            <h2>Order Details</h2>
            <div className="ScrollableContent">
              <div className="orderdetails">
                <div className="orderdetails1">
                  <p><strong>Date:</strong> {viewingOrder.created_at}</p>
                  <p><strong>Rep Name:</strong> {viewingOrder.user_name}</p>
                </div>
                <div className="orderdetails2">
                  <p><strong>Shop Name:</strong> {viewingOrder.shop}</p>
                  <p><strong>Total Amount:</strong> Rs.{viewingOrder.total_price}</p>
                </div>
              </div>

              <table className="customtable">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Qty</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {viewingOrder.items.map((item, index) => (
                    <tr key={index}>
                      <td>{item.item}</td>
                      <td>{item.quantity}</td>
                      <td>
                        {(item.quantity * parseFloat(item.unitPrice)).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="Action">
              <button onClick={() => setViewingOrder(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Shops Modal */}
      {showShopsModal && (
        <div className="ModalBackdrop">
          <div className="Modal">
            <h2>Select Shop</h2>
            <div className="ScrollableContent">
              <div className="ShopsGrid">
                {shops.map((shop) => (
                  <div
                    key={shop.id}
                    className="ShopCard"
                    onClick={() => handleShopSelect(shop)}
                  >
                    <h2>{shop.shop_name}</h2>
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
            <h2>Select Items for {selectedShop?.shop_name}</h2>
            <div className="ScrollableContent">
              <div className="DistributionStockGrid">
                {items.map((item) => {
                  const selected = selectedItems.find(
                    (i) => i.item === item.item
                  );
                  return (
                    <div key={item.id} className="DistributionItemCard">
                      <h2>{item.item}</h2>
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
                                max={item.quantity}
                                className="QtyInput"
                                value={selected.orderQty}
                                onChange={(e) =>
                                  updateItemQuantity(item.item, e.target.value)
                                }
                              />
                              <button
                                className="RemoveItemBtn"
                                title="Remove item"
                                onClick={() => removeSelectedItem(item.item)}
                              >
                                ×
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
                })}
              </div>
            </div>
            <div className="ModalButtons">
              <button className="CancelButton" onClick={handleCancelOrder}>
                Cancel
              </button>
              <button 
                className="ConfirmButton" 
                onClick={handleConfirmOrder}
                disabled={selectedItems.length === 0}
              >
                {editingOrderId ? "Update Order" : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmed Order View */}
      {orderToEdit && (
        <div className="ModalBackdrop">
          <div className="Modal">
            <div className="abc">
              <span className="order-number">Order</span>
            </div>
            <table className="confirmedOrderTable">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Qty</th>
                  <th>Unit Price</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {orderToEdit.items?.length > 0 ? (
                  orderToEdit.items.map((item) => (
                    <tr key={item.id}>
                      <td>{item.item}</td>
                      <td>{item.quantity}</td>
                      <td>{item.unitPrice}</td>
                      <td>{(item.quantity * item.unitPrice).toFixed(2)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4">No Items available</td>
                  </tr>
                )}
              </tbody>
            </table>
            <div className="Action">
              <button onClick={handleEditOrder}>Edit Order</button>
              <button onClick={handleGenerateInvoice}>Generate Invoice</button>
              <button onClick={() => setOrderToEdit(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Invoice Popup */}
      {showPopup && (
        <div className="ModalBackdrop">
          <div className="Modal">
            <div className="invoice-content" ref={invoiceRef}>
              <div className="invoice-header">
                <img src={logo} alt="Invoice Logo" className="invoice-logo" />
                <div>
                  <h2>{orderToEdit?.shop || "Shop Name"}</h2>
                  <p>{new Date().toLocaleDateString()}</p>
                </div>
                <div className="invoice-number">
                  <h2>Invoice</h2>
                  <p>#{orderToEdit?.id || "0000"}</p>
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
                  {currentInvoiceItems.map((item) => (
                    <tr key={item.id}>
                      <td>{item.item}</td>
                      <td>{item.quantity}</td>
                      <td>Rs. {item.unitPrice}</td>
                      <td>Rs. {(item.quantity * item.unitPrice).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="invoice-total">
                <p>Sub Total: Rs. {subTotal.toFixed(2)}</p>
                <p>Discount: {disCountPresentage}%</p>
                <p>
                  <strong>Total Due: Rs. {totalDue.toFixed(2)}</strong>
                </p>
              </div>
            </div>
            <div className="invoice-buttons">
              <button className="print-btn" onClick={handlePrint}>
                Print
              </button>
              <button className="close-btn" onClick={() => setShowPopup(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
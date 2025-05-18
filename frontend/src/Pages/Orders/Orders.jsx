import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/Sidebar/AdminSidebar/AdminSidebar";
import Navbar from "../../components/AdminNavbar/AdminNavbar";
import StoreFrontIcon from "@mui/icons-material/Store";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import { Link } from "react-router-dom";
import "./Orders.css";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import logo from "../../assets/YMlogo.PNG";
import axios from "axios";

const Orders = () => {
  const [orders, setOrders] = useState([]);

  // useEffect(() => {
  //   const fetchOrders = async () => {
  //     try {
  //       const response = await axios.get("http://127.0.0.1:8000/api/orders", {
  //         headers: {
  //           Authorization: `Bearer ${userToken}`,
  //         },
  //         withCredentials: true,
  //       });
  //       console.log("Fetch Orders: ", response.data);

  //       //filter Pending orders
  //       const filterOrders = [];
  //       response.data.forEach((element) => {
  //         if (element.status === "Pending" || element.status === "PENDING") {
  //           filterOrders.push(element);
  //         }
  //         console.log(filterOrders);
  //       });
  //       setOrders(filterOrders);
  //     } catch (error) {
  //       console.error("Error fetching orders!", error);
  //     }
  //   };
  //   fetchOrders();
  // }, []);

  const fetchOrders = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:8000/api/orders", {
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
        withCredentials: true,
      });
      console.log("Fetch Orders: ", response.data);

      //filter Pending orders
      const filterOrders = [];
      response.data.forEach((element) => {
        if (element.status === "Pending" || element.status === "PENDING") {
          filterOrders.push(element);
        }
        console.log(filterOrders);
      });
      setOrders(filterOrders);
    } catch (error) {
      console.error("Error fetching orders!", error);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const [viewingOrder, setViewingOrder] = useState(null); // For viewing order popup

  useEffect(() => {
    console.log("Viewing Order:", viewingOrder);
  }, [viewingOrder]);
  const handleViewOrder = (order) => {
    const response = axios
      .get(`http://127.0.0.1:8000/api/orders/${order.id}/items`)
      .then((res) => {
        if (res.data.items && res.data.items.length > 0) {
          setViewingOrder(res.data);
          console.log("rpp:", res.data);
        }
      });

    console.log("curnt:", response.data);
  };
  console.log("vieww:", viewingOrder);
  const [shops, setShops] = useState([]);

  //fetch shops
  useEffect(() => {
    const fetchShops = async () => {
      try {
        const response = await axios.get("http://127.0.0.1:8000/api/shops");
        setShops(response.data);
      } catch (error) {
        console.error("Error fetching shops: ", error);
      }
    };
    fetchShops();
  }, []);

  const [items, setItems] = useState([
    // { item: "Chilli Powder 50g", unitPrice: "250.50", quantity: 52 },
  ]);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await axios.get("http://127.0.0.1:8000/api/items");
        setItems(response.data);
      } catch (error) {
        console.error("Error fetching shops: ", error);
      }
    };
    fetchItems();
    console.log("items:", items);
  }, []);

  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 5;

  const [showShopsModal, setShowShopsModal] = useState(false);
  const [showItemsModal, setShowItemsModal] = useState(false);

  const [selectedShop, setSelectedShop] = useState(null);
  const [afterShopSelected, setAfterShopSelected] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);

  const [showPopup, setShowPopup] = useState(false);
  const [currentInvoiceItems, setCurrentInvoiceItems] = useState([]);
  const [orderToEdit, setOrderToEdit] = useState(null);
  const [editingOrderId, setEditingOrderId] = useState(null); // new state

  const invoiceRef = useRef();
  const navigate = useNavigate();

  const handleStatusChange = async (id, newStatus) => {
    if (newStatus === "Accepted") {
      // handleAcceptOrder(id);
      try {
        const response = await axios.put(
          `http://127.0.0.1:8000/api/orders/${id}/status`,
          { status: newStatus },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${userToken}`,
            },
          }
        );
        setOrders(
          orders.map((order) =>
            order.id === id ? { ...order, status: newStatus } : order
          )
        );
        fetchOrders();

        return response.data;
      } catch (error) {
        console.error("Error updating order status", error);
      }
    } else if (newStatus === "Cancelled") {
      const response = await axios.delete(
        `http://127.0.0.1:8000/api/orders/${id}`,

        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userToken}`,
          },
        }
      );
      console.log("deleted successfully", response.data);
      setOrders(orders.filter((order) => order.id != id));
      return response.data;
    }
  };

  
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = orders.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages = Math.ceil(orders.length / ordersPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleShopSelect = (shop) => {
    setSelectedShop(shop);
    setShowShopsModal(false);
    setShowItemsModal(true);
  };

  const handleItemSelect = (item) => {
    const exists = selectedItems.find((i) => i.item === item.item);
    if (!exists) {
      setSelectedItems([...selectedItems, { ...item, orderQty: 1 }]);
    }
  };

  const updateItemQuantity = (itemName, newQty) => {
    setSelectedItems(
      selectedItems.map((item) =>
        item.item === itemName
          ? { ...item, orderQty: parseInt(newQty) || 0 }
          : item
      )
    );
  };

  const removeSelectedItem = (itemName) => {
    setSelectedItems(selectedItems.filter((item) => item.item !== itemName));
  };

  const userToken = localStorage.getItem("admin_token");

  const loggedUser = localStorage.getItem("username");
  console.log(loggedUser ? loggedUser + "" : "not found");

  const handleConfirmOrder = async () => {
    console.log("itemsss:", items);
    if (!selectedShop || selectedItems.length == 0) return;
    setAfterShopSelected(selectedShop);
    const totalOrderAmount = selectedItems.reduce(
      (sum, item) => sum + item.unitPrice * item.orderQty,
      0
    );

    try {
      const getCost = await checkAdjustedOrderCost(
        selectedShop.id,
        totalOrderAmount
      );
      console.log("CCost::", getCost);

      if (getCost === undefined || getCost === null) {
        console.error("Failed to retrieve adjusted order cost");

        return;
      }
      if (editingOrderId !== null) {
        console.log("Shop");

        const updatedOrders = orders.map((order) =>
          order.id === editingOrderId
            ? {
                ...order,
                shop: selectedShop.shopName,
                date: new Date().toLocaleDateString(),
                items: selectedItems.filter((item) => item.orderQty > 0),
                total_price: getCost,
              }
            : order
        );
        console.log("SelectedShop : ", afterShopSelected);
        console.log("SelectedShop ID: ", afterShopSelected.id);
        const updatedOrder = {
          ...orders.find((o) => o.id === editingOrderId),
          shop_id: afterShopSelected?.id ?? 0,
          // shop: afterShopSelected.shopName,
          date: new Date().toLocaleDateString(),
          user_name: loggedUser,
          status: "Pending",
          total_price: getCost,
          items: selectedItems
            //.filter((item) => item.orderQty > 0)
            .map((item) => ({
              item_id: item.id,
              item: item.item,
              unitPrice: item.unitPrice,
              order_id: editingOrderId,
              quantity: item.orderQty,
              item_expenses: item.itemExpenses || 0,
            })),
        };
        setOrders(updatedOrders);
        setOrderToEdit(updatedOrder);
        setCurrentInvoiceItems(updatedOrder.items);
        console.log("editID: ", editingOrderId);
        if (!editingOrderId || editingOrderId <= 0) {
          console.log("Invalid editingOrderId:", editingOrderId);
          return;
        }
        try {
          console.log("updated Order: ", updatedOrder);

          const response = await axios.put(
            `http://127.0.0.1:8000/api/orders/${editingOrderId}`,
            updatedOrder,
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${userToken}`,
              },
            }
          );
          console.log("Edit : ", response.data);
        } catch (error) {
          console.error("Error upfating order: ", error);
        }
        setEditingOrderId(null);
      } else {
        console.log("papapap", afterShopSelected);

        const newOrder = {
          // id: orders.length + 1,
          shop_id: afterShopSelected.id,
          // created_at: new Date().toLocaleDateString(),
          user_name: loggedUser,
          status: "Pending",
          //return_balance: getCost,
          items: selectedItems
            //.filter((item) => item.orderQty > 0)
            .map((item) => ({
              item_id: item.id,
              quantity: item.orderQty,
              item_expenses: item.itemExpenses || 0,
            })),
          total_price: getCost,
        };
        console.log(getCost);
        console.log(selectedShop.id);
        console.log(selectedShop);
        // afterShopSelect = selectedShop;
        console.log("koo", newOrder);

        //store in DB
        try {
          console.log(userToken);

          const controller = new AbortController();

          const response = await axios.post(
            "http://127.0.0.1:8000/api/orders",
            newOrder,
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${userToken}`,
              },
              //withCredentials: true,
            }
            // body: JSON.stringify(newOrder),
          );
          console.log("response: " + response);

          if (!response.data) {
            throw new Error(
              `Server responded with ${response.status}:${
                response.status
              }:${await response.data}`
            );
          }
          if (response.status === 200 || response.status === 201) {
            const data = await response.data;
            console.log("Order saved:", data.order);
            console.log("Items saved:", data.order.items);
            //setOrders([...orders, newOrder]);
            setOrders((prevOrders) => [
              ...prevOrders,
              { ...data.order, items: data.order.items || [] },
            ]);
            setOrderToEdit({ ...data.order, items: data.order.items || [] });
            setCurrentInvoiceItems(data.order.items || []);

            // setOrders((orders) => [...orders, newOrder]);
            // setOrderToEdit({ ...data.order, items: data.order.items || [] });
            // setCurrentInvoiceItems(data.items);
          } else {
            throw new Error(`Unexpected status code:${response.status}`);
          }
        } catch (error) {
          console.error("Error saving order:", error);
        }
      }
    } catch (error) {
      console.error("Error saving order:", error);
    }
    setShowItemsModal(false);
    setSelectedShop(null);
    setSelectedItems([]);
  };

  const checkAdjustedOrderCost = async (shopId, orderAmount) => {
    try {
      console.log("id", shopId);

      const response = await axios.get(
        `http://127.0.0.1:8000/api/calculate-order-cost/${shopId}/${orderAmount}`,
        { withCredentials: true }
      );
      const data = response.data;
      console.log("respons: ", data.return_balance);
      console.log("kooo");

      return data.return_balance ?? orderAmount;
    } catch (error) {
      console.error("Error fetching order cost", error);
      return orderAmount;
    }
  };

  const handleCancelOrder = () => {
    if (editingOrderId !== null) {
      // Show the Order to Edit modal if updating
      const originalOrder = orders.find((order) => order.id === editingOrderId);
      setOrderToEdit(originalOrder); // Show confirmed order
      setEditingOrderId(null);
      setShowItemsModal(false); // Close items modal
    } else {
      // Navigate to the initial Orders page when adding a new order
      navigate("/adminOrders");
      setShowItemsModal(false);
      setSelectedShop(null);
      setSelectedItems([]);
    }
  };

  const handleGenerateInvoice = () => {
    setShowPopup(true);
  };

  const handleEditOrder = () => {
    if (orderToEdit) {
      const originalOrder = orderToEdit;
      setAfterShopSelected({
        id: originalOrder.shop_id,
        shopName: originalOrder.shop,
      });
      setSelectedShop({ shopName: originalOrder.shop });
      setSelectedItems(originalOrder.items);
      setEditingOrderId(originalOrder.id); // set edit mode
      setOrderToEdit(null);
      setShowItemsModal(true);
    }
  };

  const handlePrint = () => {
    html2canvas(invoiceRef.current).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      pdf.addImage(imgData, "PNG", 10, 10, 190, 0);
      pdf.save("Invoice.pdf");
    });
  };

  //subtotal
  const subTotal = currentInvoiceItems.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0
  );
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
            onClick={() => setShowShopsModal(true)}
          >
            Add New
          </button>
        </div>

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
              {orders?.length > 0 ? (
                orders.map((order) => (
                  <tr key={order.id}>
                    <td>{order.shop_id}</td>
                    <td>{order.created_at}</td>
                    <td>{order.user_name}</td>
                    <td>{order.status}</td>
                    <td>
                      {order.items
                        ? order.items
                            .map((i) => `${i.item} (${i.orderQty})`)
                            .join(", ")
                        : "—"}
                    </td>
                    <td>
                      {" "}
                      <button
                        className="btn view-btn"
                        onClick={() => handleViewOrder(order)}
                      >
                        View
                      </button>
                    </td>

                    <td>
                      {order.items
                        ? order.items
                            .map((i) => `${i.item} (${i.orderQty})`)
                            .join(", ")
                        : "—"}
                    </td>
                    {/* <td>
                      <button className="btn view-btn">View</button>
                    </td> */}
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
                        onClick={() =>
                          handleStatusChange(order.id, "Cancelled")
                        }
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
      </div>

      {/* View Order Popup */}
      {viewingOrder && (
        <div className="ModalBackdrop">
          <div className="Modal">
            <h2>Order Details</h2>
            <div className="ScrollableContent">
              {" "}
              {/* Add this wrapper */}
              <div className="orderdetails">
                <div className="orderdetails1">
                  <p>
                    <strong>Date:</strong> {viewingOrder.created_at}
                  </p>
                  <div className="repname">
                    <p>
                      <strong>Rep Name:</strong> {viewingOrder.user_name}
                    </p>
                  </div>
                </div>
                <div className="orderdetails2">
                  <p>
                    <strong>Shop Name:</strong> {viewingOrder.shop_id}
                  </p>
                  <p>
                    <strong>Total Amount:</strong> Rs.{viewingOrder.total_price}
                  </p>
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
                        {(item.quantity * parseFloat(item.unitPrice)).toFixed(
                          2
                        )}
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
                {shops.map((shop, index) => (
                  <div
                    key={index}
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
            <h2>Select Items for {selectedShop?.shopName}</h2>
            <div className="ScrollableContent">
              <div className="DistributionStockGrid">
                {items.map((item, index) => {
                  const selected = selectedItems.find(
                    (i) => i.item === item.item
                  );
                  return (
                    <div key={index} className="DistributionItemCard">
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
                              ></button>
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
              <button className="ConfirmButton" onClick={handleConfirmOrder}>
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
              <span class="order-number">Order</span>
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
                {orderToEdit?.items?.length > 0 ? (
                  orderToEdit.items.map((item, index) => (
                    <tr key={index}>
                      <td>{item.item}</td>
                      <td>{item.quantity}</td>
                      <td>{item.unitPrice}</td>
                      <td>{item.quantity * item.unitPrice}</td>
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
              <button onClick={() => setOrderToEdit(false)}>Cancel</button>
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
                  <h2>{selectedShop?.shopName}</h2>
                  <p>{new Date().toLocaleDateString()}</p>
                </div>
                <div className="invoice-number">
                  <h2>Invoice</h2>
                  <p>Order ID</p>
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
                  {currentInvoiceItems.map((item, index) => (
                    <tr key={index}>
                      <td>{item.item}</td>
                      <td>{item.quantity}</td>
                      <td>Rs. {item.unitPrice}</td>
                      <td>Rs. {item.quantity * item.unitPrice}</td>
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

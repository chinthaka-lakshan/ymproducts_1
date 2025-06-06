import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from '../../api/axios';
import StoreFrontIcon from "@mui/icons-material/Store";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import SearchIcon from "@mui/icons-material/Search";
import GoodReturnIcon from "../../assets/GoodReturn.png";
import BadReturnIcon from "../../assets/BadReturn.png";
import logo from "../../assets/YM.png";
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import "./AddReturn.css";

const AddReturn = () => {
  const [shops, setShops] = useState([]);
  const [items, setItems] = useState([]);
  const [selectedShop, setSelectedShop] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);
  const [returnBalance, setReturnBalance] = useState(0);
  const [searchShopTerm, setSearchShopTerm] = useState("");
  const [searchItemTerm, setSearchItemTerm] = useState("");
  const [isLoadingItems, setIsLoadingItems] = useState(false);
  const [itemsError, setItemsError] = useState(null);
  const [returnToEdit, setReturnToEdit] = useState(null);
  const [showReturnTypeModal, setShowReturnTypeModal] = useState(true);
  const [showShopsModal, setShowShopsModal] = useState(false);
  const [showItemsModal, setShowItemsModal] = useState(false);
  const [isGoodReturn, setIsGoodReturn] = useState(false);
  const navigate = useNavigate();

  const [showPopup, setShowPopup] = useState(false);
  const [invoiceData, setInvoiceData] = useState(null);
  const invoiceRef = useRef();

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

  // Handle return type selection
  const handleReturnTypeSelect = (isGood) => {
    setIsGoodReturn(isGood);
    setShowReturnTypeModal(false);
    setShowShopsModal(true);
  };

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

  // Cancel return
  const handleCancelReturn = () => {
    setSelectedItems([]);
    setSelectedShop(null);
    setShowItemsModal(false);
    setSearchItemTerm("");
    navigate(-1); // Go back to previous page
  };

  // Confirm return
  const handleConfirmReturn = () => {
    const confirmedReturn = {
      shop: selectedShop,
      items: selectedItems,
      isGood: isGoodReturn,
    };
    setReturnToEdit(confirmedReturn);
    setShowItemsModal(false);
    setSearchItemTerm("");
  };

  // Edit return
  const handleEditReturn = () => {
    if (returnToEdit) {
      setSelectedShop(returnToEdit.shop);
      setSelectedItems(returnToEdit.items);
      setIsGoodReturn(returnToEdit.isGood);
      setShowItemsModal(true);
      setReturnToEdit(null);
    }
  };

  // Submit return
  const handleGenerateReturn = async () => {
    try {
      const username = localStorage.getItem("username");
      const userToken = localStorage.getItem("admin_token");

      // Calculate total return value
      const returnTotal = returnToEdit.items.reduce(
        (sum, item) => sum + (item.editedPrice || item.unitPrice) * item.orderQty,
        0
      );

      const invoiceData = {
        shop: returnToEdit.shop,
        date: new Date().toLocaleDateString(),
        items: returnToEdit.items.map(item => ({
          item: item.item.item,
          quantity: item.orderQty,
          unitPrice: item.editedPrice || item.unitPrice
        })),
        subTotal: returnTotal
      };
      setInvoiceData(invoiceData);
      setShowPopup(true);

      // Prepare return data
      const returnData = {
        shop_id: returnToEdit.shop.id,
        type: returnToEdit.isGood ? "good" : "bad",
        return_cost: returnTotal.toFixed(2),
        rep_name: username,
        items: returnToEdit.items.map((item) => ({
          item_id: item.item.id,
          quantity: item.orderQty,
          unit_price: parseFloat(item.editedPrice || item.unitPrice).toFixed(2)
        }))
      };

      // Submit return
      const response = await api.post("/returns", returnData, {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${userToken}`
        }
      });

      console.log("Return created:", response.data);
      alert("Return created successfully!");
    } catch (error) {
      console.error("Error creating return:", error);
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
    <div className="AddReturnContainer">
      {/* Return Type Modal */}
      {showReturnTypeModal && (
        <div className="ModalBackdrop">
          <div className="Modal">
            <h2 className="ModalTitle">Select Return Type</h2>
            <div className="ScrollableContent">
              <div className="ReturnButtonsContainer">
                <div
                  className="ReturnButton"
                  onClick={() => handleReturnTypeSelect(true)}
                >
                  <img src={GoodReturnIcon} alt="Good Return" />
                  <p>Good Return</p>
                </div>
                <div
                  className="ReturnButton"
                  onClick={() => handleReturnTypeSelect(false)}
                >
                  <img src={BadReturnIcon} alt="Bad Return" />
                  <p>Bad Return</p>
                </div>
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
            <h2 className="ModalTitle">
              {isGoodReturn ? "Good Return Items" : "Bad Return Items"}
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
              <button className="CancelButton" onClick={handleCancelReturn}>
                Cancel
              </button>
              <button className="ConfirmButton" onClick={handleConfirmReturn}>
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Return Confirmation View */}
      {returnToEdit && (
        <div className="ModalBackdrop">
          <div className="Modal">
            <h2 className="ModalTitle">
              {returnToEdit.isGood ? "Good Return" : "Bad Return"}
            </h2>
            <h3 className="ModalSubTitle">
              {returnToEdit.shop?.shop_name}
              {returnToEdit.shop.location ? ` - ${returnToEdit.shop.location}` : ""}
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
                  {[...returnToEdit.items]
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
                                setReturnToEdit((prev) => {
                                  const updatedItems = [...prev.items];
                                  updatedItems[index].editedPrice = "";
                                  return { ...prev, items: updatedItems };
                                });
                                return;
                              }
                              const regex = /^\d*\.?\d{0,2}$/;
                              if (regex.test(value)) {
                                setReturnToEdit((prev) => {
                                  const updatedItems = [...prev.items];
                                  updatedItems[index].editedPrice = value;
                                  return { ...prev, items: updatedItems };
                                });
                              }
                            }}
                            onBlur={() => {
                              setReturnToEdit((prev) => {
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
                    <td>Total Items: {returnToEdit.items.length}</td>
                    <td>
                      Total Units:{" "}
                      {returnToEdit.items.reduce(
                        (sum, item) => sum + Number(item.orderQty || 0),
                        0
                      )}
                    </td>
                    <td colSpan={2}>
                      <strong>Total Return Value:</strong>{" "}
                      {returnToEdit.items
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
                </tfoot>
              </table>
            </div>
            <div className="ModalButtons">
              <button
                className="CancelButton"
                onClick={() => {setReturnToEdit(null), navigate('/returns')}}
              >
                Cancel
              </button>
              <button className="EditButton" onClick={handleEditReturn}>
                Edit Return
              </button>
              <button
                className="GenerateInvoice"
                onClick={handleGenerateReturn}
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
                navigate('/returns');
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

export default AddReturn;
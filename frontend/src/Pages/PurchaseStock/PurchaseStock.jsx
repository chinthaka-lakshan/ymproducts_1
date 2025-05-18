import React, { useState, useEffect } from "react";
import axios from "axios";
import "./PurchaseStock.css";
import AdminNavbar from "../../components/AdminNavbar/AdminNavbar.jsx";
import AdminSidebar from "../../components/Sidebar/AdminSidebar/AdminSidebar.jsx";
import InventoryIcon from "@mui/icons-material/ShoppingCart";

const PurchaseStock = () => {
    const [items, setItems] = useState([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showAddStockModal, setShowAddStockModal] = useState(false);
    const [newItem, setNewItem] = useState({ item: "", weight: "" });
    const [editItem, setEditItem] = useState({ item: "", weight: "" });
    const [addStockItem, setAddStockItem] = useState({ id: null, weight: "" });
    const [editIndex, setEditIndex] = useState(null);

    // Fetch purchase stocks from API
    const fetchData = () => {
        axios.get("http://127.0.0.1:8000/api/purchase_stock")
            .then(response => setItems(response.data))
            .catch(error => console.error("Error fetching purchase stock:", error));
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Add new item via API
    const handleAddItem = () => {
        if (!newItem.item || !newItem.weight) {
            alert("Please fill all fields");
            return;
        }

        axios.post("http://127.0.0.1:8000/api/purchase_stock", newItem)
            .then(() => {
                fetchData();
                setNewItem({ item: "", weight: "" });
                setShowAddModal(false);
                alert("Item added successfully!");
            })
            .catch((error) => {
                console.error("Error adding purchase stock:", error);
                alert("Failed to add item. Check input.");
            });
    };

    const handleEditClick = (index) => {
        setEditIndex(index);
        setEditItem(items[index]);
        setShowEditModal(true);
    };

    // Add this handler function
    const handleAddStockClick = (index) => {
        setAddStockItem({
            id: items[index].id,
            weight: ""
        });
        setShowAddStockModal(true);
    };

    const handleEditItem = () => {
        const id = items[editIndex].id;
        axios.put(`http://127.0.0.1:8000/api/purchase_stock/${id}`, editItem)
            .then(() => {
                fetchData();
                setShowEditModal(false);
                alert("Item updated successfully!");
            })
            .catch((error) => {
                console.error("Error updating purchase stock:", error);
                alert("Failed to update item.");
            });
    };

    // Add this function to handle stock addition
    const handleAddStock = () => {
        if (!addStockItem.weight) {
            alert("Please enter weight to add");
            return;
        }

        axios.post(`http://127.0.0.1:8000/api/purchase_stock/${addStockItem.id}/add`, {
            weight: addStockItem.weight
        })
        .then(() => {
            fetchData();
            setShowAddStockModal(false);
            setAddStockItem({ id: null, weight: "" });
            alert("Stock added successfully!");
        })
        .catch((error) => {
            console.error("Error adding stock:", error);
            alert("Failed to add stock.");
        });
    };

    const handleDeleteItem = (id) => {
        if (!window.confirm("Are you sure you want to delete this item?")) return;

        axios.delete(`http://127.0.0.1:8000/api/purchase_stock/${id}`)
            .then(() => {
                fetchData();
                alert("Item deleted successfully!");
            })
            .catch((error) => {
                console.error("Error deleting item:", error);
                alert("Failed to delete item.");
            });
    };

    return (
        <div className="PurchaseStock">
            <AdminSidebar />
            <div className="PurchaseStockContainer">
                <AdminNavbar />
                <div className="PurchaseStockCardsContainer">
                    <div className="PurchaseStockTop">
                        <h1>Purchase Stock</h1>
                        <button className="AddButton" onClick={() => setShowAddModal(true)}>Add New</button>
                    </div>
                    <div className="PurchaseStockGrid">
                        {items.map((item, index) => (
                            <div key={item.id} className="PurchaseItemCard">
                                <h2>{item.item}</h2>
                                <div className="PurchaseItemCardMiddle">
                                    <InventoryIcon className="PurchaseItemCardIcon" />
                                    <div className="PurchaseItemCardDetails">
                                        <span><strong>Weight (kg): </strong>{item.weight}</span>
                                    </div>
                                </div>
                                <div className="PurchaseItemCardButtons">
                                    <button className="DeleteButton" onClick={() => handleDeleteItem(item.id)}>Delete</button>
                                    <button className="EditButton" onClick={() => handleEditClick(index)}>Update</button>
                                    <button className="AddStockButton" onClick={() => handleAddStockClick(index)}>Add</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Add Modal */}
            {showAddModal && (
                <div className="ModalBackdrop">
                    <div className="Modal">
                        <h2>Add New Purchase Item</h2>
                        <div className="ModalMiddle">
                            <InventoryIcon className="ModalIcon" />
                            <div className="ModalInputs">
                                <input
                                    type="text"
                                    placeholder="Enter Item Name"
                                    value={newItem.item}
                                    onChange={(e) => setNewItem({ ...newItem, item: e.target.value })}
                                />
                                <input
                                    type="number"
                                    placeholder="Enter Weight (kg)"
                                    value={newItem.weight}
                                    onChange={(e) => setNewItem({ ...newItem, weight: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="ModalButtons">
                            <button className="CancelButton" onClick={() => setShowAddModal(false)}>Cancel</button>
                            <button className="SaveButton" onClick={handleAddItem}>Save</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {showEditModal && (
                <div className="ModalBackdrop">
                    <div className="Modal">
                        <h2>Update Purchase Item</h2>
                        <div className="ModalMiddle">
                            <InventoryIcon className="ModalIcon" />
                            <div className="ModalInputs">
                                <input
                                    type="text"
                                    placeholder="Enter Item Name"
                                    value={editItem.item}
                                    onChange={(e) => setEditItem({ ...editItem, item: e.target.value })}
                                />
                                <input
                                    type="number"
                                    placeholder="Enter Weight (kg)"
                                    value={editItem.weight}
                                    onChange={(e) => setEditItem({ ...editItem, weight: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="ModalButtons">
                            <button className="CancelButton" onClick={() => setShowEditModal(false)}>Cancel</button>
                            <button className="SaveButton" onClick={handleEditItem}>Update</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Stock Modal */}
            {showAddStockModal && (
                <div className="ModalBackdrop">
                    <div className="Modal">
                        <h2>Add Stock</h2>
                        <div className="ModalMiddle">
                            <InventoryIcon className="ModalIcon" />
                            <div className="ModalInputs">
                                <input
                                    type="number"
                                    placeholder="Enter Weight to Add (kg)"
                                    value={addStockItem.weight}
                                    onChange={(e) => setAddStockItem({ ...addStockItem, weight: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="ModalButtons">
                            <button className="CancelButton" onClick={() => setShowAddStockModal(false)}>Cancel</button>
                            <button className="SaveButton" onClick={handleAddStock}>Add Stock</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PurchaseStock;
import React, { useState, useEffect } from "react";
import api from "../../api/axios"; // Import your configured axios instance
import "./AdminShops.css";
import AdminSidebar from "../../components/Sidebar/AdminSidebar/AdminSidebar";
import AdminNavbar from "../../components/AdminNavbar/AdminNavbar";
import StoreFrontIcon from "@mui/icons-material/Store";

const AdminShops = () => {
    const [shops, setShops] = useState([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [newShop, setNewShop] = useState({ 
        shop_name: "", 
        location: "", 
        contact: "" 
    });
    const [editShop, setEditShop] = useState({ 
        shop_name: "", 
        location: "", 
        contact: "" 
    });
    const [editIndex, setEditIndex] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Fetch shops from backend
    useEffect(() => {
        const fetchShops = async () => {
            setLoading(true);
            try {
                const response = await api.get("/shops");
                setShops(response.data);
                setError(null);
            } catch (error) {
                console.error("Error fetching shops:", error);
                setError("Failed to load shops");
                if (error.response?.status === 401) {
                    window.location.href = '/login';
                }
            } finally {
                setLoading(false);
            }
        };

        fetchShops();
    }, []);

    // Add a new shop
    const handleAddShop = async () => {
        if (!newShop.shop_name || !newShop.location || !newShop.contact) {
            alert("Please fill all fields");
            return;
        }

        try {
            const response = await api.post("/shops", newShop);
            setShops([...shops, response.data.shop]);
            setNewShop({ shop_name: "", location: "", contact: "" });
            setShowAddModal(false);
            alert("Shop added successfully");
        } catch (error) {
            console.error("Error adding shop:", error);
            if (error.response?.status === 401) {
                alert("Session expired. Please login again.");
                window.location.href = '/login';
            } else {
                alert(error.response?.data?.message || "Failed to add shop");
            }
        }
    };

    // Open edit modal
    const handleEditClick = (index) => {
        setEditIndex(index);
        setEditShop({ ...shops[index] });
        setShowEditModal(true);
    };

    // Update shop details
    const handleEditShop = async () => {
        if (!editShop.shop_name || !editShop.location || !editShop.contact) {
            alert("Please fill all fields");
            return;
        }

        try {
            const response = await api.put(
                `/shops/${shops[editIndex].id}`,
                editShop
            );

            const updatedShops = [...shops];
            updatedShops[editIndex] = response.data.shop;
            setShops(updatedShops);

            setShowEditModal(false);
            alert("Shop updated successfully!");
        } catch (error) {
            console.error("Error updating shop:", error);
            if (error.response?.status === 401) {
                alert("Session expired. Please login again.");
                window.location.href = '/login';
            } else if (error.response?.data?.errors) {
                alert("Validation errors occurred");
            } else {
                alert("Failed to update shop");
            }
        }
    };

    // Delete a shop
    const handleDeleteShop = async (id) => {
        if (!window.confirm("Are you sure you want to delete this shop?")) return;

        try {
            await api.delete(`/shops/${id}`);
            setShops(shops.filter(shop => shop.id !== id));
            alert("Shop deleted successfully!");
        } catch (error) {
            console.error("Error deleting shop:", error);
            if (error.response?.status === 401) {
                alert("Session expired. Please login again.");
                window.location.href = '/login';
            } else {
                alert("Failed to delete shop");
            }
        }
    };

    return (
        <div className="Shops">
            <AdminSidebar />
            <div className="ShopsContainer">
                <AdminNavbar />
                <div className="ShopCardsContainer">
                    <div className="ShopsTop">
                        <h1>Shops</h1>
                        <button 
                            className="AddButton" 
                            onClick={() => setShowAddModal(true)}
                        >
                            Add New
                        </button>
                    </div>

                    {loading ? (
                        <div className="Loading">Loading shops...</div>
                    ) : error ? (
                        <div className="Error">{error}</div>
                    ) : (
                        <div className="ShopsGrid">
                            {shops.map((shop, index) => (
                                <div key={shop.id} className="ShopCard">
                                    <h2>{shop.shop_name}</h2>
                                    <div className="ShopCardMiddle">
                                        <StoreFrontIcon className="ShopCardIcon" />
                                        <div className="ShopCardDetails">
                                            <span><strong>Location: </strong>{shop.location}</span>
                                            <span><strong>Contact: </strong>{shop.contact}</span>
                                        </div>
                                    </div>
                                    <div className="ShopCardButtons">
                                        <button 
                                            className="DeleteButton" 
                                            onClick={() => handleDeleteShop(shop.id)}
                                        >
                                            Delete
                                        </button>
                                        <button 
                                            className="EditButton" 
                                            onClick={() => handleEditClick(index)}
                                        >
                                            Edit
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Add Shop Modal */}
            {showAddModal && (
                <div className="ModalBackdrop">
                    <div className="Modal">
                        <h2>Add New Shop</h2>
                        <div className="ModalMiddle">
                            <StoreFrontIcon className="ModalIcon" />
                            <div className="ModalInputs">
                                <input
                                    type="text"
                                    placeholder="Enter Shop Name"
                                    value={newShop.shop_name}
                                    onChange={(e) => setNewShop({ ...newShop, shop_name: e.target.value })}
                                    required
                                />
                                <input
                                    type="text"
                                    placeholder="Enter Location"
                                    value={newShop.location}
                                    onChange={(e) => setNewShop({ ...newShop, location: e.target.value })}
                                    required
                                />
                                <input
                                    type="text"
                                    placeholder="Enter Contact Number"
                                    value={newShop.contact}
                                    onChange={(e) => setNewShop({ ...newShop, contact: e.target.value })}
                                    required
                                />
                            </div>
                        </div>
                        <div className="ModalButtons">
                            <button 
                                className="CancelButton" 
                                onClick={() => setShowAddModal(false)}
                            >
                                Cancel
                            </button>
                            <button 
                                className="SaveButton" 
                                onClick={handleAddShop}
                            >
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Shop Modal */}
            {showEditModal && (
                <div className="ModalBackdrop">
                    <div className="Modal">
                        <h2>Edit Shop</h2>
                        <div className="ModalMiddle">
                            <StoreFrontIcon className="ModalIcon" />
                            <div className="ModalInputs">
                                <input
                                    type="text"
                                    placeholder="Enter Shop Name"
                                    value={editShop.shop_name}
                                    onChange={(e) => setEditShop({ ...editShop, shop_name: e.target.value })}
                                    required
                                />
                                <input
                                    type="text"
                                    placeholder="Enter Location"
                                    value={editShop.location}
                                    onChange={(e) => setEditShop({ ...editShop, location: e.target.value })}
                                    required
                                />
                                <input
                                    type="text"
                                    placeholder="Enter Contact Number"
                                    value={editShop.contact}
                                    onChange={(e) => setEditShop({ ...editShop, contact: e.target.value })}
                                    required
                                />
                            </div>
                        </div>
                        <div className="ModalButtons">
                            <button 
                                className="CancelButton" 
                                onClick={() => setShowEditModal(false)}
                            >
                                Cancel
                            </button>
                            <button 
                                className="SaveButton" 
                                onClick={handleEditShop}
                            >
                                Update
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminShops;
import React, { useState, useEffect } from "react";
import axios from "axios";
import "./RepShops.css";
import StoreFrontIcon from "@mui/icons-material/Store";
import RepNavbar from "../../components/RepNavbar/RepNavbar";
import RepSidebar from "../../components/Sidebar/RepSidebar/RepSidebar";

const RepShops = () => {
    const [shops, setShops] = useState([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [newShop, setNewShop] = useState({ shop_name: "", location: "", contact: "" });
    const [editShop, setEditShop] = useState({ shop_name: "", location: "", contact: "" });
    const [editIndex, setEditIndex] = useState(null);

    // ✅ Fetch shops from backend
    useEffect(() => {
        axios.get("http://127.0.0.1:8000/api/shops")
            .then(response => setShops(response.data))
            .catch(error => console.error("Error fetching shops:", error));
    }, []);

    // ✅ Add a new shop
    const handleAddShop = async () => {
        try {
          const response = await axios.post("http://127.0.0.1:8000/api/shops", newShop);
          setShops([...shops, response.data.shop]);
          setNewShop({ shop_name: "", location: "", contact: "" });
          alert("Shop added successfully");
          setShowAddModal(false);
        } catch (error) {
            console.error("Error adding shop:", error);
            alert("Failed to add shop");
        }
    };

    // ✅ Open edit modal
    const handleEditClick = (index) => {
        setEditIndex(index);
        setEditShop(shops[index]);
        setShowEditModal(true);
    };

    // ✅ Update shop details
    const handleEditShop = async () => {
        try {
            const response = await axios.put(
                `http://127.0.0.1:8000/api/shops/${shops[editIndex].id}`,
                editShop
            );

            console.log("Shop updated successfully:", response.data);
            alert(response.data.message || "Shop updated successfully!");

            // ✅ Update the local `shops` state to reflect changes immediately
            const updatedShops = [...shops];
            updatedShops[editIndex] = response.data.shop || editShop;
            setShops(updatedShops);

            setShowEditModal(false);
            setEditShop({ shop_name: "", location: "", contact: "" });

        } catch (error) {
            if (error.response) {
                console.error("Validation errors:", error.response.data.errors);
            } else {
                console.error("Unknown error:", error);
            }
        }
    };

    // ✅ Delete a shop
    const handleDeleteShop = async (id) => {
        if (!window.confirm("Are you sure you want to delete this shop?")) return;

        try {
            await axios.delete(`http://127.0.0.1:8000/api/shops/${id}`)
            setShops(shops.filter(shop => shop.id !== id));
            alert("Shop deleted successfully!");
        } catch (error) {
            console.error("Error deleting shop:", error);
            alert("Failed to delete shop.");
        }
    };

    return (
        <div className="Shops">
            <RepSidebar/>
            <div className="ShopsContainer">
                <RepNavbar/>
                <div className="ShopCardsContainer">
                    <div className="ShopsTop">
                        <h1>Shops</h1>
                        <button className="AddButton" onClick={() => setShowAddModal(true)}>Add New</button>
                    </div>
                    <div className="ShopsGrid">
                        {shops.map((shop, index) => (
                            <div key={shop.id} className="ShopCard">
                                <h2>{shop.shop_name}</h2>
                                <div className="ShopCardMiddle">
                                    <StoreFrontIcon className="ShopCardIcon"/>
                                    <div className="ShopCardDetails">
                                        <span><strong>Location: </strong>{shop.location}</span>
                                        <span><strong>Contact: </strong>{shop.contact}</span>
                                    </div>
                                </div>
                                <div className="ShopCardButtons">
                                    <button className="DeleteButton" onClick={() => handleDeleteShop(shop.id)}>Delete</button>
                                    <button className="EditButton" onClick={() => handleEditClick(index)}>Edit</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {showAddModal && (
                <div className="ModalBackdrop">
                    <div className="Modal">
                        <h2>Add New Shop</h2>
                        <div className="ModalMiddle">
                            <StoreFrontIcon className="ModalIcon"/>
                            <div className="ModalInputs">
                                <input
                                    type="text"
                                    placeholder="Enter Shop Name"
                                    value={newShop.shop_name}
                                    onChange={(e) => setNewShop({ ...newShop, shop_name: e.target.value })}
                                />
                                <input 
                                    type="text"
                                    placeholder="Enter Location"
                                    value={newShop.location}
                                    onChange={(e) => setNewShop({ ...newShop, location: e.target.value })}
                                />
                                <input 
                                    type="text"
                                    placeholder="Enter Contact Number"
                                    value={newShop.contact}
                                    onChange={(e) => setNewShop({ ...newShop, contact: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="ModalButtons">
                            <button className="CancelButton" onClick={() => setShowAddModal(false)}>Cancel</button>
                            <button className="SaveButton" onClick={handleAddShop}>Save</button>
                        </div>
                    </div>
                </div>
            )}

            {showEditModal && (
                <div className="ModalBackdrop">
                    <div className="Modal">
                        <h2>Edit Shop</h2>
                        <div className="ModalMiddle">
                            <StoreFrontIcon className="ModalIcon"/>
                            <div className="ModalInputs">
                                <input 
                                    type="text" 
                                    placeholder="Enter Shop Name" 
                                    value={editShop.shop_name} 
                                    onChange={(e) => setEditShop({ ...editShop, shop_name: e.target.value })}
                                />
                                <input 
                                    type="text" 
                                    placeholder="Enter Location" 
                                    value={editShop.location} 
                                    onChange={(e) => setEditShop({ ...editShop, location: e.target.value })}
                                />
                                <input 
                                    type="text" 
                                    placeholder="Enter Contact Number" 
                                    value={editShop.contact} 
                                    onChange={(e) => setEditShop({ ...editShop, contact: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="ModalButtons">
                            <button className="CancelButton" onClick={() => setShowEditModal(false)}>Cancel</button>
                            <button className="SaveButton" onClick={handleEditShop}>Update</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RepShops;
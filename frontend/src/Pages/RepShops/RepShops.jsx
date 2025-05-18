import React, { useState, useEffect } from "react";
import "./RepShops.css";
import StoreFrontIcon from "@mui/icons-material/Store";
import RepNavbar from "../../components/RepNavbar/RepNavbar";
import RepSidebar from "../../components/Sidebar/RepSidebar/RepSidebar";
import api from "../../api/axios";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";

const RepShops = () => {
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch shops from backend
  useEffect(() => {
    const fetchShops = async () => {
      try {
        const response = await api.get("/shops");
        setShops(response.data);
        setError(null);
      } catch (error) {
        handleApiError(error);
        setError("Failed to load shops. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchShops();
  }, []);

  const handleApiError = (error) => {
    console.error("API Error:", error);
    if (error.response?.status === 401) {
      alert("Session expired. Please login again.");
      window.location.href = '/login';
      return true;
    }
    return false;
  };

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
    } catch (error) {
      if (!handleApiError(error)) {
        alert(error.response?.data?.message || "Failed to add shop");
      }
    }
  };

  const handleEditClick = (index) => {
    setEditIndex(index);
    setEditShop({ ...shops[index] });
    setShowEditModal(true);
  };

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
    } catch (error) {
      if (!handleApiError(error)) {
        alert(error.response?.data?.message || "Failed to update shop");
      }
    }
  };

  const handleDeleteShop = async (id) => {
    if (!window.confirm("Are you sure you want to delete this shop?")) return;

    try {
      await api.delete(`/shops/${id}`);
      setShops(shops.filter(shop => shop.id !== id));
    } catch (error) {
      if (!handleApiError(error)) {
        alert("Failed to delete shop");
      }
    }
  };

  return (
    <div className="Shops">
      <RepSidebar />
      <div className="ShopsContainer">
        <RepNavbar />
        <div className="ShopCardsContainer">
          <div className="ShopsTop">
            <h1>Shops</h1>
            <Button 
              variant="contained" 
              color="primary"
              onClick={() => setShowAddModal(true)}
            >
              Add New Shop
            </Button>
          </div>

          {loading ? (
            <div className="LoadingState">
              <CircularProgress />
              <p>Loading shops...</p>
            </div>
          ) : error ? (
            <Alert severity="error" className="ErrorState">
              {error}
              <Button onClick={() => window.location.reload()}>Retry</Button>
            </Alert>
          ) : shops.length === 0 ? (
            <div className="EmptyState">
              <p>No shops found</p>
            </div>
          ) : (
            <div className="ShopsGrid">
              {shops.map((shop, index) => (
                <div key={shop.id} className="ShopCard">
                  <h2>{shop.shop_name}</h2>
                  <div className="ShopCardMiddle">
                    <StoreFrontIcon className="ShopCardIcon" />
                    <div className="ShopCardDetails">
                      <p><strong>Location:</strong> {shop.location}</p>
                      <p><strong>Contact:</strong> {shop.contact}</p>
                    </div>
                  </div>
                  <div className="ShopCardButtons">
                    <Button 
                      variant="outlined" 
                      color="error"
                      onClick={() => handleDeleteShop(shop.id)}
                    >
                      Delete
                    </Button>
                    <Button 
                      variant="outlined" 
                      color="primary"
                      onClick={() => handleEditClick(index)}
                    >
                      Edit
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Shop Modal */}
      <Dialog open={showAddModal} onClose={() => setShowAddModal(false)}>
        <DialogTitle>Add New Shop</DialogTitle>
        <DialogContent>
          <div className="ModalContent">
            <StoreFrontIcon className="ModalIcon" />
            <div className="ModalInputs">
              <TextField
                autoFocus
                margin="dense"
                label="Shop Name"
                fullWidth
                value={newShop.shop_name}
                onChange={(e) => setNewShop({ ...newShop, shop_name: e.target.value })}
              />
              <TextField
                margin="dense"
                label="Location"
                fullWidth
                value={newShop.location}
                onChange={(e) => setNewShop({ ...newShop, location: e.target.value })}
              />
              <TextField
                margin="dense"
                label="Contact Number"
                fullWidth
                value={newShop.contact}
                onChange={(e) => setNewShop({ ...newShop, contact: e.target.value })}
              />
            </div>
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowAddModal(false)}>Cancel</Button>
          <Button onClick={handleAddShop} color="primary">Save</Button>
        </DialogActions>
      </Dialog>

      {/* Edit Shop Modal */}
      <Dialog open={showEditModal} onClose={() => setShowEditModal(false)}>
        <DialogTitle>Edit Shop</DialogTitle>
        <DialogContent>
          <div className="ModalContent">
            <StoreFrontIcon className="ModalIcon" />
            <div className="ModalInputs">
              <TextField
                autoFocus
                margin="dense"
                label="Shop Name"
                fullWidth
                value={editShop.shop_name}
                onChange={(e) => setEditShop({ ...editShop, shop_name: e.target.value })}
              />
              <TextField
                margin="dense"
                label="Location"
                fullWidth
                value={editShop.location}
                onChange={(e) => setEditShop({ ...editShop, location: e.target.value })}
              />
              <TextField
                margin="dense"
                label="Contact Number"
                fullWidth
                value={editShop.contact}
                onChange={(e) => setEditShop({ ...editShop, contact: e.target.value })}
              />
            </div>
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowEditModal(false)}>Cancel</Button>
          <Button onClick={handleEditShop} color="primary">Update</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default RepShops;
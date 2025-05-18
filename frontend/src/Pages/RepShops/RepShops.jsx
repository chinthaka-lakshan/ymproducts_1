import React, { useState, useEffect } from "react";
import "./RepShops.css";
import StoreFrontIcon from "@mui/icons-material/Store";
import RepNavbar from "../../components/RepNavbar/RepNavbar";
import RepSidebar from "../../components/Sidebar/RepSidebar/RepSidebar";
import api from "../../api/axios";
import {
  CircularProgress,
  Alert,
  Button,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Snackbar
} from "@mui/material";

const RepShops = () => {
  // Main state
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
  
  // Alert state
  const [alert, setAlert] = useState({
    open: false,
    message: "",
    severity: "success"
  });

  // Fetch shops on component mount
  useEffect(() => {
    const fetchShops = async () => {
      try {
        const response = await api.get("/shops");
        setShops(response.data);
        setError(null);
      } catch (error) {
        handleApiError(error);
        setError("Failed to load shops. Please try again.");
        showAlert("Failed to load shops", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchShops();
  }, []);

  // Alert helpers
  const showAlert = (message, severity = "success") => {
    setAlert({
      open: true,
      message,
      severity
    });
  };

  const handleCloseAlert = () => {
    setAlert(prev => ({ ...prev, open: false }));
  };

  // Error handler
  const handleApiError = (error) => {
    console.error("API Error:", error);
    if (error.response?.status === 401) {
      showAlert("Session expired. Please login again.", "error");
      window.location.href = '/login';
      return true;
    }
    return false;
  };

  // CRUD Operations
  const handleAddShop = async () => {
    if (!newShop.shop_name || !newShop.location || !newShop.contact) {
      showAlert("Please fill all fields", "error");
      return;
    }

    try {
      const response = await api.post("/shops", newShop);
      setShops([...shops, response.data.shop]);
      setNewShop({ shop_name: "", location: "", contact: "" });
      setShowAddModal(false);
      showAlert("Shop added successfully!");
    } catch (error) {
      if (!handleApiError(error)) {
        showAlert(error.response?.data?.message || "Failed to add shop", "error");
      }
    }
  };

  const handleEditClick = (shop, index) => {
    setEditIndex(index);
    setEditShop({ ...shop });
    setShowEditModal(true);
  };

  const handleEditShop = async () => {
    if (!editShop.shop_name || !editShop.location || !editShop.contact) {
      showAlert("Please fill all fields", "error");
      return;
    }

    try {
      const response = await api.put(
        `/shops/${editShop.id}`,
        editShop
      );

      const updatedShops = [...shops];
      updatedShops[editIndex] = response.data.shop;
      setShops(updatedShops);
      setShowEditModal(false);
      showAlert("Shop updated successfully!");
    } catch (error) {
      if (!handleApiError(error)) {
        showAlert(error.response?.data?.message || "Failed to update shop", "error");
      }
    }
  };

  const handleDeleteShop = async (id) => {
    if (!window.confirm("Are you sure you want to delete this shop?")) return;

    try {
      await api.delete(`/shops/${id}`);
      setShops(shops.filter(shop => shop.id !== id));
      showAlert("Shop deleted successfully!");
    } catch (error) {
      if (!handleApiError(error)) {
        showAlert("Failed to delete shop", "error");
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
              startIcon={<StoreFrontIcon />}
            >
              Add New Shop
            </Button>
          </div>

          {loading ? (
            <div className="LoadingState">
              <CircularProgress size={60} />
              <p>Loading shops...</p>
            </div>
          ) : error ? (
            <div className="ErrorState">
              <Alert severity="error">
                {error}
                <Button 
                  color="inherit" 
                  size="small"
                  onClick={() => window.location.reload()}
                >
                  Retry
                </Button>
              </Alert>
            </div>
          ) : shops.length === 0 ? (
            <div className="EmptyState">
              <StoreFrontIcon style={{ fontSize: 60, color: "#ccc" }} />
              <p>No shops found</p>
              <Button 
                variant="outlined"
                onClick={() => setShowAddModal(true)}
              >
                Add Your First Shop
              </Button>
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
                      variant="contained" 
                      color="primary"
                      onClick={() => handleEditClick(shop, index)}
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
      <Dialog 
        open={showAddModal} 
        onClose={() => setShowAddModal(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          <StoreFrontIcon style={{ verticalAlign: 'middle', marginRight: 10 }} />
          Add New Shop
        </DialogTitle>
        <DialogContent>
          <div className="ModalInputs">
            <TextField
              autoFocus
              margin="dense"
              label="Shop Name"
              fullWidth
              variant="outlined"
              value={newShop.shop_name}
              onChange={(e) => setNewShop({ ...newShop, shop_name: e.target.value })}
            />
            <TextField
              margin="dense"
              label="Location"
              fullWidth
              variant="outlined"
              value={newShop.location}
              onChange={(e) => setNewShop({ ...newShop, location: e.target.value })}
            />
            <TextField
              margin="dense"
              label="Contact Number"
              fullWidth
              variant="outlined"
              value={newShop.contact}
              onChange={(e) => setNewShop({ ...newShop, contact: e.target.value })}
            />
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowAddModal(false)}>Cancel</Button>
          <Button 
            onClick={handleAddShop} 
            color="primary"
            variant="contained"
          >
            Save Shop
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Shop Modal */}
      <Dialog 
        open={showEditModal} 
        onClose={() => setShowEditModal(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          <StoreFrontIcon style={{ verticalAlign: 'middle', marginRight: 10 }} />
          Edit Shop
        </DialogTitle>
        <DialogContent>
          <div className="ModalInputs">
            <TextField
              autoFocus
              margin="dense"
              label="Shop Name"
              fullWidth
              variant="outlined"
              value={editShop.shop_name}
              onChange={(e) => setEditShop({ ...editShop, shop_name: e.target.value })}
            />
            <TextField
              margin="dense"
              label="Location"
              fullWidth
              variant="outlined"
              value={editShop.location}
              onChange={(e) => setEditShop({ ...editShop, location: e.target.value })}
            />
            <TextField
              margin="dense"
              label="Contact Number"
              fullWidth
              variant="outlined"
              value={editShop.contact}
              onChange={(e) => setEditShop({ ...editShop, contact: e.target.value })}
            />
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowEditModal(false)}>Cancel</Button>
          <Button 
            onClick={handleEditShop} 
            color="primary"
            variant="contained"
          >
            Update Shop
          </Button>
        </DialogActions>
      </Dialog>

      {/* Global Alert */}
      <Snackbar
        open={alert.open}
        autoHideDuration={6000}
        onClose={handleCloseAlert}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseAlert} 
          severity={alert.severity}
          sx={{ width: '100%' }}
          elevation={6}
          variant="filled"
        >
          {alert.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default RepShops;
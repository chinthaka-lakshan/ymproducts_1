import React, { useEffect, useState } from "react";
import "./DistributionStock.css";
import AdminNavbar from "../../components/AdminNavbar/AdminNavbar.jsx";
import AdminSidebar from "../../components/Sidebar/AdminSidebar/AdminSidebar.jsx";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import api from "../../api/axios.js";

const DistributionStock = () => {
  const [items, setItems] = useState([]);
  const [modal, setModal] = useState({
    add: false,
    edit: false,
    addStock: false,
  });

  // Simplified initial form data
  const initialFormData = {
    item: "",
    unitPrice: "",
    itemCost: "",
    quantity: "",
    id: null,
    quantityToAdd: ""
  };

  const [currentItem, setCurrentItem] = useState(initialFormData);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const response = await api.get("/items");
      setItems(response.data);
    } catch (error) {
      console.error("Error fetching items:", error);
      alert("Failed to fetch items.");
    }
  };

  const handleAddItem = async (formData) => {
    try {
      const payload = {
        item: formData.item,
        unitPrice: parseFloat(Number(formData.unitPrice).toFixed(2)),
        itemCost: parseFloat(Number(formData.itemCost).toFixed(2)),
        quantity: parseInt(formData.quantity),
      };

      const response = await api.post("/items", payload);
      setItems(prev => [...prev, response.data.item]);
      setModal(prev => ({ ...prev, add: false }));
      setCurrentItem(initialFormData);
      alert("Item added successfully!");
    } catch (error) {
      console.error("Error adding item:", error.response || error);
      alert("Failed to add item.");
    }
  };

  const handleEditItem = async (formData) => {
    try {
      const payload = {
        item: formData.item,
        unitPrice: parseFloat(Number(formData.unitPrice).toFixed(2)),
        itemCost: parseFloat(Number(formData.itemCost).toFixed(2)),
        quantity: parseInt(formData.quantity),
      };

      await api.put(`/items/${formData.id}`, payload);
      setItems(prev =>
        prev.map(item =>
          item.id === formData.id ? { ...item, ...payload } : item
        )
      );
      setModal(prev => ({ ...prev, edit: false }));
      setCurrentItem(initialFormData);
      alert("Item updated successfully!");
    } catch (error) {
      console.error("Error updating item:", error);
      alert("Failed to update item.");
    }
  };

  const handleAddStock = async (formData) => {
    try {
      const response = await api.put(
        `/items/${formData.id}/add-stock`,
        { quantity: parseInt(formData.quantityToAdd) }
      );

      setItems(prev =>
        prev.map(item =>
          item.id === formData.id
            ? { ...item, quantity: response.data.quantity }
            : item
        )
      );
      setModal(prev => ({ ...prev, addStock: false }));
      setCurrentItem(initialFormData);
      alert("Stock added successfully!");
    } catch (error) {
      console.error("Error adding stock:", error);
      alert("Failed to add stock.");
    }
  };

  const handleDeleteItem = async (id) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;

    try {
      await api.delete(`/items/${id}`);
      setItems(prev => prev.filter(item => item.id !== id));
      alert("Item deleted successfully!");
    } catch (error) {
      console.error("Error deleting item:", error);
      alert("Failed to delete item.");
    }
  };

  const openModal = (type, item = null) => {
    if (item) {
      setCurrentItem({
        id: item.id,
        item: item.item,
        unitPrice: item.unitPrice,
        itemCost: item.itemCost,
        quantity: item.quantity,
        quantityToAdd: ""
      });
    } else {
      setCurrentItem(initialFormData);
    }
    setModal(prev => ({ ...prev, [type]: true }));
  };

  const closeModal = (type) => {
    setModal(prev => ({ ...prev, [type]: false }));
    setCurrentItem(initialFormData);
  };

  const Modal = ({ type, title, fields, onSubmit, onCancel, initialData }) => {
    const [formData, setFormData] = useState(initialData);

    useEffect(() => {
      setFormData(initialData);
    }, [initialData]);

    const handleChange = (field, value) => {
      // For number fields, allow only numbers and up to 2 decimal places
      if (field === 'unitPrice' || field === 'itemCost') {
        if (value === '' || /^\d*\.?\d{0,2}$/.test(value)) {
          setFormData(prev => ({
            ...prev,
            [field]: value
          }));
        }
      } else {
        setFormData(prev => ({
          ...prev,
          [field]: value
        }));
      }
    };

    const handleSubmit = () => {
      onSubmit(formData);
    };

    return (
      <div className="ModalBackdrop">
        <div className="Modal">
          <h2>{title}</h2>
          <div className="ModalMiddle">
            <ShoppingCartIcon className="ModalIcon" />
            <div className="ModalInputs">
              {fields.map((field) => (
                <input
                  key={field.name}
                  type={field.type || "text"}
                  placeholder={field.placeholder}
                  value={formData[field.name] || ''}
                  onChange={(e) => handleChange(field.name, e.target.value)}
                  step={field.type === 'number' ? "0.01" : undefined}
                />
              ))}
            </div>
          </div>
          <div className="ModalButtons">
            <button className="CancelButton" onClick={onCancel}>
              Cancel
            </button>
            <button className="SaveButton" onClick={handleSubmit}>
              {type === "add" ? "Save" : type === "edit" ? "Update" : "Add Stock"}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="DistributionStock">
      <AdminSidebar />
      <div className="DistributionStockContainer">
        <AdminNavbar />
        <div className="DistributionStockCardsContainer">
          <div className="DistributionStockTop">
            <h1>Distribution Stock</h1>
            <button className="AddButton" onClick={() => openModal("add")}>
              Add New
            </button>
          </div>
          <div className="DistributionStockGrid">
            {items.map((item) => (
              <div key={item.id} className="DistributionItemCard">
                <h2>{item.item}</h2>
                <div className="DistributionItemCardMiddle">
                  <ShoppingCartIcon className="DistributionItemCardIcon" />
                  <div className="DistributionItemCardDetails">
                  <span>
                    <strong>Price (LKR):</strong> {Number(item.unitPrice).toFixed(2)}
                  </span>
                  <span>
                    <strong>Quantity:</strong> {item.quantity}
                  </span>
                  <span>
                    <strong>Cost (LKR):</strong> {Number(item.itemCost).toFixed(2)}
                  </span>
                </div>
                </div>
                <div className="DistributionItemCardButtons">
                  <button
                    className="DeleteButton"
                    onClick={() => handleDeleteItem(item.id)}
                  >
                    Delete
                  </button>
                  <button
                    className="EditButton"
                    onClick={() => openModal("edit", item)}
                  >
                    Update
                  </button>
                  <button
                    className="AddStockButton"
                    onClick={() => openModal("addStock", item)}
                  >
                    Add
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {modal.add && (
        <Modal
          type="add"
          title="Add New Distribution Item"
          fields={[
            { name: "item", placeholder: "Enter Item Name" },
            { name: "unitPrice", placeholder: "Enter Unit Price", type: "number" },
            { name: "itemCost", placeholder: "Enter Unit Cost", type: "number" },
            { name: "quantity", placeholder: "Enter Quantity", type: "number" },
          ]}
          initialData={currentItem}
          onSubmit={handleAddItem}
          onCancel={() => closeModal("add")}
        />
      )}

      {modal.edit && (
        <Modal
          type="edit"
          title="Update Distribution Item"
          fields={[
            { name: "item", placeholder: "Enter Item Name" },
            { name: "unitPrice", placeholder: "Enter Unit Price", type: "number" },
            { name: "itemCost", placeholder: "Enter Unit Cost", type: "number" },
            { name: "quantity", placeholder: "Enter Quantity", type: "number" },
          ]}
          initialData={currentItem}
          onSubmit={handleEditItem}
          onCancel={() => closeModal("edit")}
        />
      )}

      {modal.addStock && (
        <Modal
          type="addStock"
          title="Add Stock to Item"
          fields={[
            { name: "quantityToAdd", placeholder: "Enter Quantity", type: "number" },
          ]}
          initialData={currentItem}
          onSubmit={handleAddStock}
          onCancel={() => closeModal("addStock")}
        />
      )}
    </div>
  );
};

export default DistributionStock;
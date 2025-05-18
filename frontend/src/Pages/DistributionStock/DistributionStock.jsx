import React, { useEffect, useState } from "react";
import "./DistributionStock.css";
import AdminNavbar from "../../components/AdminNavbar/AdminNavbar.jsx";
import AdminSidebar from "../../components/Sidebar/AdminSidebar/AdminSidebar.jsx";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import api from "../../api/axios.js"; // Using the centralized axios instance

const DistributionStock = () => {
  const [items, setItems] = useState([]);
  const [modal, setModal] = useState({
    add: false,
    edit: false,
    addStock: false,
  });
  const [formData, setFormData] = useState({
    add: { item: "", unitPrice: "", itemCost: "", quantity: "" },
    edit: { id: null, item: "", unitPrice: "", itemCost: "", quantity: "" },
    addStock: { id: null, quantityToAdd: "" },
  });

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const response = await api.get("/items");
      setItems(response.data);
    } catch (error) {
      console.error("Error fetching items:", error);
      alert("Failed to fetch items");
    }
  };

  const handleInputChange = (formType, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [formType]: { ...prev[formType], [field]: value },
    }));
  };

  const handleAddItem = async () => {
    try {
      const response = await api.post("/items", formData.add);
      setItems((prev) => [...prev, response.data.item]);
      setModal((prev) => ({ ...prev, add: false }));
      setFormData((prev) => ({
        ...prev,
        add: { item: "", unitPrice: "", itemCost: "", quantity: "" },
      }));
      alert("Item added successfully!");
    } catch (error) {
      console.error("Error adding item:", error);
      alert("Failed to add item.");
    }
  };

  const handleEditItem = async () => {
    try {
      await api.put(`/items/${formData.edit.id}`, formData.edit);
      setItems((prev) =>
        prev.map((item) =>
          item.id === formData.edit.id ? formData.edit : item
        )
      );
      setModal((prev) => ({ ...prev, edit: false }));
      alert("Item updated successfully!");
    } catch (error) {
      console.error("Error updating item:", error);
      alert("Failed to update item.");
    }
  };

  const handleAddStock = async () => {
    try {
      const response = await api.put(
        `/items/${formData.addStock.id}/add-stock`,
        { quantity: formData.addStock.quantityToAdd }
      );

      setItems((prev) =>
        prev.map((item) =>
          item.id === formData.addStock.id
            ? { ...item, quantity: response.data.quantity }
            : item
        )
      );
      setModal((prev) => ({ ...prev, addStock: false }));
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
      setItems((prev) => prev.filter((item) => item.id !== id));
      alert("Item deleted successfully!");
    } catch (error) {
      console.error("Error deleting item:", error);
      alert("Failed to delete item.");
    }
  };

  const openModal = (type, item = null) => {
    if (type === "edit") {
      setFormData((prev) => ({ ...prev, edit: { ...item } }));
    } else if (type === "addStock") {
      setFormData((prev) => ({
        ...prev,
        addStock: { id: item.id, quantityToAdd: "" },
      }));
    }
    setModal((prev) => ({ ...prev, [type]: true }));
  };

  const closeModal = (type) => {
    setModal((prev) => ({ ...prev, [type]: false }));
  };

  const Modal = ({ type, title, fields, onSubmit, onCancel }) => (
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
                value={formData[type][field.name]}
                onChange={(e) =>
                  handleInputChange(type, field.name, e.target.value)
                }
              />
            ))}
          </div>
        </div>
        <div className="ModalButtons">
          <button className="CancelButton" onClick={onCancel}>
            Cancel
          </button>
          <button className="SaveButton" onClick={onSubmit}>
            {type === "add" ? "Save" : type === "edit" ? "Update" : "Add Stock"}
          </button>
        </div>
      </div>
    </div>
  );

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
                      <strong>Price (LKR):</strong> {item.unitPrice}
                    </span>
                    <span>
                      <strong>Quantity:</strong> {item.quantity}
                    </span>
                    <span>
                      <strong>Cost (LKR)</strong> {item.itemCost}
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

      {/* Add Modal */}
      {modal.add && (
        <Modal
          type="add"
          title="Add New Distribution Item"
          fields={[
            { name: "item", placeholder: "Enter Item Name" },
            {
              name: "unitPrice",
              placeholder: "Enter Unit Price (LKR)",
              type: "number",
            },
            {
              name: "itemCost",
              placeholder: "Enter Unit Cost (LKR)",
              type: "number",
            },
            { name: "quantity", placeholder: "Enter Quantity", type: "number" },
          ]}
          onSubmit={handleAddItem}
          onCancel={() => closeModal("add")}
        />
      )}

      {/* Edit Modal */}
      {modal.edit && (
        <Modal
          type="edit"
          title="Update Distribution Item"
          fields={[
            { name: "item", placeholder: "Enter Item Name" },
            {
              name: "unitPrice",
              placeholder: "Enter Unit Price (LKR)",
              type: "number",
            },
            {
              name: "itemCost",
              placeholder: "Enter Unit Cost (LKR)",
              type: "number",
            },
            { name: "quantity", placeholder: "Enter Quantity", type: "number" },
          ]}
          onSubmit={handleEditItem}
          onCancel={() => closeModal("edit")}
        />
      )}

      {/* Add Stock Modal */}
      {modal.addStock && (
        <Modal
          type="addStock"
          title="Add Stock to Item"
          fields={[
            {
              name: "quantityToAdd",
              placeholder: "Enter Quantity To Add",
              type: "number",
            },
          ]}
          onSubmit={handleAddStock}
          onCancel={() => closeModal("addStock")}
        />
      )}
    </div>
  );
};

export default DistributionStock;

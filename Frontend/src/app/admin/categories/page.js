"use client";

import { useState, useEffect } from "react";

// Mock data
const mockCategories = [
    { id: 1, name: "Textiles & Fabrics", icon: "🧵", subcategories: 12, suppliers: 45, fields: 5, status: "active" },
    { id: 2, name: "Electronics & Components", icon: "📱", subcategories: 18, suppliers: 67, fields: 8, status: "active" },
    { id: 3, name: "Packaging Materials", icon: "📦", subcategories: 8, suppliers: 34, fields: 4, status: "active" },
    { id: 4, name: "Industrial Equipment", icon: "⚙️", subcategories: 15, suppliers: 28, fields: 7, status: "active" },
    { id: 5, name: "Chemicals & Raw Materials", icon: "🧪", subcategories: 10, suppliers: 22, fields: 6, status: "active" },
    { id: 6, name: "Furniture & Fittings", icon: "🪑", subcategories: 6, suppliers: 15, fields: 4, status: "inactive" },
];

const fieldTypes = ["Text", "Number", "Dropdown", "Date", "File Upload", "Checkbox"];

export default function CategoriesPage() {
    const [categories, setCategories] = useState(mockCategories);
    const [showModal, setShowModal] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [formData, setFormData] = useState({
        name: "",
        icon: "📁",
        status: "active",
        mandatoryFields: [{ name: "Product Name", type: "Text", required: true }],
        validationRules: ["Minimum 3 characters for product name"]
    });
    const [isMobile, setIsMobile] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener("resize", checkMobile);
        return () => window.removeEventListener("resize", checkMobile);
    }, []);

    const showMobile = mounted && isMobile;

    const openAddModal = () => {
        setEditingCategory(null);
        setFormData({
            name: "",
            icon: "📁",
            status: "active",
            mandatoryFields: [{ name: "Product Name", type: "Text", required: true }],
            validationRules: ["Minimum 3 characters for product name"]
        });
        setShowModal(true);
    };

    const openEditModal = (category) => {
        setEditingCategory(category);
        setFormData({
            name: category.name,
            icon: category.icon,
            status: category.status,
            mandatoryFields: [
                { name: "Product Name", type: "Text", required: true },
                { name: "Quantity", type: "Number", required: true },
                { name: "Price Range", type: "Text", required: false },
            ],
            validationRules: ["Minimum 3 characters for product name"]
        });
        setShowModal(true);
    };

    const handleSave = () => {
        if (editingCategory) {
            setCategories(categories.map(c =>
                c.id === editingCategory.id
                    ? { ...c, name: formData.name, icon: formData.icon, status: formData.status }
                    : c
            ));
        } else {
            setCategories([...categories, {
                id: Date.now(),
                name: formData.name,
                icon: formData.icon,
                subcategories: 0,
                suppliers: 0,
                fields: formData.mandatoryFields.length,
                status: formData.status
            }]);
        }
        setShowModal(false);
    };

    const addField = () => {
        setFormData({
            ...formData,
            mandatoryFields: [...formData.mandatoryFields, { name: "", type: "Text", required: false }]
        });
    };

    const removeField = (index) => {
        setFormData({
            ...formData,
            mandatoryFields: formData.mandatoryFields.filter((_, i) => i !== index)
        });
    };

    const toggleStatus = (categoryId) => {
        setCategories(categories.map(c =>
            c.id === categoryId
                ? { ...c, status: c.status === "active" ? "inactive" : "active" }
                : c
        ));
    };

    const icons = ["📁", "🧵", "📱", "📦", "⚙️", "🧪", "🪑", "🏭", "🔧", "💡", "🎨", "🏠"];

    return (
        <div>
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", flexWrap: "wrap", gap: "12px" }}>
                <div>
                    <h1 style={{ fontSize: showMobile ? "24px" : "28px", fontWeight: "bold", color: "white", marginBottom: "4px" }}>
                        Category Management
                    </h1>
                    <p style={{ color: "#64748b", fontSize: "14px" }}>
                        Create and manage product categories
                    </p>
                </div>
                <button onClick={openAddModal} style={{
                    padding: "12px 24px",
                    backgroundColor: "#3b82f6",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    fontSize: "14px",
                    fontWeight: "500",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px"
                }}>
                    + Add Category
                </button>
            </div>

            {/* Category Grid */}
            <div style={{
                display: "grid",
                gridTemplateColumns: showMobile ? "1fr" : "repeat(3, 1fr)",
                gap: "16px"
            }}>
                {categories.map((category) => (
                    <div key={category.id} style={{
                        backgroundColor: "#1e293b",
                        borderRadius: "12px",
                        border: "1px solid #334155",
                        padding: "20px",
                        opacity: category.status === "inactive" ? 0.6 : 1
                    }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                <span style={{
                                    width: "48px",
                                    height: "48px",
                                    borderRadius: "10px",
                                    backgroundColor: "#0f172a",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: "24px"
                                }}>
                                    {category.icon}
                                </span>
                                <div>
                                    <h3 style={{ color: "white", fontSize: "16px", fontWeight: "600" }}>{category.name}</h3>
                                    <span style={{
                                        padding: "2px 8px",
                                        backgroundColor: category.status === "active" ? "#22c55e20" : "#64748b20",
                                        color: category.status === "active" ? "#22c55e" : "#64748b",
                                        borderRadius: "10px",
                                        fontSize: "11px",
                                        textTransform: "uppercase"
                                    }}>
                                        {category.status}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px", marginBottom: "16px" }}>
                            <div style={{ textAlign: "center", padding: "10px", backgroundColor: "#0f172a", borderRadius: "8px" }}>
                                <div style={{ fontSize: "18px", fontWeight: "bold", color: "#3b82f6" }}>{category.subcategories}</div>
                                <div style={{ fontSize: "11px", color: "#64748b" }}>Subcategories</div>
                            </div>
                            <div style={{ textAlign: "center", padding: "10px", backgroundColor: "#0f172a", borderRadius: "8px" }}>
                                <div style={{ fontSize: "18px", fontWeight: "bold", color: "#22c55e" }}>{category.suppliers}</div>
                                <div style={{ fontSize: "11px", color: "#64748b" }}>Suppliers</div>
                            </div>
                            <div style={{ textAlign: "center", padding: "10px", backgroundColor: "#0f172a", borderRadius: "8px" }}>
                                <div style={{ fontSize: "18px", fontWeight: "bold", color: "#f59e0b" }}>{category.fields}</div>
                                <div style={{ fontSize: "11px", color: "#64748b" }}>Fields</div>
                            </div>
                        </div>

                        <div style={{ display: "flex", gap: "8px" }}>
                            <button onClick={() => openEditModal(category)} style={{
                                flex: 1,
                                padding: "10px",
                                backgroundColor: "#334155",
                                color: "white",
                                border: "none",
                                borderRadius: "6px",
                                fontSize: "13px",
                                cursor: "pointer"
                            }}>
                                Edit
                            </button>
                            <button onClick={() => toggleStatus(category.id)} style={{
                                flex: 1,
                                padding: "10px",
                                backgroundColor: category.status === "active" ? "#f59e0b20" : "#22c55e20",
                                color: category.status === "active" ? "#f59e0b" : "#22c55e",
                                border: "none",
                                borderRadius: "6px",
                                fontSize: "13px",
                                cursor: "pointer"
                            }}>
                                {category.status === "active" ? "Deactivate" : "Activate"}
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Add/Edit Modal */}
            {showModal && (
                <div style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: "rgba(0,0,0,0.7)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    zIndex: 100,
                    padding: "20px",
                    overflow: "auto"
                }}>
                    <div style={{
                        backgroundColor: "#1e293b",
                        borderRadius: "16px",
                        padding: "24px",
                        width: "100%",
                        maxWidth: "500px",
                        maxHeight: "90vh",
                        overflowY: "auto"
                    }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                            <h3 style={{ color: "white", fontSize: "18px", fontWeight: "600" }}>
                                {editingCategory ? "Edit Category" : "Add New Category"}
                            </h3>
                            <button onClick={() => setShowModal(false)} style={{
                                background: "none",
                                border: "none",
                                color: "#64748b",
                                fontSize: "24px",
                                cursor: "pointer"
                            }}>
                                ×
                            </button>
                        </div>

                        {/* Icon Selector */}
                        <div style={{ marginBottom: "20px" }}>
                            <label style={{ display: "block", color: "#94a3b8", fontSize: "14px", marginBottom: "8px" }}>Icon</label>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                                {icons.map((icon) => (
                                    <button
                                        key={icon}
                                        onClick={() => setFormData({ ...formData, icon })}
                                        style={{
                                            width: "40px",
                                            height: "40px",
                                            borderRadius: "8px",
                                            border: formData.icon === icon ? "2px solid #3b82f6" : "1px solid #334155",
                                            backgroundColor: formData.icon === icon ? "#3b82f620" : "#0f172a",
                                            fontSize: "20px",
                                            cursor: "pointer"
                                        }}
                                    >
                                        {icon}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Name */}
                        <div style={{ marginBottom: "20px" }}>
                            <label style={{ display: "block", color: "#94a3b8", fontSize: "14px", marginBottom: "8px" }}>Category Name</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="e.g., Textiles & Fabrics"
                                style={{
                                    width: "100%",
                                    padding: "12px 14px",
                                    backgroundColor: "#0f172a",
                                    border: "1px solid #334155",
                                    borderRadius: "8px",
                                    color: "white",
                                    fontSize: "14px",
                                    outline: "none",
                                    boxSizing: "border-box"
                                }}
                            />
                        </div>

                        {/* Mandatory Fields */}
                        <div style={{ marginBottom: "20px" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                                <label style={{ color: "#94a3b8", fontSize: "14px" }}>Mandatory Fields</label>
                                <button onClick={addField} style={{
                                    padding: "6px 12px",
                                    backgroundColor: "#334155",
                                    color: "#94a3b8",
                                    border: "none",
                                    borderRadius: "6px",
                                    fontSize: "12px",
                                    cursor: "pointer"
                                }}>
                                    + Add Field
                                </button>
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                                {formData.mandatoryFields.map((field, index) => (
                                    <div key={index} style={{
                                        display: "flex",
                                        gap: "8px",
                                        alignItems: "center",
                                        backgroundColor: "#0f172a",
                                        padding: "10px",
                                        borderRadius: "8px"
                                    }}>
                                        <input
                                            type="text"
                                            value={field.name}
                                            onChange={(e) => {
                                                const updated = [...formData.mandatoryFields];
                                                updated[index].name = e.target.value;
                                                setFormData({ ...formData, mandatoryFields: updated });
                                            }}
                                            placeholder="Field name"
                                            style={{
                                                flex: 1,
                                                padding: "8px",
                                                backgroundColor: "#1e293b",
                                                border: "1px solid #334155",
                                                borderRadius: "6px",
                                                color: "white",
                                                fontSize: "13px",
                                                outline: "none"
                                            }}
                                        />
                                        <select
                                            value={field.type}
                                            onChange={(e) => {
                                                const updated = [...formData.mandatoryFields];
                                                updated[index].type = e.target.value;
                                                setFormData({ ...formData, mandatoryFields: updated });
                                            }}
                                            style={{
                                                padding: "8px",
                                                backgroundColor: "#1e293b",
                                                border: "1px solid #334155",
                                                borderRadius: "6px",
                                                color: "white",
                                                fontSize: "13px",
                                                outline: "none"
                                            }}
                                        >
                                            {fieldTypes.map(t => <option key={t} value={t}>{t}</option>)}
                                        </select>
                                        <button onClick={() => removeField(index)} style={{
                                            padding: "6px 10px",
                                            backgroundColor: "#ef444420",
                                            color: "#ef4444",
                                            border: "none",
                                            borderRadius: "6px",
                                            cursor: "pointer"
                                        }}>
                                            ×
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Save Button */}
                        <button onClick={handleSave} style={{
                            width: "100%",
                            padding: "14px",
                            backgroundColor: "#3b82f6",
                            color: "white",
                            border: "none",
                            borderRadius: "8px",
                            fontSize: "15px",
                            fontWeight: "500",
                            cursor: "pointer"
                        }}>
                            {editingCategory ? "Save Changes" : "Create Category"}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

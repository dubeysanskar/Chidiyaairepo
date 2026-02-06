"use client";

import { useState, useEffect } from "react";
import ConfirmDialog from "../components/ConfirmDialog";

export default function CategoriesPage() {
    const [supplierCategoryRequests, setSupplierCategoryRequests] = useState([]);
    const [categoryTemplates, setCategoryTemplates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [totalSuppliers, setTotalSuppliers] = useState(0);
    const [pendingRequestsCount, setPendingRequestsCount] = useState(0);
    const [activeTab, setActiveTab] = useState("requests");
    const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, item: null, action: "" });

    // Template Builder State
    const [showTemplateModal, setShowTemplateModal] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState(null);
    const [templateForm, setTemplateForm] = useState({
        name: "",
        description: "",
        image: null,
        imagePreview: "",
        commonNames: "",
        specifications: []
    });
    const [savingTemplate, setSavingTemplate] = useState(false);

    // View Specs Modal
    const [viewingTemplate, setViewingTemplate] = useState(null);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const res = await fetch("/api/admin/categories");
            const data = await res.json();
            if (res.ok) {
                setSupplierCategoryRequests(data.supplierCategoryRequests || []);
                setCategoryTemplates(data.categoryTemplates || []);
                setTotalSuppliers(data.totalSuppliers || 0);
                setPendingRequestsCount(data.pendingRequestsCount || 0);
            }
        } catch (error) {
            console.error("Failed to fetch categories", error);
        } finally {
            setLoading(false);
        }
    };

    const handleApproveReject = async (requestId, action) => {
        try {
            const res = await fetch("/api/admin/categories", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ requestId, action })
            });

            if (res.ok) {
                fetchCategories();
            }
        } catch (error) {
            console.error("Approve/Reject failed", error);
        }
    };

    // Template Builder Functions
    const openAddTemplate = () => {
        setEditingTemplate(null);
        setTemplateForm({
            name: "",
            description: "",
            image: null,
            imagePreview: "",
            commonNames: "",
            specifications: []
        });
        setShowTemplateModal(true);
    };

    const openEditTemplate = (template) => {
        setEditingTemplate(template);
        setTemplateForm({
            name: template.name,
            description: template.description || "",
            image: null,
            imagePreview: template.image || "",
            commonNames: (template.commonNames || []).join(", "),
            specifications: template.specifications || []
        });
        setShowTemplateModal(true);
    };

    const addSpecSection = () => {
        setTemplateForm({
            ...templateForm,
            specifications: [
                ...templateForm.specifications,
                {
                    key: `spec_${Date.now()}`,
                    name: "",
                    type: "text", // text, select, multi
                    options: [],
                    required: false,
                    important: false,
                    hasOther: true // "Other (Specify)" option
                }
            ]
        });
    };

    const updateSpecSection = (index, field, value) => {
        const updated = [...templateForm.specifications];
        updated[index] = { ...updated[index], [field]: value };
        // Generate key from name if name changes
        if (field === "name") {
            updated[index].key = value.toLowerCase().replace(/[^a-z0-9]+/g, "_");
        }
        setTemplateForm({ ...templateForm, specifications: updated });
    };

    const removeSpecSection = (index) => {
        setTemplateForm({
            ...templateForm,
            specifications: templateForm.specifications.filter((_, i) => i !== index)
        });
    };

    const addOption = (specIndex) => {
        const updated = [...templateForm.specifications];
        updated[specIndex].options = [...(updated[specIndex].options || []), ""];
        setTemplateForm({ ...templateForm, specifications: updated });
    };

    const updateOption = (specIndex, optIndex, value) => {
        const updated = [...templateForm.specifications];
        updated[specIndex].options[optIndex] = value;
        setTemplateForm({ ...templateForm, specifications: updated });
    };

    const removeOption = (specIndex, optIndex) => {
        const updated = [...templateForm.specifications];
        updated[specIndex].options = updated[specIndex].options.filter((_, i) => i !== optIndex);
        setTemplateForm({ ...templateForm, specifications: updated });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setTemplateForm({
                ...templateForm,
                image: file,
                imagePreview: URL.createObjectURL(file)
            });
        }
    };

    const handleSaveTemplate = async () => {
        setSavingTemplate(true);
        try {
            const formData = new FormData();
            formData.append("name", templateForm.name);
            formData.append("description", templateForm.description);
            formData.append("commonNames", templateForm.commonNames);
            formData.append("specifications", JSON.stringify(templateForm.specifications));
            if (templateForm.image) {
                formData.append("image", templateForm.image);
            }
            if (editingTemplate) {
                formData.append("id", editingTemplate.id);
            }

            const res = await fetch("/api/admin/category-templates", {
                method: editingTemplate ? "PUT" : "POST",
                body: formData
            });

            if (res.ok) {
                setShowTemplateModal(false);
                fetchCategories();
            } else {
                const data = await res.json();
                alert(data.error || "Failed to save template");
            }
        } catch (error) {
            console.error("Save template failed", error);
            alert("Failed to save template");
        } finally {
            setSavingTemplate(false);
        }
    };

    const stats = [
        { label: "Pending Requests", value: pendingRequestsCount, color: "#f59e0b" },
        { label: "Category Templates", value: categoryTemplates.length, color: "#3b82f6" },
        { label: "Approved Categories", value: supplierCategoryRequests.filter(r => r.status === "approved").length, color: "#22c55e" },
        { label: "Total Suppliers", value: totalSuppliers, color: "#8b5cf6" },
    ];

    const tabs = [
        { id: "requests", label: "📋 Supplier Requests", badge: pendingRequestsCount },
        { id: "templates", label: "🏷️ Category Templates", badge: null },
    ];

    const inputStyle = {
        width: "100%",
        padding: "12px 16px",
        backgroundColor: "#0f172a",
        border: "1px solid #334155",
        borderRadius: "8px",
        color: "white",
        fontSize: "14px",
        outline: "none",
        boxSizing: "border-box"
    };

    return (
        <div>
            <style dangerouslySetInnerHTML={{
                __html: `
                .cat-title { font-size: 24px; font-weight: bold; color: white; margin-bottom: 4px; }
                .cat-stats { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-bottom: 24px; }
                .cat-stat { background: #1e293b; padding: 16px; border-radius: 10px; border: 1px solid #334155; text-align: center; }
                .cat-stat-value { font-size: 28px; font-weight: bold; }
                .cat-stat-label { font-size: 12px; color: #94a3b8; margin-top: 4px; }
                .cat-table { width: 100%; background: #1e293b; border-radius: 12px; border: 1px solid #334155; overflow: hidden; }
                .cat-table th { text-align: left; padding: 16px; background: #0f172a; color: #94a3b8; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; }
                .cat-table td { padding: 16px; border-top: 1px solid #334155; }
                .cat-btn { padding: 8px 14px; border-radius: 6px; font-size: 13px; cursor: pointer; border: none; transition: opacity 0.2s; }
                .cat-btn:hover { opacity: 0.8; }
                .cat-empty { padding: 40px; text-align: center; color: #64748b; }
                .cat-tabs { display: flex; gap: 8px; margin-bottom: 24px; flex-wrap: wrap; }
                .cat-tab { padding: 12px 20px; border-radius: 8px; font-size: 14px; cursor: pointer; border: 1px solid #334155; background: #1e293b; color: #94a3b8; display: flex; align-items: center; gap: 8px; }
                .cat-tab.active { background: #3b82f6; color: white; border-color: #3b82f6; }
                .cat-tab-badge { padding: 2px 8px; background: #ef4444; color: white; border-radius: 12px; font-size: 12px; font-weight: 600; }
                .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.8); display: flex; align-items: flex-start; justify-content: center; z-index: 9999; padding: 20px; overflow-y: auto; }
                .modal-content { background: #1e293b; border-radius: 16px; border: 1px solid #334155; max-width: 700px; width: 100%; padding: 24px; margin: 40px 0; }
                .spec-section { background: #0f172a; border: 1px solid #334155; border-radius: 12px; padding: 16px; margin-bottom: 16px; }
                .spec-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
                .option-row { display: flex; gap: 8px; align-items: center; margin-top: 8px; }
                
                @media (min-width: 768px) {
                    .cat-title { font-size: 28px; }
                    .cat-stats { grid-template-columns: repeat(4, 1fr); }
                }
            `}} />

            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", flexWrap: "wrap", gap: "12px" }}>
                <div>
                    <h1 className="cat-title">Categories Management</h1>
                    <p style={{ color: "#64748b", fontSize: "14px" }}>Manage category templates and approve supplier requests</p>
                </div>
            </div>

            {/* Stats */}
            <div className="cat-stats">
                {stats.map((stat, i) => (
                    <div key={i} className="cat-stat">
                        <div className="cat-stat-value" style={{ color: stat.color }}>{stat.value}</div>
                        <div className="cat-stat-label">{stat.label}</div>
                    </div>
                ))}
            </div>

            {/* Tabs */}
            <div className="cat-tabs">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        className={`cat-tab ${activeTab === tab.id ? "active" : ""}`}
                        onClick={() => setActiveTab(tab.id)}
                    >
                        {tab.label}
                        {tab.badge > 0 && <span className="cat-tab-badge">{tab.badge}</span>}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="cat-table">
                    <div className="cat-empty">Loading...</div>
                </div>
            ) : (
                <>
                    {/* Supplier Category Requests Tab */}
                    {activeTab === "requests" && (
                        <div>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                                <h2 style={{ color: "white", fontSize: "18px", fontWeight: "600" }}>Supplier Category Requests</h2>
                            </div>

                            {supplierCategoryRequests.length === 0 ? (
                                <div className="cat-table">
                                    <div className="cat-empty">
                                        <div style={{ fontSize: "48px", marginBottom: "12px" }}>📭</div>
                                        No category requests from suppliers yet.
                                    </div>
                                </div>
                            ) : (
                                <table className="cat-table">
                                    <thead>
                                        <tr>
                                            <th>Supplier</th>
                                            <th>Category</th>
                                            <th>Type</th>
                                            <th>Status</th>
                                            <th>Date</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {supplierCategoryRequests.map((req) => {
                                            // Check if supplier has other approved categories (expanding)
                                            const isExpanding = supplierCategoryRequests.filter(
                                                r => r.supplierId === req.supplierId && r.status === "approved"
                                            ).length > 0 && req.status === "pending";

                                            return (
                                                <tr key={req.id}>
                                                    <td>
                                                        <div style={{ color: "white", fontWeight: "500" }}>{req.supplierName}</div>
                                                        <div style={{ color: "#64748b", fontSize: "12px" }}>{req.supplierEmail}</div>
                                                    </td>
                                                    <td>
                                                        <div style={{ color: "white", fontWeight: "500" }}>
                                                            {req.categoryTemplateName || req.customName || "—"}
                                                        </div>
                                                        {!req.categoryTemplateName && req.customName && (
                                                            <div style={{ color: "#f59e0b", fontSize: "12px" }}>⚠️ New Category Request</div>
                                                        )}
                                                    </td>
                                                    <td>
                                                        {isExpanding ? (
                                                            <span style={{
                                                                padding: "4px 10px",
                                                                backgroundColor: "#8b5cf620",
                                                                color: "#8b5cf6",
                                                                borderRadius: "12px",
                                                                fontSize: "12px"
                                                            }}>
                                                                📈 Expanding
                                                            </span>
                                                        ) : req.status === "pending" ? (
                                                            <span style={{
                                                                padding: "4px 10px",
                                                                backgroundColor: "#3b82f620",
                                                                color: "#3b82f6",
                                                                borderRadius: "12px",
                                                                fontSize: "12px"
                                                            }}>
                                                                🆕 New Supplier
                                                            </span>
                                                        ) : (
                                                            <span style={{ color: "#64748b", fontSize: "12px" }}>—</span>
                                                        )}
                                                    </td>
                                                    <td>
                                                        <span style={{
                                                            padding: "6px 12px",
                                                            backgroundColor: req.status === "approved" ? "#22c55e20" : req.status === "rejected" ? "#ef444420" : "#f59e0b20",
                                                            color: req.status === "approved" ? "#22c55e" : req.status === "rejected" ? "#ef4444" : "#f59e0b",
                                                            borderRadius: "6px",
                                                            fontSize: "12px",
                                                            fontWeight: "500",
                                                            textTransform: "uppercase"
                                                        }}>
                                                            {req.status}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <span style={{ color: "#94a3b8", fontSize: "13px" }}>
                                                            {new Date(req.createdAt).toLocaleDateString()}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        {req.status === "pending" ? (
                                                            <div style={{ display: "flex", gap: "8px" }}>
                                                                <button
                                                                    onClick={() => handleApproveReject(req.id, "approve")}
                                                                    className="cat-btn"
                                                                    style={{ background: "#22c55e20", color: "#22c55e", border: "1px solid #22c55e" }}
                                                                >
                                                                    ✅ Approve
                                                                </button>
                                                                <button
                                                                    onClick={() => handleApproveReject(req.id, "reject")}
                                                                    className="cat-btn"
                                                                    style={{ background: "#ef444420", color: "#ef4444", border: "1px solid #ef4444" }}
                                                                >
                                                                    ❌ Reject
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <span style={{ color: "#64748b", fontSize: "13px" }}>—</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    )}

                    {/* Category Templates Tab */}
                    {activeTab === "templates" && (
                        <div>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                                <h2 style={{ color: "white", fontSize: "18px", fontWeight: "600" }}>Category Templates</h2>
                                <button
                                    onClick={openAddTemplate}
                                    style={{
                                        padding: "10px 20px",
                                        backgroundColor: "#3b82f6",
                                        color: "white",
                                        border: "none",
                                        borderRadius: "8px",
                                        fontSize: "14px",
                                        fontWeight: "500",
                                        cursor: "pointer"
                                    }}
                                >
                                    ➕ Add Template
                                </button>
                            </div>

                            {categoryTemplates.length === 0 ? (
                                <div className="cat-table">
                                    <div className="cat-empty">
                                        <div style={{ fontSize: "48px", marginBottom: "12px" }}>🏷️</div>
                                        No category templates yet. Add one to get started.
                                    </div>
                                </div>
                            ) : (
                                <table className="cat-table">
                                    <thead>
                                        <tr>
                                            <th>Template</th>
                                            <th>Specifications</th>
                                            <th>Suppliers</th>
                                            <th>Products</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {categoryTemplates.map((template) => (
                                            <tr key={template.id}>
                                                <td>
                                                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                                        {template.image ? (
                                                            <img src={template.image} alt={template.name} style={{ width: "40px", height: "40px", borderRadius: "8px", objectFit: "cover" }} />
                                                        ) : (
                                                            <div style={{ width: "40px", height: "40px", borderRadius: "8px", backgroundColor: "#334155", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px" }}>🏷️</div>
                                                        )}
                                                        <div>
                                                            <div style={{ color: "white", fontWeight: "500" }}>{template.name}</div>
                                                            {template.description && (
                                                                <div style={{ color: "#64748b", fontSize: "12px", marginTop: "2px" }}>{template.description.substring(0, 50)}...</div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>
                                                    <span style={{
                                                        padding: "4px 10px",
                                                        backgroundColor: "#3b82f620",
                                                        color: "#3b82f6",
                                                        borderRadius: "12px",
                                                        fontSize: "13px"
                                                    }}>
                                                        {(template.specifications || []).length} specs
                                                    </span>
                                                </td>
                                                <td>
                                                    <span style={{ color: "#94a3b8", fontSize: "14px" }}>
                                                        {template.supplierCount} suppliers
                                                    </span>
                                                </td>
                                                <td>
                                                    <span style={{ color: "#94a3b8", fontSize: "14px" }}>
                                                        {template.productCount} products
                                                    </span>
                                                </td>
                                                <td>
                                                    <div style={{ display: "flex", gap: "8px" }}>
                                                        <button
                                                            onClick={() => setViewingTemplate(template)}
                                                            className="cat-btn"
                                                            style={{ background: "#8b5cf620", color: "#8b5cf6" }}
                                                        >
                                                            👁️ View Specs
                                                        </button>
                                                        <button
                                                            onClick={() => openEditTemplate(template)}
                                                            className="cat-btn"
                                                            style={{ background: "#334155", color: "#94a3b8" }}
                                                        >
                                                            ✏️ Edit
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    )}
                </>
            )}

            {/* View Specs Modal */}
            {viewingTemplate && (
                <div className="modal-overlay" onClick={() => setViewingTemplate(null)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: "600px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                            <h3 style={{ color: "white", fontSize: "20px", margin: 0 }}>
                                📋 {viewingTemplate.name} - Specifications
                            </h3>
                            <button
                                onClick={() => setViewingTemplate(null)}
                                style={{ background: "none", border: "none", color: "#94a3b8", fontSize: "24px", cursor: "pointer" }}
                            >×</button>
                        </div>

                        {viewingTemplate.description && (
                            <p style={{ color: "#94a3b8", fontSize: "14px", marginBottom: "20px" }}>{viewingTemplate.description}</p>
                        )}

                        {(viewingTemplate.specifications || []).length === 0 ? (
                            <div style={{ padding: "32px", textAlign: "center", color: "#64748b" }}>
                                No specifications defined for this template.
                            </div>
                        ) : (
                            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                                {viewingTemplate.specifications.map((spec, i) => (
                                    <div key={i} style={{ background: "#0f172a", borderRadius: "8px", padding: "16px", border: "1px solid #334155" }}>
                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                                            <div style={{ color: "white", fontWeight: "500" }}>{spec.name}</div>
                                            <div style={{ display: "flex", gap: "8px" }}>
                                                <span style={{
                                                    padding: "2px 8px",
                                                    backgroundColor: spec.type === "text" ? "#3b82f620" : spec.type === "select" ? "#22c55e20" : "#8b5cf620",
                                                    color: spec.type === "text" ? "#3b82f6" : spec.type === "select" ? "#22c55e" : "#8b5cf6",
                                                    borderRadius: "4px",
                                                    fontSize: "11px",
                                                    textTransform: "uppercase"
                                                }}>
                                                    {spec.type === "text" ? "📝 Text" : spec.type === "select" ? "📋 Dropdown" : "☑️ Multi-Select"}
                                                </span>
                                                {spec.required && (
                                                    <span style={{ padding: "2px 8px", backgroundColor: "#ef444420", color: "#ef4444", borderRadius: "4px", fontSize: "11px" }}>Required</span>
                                                )}
                                                {spec.important && (
                                                    <span style={{ padding: "2px 8px", backgroundColor: "#f59e0b20", color: "#f59e0b", borderRadius: "4px", fontSize: "11px" }}>Important</span>
                                                )}
                                            </div>
                                        </div>
                                        {(spec.type === "select" || spec.type === "multi") && spec.options && spec.options.length > 0 && (
                                            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "8px" }}>
                                                {spec.options.map((opt, j) => (
                                                    <span key={j} style={{ padding: "4px 10px", backgroundColor: "#334155", color: "#94a3b8", borderRadius: "12px", fontSize: "12px" }}>{opt}</span>
                                                ))}
                                                {spec.hasOther && (
                                                    <span style={{ padding: "4px 10px", backgroundColor: "#f59e0b20", color: "#f59e0b", borderRadius: "12px", fontSize: "12px" }}>+ Other (Specify)</span>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}

                        <div style={{ marginTop: "24px", display: "flex", gap: "12px" }}>
                            <button
                                onClick={() => { setViewingTemplate(null); openEditTemplate(viewingTemplate); }}
                                style={{ flex: 1, padding: "12px", backgroundColor: "#3b82f6", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "500" }}
                            >
                                ✏️ Edit Template
                            </button>
                            <button
                                onClick={() => setViewingTemplate(null)}
                                style={{ flex: 1, padding: "12px", backgroundColor: "#334155", color: "#94a3b8", border: "none", borderRadius: "8px", cursor: "pointer" }}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Add/Edit Template Modal */}
            {showTemplateModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
                            <h3 style={{ color: "white", fontSize: "20px", margin: 0 }}>
                                {editingTemplate ? "✏️ Edit Category Template" : "➕ Create Category Template"}
                            </h3>
                            <button
                                onClick={() => setShowTemplateModal(false)}
                                style={{ background: "none", border: "none", color: "#94a3b8", fontSize: "24px", cursor: "pointer" }}
                            >×</button>
                        </div>

                        {/* Basic Info */}
                        <div style={{ marginBottom: "24px" }}>
                            <h4 style={{ color: "#94a3b8", fontSize: "14px", marginBottom: "16px", textTransform: "uppercase", letterSpacing: "0.5px" }}>📌 Basic Information</h4>

                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                                <div>
                                    <label style={{ display: "block", color: "#94a3b8", fontSize: "13px", marginBottom: "8px" }}>Category Name *</label>
                                    <input
                                        type="text"
                                        value={templateForm.name}
                                        onChange={(e) => setTemplateForm({ ...templateForm, name: e.target.value })}
                                        placeholder="e.g., Paper Cups, Corrugated Boxes"
                                        style={inputStyle}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: "block", color: "#94a3b8", fontSize: "13px", marginBottom: "8px" }}>Template Image</label>
                                    <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                                        {templateForm.imagePreview && (
                                            <img src={templateForm.imagePreview} alt="Preview" style={{ width: "48px", height: "48px", borderRadius: "8px", objectFit: "cover" }} />
                                        )}
                                        <label style={{ ...inputStyle, padding: "10px 16px", cursor: "pointer", textAlign: "center", color: "#64748b" }}>
                                            📷 {templateForm.imagePreview ? "Change" : "Upload"}
                                            <input type="file" accept="image/*" onChange={handleImageChange} style={{ display: "none" }} />
                                        </label>
                                    </div>
                                </div>
                            </div>

                            <div style={{ marginBottom: "16px" }}>
                                <label style={{ display: "block", color: "#94a3b8", fontSize: "13px", marginBottom: "8px" }}>Description</label>
                                <textarea
                                    value={templateForm.description}
                                    onChange={(e) => setTemplateForm({ ...templateForm, description: e.target.value })}
                                    placeholder="Brief description of this category..."
                                    rows={2}
                                    style={{ ...inputStyle, resize: "vertical" }}
                                />
                            </div>

                            <div>
                                <label style={{ display: "block", color: "#94a3b8", fontSize: "13px", marginBottom: "8px" }}>
                                    Common Indian Names <span style={{ color: "#64748b" }}>(for chatbot matching)</span>
                                </label>
                                <input
                                    type="text"
                                    value={templateForm.commonNames}
                                    onChange={(e) => setTemplateForm({ ...templateForm, commonNames: e.target.value })}
                                    placeholder="e.g., kagaz ke cup, disposable glass, paper glass (comma separated)"
                                    style={inputStyle}
                                />
                                <p style={{ color: "#64748b", fontSize: "12px", marginTop: "6px" }}>
                                    💡 Enter common names users might use when searching. Separate with commas.
                                </p>
                            </div>
                        </div>

                        {/* Specification Sections */}
                        <div style={{ marginBottom: "24px" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                                <h4 style={{ color: "#94a3b8", fontSize: "14px", margin: 0, textTransform: "uppercase", letterSpacing: "0.5px" }}>⚙️ Specification Sections</h4>
                                <button
                                    onClick={addSpecSection}
                                    style={{ padding: "8px 16px", backgroundColor: "#22c55e20", color: "#22c55e", border: "1px solid #22c55e", borderRadius: "6px", fontSize: "13px", cursor: "pointer" }}
                                >
                                    ➕ Add Section
                                </button>
                            </div>

                            {templateForm.specifications.length === 0 ? (
                                <div style={{ padding: "32px", textAlign: "center", color: "#64748b", backgroundColor: "#0f172a", borderRadius: "12px", border: "1px dashed #334155" }}>
                                    No specification sections yet. Click "Add Section" to create one.
                                </div>
                            ) : (
                                templateForm.specifications.map((spec, specIndex) => (
                                    <div key={specIndex} className="spec-section">
                                        <div className="spec-header">
                                            <span style={{ color: "#64748b", fontSize: "12px" }}>Section {specIndex + 1}</span>
                                            <button
                                                onClick={() => removeSpecSection(specIndex)}
                                                style={{ background: "none", border: "none", color: "#ef4444", fontSize: "18px", cursor: "pointer" }}
                                            >🗑️</button>
                                        </div>

                                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
                                            <div>
                                                <label style={{ display: "block", color: "#94a3b8", fontSize: "12px", marginBottom: "6px" }}>Section Name</label>
                                                <input
                                                    type="text"
                                                    value={spec.name}
                                                    onChange={(e) => updateSpecSection(specIndex, "name", e.target.value)}
                                                    placeholder="e.g., Material, Size, Color"
                                                    style={{ ...inputStyle, padding: "10px 12px", fontSize: "13px" }}
                                                />
                                            </div>
                                            <div>
                                                <label style={{ display: "block", color: "#94a3b8", fontSize: "12px", marginBottom: "6px" }}>Field Type</label>
                                                <select
                                                    value={spec.type}
                                                    onChange={(e) => updateSpecSection(specIndex, "type", e.target.value)}
                                                    style={{ ...inputStyle, padding: "10px 12px", fontSize: "13px", cursor: "pointer" }}
                                                >
                                                    <option value="text">📝 Text Input (blank field)</option>
                                                    <option value="select">📋 Dropdown (single choice)</option>
                                                    <option value="multi">☑️ Multi-Select (multiple choice)</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div style={{ display: "flex", gap: "16px", marginBottom: "12px" }}>
                                            <label style={{ display: "flex", alignItems: "center", gap: "6px", color: "#94a3b8", fontSize: "13px", cursor: "pointer" }}>
                                                <input
                                                    type="checkbox"
                                                    checked={spec.required}
                                                    onChange={(e) => updateSpecSection(specIndex, "required", e.target.checked)}
                                                />
                                                Required
                                            </label>
                                            <label style={{ display: "flex", alignItems: "center", gap: "6px", color: "#94a3b8", fontSize: "13px", cursor: "pointer" }}>
                                                <input
                                                    type="checkbox"
                                                    checked={spec.important}
                                                    onChange={(e) => updateSpecSection(specIndex, "important", e.target.checked)}
                                                />
                                                Show on Search (Important)
                                            </label>
                                            {(spec.type === "select" || spec.type === "multi") && (
                                                <label style={{ display: "flex", alignItems: "center", gap: "6px", color: "#f59e0b", fontSize: "13px", cursor: "pointer" }}>
                                                    <input
                                                        type="checkbox"
                                                        checked={spec.hasOther !== false}
                                                        onChange={(e) => updateSpecSection(specIndex, "hasOther", e.target.checked)}
                                                    />
                                                    Include "Other (Specify)"
                                                </label>
                                            )}
                                        </div>

                                        {/* Options for select/multi */}
                                        {(spec.type === "select" || spec.type === "multi") && (
                                            <div style={{ marginTop: "12px", paddingTop: "12px", borderTop: "1px solid #334155" }}>
                                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                                                    <label style={{ color: "#94a3b8", fontSize: "12px" }}>Options</label>
                                                    <button
                                                        onClick={() => addOption(specIndex)}
                                                        style={{ padding: "4px 12px", backgroundColor: "#334155", color: "#94a3b8", border: "none", borderRadius: "4px", fontSize: "12px", cursor: "pointer" }}
                                                    >
                                                        + Add Option
                                                    </button>
                                                </div>
                                                {(spec.options || []).map((opt, optIndex) => (
                                                    <div key={optIndex} className="option-row">
                                                        <input
                                                            type="text"
                                                            value={opt}
                                                            onChange={(e) => updateOption(specIndex, optIndex, e.target.value)}
                                                            placeholder={`Option ${optIndex + 1}`}
                                                            style={{ ...inputStyle, padding: "8px 12px", fontSize: "13px", flex: 1 }}
                                                        />
                                                        <button
                                                            onClick={() => removeOption(specIndex, optIndex)}
                                                            style={{ padding: "8px 12px", backgroundColor: "#ef444420", color: "#ef4444", border: "none", borderRadius: "6px", cursor: "pointer" }}
                                                        >
                                                            ×
                                                        </button>
                                                    </div>
                                                ))}
                                                {(spec.options || []).length === 0 && (
                                                    <p style={{ color: "#64748b", fontSize: "12px", fontStyle: "italic" }}>No options added yet.</p>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Save Buttons */}
                        <div style={{ display: "flex", gap: "12px" }}>
                            <button
                                onClick={() => setShowTemplateModal(false)}
                                style={{ flex: 1, padding: "14px", backgroundColor: "#334155", color: "#94a3b8", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "14px" }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveTemplate}
                                disabled={!templateForm.name.trim() || savingTemplate}
                                style={{
                                    flex: 2,
                                    padding: "14px",
                                    backgroundColor: templateForm.name.trim() && !savingTemplate ? "#3b82f6" : "#1e293b",
                                    color: "white",
                                    border: "none",
                                    borderRadius: "8px",
                                    cursor: templateForm.name.trim() && !savingTemplate ? "pointer" : "not-allowed",
                                    fontSize: "14px",
                                    fontWeight: "600"
                                }}
                            >
                                {savingTemplate ? "Saving..." : editingTemplate ? "💾 Update Template" : "✅ Create Template"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

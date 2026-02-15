"use client";

import { useState, useEffect } from "react";

export default function SupplierProfilesPage() {
    const [suppliers, setSuppliers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("all");
    const [selectedSupplier, setSelectedSupplier] = useState(null);
    const [activeProfileTab, setActiveProfileTab] = useState("details");
    const [categoryTemplates, setCategoryTemplates] = useState([]);

    useEffect(() => {
        fetchSuppliers();
        fetchCategoryTemplates();
    }, []);

    const fetchSuppliers = async () => {
        try {
            const res = await fetch("/api/admin/suppliers");
            const data = await res.json();
            if (res.ok) {
                // Only show approved suppliers
                setSuppliers(data.filter(s => s.status === "approved"));
            }
        } catch (error) {
            console.error("Failed to fetch suppliers", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchCategoryTemplates = async () => {
        try {
            const res = await fetch("/api/categories/templates");
            if (res.ok) {
                const data = await res.json();
                setCategoryTemplates(data.categories || []);
            }
        } catch (error) {
            console.error("Failed to fetch category templates", error);
        }
    };

    // Dynamic categories from CategoryTemplate (database-driven)
    const allCategories = categoryTemplates.map(t => t.name).sort();

    // Filter suppliers
    const filtered = suppliers.filter(s => {
        const matchesSearch = !search ||
            s.companyName?.toLowerCase().includes(search.toLowerCase()) ||
            s.email?.toLowerCase().includes(search.toLowerCase()) ||
            s.city?.toLowerCase().includes(search.toLowerCase());
        const matchesCategory = categoryFilter === "all" ||
            (s.supplierCategories || []).some(sc => sc.categoryTemplate?.name === categoryFilter) ||
            (s.productCategories || []).includes(categoryFilter);
        return matchesSearch && matchesCategory;
    });

    const getAverageRating = (ratings) => {
        if (!ratings || ratings.length === 0) return null;
        const avg = ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length;
        return avg.toFixed(1);
    };

    const isImage = (url) => /\.(jpg|jpeg|png|gif|webp)$/i.test(url || "");
    const isPdf = (url) => /\.pdf$/i.test(url || "");

    if (loading) {
        return (
            <div style={{ padding: "40px", textAlign: "center", color: "#94a3b8" }}>
                Loading supplier profiles...
            </div>
        );
    }

    return (
        <div>
            <style dangerouslySetInnerHTML={{
                __html: `
                .sp-page { padding: 0; }
                .sp-header { margin-bottom: 24px; }
                .sp-title { font-size: 28px; font-weight: bold; color: white; margin-bottom: 4px; }
                .sp-subtitle { color: #64748b; font-size: 14px; }
                .sp-filters { display: flex; gap: 12px; margin-bottom: 24px; flex-wrap: wrap; }
                .sp-search { flex: 1; min-width: 200px; padding: 12px 16px; background: #1e293b; border: 1px solid #334155; border-radius: 10px; color: white; font-size: 14px; outline: none; }
                .sp-search:focus { border-color: #3b82f6; }
                .sp-search::placeholder { color: #64748b; }
                .sp-select { padding: 12px 16px; background: #1e293b; border: 1px solid #334155; border-radius: 10px; color: white; font-size: 14px; outline: none; min-width: 180px; }
                .sp-select:focus { border-color: #3b82f6; }
                .sp-count { color: #64748b; font-size: 13px; padding: 8px 0; }
                .sp-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 16px; }
                .sp-card { background: #1e293b; border: 1px solid #334155; border-radius: 12px; padding: 20px; cursor: pointer; transition: all 0.2s; }
                .sp-card:hover { border-color: #3b82f6; transform: translateY(-2px); box-shadow: 0 8px 25px rgba(0,0,0,0.3); }
                .sp-card-name { font-size: 18px; font-weight: 600; color: white; margin-bottom: 8px; display: flex; align-items: center; gap: 10px; }
                .sp-card-meta { font-size: 13px; color: #94a3b8; margin-bottom: 12px; display: flex; flex-direction: column; gap: 4px; }
                .sp-card-cats { display: flex; flex-wrap: wrap; gap: 6px; }
                .sp-cat-tag { padding: 4px 10px; background: #334155; border-radius: 12px; font-size: 11px; color: #94a3b8; }
                .sp-card-stats { display: flex; gap: 16px; margin-top: 12px; padding-top: 12px; border-top: 1px solid #334155; font-size: 12px; color: #64748b; }
                .sp-stat { display: flex; align-items: center; gap: 4px; }

                /* Profile View */
                .sp-profile { background: #0f172a; border-radius: 16px; border: 1px solid #334155; overflow: hidden; }
                .sp-profile-header { padding: 24px; background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); border-bottom: 1px solid #334155; }
                .sp-profile-back { background: none; border: none; color: #3b82f6; cursor: pointer; font-size: 14px; padding: 8px 0; margin-bottom: 16px; display: flex; align-items: center; gap: 6px; }
                .sp-profile-back:hover { color: #60a5fa; }
                .sp-profile-name { font-size: 24px; font-weight: bold; color: white; margin-bottom: 8px; }
                .sp-profile-meta { color: #94a3b8; font-size: 14px; display: flex; flex-wrap: wrap; gap: 16px; }
                .sp-profile-tabs { display: flex; gap: 0; border-bottom: 1px solid #334155; background: #1e293b; overflow-x: auto; }
                .sp-profile-tab { padding: 14px 20px; font-size: 14px; color: #94a3b8; cursor: pointer; border: none; background: none; border-bottom: 2px solid transparent; white-space: nowrap; transition: all 0.2s; }
                .sp-profile-tab:hover { color: white; }
                .sp-profile-tab.active { color: #3b82f6; border-bottom-color: #3b82f6; }
                .sp-profile-body { padding: 24px; }
                .sp-detail-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 16px; }
                .sp-detail-card { background: #1e293b; border-radius: 10px; padding: 16px; border: 1px solid #334155; }
                .sp-detail-label { font-size: 11px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px; }
                .sp-detail-value { font-size: 15px; color: white; word-break: break-all; }
                .sp-doc-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 16px; }
                .sp-doc-card { background: #1e293b; border-radius: 12px; border: 1px solid #334155; overflow: hidden; }
                .sp-doc-preview { height: 140px; background: #020617; display: flex; align-items: center; justify-content: center; position: relative; }
                .sp-doc-info { padding: 12px; }
                .sp-product-card { background: #1e293b; border-radius: 10px; padding: 16px; border: 1px solid #334155; }
                .sp-product-name { color: white; font-weight: 500; font-size: 15px; margin-bottom: 6px; }
                .sp-product-cat { color: #3b82f6; font-size: 12px; margin-bottom: 6px; }
                .sp-product-desc { color: #94a3b8; font-size: 13px; margin-bottom: 8px; }
                .sp-product-meta { display: flex; gap: 16px; font-size: 12px; color: #64748b; flex-wrap: wrap; }
                .sp-rating-card { background: #1e293b; border-radius: 10px; padding: 16px; border: 1px solid #334155; }
                .sp-badge-list { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 12px; }
                .sp-badges-inline { display: flex; gap: 6px; flex-wrap: wrap; }

                .sp-empty { padding: 60px 40px; text-align: center; color: #64748b; }
                .sp-empty-icon { font-size: 48px; margin-bottom: 12px; }

                @media (max-width: 768px) {
                    .sp-grid { grid-template-columns: 1fr; }
                    .sp-detail-grid { grid-template-columns: 1fr; }
                    .sp-doc-grid { grid-template-columns: 1fr; }
                    .sp-filters { flex-direction: column; }
                }
            `}} />

            {selectedSupplier ? (
                /* ============ PROFILE VIEW ============ */
                <div className="sp-profile">
                    {/* Header */}
                    <div className="sp-profile-header">
                        <button className="sp-profile-back" onClick={() => { setSelectedSupplier(null); setActiveProfileTab("details"); }}>
                            ← Back to Supplier List
                        </button>
                        <div className="sp-profile-name">
                            {selectedSupplier.companyName}
                            {selectedSupplier.ratings && selectedSupplier.ratings.length > 0 && (
                                <span style={{ fontSize: "16px", color: "#f59e0b", fontWeight: "500", marginLeft: "12px" }}>
                                    ⭐ {getAverageRating(selectedSupplier.ratings)} ({selectedSupplier.ratings.length})
                                </span>
                            )}
                        </div>
                        <div className="sp-profile-meta">
                            <span>📧 {selectedSupplier.email}</span>
                            <span>📱 {selectedSupplier.phone || "N/A"}</span>
                            <span>📍 {selectedSupplier.city || selectedSupplier.serviceLocations || "N/A"}</span>
                        </div>
                        {selectedSupplier.badges && selectedSupplier.badges.length > 0 && (
                            <div className="sp-badge-list">
                                {selectedSupplier.badges.map(badge => {
                                    const badgeInfo = {
                                        verified: { label: "Verified ✓", color: "#8b5cf6" },
                                        gst: { label: "GST ✓", color: "#22c55e" },
                                        premium: { label: "Premium ★", color: "#3b82f6" },
                                        top_rated: { label: "Top Rated 🏆", color: "#f59e0b" },
                                        fast_delivery: { label: "Fast Delivery 🚀", color: "#14b8a6" },
                                    }[badge] || { label: badge, color: "#94a3b8" };
                                    return (
                                        <span key={badge} style={{
                                            padding: "4px 12px", backgroundColor: `${badgeInfo.color}20`,
                                            color: badgeInfo.color, borderRadius: "12px", fontSize: "12px", fontWeight: "500"
                                        }}>
                                            {badgeInfo.label}
                                        </span>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Tabs */}
                    <div className="sp-profile-tabs">
                        {["details", "categories", "products", "documents", "ratings"].map(tab => (
                            <button
                                key={tab}
                                className={`sp-profile-tab ${activeProfileTab === tab ? "active" : ""}`}
                                onClick={() => setActiveProfileTab(tab)}
                            >
                                {tab === "details" && "📋 Details"}

                                {tab === "categories" && `Categories (${(selectedSupplier.supplierCategories || []).length})`}
                                {tab === "products" && `📦 Products (${(selectedSupplier.products || []).length})`}
                                {tab === "documents" && `📄 Documents (${(selectedSupplier.documents || []).length})`}
                                {tab === "ratings" && `⭐ Ratings (${(selectedSupplier.ratings || []).length})`}
                            </button>
                        ))}
                    </div>

                    {/* Tab Content */}
                    <div className="sp-profile-body">
                        {/* Details Tab */}
                        {activeProfileTab === "details" && (
                            <div>
                                <h3 style={{ color: "#3b82f6", fontSize: "14px", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "16px" }}>
                                    Company Information
                                </h3>
                                <div className="sp-detail-grid">
                                    {[
                                        { label: "Company Name", value: selectedSupplier.companyName },
                                        { label: "Email", value: selectedSupplier.email },
                                        { label: "Phone", value: selectedSupplier.phone },
                                        { label: "GST Number", value: selectedSupplier.gstNumber },
                                        { label: "PAN Number", value: selectedSupplier.panNumber },
                                        { label: "City", value: selectedSupplier.city },
                                        { label: "State", value: selectedSupplier.state },
                                        { label: "Address", value: selectedSupplier.address },
                                        { label: "Pincode", value: selectedSupplier.pincode },
                                        { label: "Website", value: selectedSupplier.website },
                                        { label: "Capacity", value: selectedSupplier.capacity },
                                        { label: "MOQ", value: selectedSupplier.moq },
                                        { label: "Service Locations", value: selectedSupplier.serviceLocations },
                                        { label: "Established Year", value: selectedSupplier.establishedYear },
                                        { label: "Employee Count", value: selectedSupplier.employeeCount },
                                        { label: "Certifications", value: selectedSupplier.certifications },
                                        { label: "Registered On", value: selectedSupplier.createdAt ? new Date(selectedSupplier.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : null },
                                    ].filter(item => item.value).map((item, i) => (
                                        <div key={i} className="sp-detail-card">
                                            <div className="sp-detail-label">{item.label}</div>
                                            <div className="sp-detail-value">{item.value}</div>
                                        </div>
                                    ))}
                                </div>

                                {selectedSupplier.productCategories && selectedSupplier.productCategories.length > 0 && (
                                    <div style={{ marginTop: "24px" }}>
                                        <h3 style={{ color: "#3b82f6", fontSize: "14px", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "12px" }}>
                                            Product Categories
                                        </h3>
                                        <div className="sp-card-cats">
                                            {selectedSupplier.productCategories.map((cat, i) => (
                                                <span key={i} className="sp-cat-tag" style={{ fontSize: "13px", padding: "6px 14px" }}>{cat}</span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {selectedSupplier.description && (
                                    <div style={{ marginTop: "24px" }}>
                                        <h3 style={{ color: "#3b82f6", fontSize: "14px", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "12px" }}>
                                            Description
                                        </h3>
                                        <p style={{ color: "#94a3b8", fontSize: "14px", lineHeight: "1.6" }}>{selectedSupplier.description}</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Categories Tab */}
                        {activeProfileTab === "categories" && (
                            <div>
                                {(!selectedSupplier.supplierCategories || selectedSupplier.supplierCategories.length === 0) ? (
                                    <div className="sp-empty">
                                        <div className="sp-empty-icon">\uD83C\uDFF7\uFE0F</div>
                                        <div>No categories assigned</div>
                                    </div>
                                ) : (
                                    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                                        {selectedSupplier.supplierCategories.map((cat, i) => {
                                            const isMapped = !!cat.categoryTemplateId;
                                            const categoryName = isMapped ? cat.categoryTemplate?.name : (cat.customName || "Custom Category");
                                            const productCount = (selectedSupplier.products || []).filter(p => p.supplierCategoryId === cat.id).length;
                                            return (
                                                <div key={i} style={{ background: "#1e293b", borderRadius: "12px", padding: "20px", border: `1px solid ${isMapped ? "#22c55e30" : "#f59e0b30"}` }}>
                                                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px", flexWrap: "wrap", gap: "8px" }}>
                                                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                                            <span style={{ fontSize: "17px", color: "white", fontWeight: "600" }}>{categoryName}</span>
                                                            {cat.isPrimary && <span style={{ padding: "3px 10px", background: "#3b82f620", color: "#3b82f6", fontSize: "11px", borderRadius: "8px", fontWeight: "600" }}>PRIMARY</span>}
                                                        </div>
                                                        <span style={{ padding: "5px 12px", borderRadius: "10px", fontSize: "12px", fontWeight: "600", background: isMapped ? "#22c55e20" : "#f59e0b20", color: isMapped ? "#22c55e" : "#f59e0b" }}>
                                                            {isMapped ? "Mapped" : "Unmapped"}
                                                        </span>
                                                    </div>
                                                    {isMapped && <div style={{ fontSize: "13px", color: "#94a3b8", marginBottom: "6px" }}>Template: <span style={{ color: "#22c55e", fontWeight: "500" }}>{cat.categoryTemplate?.name}</span></div>}
                                                    {cat.customDescription && <div style={{ fontSize: "13px", color: "#94a3b8", padding: "10px 12px", background: "#0f172a", borderRadius: "8px", lineHeight: "1.5", marginBottom: "8px" }}>{cat.customDescription}</div>}
                                                    <div style={{ display: "flex", gap: "16px", fontSize: "12px", color: "#64748b" }}>
                                                        <span>Status: <span style={{ color: cat.status === "approved" ? "#22c55e" : "#f59e0b", fontWeight: "500" }}>{cat.status}</span></span>
                                                        <span>Products: {productCount}</span>
                                                        {cat.createdAt && <span>Added: {new Date(cat.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Products Tab */}
                        {activeProfileTab === "products" && (
                            <div>
                                {(!selectedSupplier.products || selectedSupplier.products.length === 0) ? (
                                    <div className="sp-empty">
                                        <div className="sp-empty-icon">📭</div>
                                        <div>No products listed yet</div>
                                    </div>
                                ) : (
                                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "16px" }}>
                                        {selectedSupplier.products.map((product, i) => (
                                            <div key={i} className="sp-product-card">
                                                <div className="sp-product-name">{product.name}</div>
                                                {product.category && <div className="sp-product-cat">{product.category}</div>}
                                                {product.description && <div className="sp-product-desc">{product.description}</div>}
                                                <div className="sp-product-meta">
                                                    {product.priceRange && <span>💰 {product.priceRange}</span>}
                                                    {product.moq && <span>📦 MOQ: {product.moq}</span>}
                                                    {product.leadTime && <span>⏱️ {product.leadTime}</span>}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Documents Tab */}
                        {activeProfileTab === "documents" && (
                            <div>
                                {(!selectedSupplier.documents || selectedSupplier.documents.length === 0) ? (
                                    <div className="sp-empty">
                                        <div className="sp-empty-icon">📭</div>
                                        <div>No documents submitted</div>
                                    </div>
                                ) : (
                                    <div className="sp-doc-grid">
                                        {selectedSupplier.documents.map((doc, i) => (
                                            <div key={i} className="sp-doc-card">
                                                <div className="sp-doc-preview">
                                                    {isImage(doc.fileUrl) ? (
                                                        <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer" style={{ width: "100%", height: "100%" }}>
                                                            <img src={doc.fileUrl} alt={doc.fileName || doc.docType}
                                                                style={{ width: "100%", height: "100%", objectFit: "contain" }}
                                                                onError={(e) => { e.target.style.display = "none"; }}
                                                            />
                                                        </a>
                                                    ) : isPdf(doc.fileUrl) ? (
                                                        <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer"
                                                            style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", textDecoration: "none" }}>
                                                            <div style={{ fontSize: "42px" }}>📄</div>
                                                            <span style={{ color: "#3b82f6", fontSize: "12px" }}>Click to View PDF</span>
                                                        </a>
                                                    ) : (
                                                        <a href={doc.fileUrl || "#"} target="_blank" rel="noopener noreferrer"
                                                            style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", textDecoration: "none" }}>
                                                            <div style={{ fontSize: "42px" }}>📁</div>
                                                            <span style={{ color: "#94a3b8", fontSize: "12px" }}>View File</span>
                                                        </a>
                                                    )}
                                                    <span style={{
                                                        position: "absolute", top: "8px", right: "8px",
                                                        padding: "3px 8px", borderRadius: "10px", fontSize: "10px",
                                                        fontWeight: "500", textTransform: "uppercase",
                                                        backgroundColor: doc.status === "verified" ? "#22c55e20" : doc.status === "rejected" ? "#ef444420" : "#f59e0b20",
                                                        color: doc.status === "verified" ? "#22c55e" : doc.status === "rejected" ? "#ef4444" : "#f59e0b"
                                                    }}>
                                                        {doc.status}
                                                    </span>
                                                </div>
                                                <div className="sp-doc-info">
                                                    <div style={{ color: "white", fontWeight: "500", fontSize: "13px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                                        {doc.fileName || doc.docType}
                                                    </div>
                                                    <div style={{ color: "#64748b", fontSize: "11px", marginTop: "4px", textTransform: "capitalize" }}>
                                                        {doc.docType?.replace(/([A-Z])/g, " $1").replace(/^./, s => s.toUpperCase())}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Ratings Tab */}
                        {activeProfileTab === "ratings" && (
                            <div>
                                {(!selectedSupplier.ratings || selectedSupplier.ratings.length === 0) ? (
                                    <div className="sp-empty">
                                        <div className="sp-empty-icon">⭐</div>
                                        <div>No ratings yet</div>
                                    </div>
                                ) : (
                                    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                                        {/* Rating Summary */}
                                        <div style={{
                                            background: "#1e293b", borderRadius: "12px", padding: "20px",
                                            border: "1px solid #334155", display: "flex", alignItems: "center",
                                            gap: "20px", marginBottom: "8px"
                                        }}>
                                            <div style={{ fontSize: "48px", fontWeight: "bold", color: "#f59e0b" }}>
                                                {getAverageRating(selectedSupplier.ratings)}
                                            </div>
                                            <div>
                                                <div style={{ color: "#f59e0b", fontSize: "20px", marginBottom: "4px" }}>
                                                    {"⭐".repeat(Math.round(parseFloat(getAverageRating(selectedSupplier.ratings))))}
                                                </div>
                                                <div style={{ color: "#64748b", fontSize: "13px" }}>
                                                    Based on {selectedSupplier.ratings.length} review{selectedSupplier.ratings.length > 1 ? "s" : ""}
                                                </div>
                                            </div>
                                        </div>

                                        {selectedSupplier.ratings.map((rating, i) => (
                                            <div key={i} className="sp-rating-card">
                                                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                                                    <span style={{ color: "#f59e0b" }}>{"⭐".repeat(rating.rating)}</span>
                                                    <span style={{ color: "#64748b", fontSize: "12px" }}>
                                                        {new Date(rating.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                    </span>
                                                </div>
                                                {rating.review && (
                                                    <div style={{ color: "#94a3b8", fontSize: "14px", lineHeight: "1.5" }}>{rating.review}</div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                /* ============ LIST VIEW ============ */
                <div>
                    {/* Header */}
                    <div className="sp-header">
                        <h1 className="sp-title">Supplier Profiles</h1>
                        <p className="sp-subtitle">Browse approved suppliers, view profiles, products, and documents</p>
                    </div>

                    {/* Filters */}
                    <div className="sp-filters">
                        <input
                            type="text"
                            className="sp-search"
                            placeholder="🔍 Search by name, email, or city..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        <select
                            className="sp-select"
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                        >
                            <option value="all">All Categories</option>
                            {allCategories.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>

                    {/* Count */}
                    <div className="sp-count">
                        Showing {filtered.length} of {suppliers.length} approved suppliers
                        {categoryFilter !== "all" && ` in "${categoryFilter}"`}
                    </div>

                    {/* Grid */}
                    {filtered.length === 0 ? (
                        <div className="sp-empty">
                            <div className="sp-empty-icon">🔍</div>
                            <div style={{ fontSize: "18px", fontWeight: "500", color: "#94a3b8", marginBottom: "8px" }}>
                                No suppliers found
                            </div>
                            <div>Try adjusting your search or category filter</div>
                        </div>
                    ) : (
                        <div className="sp-grid">
                            {filtered.map(supplier => (
                                <div
                                    key={supplier.id}
                                    className="sp-card"
                                    onClick={() => setSelectedSupplier(supplier)}
                                >
                                    <div className="sp-card-name">
                                        <span>{supplier.companyName}</span>
                                        {supplier.ratings && supplier.ratings.length > 0 && (
                                            <span style={{
                                                fontSize: "13px", color: "#f59e0b", fontWeight: "500",
                                                padding: "2px 8px", background: "#f59e0b20", borderRadius: "6px"
                                            }}>
                                                ⭐ {getAverageRating(supplier.ratings)}
                                            </span>
                                        )}
                                    </div>
                                    <div className="sp-card-meta">
                                        <span>📧 {supplier.email}</span>
                                        <span>📍 {supplier.city || supplier.serviceLocations || "N/A"}</span>
                                    </div>

                                    {/* Badges */}
                                    {supplier.badges && supplier.badges.length > 0 && (
                                        <div className="sp-badges-inline" style={{ marginBottom: "10px" }}>
                                            {supplier.badges.map(badge => {
                                                const colors = {
                                                    verified: "#8b5cf6", gst: "#22c55e", premium: "#3b82f6",
                                                    top_rated: "#f59e0b", fast_delivery: "#14b8a6"
                                                };
                                                return (
                                                    <span key={badge} style={{
                                                        padding: "2px 8px", fontSize: "11px",
                                                        backgroundColor: `${colors[badge] || "#94a3b8"}20`,
                                                        color: colors[badge] || "#94a3b8",
                                                        borderRadius: "8px"
                                                    }}>
                                                        {badge.replace("_", " ")}
                                                    </span>
                                                );
                                            })}
                                        </div>
                                    )}

                                    {/* Categories */}
                                    {supplier.productCategories && supplier.productCategories.length > 0 && (
                                        <div className="sp-card-cats">
                                            {supplier.productCategories.slice(0, 3).map((cat, i) => (
                                                <span key={i} className="sp-cat-tag">{cat}</span>
                                            ))}
                                            {supplier.productCategories.length > 3 && (
                                                <span className="sp-cat-tag">+{supplier.productCategories.length - 3}</span>
                                            )}
                                        </div>
                                    )}

                                    {/* Stats */}
                                    <div className="sp-card-stats">
                                        <span className="sp-stat">📦 {(supplier.products || []).length} products</span>
                                        <span className="sp-stat">📄 {(supplier.documents || []).length} docs</span>
                                        {supplier.ratings && supplier.ratings.length > 0 && (
                                            <span className="sp-stat">⭐ {supplier.ratings.length} reviews</span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

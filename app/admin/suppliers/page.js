"use client";

import { useState, useEffect } from "react";
import ConfirmDialog, { SuspensionDialog } from "../components/ConfirmDialog";

const badgeTypes = [
    { id: "verified", label: "Verified ✓", color: "#8b5cf6", description: "Identity verified" },
    { id: "gst", label: "GST ✓", color: "#22c55e", description: "GST registered" },
    { id: "premium", label: "Premium ★", color: "#3b82f6", description: "Premium seller" },
    { id: "top_rated", label: "Top Rated 🏆", color: "#f59e0b", description: "Highly rated" },
    { id: "fast_delivery", label: "Fast Delivery 🚀", color: "#14b8a6", description: "Quick delivery" },
];

const tabs = ["pending", "approved", "suspended", "banned"];

export default function SuppliersPage() {
    const [activeTab, setActiveTab] = useState("pending");
    const [suppliers, setSuppliers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedId, setExpandedId] = useState(null);

    // Dialog states
    const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, supplier: null, action: null });
    const [suspensionDialog, setSuspensionDialog] = useState({ isOpen: false, supplier: null });
    const [badgeModal, setBadgeModal] = useState({ isOpen: false, supplier: null });
    const [detailsModal, setDetailsModal] = useState({ isOpen: false, supplier: null });
    const [docsModal, setDocsModal] = useState({ isOpen: false, supplier: null });
    const [categoryTemplates, setCategoryTemplates] = useState([]);

    useEffect(() => {
        fetchSuppliers();
        fetchCategoryTemplates();
    }, []);

    const fetchSuppliers = async () => {
        try {
            const res = await fetch("/api/admin/suppliers");
            const data = await res.json();
            if (res.ok) setSuppliers(data);
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

    const handleCategoryMapping = async (supplierCategoryId, templateId, supplierId) => {
        try {
            const res = await fetch("/api/admin/suppliers", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    supplierCategoryId,
                    categoryTemplateId: templateId,
                    action: "map",
                }),
            });
            if (res.ok) {
                const updatedSupplier = await res.json();
                setSuppliers(prev => prev.map(s => s.id === updatedSupplier.id ? updatedSupplier : s));
                setDetailsModal(prev => ({ ...prev, supplier: updatedSupplier }));
            }
        } catch (error) {
            console.error("Category mapping failed", error);
        }
    };

    const filteredSuppliers = suppliers.filter(s => {
        if (activeTab === "pending") {
            return s.status === "pending" || s.status === "pending_admin_review";
        }
        return s.status === activeTab;
    });

    const openConfirmDialog = (supplier, action) => {
        setConfirmDialog({ isOpen: true, supplier, action });
    };

    const closeConfirmDialog = () => {
        setConfirmDialog({ isOpen: false, supplier: null, action: null });
    };

    const handleConfirmedAction = async () => {
        const { supplier, action } = confirmDialog;
        await handleAction(supplier.id, action);
    };

    const handleAction = async (id, action, extraData = {}) => {
        try {
            const res = await fetch("/api/admin/suppliers", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id, action, ...extraData }),
            });

            if (res.ok) {
                const updated = await res.json();
                setSuppliers(suppliers.map(s => s.id === id ? updated : s));
            }
        } catch (error) {
            console.error("Action failed", error);
        }
    };

    const handleSuspendWithDuration = async (days) => {
        const { supplier } = suspensionDialog;
        await handleAction(supplier.id, "suspend", { suspensionDays: days });
    };

    const handleBadgeUpdate = async (supplierId, selectedBadges) => {
        await handleAction(supplierId, "update_badges", { badges: selectedBadges });
        setBadgeModal({ isOpen: false, supplier: null });
    };

    const toggleExpand = (id) => {
        setExpandedId(expandedId === id ? null : id);
    };

    const getAverageRating = (ratings) => {
        if (!ratings || ratings.length === 0) return null;
        const avg = ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length;
        return avg.toFixed(1);
    };

    const getDialogConfig = (action) => {
        switch (action) {
            case "approve":
                return { title: "Approve Supplier", message: "Are you sure you want to approve this supplier?", type: "info", confirmText: "Approve" };
            case "reject":
                return { title: "Reject Supplier", message: "This will move the supplier back to pending status.", type: "warning", confirmText: "Reject" };
            case "ban":
                return { title: "Ban Supplier", message: "This will permanently ban the supplier. This action is severe.", type: "danger", confirmText: "Ban Permanently" };
            case "restore":
                return { title: "Restore Supplier", message: "This will restore the supplier to approved status.", type: "info", confirmText: "Restore" };
            default:
                return { title: "Confirm Action", message: "Are you sure?", type: "warning", confirmText: "Confirm" };
        }
    };

    if (loading) {
        return (
            <div style={{ padding: "40px", textAlign: "center", color: "#94a3b8" }}>
                Loading suppliers...
            </div>
        );
    }

    return (
        <div>
            <style dangerouslySetInnerHTML={{
                __html: `
                .sup-page { padding: 0; }
                .sup-title { font-size: 24px; font-weight: bold; color: white; margin-bottom: 4px; }
                .sup-tabs { display: flex; gap: 8px; margin-bottom: 20px; overflow-x: auto; padding-bottom: 8px; }
                .sup-tab { padding: 10px 16px; border-radius: 8px; font-size: 14px; white-space: nowrap; cursor: pointer; border: 1px solid #334155; background: #1e293b; color: #94a3b8; transition: all 0.2s; }
                .sup-tab:hover { background: #334155; }
                .sup-tab.active { background: #3b82f6; border-color: #3b82f6; color: white; }
                .sup-card { background: #1e293b; border-radius: 12px; border: 1px solid #334155; margin-bottom: 16px; overflow: hidden; transition: all 0.2s; }
                .sup-card:hover { border-color: #475569; }
                .sup-card-header { padding: 20px; border-bottom: 1px solid #334155; cursor: pointer; }
                .sup-card-name { font-size: 18px; font-weight: 600; color: white; margin-bottom: 8px; display: flex; align-items: center; justify-content: space-between; }
                .sup-card-meta { font-size: 13px; color: #94a3b8; margin-bottom: 12px; }
                .sup-card-badges { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 12px; }
                .sup-card-actions { display: flex; gap: 8px; flex-wrap: wrap; }
                .sup-card-details { padding: 20px; background: #0f172a; border-top: 1px solid #334155; }
                .sup-detail-section { margin-bottom: 20px; }
                .sup-detail-section:last-child { margin-bottom: 0; }
                .sup-detail-title { font-size: 14px; font-weight: 600; color: #3b82f6; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.5px; }
                .sup-detail-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; }
                .sup-detail-item { }
                .sup-detail-label { font-size: 11px; color: #64748b; text-transform: uppercase; margin-bottom: 4px; }
                .sup-detail-value { font-size: 14px; color: white; word-break: break-all; }
                .sup-btn { padding: 10px 20px; border-radius: 8px; font-size: 13px; cursor: pointer; border: none; font-weight: 500; transition: all 0.2s; }
                .sup-btn-approve { background: #22c55e; color: white; }
                .sup-btn-approve:hover { background: #16a34a; }
                .sup-btn-reject { background: transparent; color: #ef4444; border: 1px solid #ef4444; }
                .sup-btn-reject:hover { background: #ef444420; }
                .sup-btn-suspend { background: #f59e0b20; color: #f59e0b; border: 1px solid #f59e0b; }
                .sup-btn-suspend:hover { background: #f59e0b30; }
                .sup-btn-ban { background: #ef4444; color: white; }
                .sup-btn-ban:hover { background: #dc2626; }
                .sup-btn-restore { background: #22c55e20; color: #22c55e; border: 1px solid #22c55e; }
                .sup-btn-restore:hover { background: #22c55e30; }
                .sup-btn-badge { background: #8b5cf620; color: #8b5cf6; border: 1px solid #8b5cf6; }
                .sup-btn-badge:hover { background: #8b5cf630; }
                .sup-btn-view { background: #334155; color: #94a3b8; }
                .sup-btn-view:hover { background: #475569; }
                .sup-empty { background: #1e293b; border-radius: 12px; padding: 60px 40px; text-align: center; color: #64748b; }
                .sup-expand-icon { transition: transform 0.2s; font-size: 12px; color: #64748b; }
                .sup-expand-icon.expanded { transform: rotate(180deg); }
                .sup-doc-list { display: flex; flex-wrap: wrap; gap: 8px; }
                .sup-doc-item { padding: 6px 12px; background: #334155; border-radius: 6px; font-size: 12px; color: #e2e8f0; display: flex; align-items: center; gap: 6px; cursor: pointer; }
                .sup-doc-item:hover { background: #475569; }
                .sup-doc-status { width: 8px; height: 8px; border-radius: 50%; }
                .sup-doc-status.pending { background: #f59e0b; }
                .sup-doc-status.verified { background: #22c55e; }
                .sup-doc-status.rejected { background: #ef4444; }
                .sup-categories { display: flex; flex-wrap: wrap; gap: 6px; }
                .sup-category { padding: 4px 10px; background: #334155; border-radius: 12px; font-size: 11px; color: #94a3b8; }
                .sup-rating { display: flex; align-items: center; gap: 4px; padding: 4px 10px; background: #f59e0b20; border-radius: 8px; color: #f59e0b; font-size: 13px; font-weight: 600; }
                .sup-suspended-until { padding: 8px 12px; background: #f59e0b20; border-radius: 6px; border: 1px solid #f59e0b40; color: #f59e0b; font-size: 12px; margin-bottom: 12px; }
                
                @media (min-width: 768px) {
                    .sup-title { font-size: 28px; }
                    .sup-detail-grid { grid-template-columns: repeat(3, 1fr); }
                }
            `}} />

            {/* Header */}
            <div style={{ marginBottom: "24px" }}>
                <h1 className="sup-title">Supplier Management</h1>
                <p style={{ color: "#64748b", fontSize: "14px" }}>Review applications, approve suppliers, manage badges and view details</p>
            </div>

            {/* Tabs */}
            <div className="sup-tabs">
                {tabs.map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`sup-tab ${activeTab === tab ? "active" : ""}`}
                    >
                        {tab.charAt(0).toUpperCase() + tab.slice(1)} ({suppliers.filter(s => s.status === tab).length})
                    </button>
                ))}
            </div>

            {/* Supplier Cards */}
            {filteredSuppliers.length === 0 ? (
                <div className="sup-empty">
                    <div style={{ fontSize: "48px", marginBottom: "16px" }}>📭</div>
                    <div style={{ fontSize: "18px", fontWeight: "500", color: "#94a3b8", marginBottom: "8px" }}>
                        No suppliers in this category
                    </div>
                    <div style={{ fontSize: "14px" }}>
                        {activeTab === "pending" && "New supplier applications will appear here"}
                        {activeTab === "approved" && "Approved suppliers will appear here"}
                        {activeTab === "suspended" && "Suspended suppliers will appear here"}
                        {activeTab === "banned" && "Banned suppliers will appear here"}
                    </div>
                </div>
            ) : (
                filteredSuppliers.map((supplier) => (
                    <div key={supplier.id} className="sup-card">
                        <div className="sup-card-header" onClick={() => toggleExpand(supplier.id)}>
                            <div className="sup-card-name">
                                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                    <span>{supplier.companyName}</span>
                                    {/* Average Rating */}
                                    {supplier.ratings && supplier.ratings.length > 0 && (
                                        <span className="sup-rating">
                                            ⭐ {getAverageRating(supplier.ratings)}
                                            <span style={{ fontWeight: "400", fontSize: "11px" }}>({supplier.ratings.length})</span>
                                        </span>
                                    )}
                                </div>
                                <span className={`sup-expand-icon ${expandedId === supplier.id ? 'expanded' : ''}`}>▼</span>
                            </div>

                            {/* Suspended Until Notice */}
                            {supplier.status === "suspended" && supplier.suspendedUntil && (
                                <div className="sup-suspended-until">
                                    ⏱️ Suspended until: {new Date(supplier.suspendedUntil).toLocaleDateString('en-IN', {
                                        day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                                    })}
                                </div>
                            )}

                            {/* Badges */}
                            {supplier.badges && supplier.badges.length > 0 && (
                                <div className="sup-card-badges">
                                    {supplier.badges.map((badgeId) => {
                                        const badge = badgeTypes.find(b => b.id === badgeId);
                                        return badge ? (
                                            <span key={badgeId} style={{ padding: "4px 12px", backgroundColor: `${badge.color}20`, color: badge.color, borderRadius: "12px", fontSize: "12px", fontWeight: "500" }}>
                                                {badge.label}
                                            </span>
                                        ) : null;
                                    })}
                                </div>
                            )}

                            <div className="sup-card-meta">
                                📧 {supplier.email} • 📱 {supplier.phone || "N/A"} • 📍 {supplier.city || supplier.serviceLocations || "N/A"}
                            </div>

                            <div className="sup-card-actions" onClick={(e) => e.stopPropagation()}>
                                {/* Pending Actions */}
                                {supplier.status === "pending" && (
                                    <>
                                        <button onClick={() => openConfirmDialog(supplier, "approve")} className="sup-btn sup-btn-approve">
                                            ✓ Approve
                                        </button>
                                        <button onClick={() => openConfirmDialog(supplier, "ban")} className="sup-btn sup-btn-reject">
                                            ✗ Reject
                                        </button>
                                    </>
                                )}

                                {/* Approved Actions */}
                                {supplier.status === "approved" && (
                                    <>
                                        <button onClick={() => setSuspensionDialog({ isOpen: true, supplier })} className="sup-btn sup-btn-suspend">
                                            ⏱️ Suspend
                                        </button>
                                        <button onClick={() => openConfirmDialog(supplier, "reject")} className="sup-btn sup-btn-reject">
                                            ↩ Rollback
                                        </button>
                                        <button onClick={() => openConfirmDialog(supplier, "ban")} className="sup-btn sup-btn-ban">
                                            ⛔ Ban
                                        </button>
                                        <button onClick={() => setBadgeModal({ isOpen: true, supplier })} className="sup-btn sup-btn-badge">
                                            🏅 Badges
                                        </button>
                                    </>
                                )}

                                {/* Suspended/Banned Actions */}
                                {(supplier.status === "suspended" || supplier.status === "banned") && (
                                    <button onClick={() => openConfirmDialog(supplier, "restore")} className="sup-btn sup-btn-restore">
                                        ↩ Restore
                                    </button>
                                )}

                                {/* Common Actions */}
                                <button onClick={() => setDocsModal({ isOpen: true, supplier })} className="sup-btn sup-btn-view">
                                    📄 Docs
                                </button>
                                <button onClick={() => setDetailsModal({ isOpen: true, supplier })} className="sup-btn sup-btn-view">
                                    📋 Details
                                </button>
                            </div>
                        </div>

                        {expandedId === supplier.id && (
                            <div className="sup-card-details">
                                {/* Registration Details */}
                                <div className="sup-detail-section">
                                    <div className="sup-detail-title">📋 Registration Details</div>
                                    <div className="sup-detail-grid">
                                        <div className="sup-detail-item">
                                            <div className="sup-detail-label">Company Name</div>
                                            <div className="sup-detail-value">{supplier.companyName}</div>
                                        </div>
                                        <div className="sup-detail-item">
                                            <div className="sup-detail-label">Email</div>
                                            <div className="sup-detail-value">{supplier.email}</div>
                                        </div>
                                        <div className="sup-detail-item">
                                            <div className="sup-detail-label">Phone</div>
                                            <div className="sup-detail-value">{supplier.phone || "Not provided"}</div>
                                        </div>
                                        <div className="sup-detail-item">
                                            <div className="sup-detail-label">Capacity</div>
                                            <div className="sup-detail-value">{supplier.capacity || "Not specified"}</div>
                                        </div>
                                        <div className="sup-detail-item">
                                            <div className="sup-detail-label">MOQ</div>
                                            <div className="sup-detail-value">{supplier.moq || "Not specified"}</div>
                                        </div>
                                        <div className="sup-detail-item">
                                            <div className="sup-detail-label">Service Locations</div>
                                            <div className="sup-detail-value">{supplier.serviceLocations || "Not specified"}</div>
                                        </div>
                                    </div>

                                    {supplier.productCategories && supplier.productCategories.length > 0 && (
                                        <div style={{ marginTop: "16px" }}>
                                            <div className="sup-detail-label">Product Categories</div>
                                            <div className="sup-categories" style={{ marginTop: "8px" }}>
                                                {supplier.productCategories.map((cat, i) => (
                                                    <span key={i} className="sup-category">{cat}</span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* KYC Details */}
                                <div className="sup-detail-section">
                                    <div className="sup-detail-title">🔐 KYC Details</div>
                                    <div className="sup-detail-grid">
                                        <div className="sup-detail-item">
                                            <div className="sup-detail-label">GST Number</div>
                                            <div className="sup-detail-value">{supplier.gstNumber || "Not submitted"}</div>
                                        </div>
                                        <div className="sup-detail-item">
                                            <div className="sup-detail-label">PAN Number</div>
                                            <div className="sup-detail-value">{supplier.panNumber || "Not submitted"}</div>
                                        </div>
                                        <div className="sup-detail-item">
                                            <div className="sup-detail-label">Registered On</div>
                                            <div className="sup-detail-value">
                                                {supplier.createdAt ? new Date(supplier.createdAt).toLocaleDateString('en-IN', {
                                                    day: 'numeric',
                                                    month: 'short',
                                                    year: 'numeric'
                                                }) : "N/A"}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Documents */}
                                <div className="sup-detail-section">
                                    <div className="sup-detail-title">📄 Submitted Documents</div>
                                    {supplier.documents && supplier.documents.length > 0 ? (
                                        <div className="sup-doc-list">
                                            {supplier.documents.map((doc, i) => (
                                                <a
                                                    key={i}
                                                    href={doc.fileUrl || "#"}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="sup-doc-item"
                                                >
                                                    <span className={`sup-doc-status ${doc.status}`}></span>
                                                    <span>{doc.fileName || doc.docType}</span>
                                                    <span style={{ color: "#64748b", fontSize: "10px", textTransform: "uppercase" }}>
                                                        ({doc.status})
                                                    </span>
                                                </a>
                                            ))}
                                        </div>
                                    ) : (
                                        <div style={{ color: "#64748b", fontSize: "14px" }}>No documents submitted</div>
                                    )}
                                </div>

                                {/* Ratings */}
                                {supplier.ratings && supplier.ratings.length > 0 && (
                                    <div className="sup-detail-section">
                                        <div className="sup-detail-title">⭐ Customer Ratings ({supplier.ratings.length})</div>
                                        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                                            {supplier.ratings.map((rating, i) => (
                                                <div key={i} style={{ padding: "12px", background: "#1e293b", borderRadius: "8px", border: "1px solid #334155" }}>
                                                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                                                        <span style={{ color: "#f59e0b" }}>{"⭐".repeat(rating.rating)}</span>
                                                        <span style={{ color: "#64748b", fontSize: "12px" }}>
                                                            {new Date(rating.createdAt).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                    {rating.review && (
                                                        <div style={{ color: "#94a3b8", fontSize: "13px" }}>{rating.review}</div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                ))
            )}

            {/* Confirm Dialog */}
            {confirmDialog.isOpen && (
                <ConfirmDialog
                    isOpen={confirmDialog.isOpen}
                    onClose={closeConfirmDialog}
                    onConfirm={handleConfirmedAction}
                    {...getDialogConfig(confirmDialog.action)}
                    message={`${getDialogConfig(confirmDialog.action).message} (${confirmDialog.supplier?.companyName})`}
                />
            )}

            {/* Suspension Dialog */}
            {suspensionDialog.isOpen && (
                <SuspensionDialog
                    isOpen={suspensionDialog.isOpen}
                    onClose={() => setSuspensionDialog({ isOpen: false, supplier: null })}
                    onConfirm={handleSuspendWithDuration}
                    supplierName={suspensionDialog.supplier?.companyName}
                />
            )}

            {/* Badge Modal */}
            {badgeModal.isOpen && (
                <BadgeModal
                    supplier={badgeModal.supplier}
                    onClose={() => setBadgeModal({ isOpen: false, supplier: null })}
                    onSave={handleBadgeUpdate}
                />
            )}

            {/* Details Modal */}
            {detailsModal.isOpen && (
                <DetailsModal
                    supplier={detailsModal.supplier}
                    categoryTemplates={categoryTemplates}
                    onMapCategory={handleCategoryMapping}
                    onClose={() => setDetailsModal({ isOpen: false, supplier: null })}
                />
            )}

            {/* Documents Modal */}
            {docsModal.isOpen && (
                <DocsModal
                    supplier={docsModal.supplier}
                    onClose={() => setDocsModal({ isOpen: false, supplier: null })}
                />
            )}
        </div>
    );
}

// Badge Assignment Modal
function BadgeModal({ supplier, onClose, onSave }) {
    const [selectedBadges, setSelectedBadges] = useState(supplier.badges || []);

    const toggleBadge = (badgeId) => {
        setSelectedBadges(prev =>
            prev.includes(badgeId)
                ? prev.filter(b => b !== badgeId)
                : [...prev, badgeId]
        );
    };

    return (
        <div style={{
            position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, padding: "20px"
        }}>
            <div style={{ backgroundColor: "#1e293b", borderRadius: "16px", border: "1px solid #334155", maxWidth: "450px", width: "100%", padding: "24px" }}>
                <h3 style={{ color: "white", fontSize: "20px", marginBottom: "8px" }}>🏅 Manage Badges</h3>
                <p style={{ color: "#64748b", fontSize: "14px", marginBottom: "20px" }}>{supplier.companyName}</p>

                <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "24px" }}>
                    {badgeTypes.map(badge => (
                        <button
                            key={badge.id}
                            onClick={() => toggleBadge(badge.id)}
                            style={{
                                display: "flex", alignItems: "center", gap: "12px", padding: "12px 16px",
                                backgroundColor: selectedBadges.includes(badge.id) ? `${badge.color}20` : "#0f172a",
                                border: `1px solid ${selectedBadges.includes(badge.id) ? badge.color : "#334155"}`,
                                borderRadius: "8px", cursor: "pointer", textAlign: "left"
                            }}
                        >
                            <span style={{ fontSize: "20px" }}>{badge.label.split(" ").pop()}</span>
                            <div>
                                <div style={{ color: selectedBadges.includes(badge.id) ? badge.color : "white", fontWeight: "500" }}>{badge.label}</div>
                                <div style={{ color: "#64748b", fontSize: "12px" }}>{badge.description}</div>
                            </div>
                            {selectedBadges.includes(badge.id) && (
                                <span style={{ marginLeft: "auto", color: badge.color }}>✓</span>
                            )}
                        </button>
                    ))}
                </div>

                <div style={{ display: "flex", gap: "12px" }}>
                    <button onClick={onClose} style={{ flex: 1, padding: "12px", backgroundColor: "#334155", color: "#94a3b8", border: "none", borderRadius: "8px", cursor: "pointer" }}>Cancel</button>
                    <button onClick={() => onSave(supplier.id, selectedBadges)} style={{ flex: 1, padding: "12px", backgroundColor: "#8b5cf6", color: "white", border: "none", borderRadius: "8px", cursor: "pointer" }}>Save Badges</button>
                </div>
            </div>
        </div>
    );
}

// Details Modal with Category Management
function DetailsModal({ supplier, categoryTemplates, onMapCategory, onClose }) {
    const products = supplier.products || [];
    const categories = supplier.supplierCategories || [];
    const detailItems = [
        { label: "Company Name", value: supplier.companyName },
        { label: "Email", value: supplier.email },
        { label: "Phone", value: supplier.phone },
        { label: "Status", value: supplier.status },
        { label: "GST Number", value: supplier.gstNumber, highlight: true },
        { label: "PAN Number", value: supplier.panNumber, highlight: true },
        { label: "City", value: supplier.city },
        { label: "State", value: supplier.state },
        { label: "Address", value: supplier.address },
        { label: "Pincode", value: supplier.pincode },
        { label: "Website", value: supplier.website },
        { label: "Capacity", value: supplier.capacity },
        { label: "MOQ", value: supplier.moq },
        { label: "Service Locations", value: supplier.serviceLocations },
        { label: "Established Year", value: supplier.establishedYear },
        { label: "Employee Count", value: supplier.employeeCount },
        { label: "Certifications", value: supplier.certifications },
    ];

    return (
        <div style={{
            position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, padding: "20px"
        }}>
            <div style={{ backgroundColor: "#1e293b", borderRadius: "16px", border: "1px solid #334155", maxWidth: "700px", width: "100%", padding: "24px", maxHeight: "85vh", overflow: "auto" }}>
                <h3 style={{ color: "white", fontSize: "20px", marginBottom: "8px" }}>Supplier Details</h3>
                <p style={{ color: "#64748b", fontSize: "14px", marginBottom: "20px" }}>{supplier.companyName}</p>

                {/* KYC Status */}
                <div style={{ marginBottom: "20px", padding: "16px", background: "linear-gradient(135deg, #1a2744, #0f172a)", borderRadius: "12px", border: "1px solid #334155" }}>
                    <div style={{ fontSize: "13px", color: "#3b82f6", fontWeight: "600", marginBottom: "12px", textTransform: "uppercase", letterSpacing: "0.5px" }}>KYC Verification</div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                        <div style={{ padding: "10px", background: "#0f172a", borderRadius: "8px", border: `1px solid ${supplier.gstNumber ? "#22c55e30" : "#ef444430"}` }}>
                            <div style={{ fontSize: "10px", color: "#64748b", textTransform: "uppercase", marginBottom: "4px" }}>GST</div>
                            <div style={{ color: supplier.gstNumber ? "#22c55e" : "#ef4444", fontWeight: "600", fontSize: "13px" }}>
                                {supplier.gstNumber || "Not Provided"}
                            </div>
                        </div>
                        <div style={{ padding: "10px", background: "#0f172a", borderRadius: "8px", border: `1px solid ${supplier.panNumber ? "#22c55e30" : "#ef444430"}` }}>
                            <div style={{ fontSize: "10px", color: "#64748b", textTransform: "uppercase", marginBottom: "4px" }}>PAN</div>
                            <div style={{ color: supplier.panNumber ? "#22c55e" : "#ef4444", fontWeight: "600", fontSize: "13px" }}>
                                {supplier.panNumber || "Not Provided"}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Category Section */}
                <div style={{ marginBottom: "20px", padding: "16px", background: "linear-gradient(135deg, #1a2744, #0f172a)", borderRadius: "12px", border: "1px solid #334155" }}>
                    <div style={{ fontSize: "13px", color: "#3b82f6", fontWeight: "600", marginBottom: "12px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Categories</div>
                    {categories.length === 0 && (!supplier.productCategories || supplier.productCategories.length === 0) ? (
                        <div style={{ color: "#64748b", fontSize: "13px", padding: "10px", textAlign: "center" }}>No categories assigned</div>
                    ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                            {categories.map((cat, i) => {
                                const isMapped = !!cat.categoryTemplateId;
                                const categoryName = isMapped ? cat.categoryTemplate?.name : (cat.customName || "Custom Category");
                                return (
                                    <div key={i} style={{ padding: "14px", background: "#0f172a", borderRadius: "10px", border: `1px solid ${isMapped ? "#22c55e30" : "#f59e0b30"}` }}>
                                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px", flexWrap: "wrap", gap: "6px" }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                                <span style={{ fontSize: "15px", color: "white", fontWeight: "600" }}>{categoryName}</span>
                                                {cat.isPrimary && <span style={{ padding: "2px 8px", background: "#3b82f620", color: "#3b82f6", fontSize: "10px", borderRadius: "8px", fontWeight: "600" }}>PRIMARY</span>}
                                            </div>
                                            <span style={{ padding: "4px 10px", borderRadius: "8px", fontSize: "11px", fontWeight: "600", background: isMapped ? "#22c55e20" : "#f59e0b20", color: isMapped ? "#22c55e" : "#f59e0b" }}>
                                                {isMapped ? "Mapped" : "Unmapped"}
                                            </span>
                                        </div>
                                        {isMapped && <div style={{ fontSize: "12px", color: "#94a3b8", marginBottom: "4px" }}>Linked to template: <span style={{ color: "#22c55e", fontWeight: "500" }}>{cat.categoryTemplate?.name}</span></div>}
                                        {cat.customDescription && (
                                            <div style={{ fontSize: "12px", color: "#94a3b8", marginTop: "6px", padding: "8px 10px", background: "#1e293b", borderRadius: "6px", lineHeight: "1.5" }}>
                                                <strong style={{ color: "#64748b" }}>Description:</strong> {cat.customDescription}
                                            </div>
                                        )}
                                        {!isMapped && (
                                            <div style={{ marginTop: "10px", padding: "10px", background: "#1e293b", borderRadius: "8px", border: "1px dashed #f59e0b40" }}>
                                                <div style={{ fontSize: "11px", color: "#f59e0b", fontWeight: "600", marginBottom: "8px", textTransform: "uppercase" }}>Map to existing template:</div>
                                                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
                                                    <select id={`map-select-${cat.id}`} style={{ flex: 1, minWidth: "180px", padding: "8px 12px", background: "#0f172a", border: "1px solid #334155", borderRadius: "8px", color: "white", fontSize: "13px", outline: "none" }} defaultValue="">
                                                        <option value="" disabled>Select a template...</option>
                                                        {(categoryTemplates || []).map(t => (<option key={t.id} value={t.id}>{t.name}</option>))}
                                                    </select>
                                                    <button onClick={() => { const sel = document.getElementById(`map-select-${cat.id}`); if (sel && sel.value) onMapCategory(cat.id, sel.value, supplier.id); }} style={{ padding: "8px 16px", background: "#22c55e", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "12px", fontWeight: "600", whiteSpace: "nowrap" }}>Map</button>
                                                </div>
                                                <div style={{ marginTop: "8px", textAlign: "center" }}>
                                                    <span style={{ color: "#64748b", fontSize: "11px" }}>or </span>
                                                    <a href="/admin/categories" target="_blank" rel="noopener noreferrer" style={{ color: "#3b82f6", fontSize: "12px", fontWeight: "500", textDecoration: "none" }}>+ Create New Template</a>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                            {supplier.productCategories && supplier.productCategories.length > 0 && categories.length === 0 && (
                                <div>
                                    <div style={{ fontSize: "11px", color: "#64748b", marginBottom: "6px" }}>Legacy categories (from registration form):</div>
                                    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                                        {supplier.productCategories.map((cat, i) => (<span key={i} style={{ padding: "5px 12px", background: "#334155", borderRadius: "12px", fontSize: "12px", color: "#94a3b8" }}>{cat}</span>))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Category Description */}
                {supplier.description && (
                    <div style={{ marginBottom: "20px", padding: "14px 16px", background: "#0f172a", borderRadius: "10px", border: "1px solid #334155" }}>
                        <div style={{ fontSize: "10px", color: "#64748b", textTransform: "uppercase", marginBottom: "6px", letterSpacing: "0.5px" }}>Category / Business Description</div>
                        <div style={{ color: "#e2e8f0", fontSize: "13px", lineHeight: "1.6" }}>{supplier.description}</div>
                    </div>
                )}

                {/* All Details Grid */}
                <div style={{ marginBottom: "20px" }}>
                    <div style={{ fontSize: "13px", color: "#3b82f6", fontWeight: "600", marginBottom: "12px", textTransform: "uppercase", letterSpacing: "0.5px" }}>All Details</div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "10px" }}>
                        {detailItems.filter(item => item.value).map((item, i) => (
                            <div key={i} style={{ padding: "10px 12px", background: "#0f172a", borderRadius: "8px", border: item.highlight ? "1px solid #22c55e30" : "1px solid #334155" }}>
                                <div style={{ fontSize: "10px", color: "#64748b", textTransform: "uppercase", marginBottom: "4px" }}>{item.label}</div>
                                <div style={{ color: item.highlight ? "#22c55e" : "white", fontSize: "13px", wordBreak: "break-all" }}>{item.value}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Products */}
                {products.length > 0 && (
                    <div style={{ marginBottom: "20px" }}>
                        <div style={{ fontSize: "13px", color: "#3b82f6", fontWeight: "600", marginBottom: "12px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Products ({products.length})</div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                            {products.map((product, i) => (
                                <div key={i} style={{ padding: "14px", background: "#0f172a", borderRadius: "10px", border: "1px solid #334155" }}>
                                    <div style={{ color: "white", fontWeight: "500", marginBottom: "4px" }}>{product.name}</div>
                                    {product.category && <div style={{ color: "#3b82f6", fontSize: "12px", marginBottom: "4px" }}>{product.category}</div>}
                                    {product.description && <div style={{ color: "#94a3b8", fontSize: "13px", marginBottom: "8px" }}>{product.description}</div>}
                                    <div style={{ display: "flex", gap: "16px", fontSize: "12px", color: "#64748b" }}>
                                        {product.priceRange && <span>Price: {product.priceRange}</span>}
                                        {product.moq && <span>MOQ: {product.moq}</span>}
                                        {product.leadTime && <span>Lead: {product.leadTime}</span>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <button onClick={onClose} style={{ marginTop: "4px", width: "100%", padding: "12px", backgroundColor: "#334155", color: "#94a3b8", border: "none", borderRadius: "8px", cursor: "pointer" }}>Close</button>
            </div>
        </div>
    );
}

// Documents Modal
function DocsModal({ supplier, onClose }) {
    const docs = supplier.documents || [];

    return (
        <div style={{
            position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, padding: "20px"
        }}>
            <div style={{ backgroundColor: "#1e293b", borderRadius: "16px", border: "1px solid #334155", maxWidth: "500px", width: "100%", padding: "24px" }}>
                <h3 style={{ color: "white", fontSize: "20px", marginBottom: "8px" }}>📄 Submitted Documents</h3>
                <p style={{ color: "#64748b", fontSize: "14px", marginBottom: "20px" }}>{supplier.companyName}</p>

                {docs.length === 0 ? (
                    <div style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>
                        <div style={{ fontSize: "48px", marginBottom: "12px" }}>📭</div>
                        No documents submitted
                    </div>
                ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                        {docs.map((doc, i) => (
                            <a
                                key={i}
                                href={doc.fileUrl || "#"}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                    display: "flex", alignItems: "center", justifyContent: "space-between",
                                    padding: "14px 16px", backgroundColor: "#0f172a", borderRadius: "8px",
                                    border: "1px solid #334155", textDecoration: "none"
                                }}
                            >
                                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                    <span style={{ fontSize: "20px" }}>📁</span>
                                    <div>
                                        <div style={{ color: "white", fontWeight: "500" }}>{doc.fileName || doc.docType}</div>
                                        <div style={{ color: "#64748b", fontSize: "12px" }}>{doc.docType}</div>
                                    </div>
                                </div>
                                <span style={{
                                    padding: "4px 10px",
                                    borderRadius: "12px",
                                    fontSize: "11px",
                                    backgroundColor: doc.status === "verified" ? "#22c55e20" : doc.status === "rejected" ? "#ef444420" : "#f59e0b20",
                                    color: doc.status === "verified" ? "#22c55e" : doc.status === "rejected" ? "#ef4444" : "#f59e0b"
                                }}>
                                    {doc.status}
                                </span>
                            </a>
                        ))}
                    </div>
                )}

                <button onClick={onClose} style={{ marginTop: "20px", width: "100%", padding: "12px", backgroundColor: "#334155", color: "#94a3b8", border: "none", borderRadius: "8px", cursor: "pointer" }}>Close</button>
            </div>
        </div>
    );
}

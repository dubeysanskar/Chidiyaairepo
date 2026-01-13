"use client";

import { useState, useEffect } from "react";

// Mock data
const mockSuppliers = [
    { id: 1, name: "Premium Textile Corp", gst: "27AAACP1234A1ZE", email: "contact@premiumtextile.com", phone: "+91 98765 43210", category: "Textiles", status: "pending", badges: [], rating: 0, documents: ["GST Certificate", "PAN Card"], appliedAt: "2 hours ago" },
    { id: 2, name: "Excel Manufacturing", gst: "24AABCE5678F1ZK", email: "info@excelmanufacturing.com", phone: "+91 87654 32109", category: "Electronics", status: "approved", badges: ["gst", "premium"], rating: 4.8, documents: ["GST Certificate", "ISO Certification"], appliedAt: "5 days ago" },
    { id: 3, name: "Quality Fabrics Ltd", gst: "27AABCQ1122G1ZM", email: "sales@qualityfabrics.in", phone: "+91 76543 21098", category: "Textiles", status: "approved", badges: ["gst", "top_seller", "fast_response"], rating: 4.6, documents: ["GST Certificate"], appliedAt: "10 days ago" },
    { id: 4, name: "Fake Corp Industries", gst: "INVALID123", email: "fake@example.com", phone: "+91 11111 11111", category: "Chemicals", status: "suspended", badges: [], rating: 1.2, documents: [], appliedAt: "1 month ago" },
    { id: 5, name: "Banned Traders", gst: "00FRAUD00000Z", email: "banned@scam.com", phone: "+91 00000 00000", category: "Packaging", status: "banned", badges: [], rating: 0, documents: [], appliedAt: "2 months ago" },
];

const badgeTypes = [
    { id: "gst", label: "GST Verified", icon: "✓", color: "#22c55e" },
    { id: "premium", label: "Premium", icon: "★", color: "#3b82f6" },
    { id: "top_seller", label: "Top Seller", icon: "🏆", color: "#f59e0b" },
    { id: "fast_response", label: "Fast Response", icon: "⚡", color: "#8b5cf6" },
    { id: "trusted", label: "Trusted", icon: "🛡️", color: "#14b8a6" },
];

const tabs = [
    { id: "pending", label: "Pending", count: 1 },
    { id: "approved", label: "Approved", count: 2 },
    { id: "suspended", label: "Suspended", count: 1 },
    { id: "banned", label: "Banned", count: 1 },
];

export default function SuppliersPage() {
    const [activeTab, setActiveTab] = useState("pending");
    const [suppliers, setSuppliers] = useState(mockSuppliers);
    const [selectedSupplier, setSelectedSupplier] = useState(null);
    const [showBadgeModal, setShowBadgeModal] = useState(false);
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
    const filteredSuppliers = suppliers.filter(s => s.status === activeTab);

    const handleAction = (supplierId, action) => {
        setSuppliers(suppliers.map(s => {
            if (s.id === supplierId) {
                if (action === "approve") return { ...s, status: "approved" };
                if (action === "suspend") return { ...s, status: "suspended" };
                if (action === "ban") return { ...s, status: "banned" };
                if (action === "restore") return { ...s, status: "approved" };
            }
            return s;
        }));
    };

    const toggleBadge = (supplierId, badgeId) => {
        setSuppliers(suppliers.map(s => {
            if (s.id === supplierId) {
                const hasBadge = s.badges.includes(badgeId);
                return {
                    ...s,
                    badges: hasBadge ? s.badges.filter(b => b !== badgeId) : [...s.badges, badgeId]
                };
            }
            return s;
        }));
    };

    return (
        <div>
            {/* Header */}
            <div style={{ marginBottom: "24px" }}>
                <h1 style={{ fontSize: showMobile ? "24px" : "28px", fontWeight: "bold", color: "white", marginBottom: "4px" }}>
                    Supplier Management
                </h1>
                <p style={{ color: "#64748b", fontSize: "14px" }}>
                    Approve, manage, and award badges to suppliers
                </p>
            </div>

            {/* Tabs */}
            <div style={{
                display: "flex",
                gap: "8px",
                marginBottom: "24px",
                overflowX: "auto",
                paddingBottom: "8px"
            }}>
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        style={{
                            padding: "10px 20px",
                            backgroundColor: activeTab === tab.id ? "#3b82f6" : "#1e293b",
                            color: activeTab === tab.id ? "white" : "#94a3b8",
                            border: "1px solid",
                            borderColor: activeTab === tab.id ? "#3b82f6" : "#334155",
                            borderRadius: "8px",
                            fontSize: "14px",
                            fontWeight: "500",
                            cursor: "pointer",
                            whiteSpace: "nowrap",
                            display: "flex",
                            alignItems: "center",
                            gap: "8px"
                        }}
                    >
                        {tab.label}
                        <span style={{
                            padding: "2px 8px",
                            backgroundColor: activeTab === tab.id ? "rgba(255,255,255,0.2)" : "#334155",
                            borderRadius: "10px",
                            fontSize: "12px"
                        }}>
                            {suppliers.filter(s => s.status === tab.id).length}
                        </span>
                    </button>
                ))}
            </div>

            {/* Supplier Cards */}
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {filteredSuppliers.length === 0 ? (
                    <div style={{
                        backgroundColor: "#1e293b",
                        borderRadius: "12px",
                        padding: "48px",
                        textAlign: "center",
                        color: "#64748b"
                    }}>
                        No suppliers in this category
                    </div>
                ) : (
                    filteredSuppliers.map((supplier) => (
                        <div key={supplier.id} style={{
                            backgroundColor: "#1e293b",
                            borderRadius: "12px",
                            border: "1px solid #334155",
                            overflow: "hidden"
                        }}>
                            {/* Card Header */}
                            <div style={{
                                padding: showMobile ? "16px" : "20px",
                                borderBottom: "1px solid #334155"
                            }}>
                                <div style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: showMobile ? "flex-start" : "center",
                                    flexDirection: showMobile ? "column" : "row",
                                    gap: "12px"
                                }}>
                                    <div>
                                        <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
                                            <h3 style={{ fontSize: "18px", fontWeight: "600", color: "white" }}>
                                                {supplier.name}
                                            </h3>
                                            {/* Badges */}
                                            {supplier.badges.map((badgeId) => {
                                                const badge = badgeTypes.find(b => b.id === badgeId);
                                                return badge ? (
                                                    <span key={badgeId} style={{
                                                        padding: "2px 8px",
                                                        backgroundColor: `${badge.color}20`,
                                                        color: badge.color,
                                                        borderRadius: "10px",
                                                        fontSize: "11px",
                                                        fontWeight: "500"
                                                    }}>
                                                        {badge.icon} {badge.label}
                                                    </span>
                                                ) : null;
                                            })}
                                        </div>
                                        <div style={{ display: "flex", gap: "16px", marginTop: "8px", fontSize: "13px", color: "#94a3b8", flexWrap: "wrap" }}>
                                            <span>GST: {supplier.gst}</span>
                                            <span>Category: {supplier.category}</span>
                                            {supplier.rating > 0 && <span>Rating: ★ {supplier.rating}</span>}
                                        </div>
                                    </div>
                                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                                        {/* Actions based on status */}
                                        {supplier.status === "pending" && (
                                            <>
                                                <button onClick={() => handleAction(supplier.id, "approve")} style={{
                                                    padding: "8px 16px",
                                                    backgroundColor: "#22c55e",
                                                    color: "white",
                                                    border: "none",
                                                    borderRadius: "6px",
                                                    fontSize: "13px",
                                                    fontWeight: "500",
                                                    cursor: "pointer"
                                                }}>
                                                    Approve
                                                </button>
                                                <button onClick={() => handleAction(supplier.id, "ban")} style={{
                                                    padding: "8px 16px",
                                                    backgroundColor: "#334155",
                                                    color: "#ef4444",
                                                    border: "1px solid #ef4444",
                                                    borderRadius: "6px",
                                                    fontSize: "13px",
                                                    cursor: "pointer"
                                                }}>
                                                    Reject
                                                </button>
                                            </>
                                        )}
                                        {supplier.status === "approved" && (
                                            <>
                                                <button onClick={() => { setSelectedSupplier(supplier); setShowBadgeModal(true); }} style={{
                                                    padding: "8px 16px",
                                                    backgroundColor: "#3b82f620",
                                                    color: "#3b82f6",
                                                    border: "1px solid #3b82f6",
                                                    borderRadius: "6px",
                                                    fontSize: "13px",
                                                    cursor: "pointer"
                                                }}>
                                                    🏅 Badges
                                                </button>
                                                <button onClick={() => handleAction(supplier.id, "suspend")} style={{
                                                    padding: "8px 16px",
                                                    backgroundColor: "#334155",
                                                    color: "#f59e0b",
                                                    border: "1px solid #f59e0b",
                                                    borderRadius: "6px",
                                                    fontSize: "13px",
                                                    cursor: "pointer"
                                                }}>
                                                    Suspend
                                                </button>
                                            </>
                                        )}
                                        {(supplier.status === "suspended" || supplier.status === "banned") && (
                                            <button onClick={() => handleAction(supplier.id, "restore")} style={{
                                                padding: "8px 16px",
                                                backgroundColor: "#22c55e20",
                                                color: "#22c55e",
                                                border: "1px solid #22c55e",
                                                borderRadius: "6px",
                                                fontSize: "13px",
                                                cursor: "pointer"
                                            }}>
                                                Restore
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Card Details */}
                            <div style={{
                                padding: showMobile ? "16px" : "20px",
                                display: "grid",
                                gridTemplateColumns: showMobile ? "1fr" : "repeat(3, 1fr)",
                                gap: "16px"
                            }}>
                                <div>
                                    <div style={{ fontSize: "12px", color: "#64748b", marginBottom: "4px" }}>Email</div>
                                    <div style={{ color: "white", fontSize: "14px" }}>{supplier.email}</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: "12px", color: "#64748b", marginBottom: "4px" }}>Phone</div>
                                    <div style={{ color: "white", fontSize: "14px" }}>{supplier.phone}</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: "12px", color: "#64748b", marginBottom: "4px" }}>Documents</div>
                                    <div style={{ color: "white", fontSize: "14px" }}>
                                        {supplier.documents.length > 0 ? supplier.documents.join(", ") : "None submitted"}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Badge Modal */}
            {showBadgeModal && selectedSupplier && (
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
                    padding: "20px"
                }}>
                    <div style={{
                        backgroundColor: "#1e293b",
                        borderRadius: "16px",
                        padding: "24px",
                        width: "100%",
                        maxWidth: "400px"
                    }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                            <h3 style={{ color: "white", fontSize: "18px", fontWeight: "600" }}>
                                Manage Badges
                            </h3>
                            <button onClick={() => { setShowBadgeModal(false); setSelectedSupplier(null); }} style={{
                                background: "none",
                                border: "none",
                                color: "#64748b",
                                fontSize: "24px",
                                cursor: "pointer"
                            }}>
                                ×
                            </button>
                        </div>
                        <p style={{ color: "#94a3b8", fontSize: "14px", marginBottom: "20px" }}>
                            {selectedSupplier.name}
                        </p>
                        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                            {badgeTypes.map((badge) => {
                                const hasBadge = selectedSupplier.badges.includes(badge.id);
                                return (
                                    <button
                                        key={badge.id}
                                        onClick={() => {
                                            toggleBadge(selectedSupplier.id, badge.id);
                                            setSelectedSupplier({
                                                ...selectedSupplier,
                                                badges: hasBadge
                                                    ? selectedSupplier.badges.filter(b => b !== badge.id)
                                                    : [...selectedSupplier.badges, badge.id]
                                            });
                                        }}
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "space-between",
                                            padding: "14px 16px",
                                            backgroundColor: hasBadge ? `${badge.color}20` : "#0f172a",
                                            border: `1px solid ${hasBadge ? badge.color : "#334155"}`,
                                            borderRadius: "8px",
                                            cursor: "pointer",
                                            textAlign: "left"
                                        }}
                                    >
                                        <span style={{ color: "white", display: "flex", alignItems: "center", gap: "10px" }}>
                                            <span style={{ fontSize: "18px" }}>{badge.icon}</span>
                                            {badge.label}
                                        </span>
                                        <span style={{
                                            width: "24px",
                                            height: "24px",
                                            borderRadius: "6px",
                                            backgroundColor: hasBadge ? badge.color : "transparent",
                                            border: `2px solid ${badge.color}`,
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            color: "white",
                                            fontSize: "14px"
                                        }}>
                                            {hasBadge && "✓"}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                        <button onClick={() => { setShowBadgeModal(false); setSelectedSupplier(null); }} style={{
                            width: "100%",
                            marginTop: "20px",
                            padding: "14px",
                            backgroundColor: "#3b82f6",
                            color: "white",
                            border: "none",
                            borderRadius: "8px",
                            fontSize: "15px",
                            fontWeight: "500",
                            cursor: "pointer"
                        }}>
                            Done
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

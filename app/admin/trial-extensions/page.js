"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function AdminTrialExtensions() {
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("requests");
    const [requests, setRequests] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [filterStatus, setFilterStatus] = useState("pending");
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [processingId, setProcessingId] = useState(null);
    const [approvalForm, setApprovalForm] = useState({ months: 0, note: "" });
    const [showDirectExtendModal, setShowDirectExtendModal] = useState(null);
    const [directExtendForm, setDirectExtendForm] = useState({ months: 1, reason: "" });
    const [notification, setNotification] = useState(null);

    useEffect(() => {
        if (activeTab === "requests") {
            fetchRequests();
        } else {
            fetchSuppliers();
        }
    }, [activeTab, filterStatus]);

    const showNotification = (message, type = "success") => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
    };

    const fetchRequests = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/trial-extensions?status=${filterStatus}`);
            const data = await res.json();
            setRequests(data.requests || []);
        } catch (error) {
            console.error("Failed to fetch requests:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchSuppliers = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/admin/trial-extensions?view=suppliers");
            const data = await res.json();
            setSuppliers(data.suppliers || []);
        } catch (error) {
            console.error("Failed to fetch suppliers:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleProcessRequest = async (requestId, action, approvedMonths, adminNote) => {
        setProcessingId(requestId);
        try {
            const res = await fetch("/api/admin/trial-extensions", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ requestId, action, approvedMonths, adminNote })
            });

            if (res.ok) {
                showNotification(`Request ${action}ed successfully!`, "success");
                setSelectedRequest(null);
                fetchRequests();
            } else {
                const data = await res.json();
                showNotification(data.error || "Failed to process request", "error");
            }
        } catch (error) {
            showNotification("Failed to process request", "error");
        } finally {
            setProcessingId(null);
        }
    };

    const handleDirectExtend = async (supplierId) => {
        setProcessingId(supplierId);
        try {
            const res = await fetch("/api/admin/trial-extensions", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    supplierId,
                    months: directExtendForm.months,
                    reason: directExtendForm.reason
                })
            });

            if (res.ok) {
                showNotification(`Trial extended by ${directExtendForm.months} month(s)!`, "success");
                setShowDirectExtendModal(null);
                setDirectExtendForm({ months: 1, reason: "" });
                fetchSuppliers();
            } else {
                const data = await res.json();
                showNotification(data.error || "Failed to extend trial", "error");
            }
        } catch (error) {
            showNotification("Failed to extend trial", "error");
        } finally {
            setProcessingId(null);
        }
    };

    const getDaysColor = (days) => {
        if (days <= 0) return "#EF4444";
        if (days <= 30) return "#F59E0B";
        if (days <= 60) return "#10B981";
        return "#3B82F6";
    };

    return (
        <div style={{ minHeight: "100vh", backgroundColor: "#f8fafc", fontFamily: "'Inter', sans-serif" }}>
            {/* Notification Toast */}
            {notification && (
                <div style={{
                    position: "fixed",
                    top: "24px",
                    right: "24px",
                    padding: "16px 24px",
                    backgroundColor: notification.type === "success" ? "#10B981" : "#EF4444",
                    color: "white",
                    borderRadius: "8px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                    zIndex: 9999,
                    fontWeight: "500"
                }}>
                    {notification.type === "success" ? "✅" : "⚠️"} {notification.message}
                </div>
            )}

            {/* Header */}
            <header style={{
                background: "linear-gradient(135deg, #1E293B 0%, #0F172A 100%)",
                padding: "24px 32px",
                borderBottom: "1px solid #334155"
            }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "4px" }}>
                            <Link href="/admin" style={{ color: "#3B82F6", textDecoration: "none", fontSize: "14px" }}>
                                ← Admin
                            </Link>
                        </div>
                        <h1 style={{ color: "white", fontSize: "24px", fontWeight: "700", margin: 0 }}>
                            ⏰ Trial & Subscription Management
                        </h1>
                        <p style={{ color: "#94A3B8", fontSize: "14px", marginTop: "8px" }}>
                            Manage supplier trial periods, extension requests, and subscriptions
                        </p>
                    </div>
                </div>
            </header>

            {/* Tabs */}
            <div style={{
                display: "flex",
                gap: "8px",
                padding: "16px 32px",
                backgroundColor: "white",
                borderBottom: "1px solid #E2E8F0"
            }}>
                {[
                    { id: "requests", label: "Extension Requests", icon: "📋" },
                    { id: "suppliers", label: "All Suppliers", icon: "👥" }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        style={{
                            padding: "10px 20px",
                            border: "none",
                            borderRadius: "8px",
                            backgroundColor: activeTab === tab.id ? "#3B82F6" : "#F1F5F9",
                            color: activeTab === tab.id ? "white" : "#64748B",
                            fontSize: "14px",
                            fontWeight: "500",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "8px"
                        }}
                    >
                        <span>{tab.icon}</span>
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Main Content */}
            <main style={{ padding: "24px 32px" }}>
                {/* Extension Requests Tab */}
                {activeTab === "requests" && (
                    <>
                        {/* Status Filter */}
                        <div style={{ display: "flex", gap: "8px", marginBottom: "24px" }}>
                            {["pending", "approved", "rejected", "all"].map(status => (
                                <button
                                    key={status}
                                    onClick={() => setFilterStatus(status)}
                                    style={{
                                        padding: "8px 16px",
                                        borderRadius: "20px",
                                        border: filterStatus === status ? "none" : "1px solid #E2E8F0",
                                        backgroundColor: filterStatus === status ? "#3B82F6" : "white",
                                        color: filterStatus === status ? "white" : "#64748B",
                                        fontSize: "13px",
                                        fontWeight: "500",
                                        cursor: "pointer",
                                        textTransform: "capitalize"
                                    }}
                                >
                                    {status}
                                </button>
                            ))}
                        </div>

                        {loading ? (
                            <div style={{ textAlign: "center", padding: "60px", color: "#64748B" }}>Loading...</div>
                        ) : requests.length === 0 ? (
                            <div style={{
                                textAlign: "center",
                                padding: "60px",
                                backgroundColor: "white",
                                borderRadius: "12px",
                                color: "#64748B"
                            }}>
                                No {filterStatus !== "all" ? filterStatus : ""} extension requests found
                            </div>
                        ) : (
                            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                                {requests.map(request => (
                                    <div key={request.id} style={{
                                        backgroundColor: "white",
                                        borderRadius: "12px",
                                        padding: "24px",
                                        border: "1px solid #E2E8F0",
                                        boxShadow: "0 1px 3px rgba(0,0,0,0.05)"
                                    }}>
                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
                                            <div>
                                                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
                                                    <h3 style={{ fontSize: "18px", fontWeight: "600", margin: 0, color: "#1E293B" }}>
                                                        {request.supplier?.companyName}
                                                    </h3>
                                                    <span style={{
                                                        padding: "4px 12px",
                                                        borderRadius: "12px",
                                                        fontSize: "12px",
                                                        fontWeight: "500",
                                                        backgroundColor: request.status === "pending" ? "#FEF3C7" : request.status === "approved" ? "#DCFCE7" : "#FEE2E2",
                                                        color: request.status === "pending" ? "#B45309" : request.status === "approved" ? "#166534" : "#DC2626"
                                                    }}>
                                                        {request.status.toUpperCase()}
                                                    </span>
                                                </div>
                                                <p style={{ color: "#64748B", fontSize: "14px", margin: "0 0 8px" }}>
                                                    {request.supplier?.email}
                                                </p>
                                                <div style={{ display: "flex", gap: "24px", fontSize: "13px", color: "#64748B" }}>
                                                    <span>📅 Requested: {new Date(request.createdAt).toLocaleDateString()}</span>
                                                    <span>⏱️ Asking for: <strong style={{ color: "#F59E0B" }}>{request.requestedMonths} month(s)</strong></span>
                                                    <span>📦 Products: {request.supplier?._count?.products || 0}</span>
                                                    <span>📥 Inquiries: {request.supplier?._count?.inquiries || 0}</span>
                                                </div>
                                                {request.reason && (
                                                    <p style={{ marginTop: "12px", padding: "12px", backgroundColor: "#F8FAFC", borderRadius: "8px", fontSize: "14px", color: "#475569" }}>
                                                        <strong>Reason:</strong> {request.reason}
                                                    </p>
                                                )}
                                            </div>

                                            {/* Action Buttons */}
                                            {request.status === "pending" && (
                                                <div style={{ display: "flex", gap: "8px" }}>
                                                    <button
                                                        onClick={() => setSelectedRequest(request)}
                                                        disabled={processingId === request.id}
                                                        style={{
                                                            padding: "10px 20px",
                                                            backgroundColor: "#10B981",
                                                            color: "white",
                                                            border: "none",
                                                            borderRadius: "8px",
                                                            fontSize: "14px",
                                                            fontWeight: "500",
                                                            cursor: processingId === request.id ? "not-allowed" : "pointer"
                                                        }}
                                                    >
                                                        ✅ Approve
                                                    </button>
                                                    <button
                                                        onClick={() => handleProcessRequest(request.id, "reject", 0, "Request declined.")}
                                                        disabled={processingId === request.id}
                                                        style={{
                                                            padding: "10px 20px",
                                                            backgroundColor: "#EF4444",
                                                            color: "white",
                                                            border: "none",
                                                            borderRadius: "8px",
                                                            fontSize: "14px",
                                                            fontWeight: "500",
                                                            cursor: processingId === request.id ? "not-allowed" : "pointer"
                                                        }}
                                                    >
                                                        ❌ Reject
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}

                {/* All Suppliers Tab */}
                {activeTab === "suppliers" && (
                    <>
                        {loading ? (
                            <div style={{ textAlign: "center", padding: "60px", color: "#64748B" }}>Loading...</div>
                        ) : (
                            <div style={{ backgroundColor: "white", borderRadius: "12px", border: "1px solid #E2E8F0", overflow: "hidden" }}>
                                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                                    <thead>
                                        <tr style={{ backgroundColor: "#F8FAFC" }}>
                                            <th style={{ padding: "16px", textAlign: "left", fontSize: "13px", fontWeight: "600", color: "#64748B" }}>Supplier</th>
                                            <th style={{ padding: "16px", textAlign: "center", fontSize: "13px", fontWeight: "600", color: "#64748B" }}>Status</th>
                                            <th style={{ padding: "16px", textAlign: "center", fontSize: "13px", fontWeight: "600", color: "#64748B" }}>Days Left</th>
                                            <th style={{ padding: "16px", textAlign: "center", fontSize: "13px", fontWeight: "600", color: "#64748B" }}>Products</th>
                                            <th style={{ padding: "16px", textAlign: "center", fontSize: "13px", fontWeight: "600", color: "#64748B" }}>Inquiries</th>
                                            <th style={{ padding: "16px", textAlign: "center", fontSize: "13px", fontWeight: "600", color: "#64748B" }}>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {suppliers.map(supplier => (
                                            <tr key={supplier.id} style={{ borderTop: "1px solid #E2E8F0" }}>
                                                <td style={{ padding: "16px" }}>
                                                    <div style={{ fontWeight: "600", color: "#1E293B" }}>{supplier.companyName}</div>
                                                    <div style={{ fontSize: "13px", color: "#64748B" }}>{supplier.email}</div>
                                                </td>
                                                <td style={{ padding: "16px", textAlign: "center" }}>
                                                    <span style={{
                                                        padding: "4px 12px",
                                                        borderRadius: "12px",
                                                        fontSize: "12px",
                                                        fontWeight: "500",
                                                        backgroundColor: supplier.isSubscribed ? "#DBEAFE" : supplier.subscriptionStatus === "trial" ? "#FEF3C7" : "#FEE2E2",
                                                        color: supplier.isSubscribed ? "#1D4ED8" : supplier.subscriptionStatus === "trial" ? "#B45309" : "#DC2626"
                                                    }}>
                                                        {supplier.isSubscribed ? "Subscribed" : supplier.subscriptionStatus === "trial" ? "Trial" : "Expired"}
                                                    </span>
                                                </td>
                                                <td style={{ padding: "16px", textAlign: "center" }}>
                                                    <span style={{
                                                        display: "inline-block",
                                                        minWidth: "60px",
                                                        padding: "6px 12px",
                                                        borderRadius: "8px",
                                                        fontSize: "14px",
                                                        fontWeight: "600",
                                                        backgroundColor: `${getDaysColor(supplier.daysRemaining)}20`,
                                                        color: getDaysColor(supplier.daysRemaining)
                                                    }}>
                                                        {supplier.daysRemaining} days
                                                    </span>
                                                </td>
                                                <td style={{ padding: "16px", textAlign: "center", fontWeight: "500" }}>
                                                    {supplier.productCount}
                                                </td>
                                                <td style={{ padding: "16px", textAlign: "center", fontWeight: "500" }}>
                                                    {supplier.inquiryCount}
                                                </td>
                                                <td style={{ padding: "16px", textAlign: "center" }}>
                                                    <button
                                                        onClick={() => setShowDirectExtendModal(supplier)}
                                                        style={{
                                                            padding: "8px 16px",
                                                            backgroundColor: "#F59E0B",
                                                            color: "white",
                                                            border: "none",
                                                            borderRadius: "6px",
                                                            fontSize: "13px",
                                                            fontWeight: "500",
                                                            cursor: "pointer"
                                                        }}
                                                    >
                                                        ⏱️ Extend Trial
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </>
                )}
            </main>

            {/* Approval Modal */}
            {selectedRequest && (
                <div style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: "rgba(0,0,0,0.5)",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    zIndex: 1000
                }}>
                    <div style={{
                        backgroundColor: "white",
                        borderRadius: "16px",
                        padding: "32px",
                        maxWidth: "480px",
                        width: "90%"
                    }}>
                        <h2 style={{ fontSize: "20px", fontWeight: "700", marginBottom: "8px" }}>
                            ✅ Approve Extension Request
                        </h2>
                        <p style={{ color: "#64748B", marginBottom: "24px" }}>
                            <strong>{selectedRequest.supplier?.companyName}</strong> requested {selectedRequest.requestedMonths} month(s)
                        </p>

                        <label style={{ display: "block", marginBottom: "16px" }}>
                            <span style={{ fontSize: "14px", fontWeight: "500", color: "#374151" }}>
                                Months to Approve (0 = No extension)
                            </span>
                            <select
                                value={approvalForm.months}
                                onChange={(e) => setApprovalForm({ ...approvalForm, months: parseInt(e.target.value) })}
                                style={{
                                    width: "100%",
                                    marginTop: "8px",
                                    padding: "12px",
                                    border: "1px solid #E2E8F0",
                                    borderRadius: "8px",
                                    fontSize: "14px"
                                }}
                            >
                                {[0, 1, 2, 3, 4, 5, 6].map(m => (
                                    <option key={m} value={m}>
                                        {m === 0 ? "No extension (reject)" : `${m} month${m > 1 ? "s" : ""}`}
                                    </option>
                                ))}
                            </select>
                        </label>

                        <label style={{ display: "block", marginBottom: "24px" }}>
                            <span style={{ fontSize: "14px", fontWeight: "500", color: "#374151" }}>
                                Note to Supplier (Optional)
                            </span>
                            <textarea
                                value={approvalForm.note}
                                onChange={(e) => setApprovalForm({ ...approvalForm, note: e.target.value })}
                                placeholder="e.g., Keep up the good work!"
                                rows={3}
                                style={{
                                    width: "100%",
                                    marginTop: "8px",
                                    padding: "12px",
                                    border: "1px solid #E2E8F0",
                                    borderRadius: "8px",
                                    fontSize: "14px",
                                    resize: "vertical"
                                }}
                            />
                        </label>

                        <div style={{ display: "flex", gap: "12px" }}>
                            <button
                                onClick={() => {
                                    setSelectedRequest(null);
                                    setApprovalForm({ months: 0, note: "" });
                                }}
                                style={{
                                    flex: 1,
                                    padding: "12px",
                                    backgroundColor: "white",
                                    border: "1px solid #E2E8F0",
                                    borderRadius: "8px",
                                    cursor: "pointer"
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleProcessRequest(
                                    selectedRequest.id,
                                    approvalForm.months > 0 ? "approve" : "reject",
                                    approvalForm.months,
                                    approvalForm.note
                                )}
                                disabled={processingId}
                                style={{
                                    flex: 1,
                                    padding: "12px",
                                    backgroundColor: approvalForm.months > 0 ? "#10B981" : "#EF4444",
                                    color: "white",
                                    border: "none",
                                    borderRadius: "8px",
                                    fontWeight: "600",
                                    cursor: processingId ? "not-allowed" : "pointer"
                                }}
                            >
                                {processingId ? "Processing..." : approvalForm.months > 0 ? "Approve" : "Reject"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Direct Extend Modal */}
            {showDirectExtendModal && (
                <div style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: "rgba(0,0,0,0.5)",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    zIndex: 1000
                }}>
                    <div style={{
                        backgroundColor: "white",
                        borderRadius: "16px",
                        padding: "32px",
                        maxWidth: "480px",
                        width: "90%"
                    }}>
                        <h2 style={{ fontSize: "20px", fontWeight: "700", marginBottom: "8px" }}>
                            ⏱️ Extend Trial Period
                        </h2>
                        <p style={{ color: "#64748B", marginBottom: "24px" }}>
                            Extend trial for <strong>{showDirectExtendModal.companyName}</strong>
                            <br />
                            Current status: {showDirectExtendModal.daysRemaining} days remaining
                        </p>

                        <label style={{ display: "block", marginBottom: "16px" }}>
                            <span style={{ fontSize: "14px", fontWeight: "500", color: "#374151" }}>
                                Months to Add
                            </span>
                            <select
                                value={directExtendForm.months}
                                onChange={(e) => setDirectExtendForm({ ...directExtendForm, months: parseInt(e.target.value) })}
                                style={{
                                    width: "100%",
                                    marginTop: "8px",
                                    padding: "12px",
                                    border: "1px solid #E2E8F0",
                                    borderRadius: "8px",
                                    fontSize: "14px"
                                }}
                            >
                                {[1, 2, 3, 4, 5, 6].map(m => (
                                    <option key={m} value={m}>{m} month{m > 1 ? "s" : ""}</option>
                                ))}
                            </select>
                        </label>

                        <label style={{ display: "block", marginBottom: "24px" }}>
                            <span style={{ fontSize: "14px", fontWeight: "500", color: "#374151" }}>
                                Reason (Optional)
                            </span>
                            <textarea
                                value={directExtendForm.reason}
                                onChange={(e) => setDirectExtendForm({ ...directExtendForm, reason: e.target.value })}
                                placeholder="e.g., High potential, active engagement..."
                                rows={2}
                                style={{
                                    width: "100%",
                                    marginTop: "8px",
                                    padding: "12px",
                                    border: "1px solid #E2E8F0",
                                    borderRadius: "8px",
                                    fontSize: "14px",
                                    resize: "vertical"
                                }}
                            />
                        </label>

                        <div style={{ display: "flex", gap: "12px" }}>
                            <button
                                onClick={() => {
                                    setShowDirectExtendModal(null);
                                    setDirectExtendForm({ months: 1, reason: "" });
                                }}
                                style={{
                                    flex: 1,
                                    padding: "12px",
                                    backgroundColor: "white",
                                    border: "1px solid #E2E8F0",
                                    borderRadius: "8px",
                                    cursor: "pointer"
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleDirectExtend(showDirectExtendModal.id)}
                                disabled={processingId}
                                style={{
                                    flex: 1,
                                    padding: "12px",
                                    backgroundColor: "#F59E0B",
                                    color: "white",
                                    border: "none",
                                    borderRadius: "8px",
                                    fontWeight: "600",
                                    cursor: processingId ? "not-allowed" : "pointer"
                                }}
                            >
                                {processingId ? "Extending..." : `Add ${directExtendForm.months} Month(s)`}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

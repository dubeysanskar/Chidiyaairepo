"use client";

import { useState } from "react";

// Mock data
const mockLogs = [
    { id: 1, type: "approval", action: "Supplier Approved", details: "Approved supplier: Premium Textile Corp", user: "Admin User", timestamp: "2024-01-13 14:32:15", ip: "192.168.1.xxx" },
    { id: 2, type: "suspension", action: "Supplier Suspended", details: "Suspended supplier: Fake Corp Industries - Reason: Fraudulent documents", user: "Admin User", timestamp: "2024-01-13 14:28:00", ip: "192.168.1.xxx" },
    { id: 3, type: "badge", action: "Badge Awarded", details: "Awarded 'Premium' badge to Quality Fabrics Ltd", user: "Admin User", timestamp: "2024-01-13 13:45:22", ip: "192.168.1.xxx" },
    { id: 4, type: "buyer_action", action: "Buyer Warned", details: "Warned buyer: Suspicious User - Reason: Multiple identical inquiries", user: "Admin User", timestamp: "2024-01-13 12:15:00", ip: "192.168.1.xxx" },
    { id: 5, type: "buyer_action", action: "Buyer Restricted", details: "Restricted buyer: Bot Account - Reason: Automated behavior", user: "Admin User", timestamp: "2024-01-13 11:00:00", ip: "192.168.1.xxx" },
    { id: 6, type: "category", action: "Category Created", details: "Created new category: Industrial Equipment", user: "Admin User", timestamp: "2024-01-13 10:30:00", ip: "192.168.1.xxx" },
    { id: 7, type: "login", action: "Admin Login", details: "Admin User logged in from new device", user: "Admin User", timestamp: "2024-01-13 09:00:00", ip: "192.168.1.xxx" },
    { id: 8, type: "inquiry", action: "Inquiry Flagged", details: "AI flagged inquiry #4521 as potential spam", user: "System", timestamp: "2024-01-12 23:45:00", ip: "N/A" },
    { id: 9, type: "approval", action: "Supplier Rejected", details: "Rejected supplier: Scam Corp - Invalid GST", user: "Admin User", timestamp: "2024-01-12 16:20:00", ip: "192.168.1.xxx" },
    { id: 10, type: "badge", action: "Badge Removed", details: "Removed 'Trusted' badge from XYZ Traders", user: "Admin User", timestamp: "2024-01-12 14:00:00", ip: "192.168.1.xxx" },
];

const logTypes = [
    { id: "all", label: "All Actions" },
    { id: "approval", label: "Approvals" },
    { id: "suspension", label: "Suspensions" },
    { id: "badge", label: "Badges" },
    { id: "buyer_action", label: "Buyer Actions" },
    { id: "category", label: "Categories" },
    { id: "login", label: "Logins" },
    { id: "inquiry", label: "Inquiries" },
];

export default function AuditLogsPage() {
    const [logs] = useState(mockLogs);
    const [filterType, setFilterType] = useState("all");
    const [searchTerm, setSearchTerm] = useState("");

    const getFilteredLogs = () => {
        return logs.filter(log => {
            const matchesType = filterType === "all" || log.type === filterType;
            const matchesSearch = log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
                log.details.toLowerCase().includes(searchTerm.toLowerCase());
            return matchesType && matchesSearch;
        });
    };

    const getTypeColor = (type) => {
        switch (type) {
            case "approval": return "#22c55e";
            case "suspension": return "#ef4444";
            case "badge": return "#f59e0b";
            case "buyer_action": return "#8b5cf6";
            case "category": return "#3b82f6";
            case "login": return "#64748b";
            case "inquiry": return "#14b8a6";
            default: return "#94a3b8";
        }
    };

    const getTypeIcon = (type) => {
        switch (type) {
            case "approval": return "✓";
            case "suspension": return "⛔";
            case "badge": return "🏅";
            case "buyer_action": return "👤";
            case "category": return "📁";
            case "login": return "🔐";
            case "inquiry": return "📬";
            default: return "📋";
        }
    };

    const handleExport = () => {
        alert("Export functionality would download logs as CSV/Excel. (UI only)");
    };

    return (
        <div>
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", flexWrap: "wrap", gap: "12px" }}>
                <div>
                    <h1 className="admin-title">Audit Logs</h1>
                    <p style={{ color: "#64748b", fontSize: "14px" }}>
                        Complete activity history of all admin actions
                    </p>
                </div>
                <button onClick={handleExport} style={{
                    padding: "12px 24px",
                    backgroundColor: "#334155",
                    color: "white",
                    border: "1px solid #475569",
                    borderRadius: "8px",
                    fontSize: "14px",
                    fontWeight: "500",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px"
                }}>
                    📥 Export Logs
                </button>
            </div>

            {/* Filters */}
            <div style={{
                backgroundColor: "#1e293b",
                borderRadius: "12px",
                padding: "16px",
                marginBottom: "24px",
                border: "1px solid #334155"
            }}>
                <div className="admin-filters">
                    {/* Search */}
                    <div style={{ flex: 1 }}>
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search logs..."
                            style={{
                                width: "100%",
                                padding: "12px 16px",
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

                    {/* Type Filter */}
                    <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                        style={{
                            padding: "12px 16px",
                            backgroundColor: "#0f172a",
                            border: "1px solid #334155",
                            borderRadius: "8px",
                            color: "white",
                            fontSize: "14px",
                            outline: "none",
                            minWidth: "150px"
                        }}
                    >
                        {logTypes.map(type => (
                            <option key={type.id} value={type.id}>{type.label}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Stats */}
            <div className="admin-stats-grid" style={{ marginBottom: "24px" }}>
                {[
                    { label: "Total Logs", value: logs.length, color: "#3b82f6" },
                    { label: "Today", value: logs.filter(l => l.timestamp.includes("2024-01-13")).length, color: "#22c55e" },
                    { label: "Approvals", value: logs.filter(l => l.type === "approval").length, color: "#f59e0b" },
                    { label: "Suspensions", value: logs.filter(l => l.type === "suspension").length, color: "#ef4444" },
                ].map((stat, i) => (
                    <div key={i} style={{
                        backgroundColor: "#1e293b",
                        padding: "16px",
                        borderRadius: "10px",
                        border: "1px solid #334155"
                    }}>
                        <div style={{ fontSize: "24px", fontWeight: "bold", color: stat.color }}>{stat.value}</div>
                        <div style={{ fontSize: "12px", color: "#94a3b8" }}>{stat.label}</div>
                    </div>
                ))}
            </div>

            {/* Logs List */}
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {getFilteredLogs().length === 0 ? (
                    <div style={{
                        backgroundColor: "#1e293b",
                        borderRadius: "12px",
                        padding: "48px",
                        textAlign: "center",
                        color: "#64748b"
                    }}>
                        No logs found matching your criteria
                    </div>
                ) : (
                    getFilteredLogs().map((log) => (
                        <div key={log.id} style={{
                            backgroundColor: "#1e293b",
                            borderRadius: "10px",
                            border: "1px solid #334155",
                            borderLeft: `4px solid ${getTypeColor(log.type)}`,
                            padding: "14px"
                        }}>
                            <div className="admin-row">
                                <div style={{ display: "flex", alignItems: "flex-start", gap: "12px", flex: 1 }}>
                                    <span style={{
                                        width: "36px",
                                        height: "36px",
                                        borderRadius: "8px",
                                        backgroundColor: `${getTypeColor(log.type)}20`,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        fontSize: "16px",
                                        flexShrink: 0
                                    }}>
                                        {getTypeIcon(log.type)}
                                    </span>
                                    <div>
                                        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                                            <span style={{ color: "white", fontSize: "15px", fontWeight: "500" }}>
                                                {log.action}
                                            </span>
                                            <span style={{
                                                padding: "2px 6px",
                                                backgroundColor: `${getTypeColor(log.type)}20`,
                                                color: getTypeColor(log.type),
                                                borderRadius: "6px",
                                                fontSize: "10px",
                                                textTransform: "uppercase"
                                            }}>
                                                {log.type.replace("_", " ")}
                                            </span>
                                        </div>
                                        <div style={{ color: "#94a3b8", fontSize: "13px", marginTop: "4px" }}>
                                            {log.details}
                                        </div>
                                    </div>
                                </div>
                                <div style={{ minWidth: "120px" }}>
                                    <div style={{ color: "#64748b", fontSize: "12px" }}>{log.timestamp}</div>
                                    <div style={{ color: "#475569", fontSize: "11px" }}>by {log.user}</div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Pagination Info */}
            <div style={{
                marginTop: "24px",
                padding: "16px",
                backgroundColor: "#1e293b",
                borderRadius: "10px",
                border: "1px solid #334155",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "12px"
            }}>
                <span style={{ color: "#64748b", fontSize: "14px" }}>
                    Showing {getFilteredLogs().length} of {logs.length} logs
                </span>
                <div style={{ display: "flex", gap: "8px" }}>
                    <button style={{
                        padding: "8px 16px",
                        backgroundColor: "#334155",
                        color: "#94a3b8",
                        border: "none",
                        borderRadius: "6px",
                        fontSize: "13px",
                        cursor: "pointer"
                    }}>
                        ← Previous
                    </button>
                    <button style={{
                        padding: "8px 16px",
                        backgroundColor: "#334155",
                        color: "#94a3b8",
                        border: "none",
                        borderRadius: "6px",
                        fontSize: "13px",
                        cursor: "pointer"
                    }}>
                        Next →
                    </button>
                </div>
            </div>
        </div>
    );
}

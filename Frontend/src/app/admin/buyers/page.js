"use client";

import { useState, useEffect } from "react";

// Mock data
const mockBuyers = [
    { id: 1, name: "Rajesh Kumar", email: "rajesh@company.com", phone: "+91 98765 43210", inquiries: 23, status: "active", flagged: false, flagReason: "", lastActive: "2 hours ago" },
    { id: 2, name: "Suspicious User", email: "spam@fake.com", phone: "+91 11111 22222", inquiries: 45, status: "flagged", flagged: true, flagReason: "Sent 15 identical inquiries in 1 hour", severity: "high", lastActive: "1 hour ago" },
    { id: 3, name: "Neha Sharma", email: "neha@business.in", phone: "+91 87654 32109", inquiries: 8, status: "active", flagged: false, flagReason: "", lastActive: "1 day ago" },
    { id: 4, name: "Bot Account", email: "bot123@temp.com", phone: "+91 00000 00000", inquiries: 100, status: "flagged", flagged: true, flagReason: "Automated behavior detected", severity: "high", lastActive: "30 min ago" },
    { id: 5, name: "Vikram Patel", email: "vikram@enterprise.co", phone: "+91 76543 21098", inquiries: 12, status: "warned", flagged: true, flagReason: "Minor policy violation", severity: "low", lastActive: "3 days ago" },
    { id: 6, name: "Banned User", email: "banned@example.com", phone: "+91 55555 55555", inquiries: 0, status: "restricted", flagged: true, flagReason: "Repeated abuse after warning", severity: "high", lastActive: "1 week ago" },
];

const tabs = [
    { id: "all", label: "All Buyers" },
    { id: "flagged", label: "AI-Flagged" },
    { id: "warned", label: "Warned" },
    { id: "restricted", label: "Restricted" },
];

export default function BuyersPage() {
    const [activeTab, setActiveTab] = useState("all");
    const [buyers, setBuyers] = useState(mockBuyers);
    const [selectedBuyer, setSelectedBuyer] = useState(null);
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

    const getFilteredBuyers = () => {
        if (activeTab === "all") return buyers.filter(b => b.status !== "restricted");
        if (activeTab === "flagged") return buyers.filter(b => b.flagged && b.status !== "warned" && b.status !== "restricted");
        if (activeTab === "warned") return buyers.filter(b => b.status === "warned");
        if (activeTab === "restricted") return buyers.filter(b => b.status === "restricted");
        return buyers;
    };

    const handleAction = (buyerId, action) => {
        setBuyers(buyers.map(b => {
            if (b.id === buyerId) {
                if (action === "warn") return { ...b, status: "warned" };
                if (action === "restrict") return { ...b, status: "restricted" };
                if (action === "restore") return { ...b, status: "active", flagged: false, flagReason: "" };
                if (action === "dismiss") return { ...b, flagged: false, flagReason: "" };
            }
            return b;
        }));
    };

    const getSeverityColor = (severity) => {
        switch (severity) {
            case "high": return "#ef4444";
            case "medium": return "#f59e0b";
            case "low": return "#3b82f6";
            default: return "#64748b";
        }
    };

    return (
        <div>
            {/* Header */}
            <div style={{ marginBottom: "24px" }}>
                <h1 style={{ fontSize: showMobile ? "24px" : "28px", fontWeight: "bold", color: "white", marginBottom: "4px" }}>
                    Buyer Monitoring
                </h1>
                <p style={{ color: "#64748b", fontSize: "14px" }}>
                    Monitor buyer activity and handle AI-flagged accounts
                </p>
            </div>

            {/* Stats */}
            <div style={{
                display: "grid",
                gridTemplateColumns: showMobile ? "repeat(2, 1fr)" : "repeat(4, 1fr)",
                gap: "12px",
                marginBottom: "24px"
            }}>
                {[
                    { label: "Total Buyers", value: buyers.filter(b => b.status !== "restricted").length, color: "#3b82f6" },
                    { label: "AI-Flagged", value: buyers.filter(b => b.flagged).length, color: "#ef4444" },
                    { label: "Warned", value: buyers.filter(b => b.status === "warned").length, color: "#f59e0b" },
                    { label: "Restricted", value: buyers.filter(b => b.status === "restricted").length, color: "#94a3b8" },
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
                            whiteSpace: "nowrap"
                        }}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Buyer Cards */}
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {getFilteredBuyers().length === 0 ? (
                    <div style={{
                        backgroundColor: "#1e293b",
                        borderRadius: "12px",
                        padding: "48px",
                        textAlign: "center",
                        color: "#64748b"
                    }}>
                        No buyers in this category
                    </div>
                ) : (
                    getFilteredBuyers().map((buyer) => (
                        <div key={buyer.id} style={{
                            backgroundColor: "#1e293b",
                            borderRadius: "12px",
                            border: "1px solid #334155",
                            padding: showMobile ? "16px" : "20px"
                        }}>
                            <div style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: showMobile ? "flex-start" : "center",
                                flexDirection: showMobile ? "column" : "row",
                                gap: "12px"
                            }}>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                                        <h3 style={{ fontSize: "16px", fontWeight: "600", color: "white" }}>
                                            {buyer.name}
                                        </h3>
                                        {buyer.flagged && (
                                            <span style={{
                                                padding: "2px 8px",
                                                backgroundColor: `${getSeverityColor(buyer.severity)}20`,
                                                color: getSeverityColor(buyer.severity),
                                                borderRadius: "10px",
                                                fontSize: "11px",
                                                fontWeight: "500"
                                            }}>
                                                🚩 {buyer.severity?.toUpperCase() || "FLAGGED"}
                                            </span>
                                        )}
                                        {buyer.status === "warned" && (
                                            <span style={{
                                                padding: "2px 8px",
                                                backgroundColor: "#f59e0b20",
                                                color: "#f59e0b",
                                                borderRadius: "10px",
                                                fontSize: "11px"
                                            }}>
                                                ⚠️ Warned
                                            </span>
                                        )}
                                        {buyer.status === "restricted" && (
                                            <span style={{
                                                padding: "2px 8px",
                                                backgroundColor: "#ef444420",
                                                color: "#ef4444",
                                                borderRadius: "10px",
                                                fontSize: "11px"
                                            }}>
                                                ⛔ Restricted
                                            </span>
                                        )}
                                    </div>
                                    <div style={{ display: "flex", gap: "16px", marginTop: "8px", fontSize: "13px", color: "#94a3b8", flexWrap: "wrap" }}>
                                        <span>{buyer.email}</span>
                                        <span>{buyer.inquiries} inquiries</span>
                                        <span>Last active: {buyer.lastActive}</span>
                                    </div>
                                    {buyer.flagReason && (
                                        <div style={{
                                            marginTop: "10px",
                                            padding: "10px",
                                            backgroundColor: "#0f172a",
                                            borderRadius: "6px",
                                            borderLeft: `3px solid ${getSeverityColor(buyer.severity)}`,
                                            fontSize: "13px",
                                            color: "#94a3b8"
                                        }}>
                                            <strong style={{ color: "white" }}>AI Flag:</strong> {buyer.flagReason}
                                        </div>
                                    )}
                                </div>
                                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                                    {buyer.status === "active" && buyer.flagged && (
                                        <>
                                            <button onClick={() => handleAction(buyer.id, "dismiss")} style={{
                                                padding: "8px 14px",
                                                backgroundColor: "#334155",
                                                color: "#94a3b8",
                                                border: "none",
                                                borderRadius: "6px",
                                                fontSize: "13px",
                                                cursor: "pointer"
                                            }}>
                                                Dismiss
                                            </button>
                                            <button onClick={() => handleAction(buyer.id, "warn")} style={{
                                                padding: "8px 14px",
                                                backgroundColor: "#f59e0b20",
                                                color: "#f59e0b",
                                                border: "1px solid #f59e0b",
                                                borderRadius: "6px",
                                                fontSize: "13px",
                                                cursor: "pointer"
                                            }}>
                                                Warn
                                            </button>
                                            <button onClick={() => handleAction(buyer.id, "restrict")} style={{
                                                padding: "8px 14px",
                                                backgroundColor: "#ef444420",
                                                color: "#ef4444",
                                                border: "1px solid #ef4444",
                                                borderRadius: "6px",
                                                fontSize: "13px",
                                                cursor: "pointer"
                                            }}>
                                                Restrict
                                            </button>
                                        </>
                                    )}
                                    {buyer.status === "warned" && (
                                        <>
                                            <button onClick={() => handleAction(buyer.id, "restore")} style={{
                                                padding: "8px 14px",
                                                backgroundColor: "#22c55e20",
                                                color: "#22c55e",
                                                border: "1px solid #22c55e",
                                                borderRadius: "6px",
                                                fontSize: "13px",
                                                cursor: "pointer"
                                            }}>
                                                Remove Warning
                                            </button>
                                            <button onClick={() => handleAction(buyer.id, "restrict")} style={{
                                                padding: "8px 14px",
                                                backgroundColor: "#ef444420",
                                                color: "#ef4444",
                                                border: "1px solid #ef4444",
                                                borderRadius: "6px",
                                                fontSize: "13px",
                                                cursor: "pointer"
                                            }}>
                                                Restrict
                                            </button>
                                        </>
                                    )}
                                    {buyer.status === "restricted" && (
                                        <button onClick={() => handleAction(buyer.id, "restore")} style={{
                                            padding: "8px 14px",
                                            backgroundColor: "#22c55e20",
                                            color: "#22c55e",
                                            border: "1px solid #22c55e",
                                            borderRadius: "6px",
                                            fontSize: "13px",
                                            cursor: "pointer"
                                        }}>
                                            Restore Access
                                        </button>
                                    )}
                                    <button style={{
                                        padding: "8px 14px",
                                        backgroundColor: "#1e293b",
                                        color: "#3b82f6",
                                        border: "1px solid #334155",
                                        borderRadius: "6px",
                                        fontSize: "13px",
                                        cursor: "pointer"
                                    }}>
                                        View Activity
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

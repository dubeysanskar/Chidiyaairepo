"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useCallback } from "react";

// Date formatter options (hoisted outside component)
const dateFormatOptions: Intl.DateTimeFormatOptions = {
    day: "numeric",
    month: "short",
    year: "numeric",
};

interface ChatSession {
    id: string;
    location: string | null;
    category: string | null;
    quantity: string | null;
    budget: string | null;
    status: string;
    createdAt: string;
    lastMessage: string | null;
}

interface HistoryItem {
    id: string;
    location: string | null;
    category: string | null;
    quantity: string | null;
    budget: string | null;
    status: string;
    createdAt: string;
    searches: { id: string; query: string; timestamp: string }[];
}

interface SavedSupplier {
    id: string;
    companyName: string;
    city: string | null;
    productCategories: string[];
    badges: string[];
    phone: string | null;
}

interface Activity {
    type: string;
    supplierId: string;
    supplierName: string;
    timestamp: string;
}

export default function BuyerDashboard() {
    const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
    const [savedSuppliers, setSavedSuppliers] = useState<SavedSupplier[]>([]);
    const [recentActivity, setRecentActivity] = useState<Activity[]>([]);
    const [searchHistory, setSearchHistory] = useState<HistoryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<"history" | "saved" | "activity">("history");

    // Selection state for history
    const [selectedSessions, setSelectedSessions] = useState<Set<string>>(new Set());
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteMode, setDeleteMode] = useState<"single" | "selected" | "all">("single");
    const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        fetchDashboardData();
        fetchSearchHistory();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const response = await fetch("/api/buyer/dashboard");
            const data = await response.json();
            if (data.success) {
                setChatSessions(data.chatSessions || []);
                setSavedSuppliers(data.savedSuppliers || []);
                setRecentActivity(data.recentActivity || []);
            }
        } catch (error) {
            console.error("Failed to fetch dashboard data:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchSearchHistory = async () => {
        try {
            const response = await fetch("/api/buyer/history");
            const data = await response.json();
            if (data.success) {
                setSearchHistory(data.history || []);
            }
        } catch (error) {
            console.error("Failed to fetch search history:", error);
        }
    };

    // Memoize formatDate for stable reference (rerender optimization)
    const formatDate = useCallback((dateStr: string) => {
        return new Date(dateStr).toLocaleDateString("en-IN", dateFormatOptions);
    }, []);

    // Selection handlers
    const toggleSelectSession = (id: string) => {
        setSelectedSessions(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) {
                newSet.delete(id);
            } else {
                newSet.add(id);
            }
            return newSet;
        });
    };

    const toggleSelectAll = () => {
        if (selectedSessions.size === searchHistory.length) {
            setSelectedSessions(new Set());
        } else {
            setSelectedSessions(new Set(searchHistory.map(h => h.id)));
        }
    };

    // Delete handlers
    const handleDeleteSingle = (id: string) => {
        setDeleteMode("single");
        setDeleteTargetId(id);
        setShowDeleteModal(true);
    };

    const handleDeleteSelected = () => {
        if (selectedSessions.size === 0) return;
        setDeleteMode("selected");
        setShowDeleteModal(true);
    };

    const handleDeleteAll = () => {
        setDeleteMode("all");
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        setIsDeleting(true);
        try {
            let url = "/api/buyer/history";
            if (deleteMode === "all") {
                url += "?all=true";
            } else if (deleteMode === "selected") {
                url += `?ids=${Array.from(selectedSessions).join(",")}`;
            } else if (deleteMode === "single" && deleteTargetId) {
                url += `?ids=${deleteTargetId}`;
            }

            const response = await fetch(url, { method: "DELETE" });
            const data = await response.json();

            if (data.success) {
                // Refresh history
                await fetchSearchHistory();
                setSelectedSessions(new Set());
            }
        } catch (error) {
            console.error("Delete failed:", error);
        } finally {
            setIsDeleting(false);
            setShowDeleteModal(false);
            setDeleteTargetId(null);
        }
    };

    const getDeleteMessage = () => {
        if (deleteMode === "all") return "Are you sure you want to delete all search history?";
        if (deleteMode === "selected") return `Delete ${selectedSessions.size} selected session(s)?`;
        return "Delete this search session?";
    };

    return (
        <div style={{
            minHeight: "100vh",
            fontFamily: "'Inter', system-ui, sans-serif",
            backgroundColor: "#f8fafc"
        }}>
            {/* Header */}
            <header style={{
                backgroundColor: "white",
                borderBottom: "1px solid #e2e8f0",
                padding: "14px 24px"
            }}>
                <div style={{ maxWidth: "1200px", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center" }}>
                        <Image
                            src="/assests/chidiyaailogo.png"
                            alt="ChidiyaAI"
                            width={140}
                            height={38}
                            style={{ height: "38px", width: "auto" }}
                            priority
                        />
                    </Link>
                    <div style={{ display: "flex", gap: "16px", fontSize: "14px", alignItems: "center" }}>
                        <Link href="/" style={{ color: "#64748b", textDecoration: "none" }}>Home</Link>
                        <Link href="/account/chat" style={{
                            color: "white",
                            textDecoration: "none",
                            fontWeight: "500",
                            backgroundColor: "#3b82f6",
                            padding: "8px 16px",
                            borderRadius: "8px"
                        }}>+ New Search</Link>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main style={{ maxWidth: "1200px", margin: "0 auto", padding: "32px 24px" }}>
                <h1 style={{ fontSize: "28px", fontWeight: "700", color: "#0f172a", margin: "0 0 8px" }}>
                    Buyer Dashboard
                </h1>
                <p style={{ fontSize: "15px", color: "#64748b", margin: "0 0 32px" }}>
                    Manage your sourcing requests and supplier connections
                </p>

                {/* Tabs */}
                <div style={{ display: "flex", gap: "8px", marginBottom: "24px", borderBottom: "1px solid #e2e8f0", paddingBottom: "0" }}>
                    {[
                        { key: "history", label: "🕒 Search History", count: searchHistory.length },
                        { key: "saved", label: "⭐ Saved Suppliers", count: savedSuppliers.length },
                        { key: "activity", label: "📞 Recent Activity", count: recentActivity.length }
                    ].map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key as typeof activeTab)}
                            style={{
                                padding: "12px 20px",
                                backgroundColor: "transparent",
                                border: "none",
                                borderBottom: activeTab === tab.key ? "2px solid #3b82f6" : "2px solid transparent",
                                color: activeTab === tab.key ? "#0f172a" : "#64748b",
                                fontWeight: activeTab === tab.key ? "600" : "400",
                                fontSize: "14px",
                                cursor: "pointer",
                                marginBottom: "-1px"
                            }}
                        >
                            {tab.label} ({tab.count})
                        </button>
                    ))}
                </div>

                {loading ? (
                    <div style={{ textAlign: "center", padding: "60px 0", color: "#64748b" }}>
                        Loading...
                    </div>
                ) : (
                    <>
                        {/* Search History Tab */}
                        {activeTab === "history" && (
                            <div>
                                {searchHistory.length === 0 ? (
                                    <div style={{
                                        backgroundColor: "white",
                                        borderRadius: "16px",
                                        border: "1px solid #e2e8f0",
                                        padding: "48px",
                                        textAlign: "center"
                                    }}>
                                        <div style={{ fontSize: "48px", marginBottom: "16px", opacity: 0.5 }}>🕒</div>
                                        <p style={{ fontSize: "15px", color: "#64748b", margin: "0 0 16px" }}>
                                            No search history yet
                                        </p>
                                        <Link href="/account/chat" style={{
                                            display: "inline-block",
                                            padding: "12px 24px",
                                            backgroundColor: "#0f172a",
                                            color: "white",
                                            borderRadius: "10px",
                                            textDecoration: "none",
                                            fontSize: "14px",
                                            fontWeight: "500"
                                        }}>
                                            Start Your First Search
                                        </Link>
                                    </div>
                                ) : (
                                    <>
                                        {/* Action Bar */}
                                        <div style={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: "center",
                                            marginBottom: "16px",
                                            padding: "12px 16px",
                                            backgroundColor: "white",
                                            borderRadius: "10px",
                                            border: "1px solid #e2e8f0"
                                        }}>
                                            <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "14px", color: "#64748b" }}>
                                                <input
                                                    type="checkbox"
                                                    checked={selectedSessions.size === searchHistory.length && searchHistory.length > 0}
                                                    onChange={toggleSelectAll}
                                                    style={{ width: "16px", height: "16px", cursor: "pointer" }}
                                                />
                                                Select All
                                            </label>
                                            <div style={{ display: "flex", gap: "8px" }}>
                                                {selectedSessions.size > 0 && (
                                                    <button
                                                        onClick={handleDeleteSelected}
                                                        style={{
                                                            padding: "8px 16px",
                                                            backgroundColor: "#fee2e2",
                                                            color: "#dc2626",
                                                            border: "none",
                                                            borderRadius: "8px",
                                                            fontSize: "13px",
                                                            fontWeight: "500",
                                                            cursor: "pointer"
                                                        }}
                                                    >
                                                        🗑️ Delete Selected ({selectedSessions.size})
                                                    </button>
                                                )}
                                                <button
                                                    onClick={handleDeleteAll}
                                                    style={{
                                                        padding: "8px 16px",
                                                        backgroundColor: "#f1f5f9",
                                                        color: "#64748b",
                                                        border: "1px solid #e2e8f0",
                                                        borderRadius: "8px",
                                                        fontSize: "13px",
                                                        fontWeight: "500",
                                                        cursor: "pointer"
                                                    }}
                                                >
                                                    Clear All History
                                                </button>
                                            </div>
                                        </div>

                                        {/* History Items */}
                                        <div style={{ display: "grid", gap: "12px" }}>
                                            {searchHistory.map(session => (
                                                <div key={session.id} style={{
                                                    backgroundColor: "white",
                                                    borderRadius: "12px",
                                                    border: selectedSessions.has(session.id) ? "2px solid #3b82f6" : "1px solid #e2e8f0",
                                                    padding: "16px 20px",
                                                }}>
                                                    <div style={{ display: "flex", gap: "12px" }}>
                                                        {/* Checkbox */}
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedSessions.has(session.id)}
                                                            onChange={() => toggleSelectSession(session.id)}
                                                            style={{ width: "18px", height: "18px", cursor: "pointer", marginTop: "2px" }}
                                                        />

                                                        {/* Content */}
                                                        <div style={{ flex: 1 }}>
                                                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" }}>
                                                                <div>
                                                                    <p style={{ margin: "0 0 6px", fontSize: "13px", color: "#64748b" }}>
                                                                        {formatDate(session.createdAt)}
                                                                    </p>
                                                                    <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                                                                        {session.category && (
                                                                            <span style={{
                                                                                padding: "3px 8px",
                                                                                backgroundColor: "#dcfce7",
                                                                                color: "#15803d",
                                                                                borderRadius: "6px",
                                                                                fontSize: "11px"
                                                                            }}>📦 {session.category}</span>
                                                                        )}
                                                                        {session.location && (
                                                                            <span style={{
                                                                                padding: "3px 8px",
                                                                                backgroundColor: "#dbeafe",
                                                                                color: "#1d4ed8",
                                                                                borderRadius: "6px",
                                                                                fontSize: "11px"
                                                                            }}>📍 {session.location}</span>
                                                                        )}
                                                                        {session.budget && (
                                                                            <span style={{
                                                                                padding: "3px 8px",
                                                                                backgroundColor: "#fef3c7",
                                                                                color: "#b45309",
                                                                                borderRadius: "6px",
                                                                                fontSize: "11px"
                                                                            }}>💰 {session.budget}</span>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                                <div style={{ display: "flex", gap: "8px" }}>
                                                                    <Link
                                                                        href={`/account/chat?session=${session.id}`}
                                                                        style={{
                                                                            padding: "6px 12px",
                                                                            backgroundColor: "#0f172a",
                                                                            color: "white",
                                                                            borderRadius: "6px",
                                                                            fontSize: "12px",
                                                                            fontWeight: "500",
                                                                            textDecoration: "none"
                                                                        }}
                                                                    >
                                                                        Continue
                                                                    </Link>
                                                                    <button
                                                                        onClick={() => handleDeleteSingle(session.id)}
                                                                        style={{
                                                                            padding: "6px 10px",
                                                                            backgroundColor: "#fee2e2",
                                                                            color: "#dc2626",
                                                                            border: "none",
                                                                            borderRadius: "6px",
                                                                            fontSize: "12px",
                                                                            cursor: "pointer"
                                                                        }}
                                                                    >
                                                                        🗑️
                                                                    </button>
                                                                </div>
                                                            </div>

                                                            {/* Searches in this session */}
                                                            {session.searches && session.searches.length > 0 && (
                                                                <div style={{
                                                                    marginTop: "10px",
                                                                    paddingTop: "10px",
                                                                    borderTop: "1px dashed #e2e8f0"
                                                                }}>
                                                                    <p style={{ margin: "0 0 6px", fontSize: "11px", color: "#94a3b8", textTransform: "uppercase", fontWeight: "600" }}>
                                                                        Searches in this session:
                                                                    </p>
                                                                    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                                                                        {session.searches.map((search, idx) => (
                                                                            <p key={idx} style={{
                                                                                margin: 0,
                                                                                fontSize: "13px",
                                                                                color: "#475569",
                                                                                paddingLeft: "12px",
                                                                                borderLeft: "2px solid #e2e8f0"
                                                                            }}>
                                                                                • {search.query}
                                                                            </p>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>
                        )}

                        {/* Saved Suppliers Tab */}
                        {activeTab === "saved" && (
                            <div>
                                {savedSuppliers.length === 0 ? (
                                    <div style={{
                                        backgroundColor: "white",
                                        borderRadius: "16px",
                                        border: "1px solid #e2e8f0",
                                        padding: "48px",
                                        textAlign: "center"
                                    }}>
                                        <div style={{ fontSize: "48px", marginBottom: "16px", opacity: 0.5 }}>⭐</div>
                                        <p style={{ fontSize: "15px", color: "#64748b", margin: "0 0 16px" }}>
                                            No saved suppliers yet
                                        </p>
                                        <Link href="/account/chat" style={{
                                            display: "inline-block",
                                            padding: "12px 24px",
                                            backgroundColor: "#0f172a",
                                            color: "white",
                                            borderRadius: "10px",
                                            textDecoration: "none",
                                            fontSize: "14px",
                                            fontWeight: "500"
                                        }}>
                                            Find Suppliers
                                        </Link>
                                    </div>
                                ) : (
                                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "16px" }}>
                                        {savedSuppliers.map(supplier => (
                                            <div key={supplier.id} style={{
                                                backgroundColor: "white",
                                                borderRadius: "12px",
                                                border: "1px solid #e2e8f0",
                                                padding: "20px"
                                            }}>
                                                <h3 style={{ margin: "0 0 8px", fontSize: "16px", fontWeight: "600", color: "#0f172a" }}>
                                                    📦 {supplier.companyName}
                                                </h3>
                                                <p style={{ margin: "0 0 12px", fontSize: "13px", color: "#64748b" }}>
                                                    📍 {supplier.city || "India"}
                                                </p>
                                                {supplier.badges && supplier.badges.length > 0 && (
                                                    <div style={{ display: "flex", gap: "6px", marginBottom: "12px" }}>
                                                        {supplier.badges.includes("verified") && (
                                                            <span style={{ padding: "3px 8px", backgroundColor: "#dcfce7", color: "#15803d", borderRadius: "6px", fontSize: "11px" }}>
                                                                ✓ Verified
                                                            </span>
                                                        )}
                                                        {supplier.badges.includes("gst") && (
                                                            <span style={{ padding: "3px 8px", backgroundColor: "#dbeafe", color: "#1d4ed8", borderRadius: "6px", fontSize: "11px" }}>
                                                                GST
                                                            </span>
                                                        )}
                                                    </div>
                                                )}
                                                {supplier.phone && (
                                                    <p style={{ margin: 0, fontSize: "14px", fontWeight: "500", color: "#15803d" }}>
                                                        📞 {supplier.phone}
                                                    </p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Recent Activity Tab */}
                        {activeTab === "activity" && (
                            <div>
                                {recentActivity.length === 0 ? (
                                    <div style={{
                                        backgroundColor: "white",
                                        borderRadius: "16px",
                                        border: "1px solid #e2e8f0",
                                        padding: "48px",
                                        textAlign: "center"
                                    }}>
                                        <div style={{ fontSize: "48px", marginBottom: "16px", opacity: 0.5 }}>📞</div>
                                        <p style={{ fontSize: "15px", color: "#64748b", margin: 0 }}>
                                            No recent activity yet
                                        </p>
                                    </div>
                                ) : (
                                    <div style={{
                                        backgroundColor: "white",
                                        borderRadius: "12px",
                                        border: "1px solid #e2e8f0"
                                    }}>
                                        {recentActivity.map((activity, i) => (
                                            <div key={i} style={{
                                                padding: "16px 20px",
                                                borderBottom: i < recentActivity.length - 1 ? "1px solid #e2e8f0" : "none",
                                                display: "flex",
                                                alignItems: "center",
                                                gap: "12px"
                                            }}>
                                                <span style={{ fontSize: "20px" }}>📞</span>
                                                <div>
                                                    <p style={{ margin: 0, fontSize: "14px", color: "#0f172a" }}>
                                                        Viewed contact for <strong>{activity.supplierName}</strong>
                                                    </p>
                                                    <p style={{ margin: "4px 0 0", fontSize: "12px", color: "#64748b" }}>
                                                        {formatDate(activity.timestamp)}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </>
                )}
            </main>

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div style={{
                    position: "fixed",
                    inset: 0,
                    backgroundColor: "rgba(0, 0, 0, 0.5)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    zIndex: 1000
                }}>
                    <div style={{
                        backgroundColor: "white",
                        borderRadius: "16px",
                        padding: "24px",
                        maxWidth: "400px",
                        width: "90%",
                        boxShadow: "0 20px 50px rgba(0, 0, 0, 0.2)"
                    }}>
                        <h3 style={{ margin: "0 0 12px", fontSize: "18px", fontWeight: "600", color: "#0f172a" }}>
                            Confirm Delete
                        </h3>
                        <p style={{ margin: "0 0 24px", fontSize: "14px", color: "#64748b" }}>
                            {getDeleteMessage()}
                        </p>
                        <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                disabled={isDeleting}
                                style={{
                                    padding: "10px 20px",
                                    backgroundColor: "#f1f5f9",
                                    color: "#64748b",
                                    border: "none",
                                    borderRadius: "8px",
                                    fontSize: "14px",
                                    fontWeight: "500",
                                    cursor: isDeleting ? "not-allowed" : "pointer"
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDelete}
                                disabled={isDeleting}
                                style={{
                                    padding: "10px 20px",
                                    backgroundColor: "#dc2626",
                                    color: "white",
                                    border: "none",
                                    borderRadius: "8px",
                                    fontSize: "14px",
                                    fontWeight: "500",
                                    cursor: isDeleting ? "not-allowed" : "pointer",
                                    opacity: isDeleting ? 0.7 : 1
                                }}
                            >
                                {isDeleting ? "Deleting..." : "Delete"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

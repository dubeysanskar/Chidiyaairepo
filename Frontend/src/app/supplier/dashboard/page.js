"use client";

import { useState } from "react";
import Link from "next/link";

// Mock data - will be replaced with API calls
const mockInquiries = [
    {
        id: 1,
        product: "Cotton Fabric - Premium Quality",
        quantity: "5000 meters",
        budget: "₹2,50,000",
        timeline: "30 days",
        status: "new",
        receivedAt: "2 hours ago"
    },
    {
        id: 2,
        product: "Polyester Blend Fabric",
        quantity: "2000 meters",
        budget: "₹80,000",
        timeline: "15 days",
        status: "quoted",
        receivedAt: "1 day ago"
    },
    {
        id: 3,
        product: "Linen Fabric for Apparel",
        quantity: "1000 meters",
        budget: "₹1,50,000",
        timeline: "45 days",
        status: "accepted",
        receivedAt: "3 days ago"
    }
];

const mockStats = {
    totalInquiries: 45,
    quotesSubmitted: 32,
    acceptedDeals: 12,
    conversionRate: 37.5,
    profileViews: 156,
    leadAcceptRate: 71
};

export default function SupplierDashboard() {
    const [activeTab, setActiveTab] = useState("inquiries");
    const [selectedInquiry, setSelectedInquiry] = useState(null);
    const [quoteForm, setQuoteForm] = useState({ price: "", moq: "", timeline: "", notes: "" });

    const handleQuoteSubmit = (e) => {
        e.preventDefault();
        alert("Quote submitted successfully!");
        setSelectedInquiry(null);
        setQuoteForm({ price: "", moq: "", timeline: "", notes: "" });
    };

    return (
        <div style={{
            minHeight: "100vh",
            display: "flex",
            fontFamily: "'Inter', system-ui, sans-serif",
            backgroundColor: "#f8fafc"
        }}>
            {/* Sidebar */}
            <aside style={{
                width: "260px",
                backgroundColor: "#0f172a",
                padding: "24px 16px",
                position: "fixed",
                top: 0,
                left: 0,
                bottom: 0
            }}>
                <Link href="/supplier" style={{ textDecoration: "none", display: "block", marginBottom: "40px" }}>
                    <span style={{ fontSize: "20px", fontWeight: "bold", color: "white" }}>
                        Chidiya<span style={{ color: "#3b82f6" }}>AI</span>
                    </span>
                    <span style={{ display: "block", fontSize: "12px", color: "#64748b", marginTop: "2px" }}>Supplier Portal</span>
                </Link>

                <nav style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    {[
                        { id: "inquiries", label: "Inquiries", icon: "📥" },
                        { id: "quotes", label: "My Quotes", icon: "📝" },
                        { id: "analytics", label: "Analytics", icon: "📊" },
                        { id: "profile", label: "Company Profile", icon: "🏢" },
                        { id: "products", label: "Products", icon: "📦" },
                    ].map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "12px",
                                padding: "12px 16px",
                                backgroundColor: activeTab === item.id ? "#1e293b" : "transparent",
                                border: "none",
                                borderRadius: "8px",
                                color: activeTab === item.id ? "white" : "#94a3b8",
                                fontSize: "14px",
                                cursor: "pointer",
                                textAlign: "left"
                            }}
                        >
                            <span>{item.icon}</span>
                            {item.label}
                        </button>
                    ))}
                </nav>

                {/* Badges */}
                <div style={{ marginTop: "40px", padding: "16px", backgroundColor: "#1e293b", borderRadius: "12px" }}>
                    <div style={{ fontSize: "12px", color: "#64748b", marginBottom: "12px" }}>YOUR BADGES</div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                        <span style={{ padding: "4px 10px", backgroundColor: "#22c55e", color: "white", borderRadius: "12px", fontSize: "11px" }}>
                            ✓ GST Verified
                        </span>
                        <span style={{ padding: "4px 10px", backgroundColor: "#3b82f6", color: "white", borderRadius: "12px", fontSize: "11px" }}>
                            Premium
                        </span>
                    </div>
                    <p style={{ fontSize: "11px", color: "#64748b", marginTop: "12px" }}>
                        Badges are set by admin and cannot be modified.
                    </p>
                </div>

                <div style={{ position: "absolute", bottom: "24px", left: "16px", right: "16px" }}>
                    <Link href="/" style={{
                        display: "block",
                        padding: "12px",
                        backgroundColor: "#1e293b",
                        borderRadius: "8px",
                        color: "#94a3b8",
                        textDecoration: "none",
                        fontSize: "14px",
                        textAlign: "center"
                    }}>
                        ← Back to Main Site
                    </Link>
                </div>
            </aside>

            {/* Main Content */}
            <main style={{ marginLeft: "260px", flex: 1, padding: "24px" }}>
                {/* Header */}
                <header style={{ marginBottom: "32px" }}>
                    <h1 style={{ fontSize: "24px", fontWeight: "bold", color: "#0f172a", marginBottom: "8px" }}>
                        Welcome, Premium Textile Corp
                    </h1>
                    <p style={{ color: "#64748b" }}>Manage your inquiries, quotes, and business profile</p>
                </header>

                {/* Stats Cards */}
                {activeTab === "inquiries" && (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "32px" }}>
                        {[
                            { label: "Total Inquiries", value: mockStats.totalInquiries, color: "#3b82f6" },
                            { label: "Quotes Submitted", value: mockStats.quotesSubmitted, color: "#8b5cf6" },
                            { label: "Deals Won", value: mockStats.acceptedDeals, color: "#22c55e" },
                            { label: "Conversion Rate", value: `${mockStats.conversionRate}%`, color: "#f59e0b" }
                        ].map((stat, i) => (
                            <div key={i} style={{ backgroundColor: "white", padding: "20px", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
                                <div style={{ fontSize: "28px", fontWeight: "bold", color: stat.color, marginBottom: "4px" }}>{stat.value}</div>
                                <div style={{ fontSize: "13px", color: "#64748b" }}>{stat.label}</div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Inquiries Tab */}
                {activeTab === "inquiries" && (
                    <div style={{ backgroundColor: "white", borderRadius: "16px", border: "1px solid #e2e8f0" }}>
                        <div style={{ padding: "20px", borderBottom: "1px solid #e2e8f0" }}>
                            <h2 style={{ fontSize: "18px", fontWeight: "600", color: "#0f172a" }}>Active Inquiries</h2>
                            <p style={{ fontSize: "13px", color: "#64748b" }}>AI-validated buyer inquiries matching your products</p>
                        </div>

                        <div>
                            {mockInquiries.map((inquiry) => (
                                <div
                                    key={inquiry.id}
                                    style={{
                                        padding: "20px",
                                        borderBottom: "1px solid #f1f5f9",
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center"
                                    }}
                                >
                                    <div>
                                        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
                                            <h3 style={{ fontSize: "16px", fontWeight: "600", color: "#0f172a" }}>{inquiry.product}</h3>
                                            <span style={{
                                                padding: "2px 8px",
                                                borderRadius: "10px",
                                                fontSize: "11px",
                                                backgroundColor: inquiry.status === "new" ? "#dcfce7" : inquiry.status === "quoted" ? "#fef3c7" : "#dbeafe",
                                                color: inquiry.status === "new" ? "#15803d" : inquiry.status === "quoted" ? "#b45309" : "#1d4ed8"
                                            }}>
                                                {inquiry.status.toUpperCase()}
                                            </span>
                                        </div>
                                        <div style={{ display: "flex", gap: "24px", fontSize: "13px", color: "#64748b" }}>
                                            <span>Qty: {inquiry.quantity}</span>
                                            <span>Budget: {inquiry.budget}</span>
                                            <span>Timeline: {inquiry.timeline}</span>
                                            <span>Received: {inquiry.receivedAt}</span>
                                        </div>
                                    </div>
                                    <div style={{ display: "flex", gap: "8px" }}>
                                        {inquiry.status === "new" && (
                                            <>
                                                <button
                                                    onClick={() => setSelectedInquiry(inquiry)}
                                                    style={{
                                                        padding: "8px 16px",
                                                        backgroundColor: "#0f172a",
                                                        color: "white",
                                                        border: "none",
                                                        borderRadius: "6px",
                                                        fontSize: "13px",
                                                        cursor: "pointer"
                                                    }}
                                                >
                                                    Submit Quote
                                                </button>
                                                <button
                                                    style={{
                                                        padding: "8px 16px",
                                                        backgroundColor: "white",
                                                        color: "#64748b",
                                                        border: "1px solid #e2e8f0",
                                                        borderRadius: "6px",
                                                        fontSize: "13px",
                                                        cursor: "pointer"
                                                    }}
                                                >
                                                    Decline
                                                </button>
                                            </>
                                        )}
                                        {inquiry.status !== "new" && (
                                            <button
                                                style={{
                                                    padding: "8px 16px",
                                                    backgroundColor: "white",
                                                    color: "#64748b",
                                                    border: "1px solid #e2e8f0",
                                                    borderRadius: "6px",
                                                    fontSize: "13px",
                                                    cursor: "pointer"
                                                }}
                                            >
                                                View Details
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div style={{ padding: "16px", textAlign: "center", color: "#64748b", fontSize: "13px" }}>
                            📫 You cannot contact buyers directly. All communication happens through quotes.
                        </div>
                    </div>
                )}

                {/* Analytics Tab */}
                {activeTab === "analytics" && (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "24px" }}>
                        <div style={{ backgroundColor: "white", padding: "24px", borderRadius: "16px", border: "1px solid #e2e8f0" }}>
                            <h3 style={{ fontSize: "16px", fontWeight: "600", color: "#0f172a", marginBottom: "20px" }}>Performance Overview</h3>
                            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                                <div style={{ display: "flex", justifyContent: "space-between" }}>
                                    <span style={{ color: "#64748b" }}>Profile Views</span>
                                    <span style={{ fontWeight: "600" }}>{mockStats.profileViews}</span>
                                </div>
                                <div style={{ display: "flex", justifyContent: "space-between" }}>
                                    <span style={{ color: "#64748b" }}>Lead Acceptance Rate</span>
                                    <span style={{ fontWeight: "600" }}>{mockStats.leadAcceptRate}%</span>
                                </div>
                                <div style={{ display: "flex", justifyContent: "space-between" }}>
                                    <span style={{ color: "#64748b" }}>Buyer Selection Rate</span>
                                    <span style={{ fontWeight: "600" }}>{mockStats.conversionRate}%</span>
                                </div>
                            </div>
                        </div>
                        <div style={{ backgroundColor: "white", padding: "24px", borderRadius: "16px", border: "1px solid #e2e8f0" }}>
                            <h3 style={{ fontSize: "16px", fontWeight: "600", color: "#0f172a", marginBottom: "20px" }}>Monthly Trend</h3>
                            <div style={{ height: "150px", display: "flex", alignItems: "center", justifyContent: "center", color: "#94a3b8" }}>
                                [Chart Placeholder]
                            </div>
                        </div>
                    </div>
                )}

                {/* Profile Tab */}
                {activeTab === "profile" && (
                    <div style={{ backgroundColor: "white", padding: "32px", borderRadius: "16px", border: "1px solid #e2e8f0" }}>
                        <h2 style={{ fontSize: "20px", fontWeight: "600", color: "#0f172a", marginBottom: "24px" }}>Company Profile</h2>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
                            <div>
                                <label style={{ display: "block", fontSize: "14px", color: "#64748b", marginBottom: "4px" }}>Company Name</label>
                                <p style={{ fontSize: "16px", fontWeight: "500", color: "#0f172a" }}>Premium Textile Corp</p>
                            </div>
                            <div>
                                <label style={{ display: "block", fontSize: "14px", color: "#64748b", marginBottom: "4px" }}>GST Number</label>
                                <p style={{ fontSize: "16px", fontWeight: "500", color: "#0f172a" }}>27AAACP1234A1ZE</p>
                            </div>
                            <div>
                                <label style={{ display: "block", fontSize: "14px", color: "#64748b", marginBottom: "4px" }}>Categories</label>
                                <p style={{ fontSize: "16px", fontWeight: "500", color: "#0f172a" }}>Textiles & Fabrics</p>
                            </div>
                            <div>
                                <label style={{ display: "block", fontSize: "14px", color: "#64748b", marginBottom: "4px" }}>Service Locations</label>
                                <p style={{ fontSize: "16px", fontWeight: "500", color: "#0f172a" }}>Delhi NCR, Pan India</p>
                            </div>
                        </div>
                    </div>
                )}
            </main>

            {/* Quote Modal */}
            {selectedInquiry && (
                <div style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: "rgba(0,0,0,0.5)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    zIndex: 100
                }}>
                    <div style={{
                        backgroundColor: "white",
                        borderRadius: "16px",
                        padding: "32px",
                        width: "100%",
                        maxWidth: "500px"
                    }}>
                        <h2 style={{ fontSize: "20px", fontWeight: "bold", color: "#0f172a", marginBottom: "8px" }}>
                            Submit Quote
                        </h2>
                        <p style={{ color: "#64748b", marginBottom: "24px", fontSize: "14px" }}>
                            For: {selectedInquiry.product}
                        </p>

                        <form onSubmit={handleQuoteSubmit}>
                            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                                <div>
                                    <label style={{ display: "block", fontSize: "14px", fontWeight: "500", marginBottom: "6px" }}>Price (₹)</label>
                                    <input
                                        type="text"
                                        value={quoteForm.price}
                                        onChange={(e) => setQuoteForm({ ...quoteForm, price: e.target.value })}
                                        placeholder="e.g., 2,25,000"
                                        required
                                        style={{ width: "100%", padding: "12px", border: "1px solid #e2e8f0", borderRadius: "8px", boxSizing: "border-box" }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: "block", fontSize: "14px", fontWeight: "500", marginBottom: "6px" }}>MOQ</label>
                                    <input
                                        type="text"
                                        value={quoteForm.moq}
                                        onChange={(e) => setQuoteForm({ ...quoteForm, moq: e.target.value })}
                                        placeholder="e.g., 500 meters"
                                        required
                                        style={{ width: "100%", padding: "12px", border: "1px solid #e2e8f0", borderRadius: "8px", boxSizing: "border-box" }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: "block", fontSize: "14px", fontWeight: "500", marginBottom: "6px" }}>Delivery Timeline</label>
                                    <input
                                        type="text"
                                        value={quoteForm.timeline}
                                        onChange={(e) => setQuoteForm({ ...quoteForm, timeline: e.target.value })}
                                        placeholder="e.g., 20 days"
                                        required
                                        style={{ width: "100%", padding: "12px", border: "1px solid #e2e8f0", borderRadius: "8px", boxSizing: "border-box" }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: "block", fontSize: "14px", fontWeight: "500", marginBottom: "6px" }}>Notes (Optional)</label>
                                    <textarea
                                        value={quoteForm.notes}
                                        onChange={(e) => setQuoteForm({ ...quoteForm, notes: e.target.value })}
                                        placeholder="Any additional details..."
                                        rows={3}
                                        style={{ width: "100%", padding: "12px", border: "1px solid #e2e8f0", borderRadius: "8px", boxSizing: "border-box", resize: "vertical" }}
                                    />
                                </div>
                            </div>

                            <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
                                <button
                                    type="button"
                                    onClick={() => setSelectedInquiry(null)}
                                    style={{ flex: 1, padding: "12px", backgroundColor: "white", border: "1px solid #e2e8f0", borderRadius: "8px", cursor: "pointer" }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    style={{ flex: 1, padding: "12px", backgroundColor: "#0f172a", color: "white", border: "none", borderRadius: "8px", cursor: "pointer" }}
                                >
                                    Submit Quote
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

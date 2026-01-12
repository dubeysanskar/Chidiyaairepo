"use client";

import { useState } from "react";
import Link from "next/link";

// Mock data
const mockInquiries = [
    {
        id: 1,
        product: "Cotton Fabric - Premium Quality",
        quantity: "5000 meters",
        budget: "₹2,50,000",
        status: "pending",
        sentAt: "2 hours ago",
        responses: 3
    },
    {
        id: 2,
        product: "Electronic Components",
        quantity: "10000 units",
        budget: "₹5,00,000",
        status: "quoted",
        sentAt: "1 day ago",
        responses: 5
    },
    {
        id: 3,
        product: "Packaging Materials",
        quantity: "2000 boxes",
        budget: "₹80,000",
        status: "accepted",
        sentAt: "3 days ago",
        responses: 4
    }
];

const mockQuotes = [
    {
        id: 1,
        inquiryId: 2,
        product: "Electronic Components",
        supplierRating: 4.8,
        price: "₹4,75,000",
        moq: "5000 units",
        delivery: "15 days",
        verified: true
    },
    {
        id: 2,
        inquiryId: 2,
        product: "Electronic Components",
        supplierRating: 4.5,
        price: "₹4,90,000",
        moq: "3000 units",
        delivery: "12 days",
        verified: true
    },
    {
        id: 3,
        inquiryId: 2,
        product: "Electronic Components",
        supplierRating: 4.2,
        price: "₹4,50,000",
        moq: "10000 units",
        delivery: "20 days",
        verified: true
    }
];

const mockStats = {
    totalInquiries: 12,
    activeQuotes: 8,
    acceptedDeals: 5,
    avgSavings: "₹45,000"
};

export default function BuyerDashboard() {
    const [activeTab, setActiveTab] = useState("inquiries");
    const [selectedInquiry, setSelectedInquiry] = useState(null);
    const [showQuotes, setShowQuotes] = useState(false);

    const handleDownloadPDF = (quoteId) => {
        // In production, this would call the API
        alert(`Downloading PDF for quote ${quoteId}`);
    };

    const handleAcceptQuote = (quoteId) => {
        alert(`Quote ${quoteId} accepted!`);
    };

    const handleRejectQuote = (quoteId) => {
        alert(`Quote ${quoteId} rejected`);
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
                backgroundColor: "white",
                borderRight: "1px solid #e2e8f0",
                padding: "24px 16px",
                position: "fixed",
                top: 0,
                left: 0,
                bottom: 0
            }}>
                <Link href="/" style={{ textDecoration: "none", display: "block", marginBottom: "40px" }}>
                    <span style={{ fontSize: "20px", fontWeight: "bold", color: "#0f172a" }}>
                        Chidiya<span style={{ color: "#3b82f6" }}>AI</span>
                    </span>
                    <span style={{ display: "block", fontSize: "12px", color: "#64748b", marginTop: "2px" }}>Buyer Dashboard</span>
                </Link>

                <nav style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    {[
                        { id: "inquiries", label: "My Inquiries", icon: "📤" },
                        { id: "quotes", label: "Compare Quotes", icon: "📋" },
                        { id: "suppliers", label: "Top Suppliers", icon: "🏆" },
                        { id: "profile", label: "My Profile", icon: "👤" },
                    ].map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "12px",
                                padding: "12px 16px",
                                backgroundColor: activeTab === item.id ? "#f1f5f9" : "transparent",
                                border: "none",
                                borderRadius: "8px",
                                color: activeTab === item.id ? "#0f172a" : "#64748b",
                                fontSize: "14px",
                                cursor: "pointer",
                                textAlign: "left",
                                fontWeight: activeTab === item.id ? "500" : "normal"
                            }}
                        >
                            <span>{item.icon}</span>
                            {item.label}
                        </button>
                    ))}
                </nav>

                <div style={{ marginTop: "40px", padding: "16px", backgroundColor: "#f8fafc", borderRadius: "12px" }}>
                    <div style={{ fontSize: "12px", color: "#64748b", marginBottom: "8px" }}>QUICK ACTIONS</div>
                    <Link href="/chat" style={{
                        display: "block",
                        padding: "12px",
                        backgroundColor: "#0f172a",
                        color: "white",
                        borderRadius: "8px",
                        textDecoration: "none",
                        fontSize: "14px",
                        textAlign: "center",
                        fontWeight: "500"
                    }}>
                        New Sourcing Request
                    </Link>
                </div>

                <div style={{ position: "absolute", bottom: "24px", left: "16px", right: "16px" }}>
                    <Link href="/" style={{
                        display: "block",
                        padding: "12px",
                        backgroundColor: "#f1f5f9",
                        borderRadius: "8px",
                        color: "#64748b",
                        textDecoration: "none",
                        fontSize: "14px",
                        textAlign: "center"
                    }}>
                        ← Back to Home
                    </Link>
                </div>
            </aside>

            {/* Main Content */}
            <main style={{ marginLeft: "260px", flex: 1, padding: "24px" }}>
                {/* Header */}
                <header style={{ marginBottom: "32px" }}>
                    <h1 style={{ fontSize: "24px", fontWeight: "bold", color: "#0f172a", marginBottom: "8px" }}>
                        Welcome back!
                    </h1>
                    <p style={{ color: "#64748b" }}>Source suppliers in under 5 minutes</p>
                </header>

                {/* Stats Cards */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "32px" }}>
                    {[
                        { label: "Total Inquiries", value: mockStats.totalInquiries, color: "#3b82f6" },
                        { label: "Active Quotes", value: mockStats.activeQuotes, color: "#8b5cf6" },
                        { label: "Deals Closed", value: mockStats.acceptedDeals, color: "#22c55e" },
                        { label: "Avg. Savings", value: mockStats.avgSavings, color: "#f59e0b" }
                    ].map((stat, i) => (
                        <div key={i} style={{ backgroundColor: "white", padding: "20px", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
                            <div style={{ fontSize: "28px", fontWeight: "bold", color: stat.color, marginBottom: "4px" }}>{stat.value}</div>
                            <div style={{ fontSize: "13px", color: "#64748b" }}>{stat.label}</div>
                        </div>
                    ))}
                </div>

                {/* Inquiries Tab */}
                {activeTab === "inquiries" && (
                    <div style={{ backgroundColor: "white", borderRadius: "16px", border: "1px solid #e2e8f0" }}>
                        <div style={{ padding: "20px", borderBottom: "1px solid #e2e8f0" }}>
                            <h2 style={{ fontSize: "18px", fontWeight: "600", color: "#0f172a" }}>My Inquiries</h2>
                            <p style={{ fontSize: "13px", color: "#64748b" }}>Track your sourcing requests and responses</p>
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
                                                backgroundColor: inquiry.status === "pending" ? "#fef3c7" : inquiry.status === "quoted" ? "#dcfce7" : "#dbeafe",
                                                color: inquiry.status === "pending" ? "#b45309" : inquiry.status === "quoted" ? "#15803d" : "#1d4ed8"
                                            }}>
                                                {inquiry.status === "quoted" ? `${inquiry.responses} QUOTES` : inquiry.status.toUpperCase()}
                                            </span>
                                        </div>
                                        <div style={{ display: "flex", gap: "24px", fontSize: "13px", color: "#64748b" }}>
                                            <span>Qty: {inquiry.quantity}</span>
                                            <span>Budget: {inquiry.budget}</span>
                                            <span>Sent: {inquiry.sentAt}</span>
                                        </div>
                                    </div>
                                    <div style={{ display: "flex", gap: "8px" }}>
                                        {inquiry.status === "quoted" && (
                                            <button
                                                onClick={() => { setSelectedInquiry(inquiry); setShowQuotes(true); }}
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
                                                Compare Quotes
                                            </button>
                                        )}
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
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Quotes Comparison Tab */}
                {activeTab === "quotes" && (
                    <div style={{ backgroundColor: "white", borderRadius: "16px", border: "1px solid #e2e8f0", padding: "24px" }}>
                        <h2 style={{ fontSize: "18px", fontWeight: "600", color: "#0f172a", marginBottom: "24px" }}>Compare Quotes</h2>

                        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
                            {mockQuotes.map((quote, i) => (
                                <div key={quote.id} style={{
                                    border: i === 0 ? "2px solid #3b82f6" : "1px solid #e2e8f0",
                                    borderRadius: "12px",
                                    padding: "20px",
                                    position: "relative"
                                }}>
                                    {i === 0 && (
                                        <div style={{
                                            position: "absolute",
                                            top: "-10px",
                                            left: "50%",
                                            transform: "translateX(-50%)",
                                            padding: "4px 12px",
                                            backgroundColor: "#3b82f6",
                                            color: "white",
                                            borderRadius: "10px",
                                            fontSize: "11px"
                                        }}>Best Match</div>
                                    )}

                                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
                                        <span style={{ fontSize: "14px", color: "#f59e0b" }}>★ {quote.supplierRating}</span>
                                        {quote.verified && (
                                            <span style={{ padding: "2px 6px", backgroundColor: "#dcfce7", color: "#15803d", borderRadius: "8px", fontSize: "10px" }}>Verified</span>
                                        )}
                                    </div>

                                    <div style={{ marginBottom: "16px" }}>
                                        <div style={{ fontSize: "24px", fontWeight: "bold", color: "#0f172a", marginBottom: "4px" }}>{quote.price}</div>
                                        <div style={{ fontSize: "13px", color: "#64748b" }}>for {quote.product}</div>
                                    </div>

                                    <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "20px" }}>
                                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
                                            <span style={{ color: "#64748b" }}>MOQ</span>
                                            <span style={{ color: "#0f172a" }}>{quote.moq}</span>
                                        </div>
                                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
                                            <span style={{ color: "#64748b" }}>Delivery</span>
                                            <span style={{ color: "#0f172a" }}>{quote.delivery}</span>
                                        </div>
                                    </div>

                                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                                        <button
                                            onClick={() => handleAcceptQuote(quote.id)}
                                            style={{
                                                padding: "10px",
                                                backgroundColor: "#0f172a",
                                                color: "white",
                                                border: "none",
                                                borderRadius: "6px",
                                                fontSize: "13px",
                                                cursor: "pointer"
                                            }}
                                        >
                                            Accept Quote
                                        </button>
                                        <div style={{ display: "flex", gap: "8px" }}>
                                            <button
                                                onClick={() => handleDownloadPDF(quote.id)}
                                                style={{
                                                    flex: 1,
                                                    padding: "8px",
                                                    backgroundColor: "white",
                                                    color: "#64748b",
                                                    border: "1px solid #e2e8f0",
                                                    borderRadius: "6px",
                                                    fontSize: "12px",
                                                    cursor: "pointer"
                                                }}
                                            >
                                                📄 PDF
                                            </button>
                                            <button
                                                onClick={() => handleRejectQuote(quote.id)}
                                                style={{
                                                    flex: 1,
                                                    padding: "8px",
                                                    backgroundColor: "white",
                                                    color: "#ef4444",
                                                    border: "1px solid #fecaca",
                                                    borderRadius: "6px",
                                                    fontSize: "12px",
                                                    cursor: "pointer"
                                                }}
                                            >
                                                Reject
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <p style={{ textAlign: "center", marginTop: "24px", color: "#64748b", fontSize: "13px" }}>
                            🔒 Supplier contact details are hidden for your privacy. Accept a quote to proceed.
                        </p>
                    </div>
                )}

                {/* Suppliers Tab */}
                {activeTab === "suppliers" && (
                    <div style={{ backgroundColor: "white", borderRadius: "16px", border: "1px solid #e2e8f0", padding: "24px" }}>
                        <h2 style={{ fontSize: "18px", fontWeight: "600", color: "#0f172a", marginBottom: "8px" }}>Top 5 Suppliers</h2>
                        <p style={{ fontSize: "13px", color: "#64748b", marginBottom: "24px" }}>
                            Ranked by verification, pricing, reliability, and ratings. No ads, no sponsored content.
                        </p>

                        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                            {[1, 2, 3, 4, 5].map((rank) => (
                                <div key={rank} style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "16px",
                                    padding: "16px",
                                    backgroundColor: rank === 1 ? "#f0f9ff" : "#f8fafc",
                                    borderRadius: "12px",
                                    border: rank === 1 ? "1px solid #bae6fd" : "none"
                                }}>
                                    <div style={{
                                        width: "32px",
                                        height: "32px",
                                        borderRadius: "50%",
                                        backgroundColor: rank === 1 ? "#3b82f6" : "#e2e8f0",
                                        color: rank === 1 ? "white" : "#64748b",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        fontWeight: "bold"
                                    }}>{rank}</div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: "600", color: "#0f172a" }}>Supplier {rank}</div>
                                        <div style={{ fontSize: "13px", color: "#64748b" }}>Textiles • Delhi NCR</div>
                                    </div>
                                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                        <span style={{ padding: "4px 8px", backgroundColor: "#dcfce7", color: "#15803d", borderRadius: "8px", fontSize: "11px" }}>Verified</span>
                                        <span style={{ color: "#f59e0b" }}>★ {(4.9 - rank * 0.1).toFixed(1)}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Profile Tab */}
                {activeTab === "profile" && (
                    <div style={{ backgroundColor: "white", padding: "32px", borderRadius: "16px", border: "1px solid #e2e8f0" }}>
                        <h2 style={{ fontSize: "20px", fontWeight: "600", color: "#0f172a", marginBottom: "24px" }}>My Profile</h2>
                        <p style={{ color: "#64748b", marginBottom: "24px" }}>
                            Your identity remains anonymous to suppliers until you choose to reveal it.
                        </p>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
                            <div>
                                <label style={{ display: "block", fontSize: "14px", color: "#64748b", marginBottom: "4px" }}>Display Name</label>
                                <p style={{ fontSize: "16px", fontWeight: "500", color: "#0f172a" }}>Anonymous Buyer</p>
                            </div>
                            <div>
                                <label style={{ display: "block", fontSize: "14px", color: "#64748b", marginBottom: "4px" }}>Account Type</label>
                                <p style={{ fontSize: "16px", fontWeight: "500", color: "#0f172a" }}>Free Plan</p>
                            </div>
                            <div>
                                <label style={{ display: "block", fontSize: "14px", color: "#64748b", marginBottom: "4px" }}>Member Since</label>
                                <p style={{ fontSize: "16px", fontWeight: "500", color: "#0f172a" }}>January 2025</p>
                            </div>
                            <div>
                                <label style={{ display: "block", fontSize: "14px", color: "#64748b", marginBottom: "4px" }}>Communication</label>
                                <p style={{ fontSize: "16px", fontWeight: "500", color: "#0f172a" }}>Platform Only (No Calls)</p>
                            </div>
                        </div>
                    </div>
                )}
            </main>

            {/* Quotes Modal */}
            {showQuotes && selectedInquiry && (
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
                        maxWidth: "800px",
                        maxHeight: "80vh",
                        overflowY: "auto"
                    }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
                            <div>
                                <h2 style={{ fontSize: "20px", fontWeight: "bold", color: "#0f172a" }}>
                                    Compare Quotes
                                </h2>
                                <p style={{ color: "#64748b", fontSize: "14px" }}>
                                    For: {selectedInquiry.product}
                                </p>
                            </div>
                            <button
                                onClick={() => setShowQuotes(false)}
                                style={{ background: "none", border: "none", fontSize: "24px", cursor: "pointer", color: "#64748b" }}
                            >
                                ×
                            </button>
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
                            {mockQuotes.map((quote) => (
                                <div key={quote.id} style={{ border: "1px solid #e2e8f0", borderRadius: "12px", padding: "16px" }}>
                                    <div style={{ fontSize: "24px", fontWeight: "bold", color: "#0f172a", marginBottom: "12px" }}>{quote.price}</div>
                                    <div style={{ fontSize: "13px", color: "#64748b", marginBottom: "8px" }}>MOQ: {quote.moq}</div>
                                    <div style={{ fontSize: "13px", color: "#64748b", marginBottom: "16px" }}>Delivery: {quote.delivery}</div>
                                    <button
                                        onClick={() => handleAcceptQuote(quote.id)}
                                        style={{
                                            width: "100%",
                                            padding: "10px",
                                            backgroundColor: "#0f172a",
                                            color: "white",
                                            border: "none",
                                            borderRadius: "6px",
                                            cursor: "pointer"
                                        }}
                                    >
                                        Accept
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

export default function SupplierLanding() {
    const [isMobile, setIsMobile] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    return (
        <div style={{
            minHeight: "100vh",
            fontFamily: "'Inter', system-ui, sans-serif",
            backgroundColor: "#f8fafc"
        }}>
            {/* Header */}
            <nav style={{
                backgroundColor: "white",
                borderBottom: "1px solid #e2e8f0",
                padding: isMobile ? "12px 16px" : "16px 24px",
                position: "sticky",
                top: 0,
                zIndex: 50
            }}>
                <div style={{ maxWidth: "1100px", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <Link href="/" style={{ fontWeight: "bold", fontSize: "20px", color: "#0f172a", textDecoration: "none" }}>
                        Chidiya<span style={{ color: "#3b82f6" }}>AI</span>
                    </Link>

                    {/* Desktop Nav */}
                    {!isMobile && (
                        <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
                            <Link href="/supplier/login" style={{ color: "#64748b", textDecoration: "none", fontSize: "14px" }}>
                                Supplier Login
                            </Link>
                            <Link href="/supplier/register" style={{
                                backgroundColor: "#0f172a",
                                color: "white",
                                padding: "10px 20px",
                                borderRadius: "8px",
                                textDecoration: "none",
                                fontSize: "14px",
                                fontWeight: "500"
                            }}>
                                Become a Supplier
                            </Link>
                        </div>
                    )}

                    {/* Mobile Menu Button */}
                    {isMobile && (
                        <button onClick={() => setMenuOpen(!menuOpen)} style={{ background: "none", border: "none", padding: "8px", cursor: "pointer" }}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0f172a" strokeWidth="2">
                                {menuOpen ? <path d="M6 18L18 6M6 6l12 12" /> : <path d="M4 6h16M4 12h16M4 18h16" />}
                            </svg>
                        </button>
                    )}
                </div>

                {/* Mobile Menu */}
                {isMobile && menuOpen && (
                    <div style={{ paddingTop: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
                        <Link href="/supplier/login" onClick={() => setMenuOpen(false)} style={{ display: "block", padding: "12px", color: "#64748b", textDecoration: "none", textAlign: "center" }}>
                            Supplier Login
                        </Link>
                        <Link href="/supplier/register" onClick={() => setMenuOpen(false)} style={{
                            display: "block",
                            backgroundColor: "#0f172a",
                            color: "white",
                            padding: "12px",
                            borderRadius: "8px",
                            textDecoration: "none",
                            textAlign: "center",
                            fontWeight: "500"
                        }}>
                            Become a Supplier
                        </Link>
                    </div>
                )}
            </nav>

            {/* Hero */}
            <section style={{
                padding: isMobile ? "60px 16px" : "100px 24px",
                background: "linear-gradient(180deg, #0f172a 0%, #1e293b 100%)",
                textAlign: "center"
            }}>
                <div style={{ maxWidth: "800px", margin: "0 auto" }}>
                    <span style={{
                        display: "inline-block",
                        padding: "6px 16px",
                        backgroundColor: "rgba(59,130,246,0.2)",
                        color: "#60a5fa",
                        borderRadius: "20px",
                        fontSize: "14px",
                        marginBottom: "24px"
                    }}>
                        For Verified Suppliers
                    </span>
                    <h1 style={{ fontSize: isMobile ? "32px" : "48px", fontWeight: "bold", color: "white", marginBottom: "20px", lineHeight: "1.2" }}>
                        Become a Verified Partner at ChidiyaAI
                    </h1>
                    <p style={{ fontSize: isMobile ? "16px" : "20px", color: "#94a3b8", marginBottom: "40px", lineHeight: "1.6" }}>
                        Get access to quality leads from verified buyers. No spam, no fake inquiries — only AI-validated business opportunities.
                    </p>
                    <div style={{ display: "flex", gap: "16px", justifyContent: "center", flexDirection: isMobile ? "column" : "row" }}>
                        <Link href="/supplier/register" style={{
                            backgroundColor: "#3b82f6",
                            color: "white",
                            padding: isMobile ? "14px 24px" : "16px 32px",
                            borderRadius: "8px",
                            textDecoration: "none",
                            fontWeight: "500",
                            fontSize: "16px",
                            textAlign: "center"
                        }}>
                            Register as Supplier
                        </Link>
                        <Link href="/supplier/login" style={{
                            backgroundColor: "transparent",
                            color: "white",
                            padding: isMobile ? "14px 24px" : "16px 32px",
                            borderRadius: "8px",
                            textDecoration: "none",
                            fontWeight: "500",
                            fontSize: "16px",
                            border: "1px solid #475569",
                            textAlign: "center"
                        }}>
                            Sign in
                        </Link>
                    </div>
                </div>
            </section>

            {/* Benefits */}
            <section style={{ padding: isMobile ? "60px 16px" : "80px 24px", backgroundColor: "white" }}>
                <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
                    <h2 style={{ fontSize: isMobile ? "28px" : "36px", fontWeight: "bold", color: "#0f172a", textAlign: "center", marginBottom: "48px" }}>
                        Why Partner with ChidiyaAI?
                    </h2>

                    <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)", gap: isMobile ? "16px" : "32px" }}>
                        {[
                            { icon: "✓", title: "Verified Leads Only", desc: "Receive only AI-validated inquiries from genuine buyers. No spam, no fake leads." },
                            { icon: "🔒", title: "Privacy Protected", desc: "Buyer details are protected. Focus on the inquiry, not chasing contacts." },
                            { icon: "📊", title: "Analytics Dashboard", desc: "Track your performance with detailed analytics: inquiries, quotes, conversion rates." },
                            { icon: "🏆", title: "Trust Badges", desc: "Earn verification badges that boost your credibility with buyers." },
                            { icon: "⚡", title: "Instant Notifications", desc: "Get notified immediately when a matching inquiry comes in." },
                            { icon: "🎯", title: "Targeted Matches", desc: "Our AI matches you with buyers looking for exactly what you offer." }
                        ].map((item, i) => (
                            <div key={i} style={{ padding: isMobile ? "20px" : "24px", backgroundColor: "#f8fafc", borderRadius: "16px" }}>
                                <div style={{ fontSize: "32px", marginBottom: "16px" }}>{item.icon}</div>
                                <h3 style={{ fontSize: "18px", fontWeight: "600", color: "#0f172a", marginBottom: "8px" }}>{item.title}</h3>
                                <p style={{ fontSize: "14px", color: "#64748b", lineHeight: "1.6" }}>{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section style={{ padding: isMobile ? "60px 16px" : "80px 24px", backgroundColor: "#f8fafc" }}>
                <div style={{ maxWidth: "800px", margin: "0 auto" }}>
                    <h2 style={{ fontSize: isMobile ? "28px" : "36px", fontWeight: "bold", color: "#0f172a", textAlign: "center", marginBottom: "48px" }}>
                        How It Works
                    </h2>

                    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                        {[
                            { step: "1", title: "Register & Complete KYC", desc: "Submit company details and verification documents (GST, PAN, IEC if applicable)." },
                            { step: "2", title: "Get Verified", desc: "Our team reviews and verifies your documents. Earn trust badges." },
                            { step: "3", title: "Receive Inquiries", desc: "Get AI-validated buyer inquiries matching your products and capacity." },
                            { step: "4", title: "Submit Quotes", desc: "Respond with price, MOQ, delivery timeline. Win the business." }
                        ].map((item, i) => (
                            <div key={i} style={{ display: "flex", gap: "20px", backgroundColor: "white", padding: isMobile ? "16px" : "24px", borderRadius: "12px" }}>
                                <div style={{
                                    width: "48px",
                                    height: "48px",
                                    borderRadius: "50%",
                                    backgroundColor: "#3b82f6",
                                    color: "white",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontWeight: "bold",
                                    fontSize: "18px",
                                    flexShrink: 0
                                }}>{item.step}</div>
                                <div>
                                    <h3 style={{ fontSize: "18px", fontWeight: "600", color: "#0f172a", marginBottom: "4px" }}>{item.title}</h3>
                                    <p style={{ fontSize: "14px", color: "#64748b" }}>{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Video Demo */}
            <section style={{ padding: isMobile ? "60px 16px" : "80px 24px", backgroundColor: "white" }}>
                <div style={{ maxWidth: "800px", margin: "0 auto" }}>
                    <div style={{ textAlign: "center", marginBottom: "40px" }}>
                        <span style={{
                            display: "inline-block",
                            padding: "8px 18px",
                            background: "linear-gradient(135deg, rgba(59,130,246,0.1), rgba(99,102,241,0.08))",
                            color: "#3b82f6",
                            borderRadius: "24px",
                            fontSize: "13px",
                            fontWeight: "600",
                            marginBottom: "16px",
                            border: "1px solid rgba(59,130,246,0.15)"
                        }}>
                            🎬 Video Guide
                        </span>
                        <h2 style={{ fontSize: isMobile ? "24px" : "32px", fontWeight: "bold", color: "#0f172a", marginBottom: "12px" }}>
                            Watch: How to Register as a Supplier
                        </h2>
                        <p style={{ fontSize: isMobile ? "14px" : "16px", color: "#64748b", maxWidth: "600px", margin: "0 auto" }}>
                            Follow this step-by-step video walkthrough to complete your supplier registration on ChidiyaAI.
                        </p>
                    </div>

                    <div style={{
                        borderRadius: "20px",
                        overflow: "hidden",
                        border: "1px solid #e2e8f0",
                        boxShadow: "0 20px 60px rgba(0,0,0,0.1), 0 0 30px rgba(59,130,246,0.06)",
                        backgroundColor: "#000"
                    }}>
                        <div style={{ position: "relative", paddingBottom: "56.25%", height: 0 }}>
                            <iframe
                                src="https://www.youtube.com/embed/3npRaHhZ7PA?si=-YPdX3QgD9nt9Jub"
                                title="ChidiyaAI Supplier Registration Guide"
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                referrerPolicy="strict-origin-when-cross-origin"
                                allowFullScreen
                                style={{
                                    position: "absolute",
                                    top: 0,
                                    left: 0,
                                    width: "100%",
                                    height: "100%",
                                    border: "none"
                                }}
                            />
                        </div>
                    </div>

                    <div style={{ textAlign: "center", marginTop: "24px" }}>
                        <Link href="/supplier/register" style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "8px",
                            background: "linear-gradient(135deg, #3b82f6, #2563eb)",
                            color: "white",
                            padding: "14px 32px",
                            borderRadius: "12px",
                            textDecoration: "none",
                            fontWeight: "600",
                            fontSize: "16px",
                            boxShadow: "0 8px 24px rgba(59,130,246,0.3)"
                        }}>
                            Register Now <span>→</span>
                        </Link>
                    </div>
                </div>
            </section>
            {/* CTA */}
            <section style={{ padding: isMobile ? "60px 16px" : "80px 24px", backgroundColor: "#0f172a", textAlign: "center" }}>
                <div style={{ maxWidth: "600px", margin: "0 auto" }}>
                    <h2 style={{ fontSize: isMobile ? "24px" : "32px", fontWeight: "bold", color: "white", marginBottom: "16px" }}>
                        Ready to grow your business?
                    </h2>
                    <p style={{ color: "#94a3b8", marginBottom: "32px" }}>
                        Join hundreds of verified suppliers on ChidiyaAI
                    </p>
                    <Link href="/supplier/register" style={{
                        display: "inline-block",
                        backgroundColor: "white",
                        color: "#0f172a",
                        padding: isMobile ? "14px 28px" : "16px 32px",
                        borderRadius: "8px",
                        textDecoration: "none",
                        fontWeight: "500"
                    }}>
                        Become a Supplier
                    </Link>
                </div>
            </section>

            {/* Footer */}
            <footer style={{ padding: "40px 24px", backgroundColor: "#0f172a", borderTop: "1px solid #1e293b", textAlign: "center" }}>
                <p style={{ color: "#64748b", fontSize: "14px" }}>© 2025 ChidiyaAI. All rights reserved.</p>
            </footer>
        </div>
    );
}

"use client";

import Link from "next/link";

export default function SupplierLanding() {
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
                padding: "16px 24px"
            }}>
                <div style={{ maxWidth: "1100px", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <Link href="/" style={{ fontWeight: "bold", fontSize: "20px", color: "#0f172a", textDecoration: "none" }}>
                        Chidiya<span style={{ color: "#3b82f6" }}>AI</span>
                    </Link>
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
                </div>
            </nav>

            {/* Hero */}
            <section style={{
                padding: "100px 24px",
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
                    <h1 style={{ fontSize: "48px", fontWeight: "bold", color: "white", marginBottom: "20px", lineHeight: "1.2" }}>
                        Become a Verified Partner at ChidiyaAI
                    </h1>
                    <p style={{ fontSize: "20px", color: "#94a3b8", marginBottom: "40px", lineHeight: "1.6" }}>
                        Get access to quality leads from verified buyers. No spam, no fake inquiries — only AI-validated business opportunities.
                    </p>
                    <div style={{ display: "flex", gap: "16px", justifyContent: "center" }}>
                        <Link href="/supplier/register" style={{
                            backgroundColor: "#3b82f6",
                            color: "white",
                            padding: "16px 32px",
                            borderRadius: "8px",
                            textDecoration: "none",
                            fontWeight: "500",
                            fontSize: "16px"
                        }}>
                            Register as Supplier
                        </Link>
                        <Link href="/supplier/login" style={{
                            backgroundColor: "transparent",
                            color: "white",
                            padding: "16px 32px",
                            borderRadius: "8px",
                            textDecoration: "none",
                            fontWeight: "500",
                            fontSize: "16px",
                            border: "1px solid #475569"
                        }}>
                            Sign in
                        </Link>
                    </div>
                </div>
            </section>

            {/* Benefits */}
            <section style={{ padding: "80px 24px", backgroundColor: "white" }}>
                <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
                    <h2 style={{ fontSize: "36px", fontWeight: "bold", color: "#0f172a", textAlign: "center", marginBottom: "48px" }}>
                        Why Partner with ChidiyaAI?
                    </h2>

                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "32px" }}>
                        {[
                            { icon: "✓", title: "Verified Leads Only", desc: "Receive only AI-validated inquiries from genuine buyers. No spam, no fake leads." },
                            { icon: "🔒", title: "Privacy Protected", desc: "Buyer details are protected. Focus on the inquiry, not chasing contacts." },
                            { icon: "📊", title: "Analytics Dashboard", desc: "Track your performance with detailed analytics: inquiries, quotes, conversion rates." },
                            { icon: "🏆", title: "Trust Badges", desc: "Earn verification badges that boost your credibility with buyers." },
                            { icon: "⚡", title: "Instant Notifications", desc: "Get notified immediately when a matching inquiry comes in." },
                            { icon: "🎯", title: "Targeted Matches", desc: "Our AI matches you with buyers looking for exactly what you offer." }
                        ].map((item, i) => (
                            <div key={i} style={{ padding: "24px", backgroundColor: "#f8fafc", borderRadius: "16px" }}>
                                <div style={{ fontSize: "32px", marginBottom: "16px" }}>{item.icon}</div>
                                <h3 style={{ fontSize: "18px", fontWeight: "600", color: "#0f172a", marginBottom: "8px" }}>{item.title}</h3>
                                <p style={{ fontSize: "14px", color: "#64748b", lineHeight: "1.6" }}>{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section style={{ padding: "80px 24px", backgroundColor: "#f8fafc" }}>
                <div style={{ maxWidth: "800px", margin: "0 auto" }}>
                    <h2 style={{ fontSize: "36px", fontWeight: "bold", color: "#0f172a", textAlign: "center", marginBottom: "48px" }}>
                        How It Works
                    </h2>

                    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                        {[
                            { step: "1", title: "Register & Complete KYC", desc: "Submit company details and verification documents (GST, PAN, IEC if applicable)." },
                            { step: "2", title: "Get Verified", desc: "Our team reviews and verifies your documents. Earn trust badges." },
                            { step: "3", title: "Receive Inquiries", desc: "Get AI-validated buyer inquiries matching your products and capacity." },
                            { step: "4", title: "Submit Quotes", desc: "Respond with price, MOQ, delivery timeline. Win the business." }
                        ].map((item, i) => (
                            <div key={i} style={{ display: "flex", gap: "20px", backgroundColor: "white", padding: "24px", borderRadius: "12px" }}>
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

            {/* CTA */}
            <section style={{ padding: "80px 24px", backgroundColor: "#0f172a", textAlign: "center" }}>
                <div style={{ maxWidth: "600px", margin: "0 auto" }}>
                    <h2 style={{ fontSize: "32px", fontWeight: "bold", color: "white", marginBottom: "16px" }}>
                        Ready to grow your business?
                    </h2>
                    <p style={{ color: "#94a3b8", marginBottom: "32px" }}>
                        Join hundreds of verified suppliers on ChidiyaAI
                    </p>
                    <Link href="/supplier/register" style={{
                        display: "inline-block",
                        backgroundColor: "white",
                        color: "#0f172a",
                        padding: "16px 32px",
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

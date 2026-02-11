"use client";

import Link from "next/link";
import Image from "next/image";

export default function AboutPage() {
    return (
        <div style={{ fontFamily: "'Inter', system-ui, sans-serif", color: "#0f172a" }}>
            {/* Header */}
            <header style={{ backgroundColor: "white", borderBottom: "1px solid #e2e8f0", padding: "16px 24px", position: "sticky", top: 0, zIndex: 50 }}>
                <div style={{ maxWidth: "1000px", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center" }}>
                        <Image src="/assests/chidiyaailogo.png" alt="ChidiyaAI" width={130} height={35} style={{ height: "35px", width: "auto" }} priority />
                    </Link>
                    <div style={{ display: "flex", gap: "16px", fontSize: "14px" }}>
                        <Link href="/" style={{ color: "#64748b", textDecoration: "none" }}>Home</Link>
                        <Link href="/contact" style={{ color: "#64748b", textDecoration: "none" }}>Contact</Link>
                    </div>
                </div>
            </header>

            {/* Hero */}
            <section style={{ padding: "80px 24px", background: "linear-gradient(180deg, #f0f7ff 0%, #ffffff 100%)", textAlign: "center" }}>
                <div style={{ maxWidth: "800px", margin: "0 auto" }}>
                    <span style={{ display: "inline-block", padding: "6px 14px", backgroundColor: "#eff6ff", color: "#3b82f6", borderRadius: "20px", fontSize: "13px", fontWeight: "500", marginBottom: "16px" }}>
                        About Us
                    </span>
                    <h1 style={{ fontSize: "48px", fontWeight: "700", lineHeight: "1.1", marginBottom: "20px", letterSpacing: "-1px" }}>
                        Making B2B Sourcing <span style={{ color: "#3b82f6" }}>Smarter</span> for India
                    </h1>
                    <p style={{ fontSize: "18px", color: "#64748b", lineHeight: "1.7" }}>
                        ChidiyaAI is an AI-powered B2B sourcing platform that connects Indian businesses with verified suppliers — faster, smarter, and more transparent than ever before.
                    </p>
                </div>
            </section>

            {/* Mission */}
            <section style={{ padding: "80px 24px", backgroundColor: "white" }}>
                <div style={{ maxWidth: "900px", margin: "0 auto" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "60px", alignItems: "center" }}>
                        <div>
                            <h2 style={{ fontSize: "32px", fontWeight: "700", marginBottom: "16px" }}>Our Mission</h2>
                            <p style={{ fontSize: "16px", color: "#64748b", lineHeight: "1.8", marginBottom: "16px" }}>
                                India's B2B market is massive but fragmented. Small and medium businesses spend weeks finding the right suppliers — calling middlemen, visiting mandis, and dealing with unverified contacts.
                            </p>
                            <p style={{ fontSize: "16px", color: "#64748b", lineHeight: "1.8" }}>
                                We built ChidiyaAI to change that. Our AI assistant "Chidiya" understands your requirements, matches you with GST-verified suppliers, and helps you compare prices — all in minutes, not weeks.
                            </p>
                        </div>
                        <div style={{ backgroundColor: "#f8fafc", borderRadius: "20px", padding: "40px", textAlign: "center" }}>
                            <div style={{
                                width: "80px", height: "80px", borderRadius: "50%",
                                background: "linear-gradient(135deg, #3b82f6, #2563eb)",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                margin: "0 auto 16px", boxShadow: "0 8px 24px rgba(59,130,246,0.3)"
                            }}>
                                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                                </svg>
                            </div>
                            <h3 style={{ fontSize: "24px", fontWeight: "700", color: "#3b82f6", marginBottom: "8px" }}>Chidiya</h3>
                            <p style={{ color: "#64748b", fontSize: "14px" }}>Your AI sourcing assistant that works 24/7</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Values */}
            <section style={{ padding: "80px 24px", backgroundColor: "#f8fafc" }}>
                <div style={{ maxWidth: "900px", margin: "0 auto" }}>
                    <h2 style={{ fontSize: "32px", fontWeight: "700", textAlign: "center", marginBottom: "48px" }}>What Drives Us</h2>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "24px" }}>
                        {[
                            { icon: (<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>), title: "Trust & Verification", desc: "Every supplier on our platform is GST-verified. We rigorously review for quality, credibility, and reliability." },
                            { icon: (<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>), title: "Speed & Efficiency", desc: "AI-powered matching gets you connected with the right suppliers in minutes, not weeks." },
                            { icon: (<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>), title: "Privacy & Security", desc: "We never share your phone number with suppliers. Your data stays private and secure." },
                            { icon: (<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></svg>), title: "Made for India", desc: "Built specifically for Indian B2B market — we understand local terms, products, and business customs." },
                            { icon: (<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>), title: "Transparent Pricing", desc: "Compare prices across suppliers. No hidden fees, no middlemen markup." },
                            { icon: (<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>), title: "Fair to Suppliers", desc: "We help small manufacturers and wholesalers reach more buyers with affordable subscription plans." },
                        ].map((v, i) => (
                            <div key={i} style={{ backgroundColor: "white", borderRadius: "16px", padding: "28px", border: "1px solid #e2e8f0" }}>
                                <div style={{ width: "48px", height: "48px", borderRadius: "12px", backgroundColor: "#eff6ff", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "12px" }}>
                                    {v.icon}
                                </div>
                                <h3 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "8px", color: "#0f172a" }}>{v.title}</h3>
                                <p style={{ fontSize: "14px", color: "#64748b", lineHeight: "1.6" }}>{v.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Stats - Same as landing page */}
            <section style={{ padding: "80px 24px", backgroundColor: "white" }}>
                <div style={{ maxWidth: "900px", margin: "0 auto" }}>
                    <div style={{ textAlign: "center", marginBottom: "48px" }}>
                        <h2 style={{ fontSize: "36px", fontWeight: "bold", color: "#0f172a", marginBottom: "8px" }}>
                            Proven Performance
                        </h2>
                        <p style={{ color: "#64748b" }}>Growing every day with businesses like yours</p>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "32px", textAlign: "center" }}>
                        {[
                            { num: "500+", label: "Verified Suppliers" },
                            { num: "2000+", label: "Successful Matches" },
                            { num: "₹25L+", label: "Buyer Savings" },
                            { num: "95%", label: "Satisfaction Rate" },
                        ].map((s, i) => (
                            <div key={i}>
                                <div style={{ fontSize: "48px", fontWeight: "800", color: "#3b82f6", marginBottom: "8px" }}>{s.num}</div>
                                <div style={{ fontSize: "14px", color: "#64748b" }}>{s.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section style={{ padding: "80px 24px", backgroundColor: "#0f172a", textAlign: "center" }}>
                <div style={{ maxWidth: "600px", margin: "0 auto" }}>
                    <h2 style={{ fontSize: "32px", fontWeight: "700", color: "white", marginBottom: "16px" }}>
                        Ready to source smarter?
                    </h2>
                    <p style={{ color: "#94a3b8", fontSize: "16px", marginBottom: "32px" }}>
                        Join thousands of Indian businesses already using ChidiyaAI.
                    </p>
                    <div style={{ display: "flex", gap: "16px", justifyContent: "center" }}>
                        <Link href="/account/chat" style={{ backgroundColor: "#3b82f6", color: "white", padding: "14px 28px", borderRadius: "8px", textDecoration: "none", fontWeight: "500" }}>
                            Start Sourcing Free
                        </Link>
                        <Link href="/contact" style={{ backgroundColor: "transparent", color: "white", padding: "14px 28px", borderRadius: "8px", textDecoration: "none", fontWeight: "500", border: "1px solid #334155" }}>
                            Contact Us
                        </Link>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer style={{ backgroundColor: "#0f172a", borderTop: "1px solid #1e293b", padding: "24px", textAlign: "center" }}>
                <p style={{ color: "#64748b", fontSize: "14px" }}>© 2025 ChidiyaAI. All rights reserved. Made with ❤️ in India</p>
            </footer>
        </div>
    );
}

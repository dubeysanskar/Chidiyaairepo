"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import ScheduleMeetingModal from "@/app/components/ScheduleMeetingModal";

export default function SupplierLanding() {
    const [isMobile, setIsMobile] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const [showMeetingModal, setShowMeetingModal] = useState(false);

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
                    <Link href="/" style={{ display: "flex", alignItems: "center" }}>
                        <Image src="/assests/chidiyaailogo.png" alt="ChidiyaAI" width={120} height={40} style={{ height: "40px", width: "auto" }} />
                    </Link>

                    {/* Desktop Nav */}
                    {!isMobile && (
                        <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
                            <Link href="/" style={{ color: "#64748b", textDecoration: "none", fontSize: "14px" }}>
                                Home
                            </Link>
                            <Link href="/supplier/login" style={{ color: "#64748b", textDecoration: "none", fontSize: "14px" }}>
                                Supplier Login
                            </Link>
                            <button
                                onClick={() => setShowMeetingModal(true)}
                                style={{
                                    padding: "8px 16px", fontSize: "13px", fontWeight: "500",
                                    color: "white", background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
                                    border: "none", borderRadius: "8px", cursor: "pointer",
                                    display: "flex", alignItems: "center", gap: "6px",
                                }}
                            >
                                📅 Schedule Meeting
                            </button>
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
                        <Link href="/" onClick={() => setMenuOpen(false)} style={{ display: "block", padding: "12px", color: "#64748b", textDecoration: "none", textAlign: "center" }}>
                            Home
                        </Link>
                        <Link href="/supplier/login" onClick={() => setMenuOpen(false)} style={{ display: "block", padding: "12px", color: "#64748b", textDecoration: "none", textAlign: "center" }}>
                            Supplier Login
                        </Link>
                        <button
                            onClick={() => { setShowMeetingModal(true); setMenuOpen(false); }}
                            style={{
                                display: "block", width: "100%", padding: "12px", fontSize: "16px",
                                color: "white", background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
                                border: "none", borderRadius: "8px", cursor: "pointer", textAlign: "center",
                            }}
                        >
                            📅 Schedule Meeting
                        </button>
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

            {/* Hero — Two Column Layout */}
            <section style={{ padding: isMobile ? "40px 16px" : "80px 24px", backgroundColor: "#f8fafc" }}>
                <div style={{ maxWidth: "1100px", margin: "0 auto", display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: isMobile ? "32px" : "60px", alignItems: "center" }}>
                    {/* Left — Chat Mockup */}
                    <div style={{ backgroundColor: "white", borderRadius: "20px", padding: isMobile ? "20px" : "28px", boxShadow: "0 20px 60px rgba(0,0,0,0.08)", border: "1px solid #e2e8f0", order: isMobile ? 1 : 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "20px" }}>
                            <span style={{ fontSize: "20px" }}>🐦</span>
                            <span style={{ fontWeight: "700", fontSize: "16px", color: "#0f172a" }}>ChidiyaAI</span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "12px" }}>
                            <div style={{ backgroundColor: "#3b82f6", color: "white", padding: "10px 16px", borderRadius: "16px 16px 4px 16px", fontSize: "13px", maxWidth: "80%" }}>
                                I need corrugated box suppliers in Mumbai, MOQ 5000
                            </div>
                        </div>
                        <div style={{ textAlign: "right", fontSize: "11px", color: "#94a3b8", marginBottom: "16px" }}>Time: 10:32 AM</div>
                        <div style={{ backgroundColor: "#f8fafc", borderRadius: "12px", padding: "16px", border: "1px solid #e2e8f0" }}>
                            <p style={{ fontWeight: "600", fontSize: "14px", color: "#0f172a", marginBottom: "12px" }}>Found 12 new buyer inquiries today!</p>
                            {[
                                { name: "Buycorr Pvt Ltd (Mumbai)", qty: "5000 pieces", time: "10:15 AM" },
                                { name: "Pack Rite Traders (Delhi)", qty: "3000 pieces", time: "09:48 AM" },
                                { name: "EcoPack Solutions (Pune)", qty: "8000 pieces", time: "09:20 AM" }
                            ].map((item, i) => (
                                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderTop: i > 0 ? "1px solid #e2e8f0" : "none" }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                        <span style={{ width: "28px", height: "28px", borderRadius: "50%", backgroundColor: "#eff6ff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px" }}>🏢</span>
                                        <div>
                                            <div style={{ fontSize: "13px", fontWeight: "600", color: "#0f172a" }}>{item.name}</div>
                                            <div style={{ fontSize: "11px", color: "#64748b" }}>{item.qty} <span style={{ backgroundColor: "#dcfce7", color: "#166534", padding: "1px 6px", borderRadius: "4px", fontSize: "10px", fontWeight: "600", marginLeft: "4px" }}>High Match</span></div>
                                        </div>
                                    </div>
                                    <span style={{ fontSize: "11px", color: "#94a3b8" }}>{item.time}</span>
                                </div>
                            ))}
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "12px", paddingTop: "12px", borderTop: "1px solid #e2e8f0" }}>
                                <span style={{ fontSize: "12px", color: "#64748b" }}>Total inquiries today: <strong>12</strong></span>
                                <span style={{ fontSize: "12px", color: "#3b82f6", fontWeight: "600" }}>View All →</span>
                            </div>
                        </div>
                    </div>
                    {/* Right — CTA */}
                    <div>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "6px 14px", backgroundColor: "#eff6ff", color: "#3b82f6", borderRadius: "20px", fontSize: "13px", fontWeight: "600", marginBottom: "20px", border: "1px solid #bfdbfe" }}>🏪 SELLER MODE</span>
                        <h1 style={{ fontSize: isMobile ? "32px" : "44px", fontWeight: "800", color: "#0f172a", lineHeight: "1.15", marginBottom: "16px" }}>
                            Get found. Grow your business.
                        </h1>
                        <p style={{ fontSize: "16px", color: "#64748b", lineHeight: "1.7", marginBottom: "24px" }}>
                            Join thousands of verified sellers already receiving quality inquiries from serious buyers every day.
                        </p>
                        <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "32px" }}>
                            {["Receive verified buyer inquiries", "Showcase your products & pricing", "Grow your business, 24/7"].map((t, i) => (
                                <div key={i} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                    <span style={{ width: "22px", height: "22px", borderRadius: "50%", backgroundColor: "#dcfce7", color: "#16a34a", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", flexShrink: 0 }}>✓</span>
                                    <span style={{ fontSize: "15px", color: "#334155" }}>{t}</span>
                                </div>
                            ))}
                        </div>
                        <Link href="/supplier/register" style={{ display: "inline-flex", alignItems: "center", gap: "8px", backgroundColor: "#0f172a", color: "white", padding: "16px 32px", borderRadius: "10px", textDecoration: "none", fontWeight: "600", fontSize: "16px" }}>
                            Register as Seller <span>→</span>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Video Demo — Registration Walkthrough */}
            <section style={{ padding: isMobile ? "40px 16px" : "60px 24px", backgroundColor: "white" }}>
                <div style={{ maxWidth: "800px", margin: "0 auto" }}>
                    <div style={{ textAlign: "center", marginBottom: "32px" }}>
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
            {/* Need Business Solutions CTA — after hero */}
            <section style={{
                padding: isMobile ? "40px 16px" : "60px 24px",
                background: "linear-gradient(135deg, #eff6ff 0%, #f0fdf4 100%)",
                textAlign: "center"
            }}>
                <div style={{ maxWidth: "700px", margin: "0 auto" }}>
                    <span style={{ fontSize: "36px", display: "block", marginBottom: "16px" }}>🤝</span>
                    <h2 style={{ fontSize: isMobile ? "22px" : "28px", fontWeight: "700", color: "#0f172a", marginBottom: "12px" }}>
                        Need Business Solutions or Assessment?
                    </h2>
                    <p style={{ fontSize: isMobile ? "14px" : "16px", color: "#475569", lineHeight: "1.7", marginBottom: "24px" }}>
                        Whether you need help with packaging supply chain management, want to explore bulk sourcing options, or need guidance on growing your packaging business — our team is here to help.
                    </p>
                    <div style={{ display: "flex", gap: "16px", justifyContent: "center", flexWrap: "wrap" }}>
                        <button
                            onClick={() => setShowMeetingModal(true)}
                            style={{
                                padding: "14px 28px", fontSize: "15px", fontWeight: "600",
                                color: "white", background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
                                border: "none", borderRadius: "10px", cursor: "pointer",
                                display: "inline-flex", alignItems: "center", gap: "8px",
                                boxShadow: "0 4px 14px rgba(59,130,246,0.3)",
                            }}
                        >
                            📅 Schedule a Meeting with Us
                        </button>
                        <Link href="/contact" style={{
                            padding: "14px 28px", fontSize: "15px", fontWeight: "500",
                            color: "#3b82f6", backgroundColor: "white",
                            border: "1px solid #bfdbfe", borderRadius: "10px",
                            textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "8px",
                        }}>
                            📞 Contact Us
                        </Link>
                    </div>
                    <p style={{ fontSize: "12px", color: "#94a3b8", marginTop: "16px" }}>
                        Our team responds within 24 hours
                    </p>
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
                            { step: "1", title: "Register & Complete KYC", desc: "Submit company details and verification documents (GST, Aadhar, certifications)." },
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

            {/* Proven Performance — Stats */}
            <section style={{ padding: isMobile ? "60px 16px" : "80px 24px", backgroundColor: "white" }}>
                <div style={{ maxWidth: "900px", margin: "0 auto", textAlign: "center" }}>
                    <h2 style={{ fontSize: isMobile ? "28px" : "36px", fontWeight: "800", color: "#0f172a", marginBottom: "8px" }}>Proven Performance</h2>
                    <p style={{ color: "#64748b", marginBottom: "48px" }}>Growing every day with businesses like yours</p>
                    <div style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(4, 1fr)", gap: "32px" }}>
                        {[
                            { value: "500+", label: "Verified Suppliers" },
                            { value: "2000+", label: "Successful Matches" },
                            { value: "₹25L+", label: "Buyer Savings" },
                            { value: "95%", label: "Satisfaction Rate" }
                        ].map((s, i) => (
                            <div key={i}>
                                <div style={{ fontSize: isMobile ? "36px" : "48px", fontWeight: "800", color: "#3b82f6", marginBottom: "8px" }}>{s.value}</div>
                                <div style={{ color: "#64748b", fontSize: "14px" }}>{s.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* What Our Sellers Say — Testimonials */}
            <section style={{ padding: isMobile ? "60px 16px" : "80px 24px", backgroundColor: "#f8fafc" }}>
                <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
                    <div style={{ textAlign: "center", marginBottom: "48px" }}>
                        <h2 style={{ fontSize: isMobile ? "28px" : "36px", fontWeight: "800", color: "#0f172a", marginBottom: "12px" }}>What Our Sellers Say</h2>
                        <p style={{ color: "#64748b", fontSize: "16px" }}>Real sellers, real growth</p>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)", gap: "24px" }}>
                        {[
                            { name: "Vikram Mehta", role: "Owner, Mehta Packaging Co.", quote: "ChidiyaAI helped my business grow 2x in just 3 months! The quality of buyer leads is unmatched — every inquiry is genuine.", image: "/images/seller-testimonial-1.png", badge: "2x growth" },
                            { name: "Sneha Joshi", role: "Director, Joshi Textiles", quote: "We went from 10 inquiries per month to 50+. The AI matching is a game-changer for suppliers like us.", image: "/images/seller-testimonial-2.png", badge: "5x leads" },
                            { name: "Ramesh Agarwal", role: "MD, Agarwal Industries", quote: "As a small manufacturer, getting verified buyer leads was impossible before ChidiyaAI. Now we close deals every week.", image: "/images/seller-testimonial-3.png", badge: "Weekly deals" }
                        ].map((t, i) => (
                            <div key={i} style={{ backgroundColor: "white", borderRadius: "16px", overflow: "hidden", border: "1px solid #e2e8f0", transition: "transform 0.3s, box-shadow 0.3s" }}>
                                <div style={{ position: "relative" }}>
                                    <img src={t.image} alt={t.name} style={{ width: "100%", height: isMobile ? "280px" : "320px", objectFit: "cover", display: "block" }} />
                                    <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "80px", background: "linear-gradient(transparent, rgba(0,0,0,0.4))", pointerEvents: "none" }} />
                                    <span style={{ position: "absolute", top: "12px", left: "12px", padding: "4px 10px", background: "rgba(59,130,246,0.9)", color: "white", borderRadius: "8px", fontSize: "11px", fontWeight: "600" }}>✓ Verified</span>
                                    <span style={{ position: "absolute", top: "12px", right: "12px", padding: "4px 12px", background: "rgba(16,185,129,0.9)", color: "white", borderRadius: "8px", fontSize: "12px", fontWeight: "600" }}>{t.badge}</span>
                                </div>
                                <div style={{ padding: "20px" }}>
                                    <div style={{ marginBottom: "10px" }}>{[1,2,3,4,5].map(s => <span key={s} style={{ color: "#f59e0b", fontSize: "15px", marginRight: "1px" }}>★</span>)}</div>
                                    <p style={{ fontSize: "14px", color: "#475569", marginBottom: "16px", lineHeight: "1.6", fontStyle: "italic" }}>&ldquo;{t.quote}&rdquo;</p>
                                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                        <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "linear-gradient(135deg, #3b82f6, #6366f1)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: "700", fontSize: "14px" }}>{t.name[0]}</div>
                                        <div>
                                            <div style={{ fontWeight: "600", color: "#0f172a", fontSize: "14px" }}>{t.name}</div>
                                            <div style={{ fontSize: "12px", color: "#64748b" }}>{t.role}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>


            <section style={{ padding: isMobile ? "60px 16px" : "80px 24px", backgroundColor: "#0f172a", textAlign: "center" }}>
                <div style={{ maxWidth: "600px", margin: "0 auto" }}>
                    <h2 style={{ fontSize: isMobile ? "24px" : "32px", fontWeight: "bold", color: "white", marginBottom: "16px" }}>
                        Ready to grow your business?
                    </h2>
                    <p style={{ color: "#94a3b8", marginBottom: "32px" }}>
                        Join hundreds of verified suppliers on ChidiyaAI
                    </p>
                    <div style={{ display: "flex", gap: "16px", justifyContent: "center", flexWrap: "wrap" }}>
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
                        <button
                            onClick={() => setShowMeetingModal(true)}
                            style={{
                                padding: isMobile ? "14px 28px" : "16px 32px",
                                background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
                                color: "white", border: "none", borderRadius: "8px",
                                fontWeight: "500", cursor: "pointer", fontSize: "16px",
                            }}
                        >
                            📅 Schedule a Meeting
                        </button>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer style={{ padding: "40px 24px", backgroundColor: "#0f172a", borderTop: "1px solid #1e293b", textAlign: "center" }}>
                <p style={{ color: "#64748b", fontSize: "14px" }}>© 2025 ChidiyaAI. All rights reserved.</p>
            </footer>

            {/* Schedule Meeting Modal */}
            <ScheduleMeetingModal
                isOpen={showMeetingModal}
                onClose={() => setShowMeetingModal(false)}
            />
        </div>
    );
}

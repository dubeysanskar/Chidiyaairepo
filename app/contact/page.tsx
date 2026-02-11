"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

export default function ContactPage() {
    const [formData, setFormData] = useState({ name: "", email: "", phone: "", subject: "general", message: "" });
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        // Simulate submission
        await new Promise(resolve => setTimeout(resolve, 1500));
        setSubmitted(true);
        setLoading(false);
    };

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
                        <Link href="/about" style={{ color: "#64748b", textDecoration: "none" }}>About</Link>
                    </div>
                </div>
            </header>

            {/* Hero */}
            <section style={{ padding: "80px 24px", background: "linear-gradient(180deg, #f0f7ff 0%, #ffffff 100%)", textAlign: "center" }}>
                <div style={{ maxWidth: "600px", margin: "0 auto" }}>
                    <span style={{ display: "inline-block", padding: "6px 14px", backgroundColor: "#eff6ff", color: "#3b82f6", borderRadius: "20px", fontSize: "13px", fontWeight: "500", marginBottom: "16px" }}>
                        Get in Touch
                    </span>
                    <h1 style={{ fontSize: "42px", fontWeight: "700", lineHeight: "1.1", marginBottom: "16px" }}>
                        Contact <span style={{ color: "#3b82f6" }}>ChidiyaAI</span>
                    </h1>
                    <p style={{ fontSize: "16px", color: "#64748b", lineHeight: "1.7" }}>
                        Have questions, feedback, or need help? We'd love to hear from you. Our team typically responds within 24 hours.
                    </p>
                </div>
            </section>

            {/* Contact Form + Info */}
            <section id="contact-form" style={{ padding: "60px 24px 80px", backgroundColor: "white" }}>
                <div style={{ maxWidth: "900px", margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "60px" }}>
                    {/* Form */}
                    <div>
                        <h2 style={{ fontSize: "24px", fontWeight: "700", marginBottom: "24px" }}>Send us a message</h2>

                        {submitted ? (
                            <div style={{ backgroundColor: "#dcfce7", borderRadius: "16px", padding: "40px", textAlign: "center" }}>
                                <div style={{ fontSize: "48px", marginBottom: "16px" }}>✅</div>
                                <h3 style={{ fontSize: "20px", fontWeight: "600", color: "#15803d", marginBottom: "8px" }}>Message Sent!</h3>
                                <p style={{ color: "#166534", fontSize: "14px" }}>We'll get back to you within 24 hours.</p>
                                <button onClick={() => { setSubmitted(false); setFormData({ name: "", email: "", phone: "", subject: "general", message: "" }); }}
                                    style={{ marginTop: "16px", padding: "10px 20px", backgroundColor: "#15803d", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "500" }}>
                                    Send Another
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                                <div>
                                    <label style={{ display: "block", fontSize: "13px", fontWeight: "500", color: "#475569", marginBottom: "6px" }}>Full Name *</label>
                                    <input type="text" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        style={{ width: "100%", padding: "12px 16px", borderRadius: "10px", border: "1px solid #e2e8f0", fontSize: "14px", outline: "none", boxSizing: "border-box" }}
                                        placeholder="Your name" />
                                </div>
                                <div>
                                    <label style={{ display: "block", fontSize: "13px", fontWeight: "500", color: "#475569", marginBottom: "6px" }}>Email *</label>
                                    <input type="email" required value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })}
                                        style={{ width: "100%", padding: "12px 16px", borderRadius: "10px", border: "1px solid #e2e8f0", fontSize: "14px", outline: "none", boxSizing: "border-box" }}
                                        placeholder="you@company.com" />
                                </div>
                                <div>
                                    <label style={{ display: "block", fontSize: "13px", fontWeight: "500", color: "#475569", marginBottom: "6px" }}>Phone (optional)</label>
                                    <input type="tel" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                        style={{ width: "100%", padding: "12px 16px", borderRadius: "10px", border: "1px solid #e2e8f0", fontSize: "14px", outline: "none", boxSizing: "border-box" }}
                                        placeholder="+91 98765 43210" />
                                </div>
                                <div>
                                    <label style={{ display: "block", fontSize: "13px", fontWeight: "500", color: "#475569", marginBottom: "6px" }}>Subject</label>
                                    <select value={formData.subject} onChange={e => setFormData({ ...formData, subject: e.target.value })}
                                        style={{ width: "100%", padding: "12px 16px", borderRadius: "10px", border: "1px solid #e2e8f0", fontSize: "14px", outline: "none", boxSizing: "border-box", backgroundColor: "white" }}>
                                        <option value="general">General Inquiry</option>
                                        <option value="buyer">Buyer Support</option>
                                        <option value="supplier">Supplier Support</option>
                                        <option value="partnership">Partnership</option>
                                        <option value="feedback">Feedback</option>
                                        <option value="bug">Report a Bug</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: "block", fontSize: "13px", fontWeight: "500", color: "#475569", marginBottom: "6px" }}>Message *</label>
                                    <textarea required rows={5} value={formData.message} onChange={e => setFormData({ ...formData, message: e.target.value })}
                                        style={{ width: "100%", padding: "12px 16px", borderRadius: "10px", border: "1px solid #e2e8f0", fontSize: "14px", outline: "none", resize: "vertical", boxSizing: "border-box" }}
                                        placeholder="Tell us how we can help..." />
                                </div>
                                <button type="submit" disabled={loading}
                                    style={{ padding: "14px", backgroundColor: loading ? "#94a3b8" : "#3b82f6", color: "white", border: "none", borderRadius: "10px", fontSize: "15px", fontWeight: "600", cursor: loading ? "not-allowed" : "pointer" }}>
                                    {loading ? "Sending..." : "Send Message"}
                                </button>
                            </form>
                        )}
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h2 style={{ fontSize: "24px", fontWeight: "700", marginBottom: "24px" }}>Other ways to reach us</h2>
                        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                            <div style={{ backgroundColor: "#f8fafc", borderRadius: "16px", padding: "24px" }}>
                                <div style={{ fontSize: "24px", marginBottom: "8px" }}>📧</div>
                                <h3 style={{ fontSize: "16px", fontWeight: "600", marginBottom: "4px" }}>Email</h3>
                                <p style={{ fontSize: "14px", color: "#64748b" }}>support@chidiyaai.com</p>
                            </div>
                            <div style={{ backgroundColor: "#f8fafc", borderRadius: "16px", padding: "24px" }}>
                                <div style={{ fontSize: "24px", marginBottom: "8px" }}>📍</div>
                                <h3 style={{ fontSize: "16px", fontWeight: "600", marginBottom: "4px" }}>Office</h3>
                                <p style={{ fontSize: "14px", color: "#64748b" }}>Noida, Uttar Pradesh, India</p>
                            </div>
                            <div style={{ backgroundColor: "#f8fafc", borderRadius: "16px", padding: "24px" }}>
                                <div style={{ fontSize: "24px", marginBottom: "8px" }}>💬</div>
                                <h3 style={{ fontSize: "16px", fontWeight: "600", marginBottom: "4px" }}>Live Chat</h3>
                                <p style={{ fontSize: "14px", color: "#64748b" }}>Use the Chidiya Helper widget on any page for instant product guidance.</p>
                            </div>
                            <div style={{ backgroundColor: "#f8fafc", borderRadius: "16px", padding: "24px" }}>
                                <div style={{ fontSize: "24px", marginBottom: "8px" }}>⏰</div>
                                <h3 style={{ fontSize: "16px", fontWeight: "600", marginBottom: "4px" }}>Business Hours</h3>
                                <p style={{ fontSize: "14px", color: "#64748b" }}>Monday - Saturday: 9 AM - 7 PM IST</p>
                            </div>
                        </div>
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

"use client";

import Link from "next/link";
import Navbar from "@/app/components/ui/navbar";

const navMenus = [
    { id: 0, title: "Home", url: "/", dropdown: false },
    { id: 1, title: "Features", url: "/#features", dropdown: false },
    { id: 2, title: "Pricing", url: "/#pricing", dropdown: false },
    { id: 3, title: "Reviews", url: "/#testimonials", dropdown: false },
    { id: 4, title: "Sell on ChidiyaAI", url: "/supplier", dropdown: false, highlight: true },
];

export default function HelpCenter() {
    return (
        <>
            <Navbar menus={navMenus} />
            <div style={{ paddingTop: "80px", minHeight: "100vh", backgroundColor: "#f8fafc" }}>
                <div style={{ maxWidth: "800px", margin: "0 auto", padding: "40px 20px" }}>
                    <h1 style={{ fontSize: "32px", fontWeight: "700", color: "#0f172a", marginBottom: "8px" }}>Help Center</h1>
                    <p style={{ color: "#64748b", fontSize: "16px", marginBottom: "40px" }}>
                        Find answers to common questions and get the support you need.
                    </p>

                    {/* Getting Started */}
                    <section style={{ marginBottom: "32px" }}>
                        <h2 style={{ fontSize: "20px", fontWeight: "600", color: "#0f172a", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                            🚀 Getting Started
                        </h2>
                        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                            <HelpCard
                                title="How to Search for Suppliers"
                                description="Use our AI-powered chat to describe what you need. Mention the product, quantity, location, and specifications for best results."
                            />
                            <HelpCard
                                title="Creating Your Account"
                                description="Click 'Get Started' on the homepage. You can sign up with Google or create an account with your email."
                            />
                            <HelpCard
                                title="Understanding Supplier Cards"
                                description="Each supplier card shows company name, location, product categories, badges (verified, GST), match score, and pricing."
                            />
                        </div>
                    </section>

                    {/* For Buyers */}
                    <section style={{ marginBottom: "32px" }}>
                        <h2 style={{ fontSize: "20px", fontWeight: "600", color: "#0f172a", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                            🛒 For Buyers
                        </h2>
                        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                            <HelpCard
                                title="Viewing Supplier Contacts"
                                description="Free users can view up to 3 supplier contacts per day. Subscribe to get unlimited contact views."
                            />
                            <HelpCard
                                title="Using the GST Calculator"
                                description="Click the GST Calculator button in the chat header to calculate GST on any amount with automatic CGST/SGST breakdown."
                            />
                            <HelpCard
                                title="Chat History"
                                description="Your chat conversations are saved automatically. Access them from the chat page to continue previous searches."
                            />
                        </div>
                    </section>

                    {/* For Suppliers */}
                    <section style={{ marginBottom: "32px" }}>
                        <h2 style={{ fontSize: "20px", fontWeight: "600", color: "#0f172a", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                            📦 For Suppliers
                        </h2>
                        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                            <HelpCard
                                title="Registering as a Supplier"
                                description="Go to 'Sell on ChidiyaAI', fill in your business details, products, and submit. Our team will verify and approve your listing."
                            />
                            <HelpCard
                                title="Managing Your Dashboard"
                                description="Track inquiries, update products, view analytics, and manage your profile from the supplier dashboard."
                            />
                        </div>
                    </section>

                    {/* Contact Support */}
                    <section style={{
                        backgroundColor: "#eff6ff",
                        borderRadius: "12px",
                        padding: "24px",
                        textAlign: "center",
                    }}>
                        <h2 style={{ fontSize: "18px", fontWeight: "600", color: "#0f172a", marginBottom: "8px" }}>
                            Still need help?
                        </h2>
                        <p style={{ color: "#64748b", fontSize: "14px", marginBottom: "16px" }}>
                            Our team is here to assist you.
                        </p>
                        <a
                            href="mailto:support@chidiyaai.com"
                            style={{
                                display: "inline-block",
                                padding: "10px 24px",
                                backgroundColor: "#3b82f6",
                                color: "white",
                                borderRadius: "8px",
                                textDecoration: "none",
                                fontWeight: "500",
                                fontSize: "14px",
                            }}
                        >
                            Contact Support
                        </a>
                    </section>
                </div>
            </div>
        </>
    );
}

function HelpCard({ title, description }: { title: string; description: string }) {
    return (
        <div style={{
            backgroundColor: "white",
            border: "1px solid #e2e8f0",
            borderRadius: "10px",
            padding: "16px 20px",
        }}>
            <h3 style={{ fontSize: "15px", fontWeight: "600", color: "#0f172a", marginBottom: "6px" }}>{title}</h3>
            <p style={{ fontSize: "14px", color: "#64748b", margin: 0, lineHeight: "1.5" }}>{description}</p>
        </div>
    );
}

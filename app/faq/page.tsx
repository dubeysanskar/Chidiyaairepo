"use client";

import { useState } from "react";
import Link from "next/link";
import Navbar from "@/app/components/ui/navbar";

const navMenus = [
    { id: 0, title: "Home", url: "/", dropdown: false },
    { id: 1, title: "Features", url: "/#features", dropdown: false },
    { id: 2, title: "Pricing", url: "/#pricing", dropdown: false },
    { id: 3, title: "Reviews", url: "/#testimonials", dropdown: false },
    { id: 4, title: "Sell on ChidiyaAI", url: "/supplier", dropdown: false, highlight: true },
];

const faqs = [
    {
        category: "General",
        questions: [
            {
                q: "What is ChidiyaAI?",
                a: "ChidiyaAI is an AI-powered B2B sourcing platform that helps Indian businesses find verified suppliers. Our smart chatbot understands your requirements and connects you with the most relevant suppliers."
            },
            {
                q: "Is ChidiyaAI free to use?",
                a: "Yes! You can search for suppliers and view up to 3 contacts per day for free. For unlimited access, contact views, and premium features, check our subscription plans."
            },
            {
                q: "How does the AI matching work?",
                a: "Our AI analyzes your product requirements, specifications, location preferences, and budget to find the best-matching suppliers from our verified database."
            },
        ]
    },
    {
        category: "For Buyers",
        questions: [
            {
                q: "How do I find suppliers?",
                a: "Simply type what you need in the chat. For example: 'I need 5000 corrugated boxes in Noida, 5PLY, food-grade'. The AI will understand and show you matching suppliers."
            },
            {
                q: "What does the match score mean?",
                a: "The match score (0-100%) shows how well a supplier matches your requirements based on category, location, badges, and specifications."
            },
            {
                q: "What is MOQ?",
                a: "MOQ stands for Minimum Order Quantity - the smallest amount a supplier will sell. This varies by product and supplier."
            },
            {
                q: "What does GSM mean?",
                a: "GSM (Grams per Square Meter) measures paper or fabric thickness. Higher GSM = thicker/heavier material. For example, regular paper is ~80 GSM, cardboard is ~250-400 GSM."
            },
            {
                q: "What does PLY mean for boxes?",
                a: "PLY refers to the number of layers in corrugated boxes. 3PLY is for light items, 5PLY for medium weight, and 7PLY for heavy items. More PLY = stronger box."
            },
        ]
    },
    {
        category: "For Suppliers",
        questions: [
            {
                q: "How do I register as a supplier?",
                a: "Visit the 'Sell on ChidiyaAI' page, fill in your business details including company name, GST number, products, and MOQ. Our team will verify and approve your listing."
            },
            {
                q: "How long does verification take?",
                a: "Verification typically takes 1-2 business days. You'll receive an email once your profile is approved."
            },
            {
                q: "Can I update my product catalog?",
                a: "Yes! Once approved, you can manage your products, pricing, and business details from your supplier dashboard."
            },
        ]
    },
    {
        category: "Payments & Subscriptions",
        questions: [
            {
                q: "What payment methods are accepted?",
                a: "We accept all major payment methods through Razorpay including UPI, credit/debit cards, net banking, and wallets."
            },
            {
                q: "Can I cancel my subscription?",
                a: "Yes, you can cancel your subscription anytime. Your access will continue until the end of the billing period."
            },
        ]
    },
];

export default function FAQ() {
    const [openItems, setOpenItems] = useState<Record<string, boolean>>({});

    const toggleItem = (key: string) => {
        setOpenItems(prev => ({ ...prev, [key]: !prev[key] }));
    };

    return (
        <>
            <Navbar menus={navMenus} />
            <div style={{ paddingTop: "80px", minHeight: "100vh", backgroundColor: "#f8fafc" }}>
                <div style={{ maxWidth: "800px", margin: "0 auto", padding: "40px 20px" }}>
                    <h1 style={{ fontSize: "32px", fontWeight: "700", color: "#0f172a", marginBottom: "8px" }}>
                        Frequently Asked Questions
                    </h1>
                    <p style={{ color: "#64748b", fontSize: "16px", marginBottom: "40px" }}>
                        Quick answers to common questions about ChidiyaAI.
                    </p>

                    {faqs.map((section) => (
                        <div key={section.category} style={{ marginBottom: "32px" }}>
                            <h2 style={{
                                fontSize: "18px",
                                fontWeight: "600",
                                color: "#0f172a",
                                marginBottom: "16px",
                                paddingBottom: "8px",
                                borderBottom: "2px solid #e2e8f0",
                            }}>
                                {section.category}
                            </h2>
                            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                                {section.questions.map((faq, idx) => {
                                    const key = `${section.category}-${idx}`;
                                    const isOpen = openItems[key];
                                    return (
                                        <div
                                            key={key}
                                            style={{
                                                backgroundColor: "white",
                                                border: "1px solid #e2e8f0",
                                                borderRadius: "10px",
                                                overflow: "hidden",
                                            }}
                                        >
                                            <button
                                                onClick={() => toggleItem(key)}
                                                style={{
                                                    width: "100%",
                                                    padding: "16px 20px",
                                                    background: "none",
                                                    border: "none",
                                                    cursor: "pointer",
                                                    display: "flex",
                                                    justifyContent: "space-between",
                                                    alignItems: "center",
                                                    textAlign: "left",
                                                }}
                                            >
                                                <span style={{ fontSize: "15px", fontWeight: "500", color: "#0f172a" }}>
                                                    {faq.q}
                                                </span>
                                                <span style={{
                                                    fontSize: "18px",
                                                    color: "#64748b",
                                                    transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                                                    transition: "transform 0.2s",
                                                    flexShrink: 0,
                                                    marginLeft: "12px",
                                                }}>
                                                    ▼
                                                </span>
                                            </button>
                                            {isOpen && (
                                                <div style={{
                                                    padding: "0 20px 16px",
                                                    fontSize: "14px",
                                                    color: "#64748b",
                                                    lineHeight: "1.6",
                                                }}>
                                                    {faq.a}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}

                    {/* Still have questions */}
                    <div style={{
                        backgroundColor: "#eff6ff",
                        borderRadius: "12px",
                        padding: "24px",
                        textAlign: "center",
                    }}>
                        <p style={{ fontSize: "15px", color: "#0f172a", fontWeight: "500", marginBottom: "12px" }}>
                            Didn&apos;t find what you were looking for?
                        </p>
                        <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
                            <Link
                                href="/help"
                                style={{
                                    padding: "10px 24px",
                                    backgroundColor: "#3b82f6",
                                    color: "white",
                                    borderRadius: "8px",
                                    textDecoration: "none",
                                    fontWeight: "500",
                                    fontSize: "14px",
                                }}
                            >
                                Visit Help Center
                            </Link>
                            <a
                                href="mailto:support@chidiyaai.com"
                                style={{
                                    padding: "10px 24px",
                                    backgroundColor: "white",
                                    color: "#3b82f6",
                                    borderRadius: "8px",
                                    textDecoration: "none",
                                    fontWeight: "500",
                                    fontSize: "14px",
                                    border: "1px solid #bfdbfe",
                                }}
                            >
                                Email Support
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

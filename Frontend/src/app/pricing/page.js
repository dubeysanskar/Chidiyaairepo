"use client";

import { useState } from "react";
import Link from "next/link";

export default function Pricing() {
    const [isYearly, setIsYearly] = useState(false);

    const plans = [
        {
            name: "Free",
            desc: "For trying out",
            monthlyPrice: 0,
            yearlyPrice: 0,
            features: [
                "10 searches/month",
                "Basic AI matching",
                "Email support",
                "View up to 5 suppliers"
            ],
            cta: "Get Started",
            href: "/onboarding"
        },
        {
            name: "Pro",
            desc: "For growing businesses",
            monthlyPrice: 2999,
            yearlyPrice: 29990,
            popular: true,
            features: [
                "Unlimited searches",
                "Advanced AI matching",
                "Priority support",
                "Supplier verification reports",
                "Price alerts",
                "Direct supplier chat"
            ],
            cta: "Start Free Trial",
            href: "/onboarding?plan=pro"
        },
        {
            name: "Enterprise",
            desc: "For large organizations",
            monthlyPrice: null,
            yearlyPrice: null,
            features: [
                "Everything in Pro",
                "Dedicated account manager",
                "API access",
                "Custom integrations",
                "Bulk operations",
                "SLA guarantee"
            ],
            cta: "Contact Sales",
            href: "/contact"
        }
    ];

    const formatPrice = (price) => {
        if (price === null) return "Custom";
        if (price === 0) return "₹0";
        return `₹${price.toLocaleString('en-IN')}`;
    };

    return (
        <div style={{
            minHeight: "100vh",
            backgroundColor: "#f8fafc",
            fontFamily: "'Inter', system-ui, sans-serif"
        }}>
            {/* Navbar */}
            <nav style={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                zIndex: 100,
                backgroundColor: "rgba(255,255,255,0.95)",
                backdropFilter: "blur(10px)",
                borderBottom: "1px solid #e2e8f0",
                padding: "0 24px",
                height: "64px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between"
            }}>
                <Link href="/" style={{ fontWeight: "bold", fontSize: "20px", color: "#0f172a", textDecoration: "none" }}>
                    Chidiya<span style={{ color: "#3b82f6" }}>AI</span>
                </Link>
                <div style={{ display: "flex", gap: "24px", alignItems: "center" }}>
                    <Link href="/#features" style={{ color: "#64748b", textDecoration: "none", fontSize: "14px" }}>Features</Link>
                    <Link href="/pricing" style={{ color: "#3b82f6", textDecoration: "none", fontSize: "14px", fontWeight: "500" }}>Pricing</Link>
                </div>
                <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                    <Link href="/auth/signin" style={{ color: "#64748b", textDecoration: "none", fontSize: "14px" }}>
                        Sign in
                    </Link>
                    <Link href="/onboarding" style={{
                        backgroundColor: "#0f172a",
                        color: "white",
                        padding: "10px 20px",
                        borderRadius: "8px",
                        textDecoration: "none",
                        fontSize: "14px",
                        fontWeight: "500"
                    }}>
                        Try for free
                    </Link>
                </div>
            </nav>

            {/* Main Content */}
            <main style={{ paddingTop: "120px", paddingBottom: "80px" }}>
                <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 24px" }}>
                    {/* Header */}
                    <div style={{ textAlign: "center", marginBottom: "48px" }}>
                        <h1 style={{ fontSize: "48px", fontWeight: "bold", color: "#0f172a", marginBottom: "16px" }}>
                            Choose the right plan for you
                        </h1>
                        <p style={{ fontSize: "20px", color: "#64748b", marginBottom: "32px" }}>
                            Start free, scale as you grow. All plans include core features.
                        </p>

                        {/* Monthly/Yearly Toggle */}
                        <div style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "12px",
                            backgroundColor: "white",
                            padding: "6px",
                            borderRadius: "12px",
                            border: "1px solid #e2e8f0"
                        }}>
                            <button
                                onClick={() => setIsYearly(false)}
                                style={{
                                    padding: "12px 24px",
                                    borderRadius: "8px",
                                    border: "none",
                                    backgroundColor: !isYearly ? "#0f172a" : "transparent",
                                    color: !isYearly ? "white" : "#64748b",
                                    fontSize: "14px",
                                    fontWeight: "500",
                                    cursor: "pointer",
                                    transition: "all 0.2s ease"
                                }}
                            >
                                Monthly
                            </button>
                            <button
                                onClick={() => setIsYearly(true)}
                                style={{
                                    padding: "12px 24px",
                                    borderRadius: "8px",
                                    border: "none",
                                    backgroundColor: isYearly ? "#0f172a" : "transparent",
                                    color: isYearly ? "white" : "#64748b",
                                    fontSize: "14px",
                                    fontWeight: "500",
                                    cursor: "pointer",
                                    transition: "all 0.2s ease"
                                }}
                            >
                                Yearly
                                <span style={{
                                    marginLeft: "8px",
                                    padding: "2px 8px",
                                    backgroundColor: "#22c55e",
                                    color: "white",
                                    borderRadius: "10px",
                                    fontSize: "11px"
                                }}>
                                    Save 17%
                                </span>
                            </button>
                        </div>
                    </div>

                    {/* Pricing Cards */}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "24px" }}>
                        {plans.map((plan, index) => (
                            <div
                                key={index}
                                style={{
                                    backgroundColor: plan.popular ? "#0f172a" : "white",
                                    borderRadius: "20px",
                                    padding: "40px 32px",
                                    border: plan.popular ? "none" : "1px solid #e2e8f0",
                                    color: plan.popular ? "white" : "#0f172a",
                                    position: "relative",
                                    transform: plan.popular ? "scale(1.05)" : "none",
                                    boxShadow: plan.popular ? "0 20px 60px rgba(0,0,0,0.2)" : "none"
                                }}
                            >
                                {plan.popular && (
                                    <div style={{
                                        position: "absolute",
                                        top: "-12px",
                                        left: "50%",
                                        transform: "translateX(-50%)",
                                        padding: "6px 16px",
                                        backgroundColor: "#3b82f6",
                                        color: "white",
                                        borderRadius: "20px",
                                        fontSize: "13px",
                                        fontWeight: "500"
                                    }}>
                                        Most Popular
                                    </div>
                                )}

                                <h3 style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "4px" }}>
                                    {plan.name}
                                </h3>
                                <p style={{
                                    fontSize: "14px",
                                    color: plan.popular ? "#94a3b8" : "#64748b",
                                    marginBottom: "24px"
                                }}>
                                    {plan.desc}
                                </p>

                                <div style={{ marginBottom: "32px" }}>
                                    <span style={{ fontSize: "48px", fontWeight: "bold" }}>
                                        {formatPrice(isYearly ? plan.yearlyPrice : plan.monthlyPrice)}
                                    </span>
                                    {plan.monthlyPrice !== null && plan.monthlyPrice > 0 && (
                                        <span style={{
                                            fontSize: "16px",
                                            color: plan.popular ? "#94a3b8" : "#64748b"
                                        }}>
                                            /{isYearly ? "year" : "month"}
                                        </span>
                                    )}
                                </div>

                                <ul style={{ listStyle: "none", padding: 0, marginBottom: "32px" }}>
                                    {plan.features.map((feature, i) => (
                                        <li key={i} style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "12px",
                                            padding: "10px 0",
                                            fontSize: "15px",
                                            color: plan.popular ? "#e2e8f0" : "#475569"
                                        }}>
                                            <span style={{ color: plan.popular ? "#60a5fa" : "#22c55e" }}>✓</span>
                                            {feature}
                                        </li>
                                    ))}
                                </ul>

                                <Link
                                    href={plan.href}
                                    style={{
                                        display: "block",
                                        textAlign: "center",
                                        padding: "16px",
                                        backgroundColor: plan.popular ? "white" : "#0f172a",
                                        color: plan.popular ? "#0f172a" : "white",
                                        borderRadius: "10px",
                                        textDecoration: "none",
                                        fontWeight: "600",
                                        fontSize: "16px"
                                    }}
                                >
                                    {plan.cta}
                                </Link>
                            </div>
                        ))}
                    </div>

                    {/* FAQ Section */}
                    <div style={{ marginTop: "80px", textAlign: "center" }}>
                        <h2 style={{ fontSize: "32px", fontWeight: "bold", color: "#0f172a", marginBottom: "16px" }}>
                            Frequently Asked Questions
                        </h2>
                        <p style={{ color: "#64748b", marginBottom: "40px" }}>
                            Have questions? We've got answers.
                        </p>

                        <div style={{ maxWidth: "700px", margin: "0 auto", textAlign: "left" }}>
                            {[
                                { q: "Can I change plans later?", a: "Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately." },
                                { q: "What payment methods do you accept?", a: "We accept all major credit cards, debit cards, UPI, and net banking for Indian customers." },
                                { q: "Is there a free trial?", a: "Yes! The Pro plan comes with a 14-day free trial. No credit card required." },
                                { q: "What happens after my trial ends?", a: "You'll be automatically moved to the Free plan unless you choose to upgrade." }
                            ].map((faq, i) => (
                                <div key={i} style={{
                                    backgroundColor: "white",
                                    borderRadius: "12px",
                                    padding: "24px",
                                    marginBottom: "16px",
                                    border: "1px solid #e2e8f0"
                                }}>
                                    <h4 style={{ fontSize: "16px", fontWeight: "600", color: "#0f172a", marginBottom: "8px" }}>
                                        {faq.q}
                                    </h4>
                                    <p style={{ fontSize: "14px", color: "#64748b", margin: 0, lineHeight: "1.6" }}>
                                        {faq.a}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer style={{ padding: "40px 24px", backgroundColor: "#0f172a", textAlign: "center" }}>
                <div style={{ color: "#64748b", fontSize: "14px" }}>
                    © 2025 ChidiyaAI. All rights reserved.
                </div>
            </footer>
        </div>
    );
}

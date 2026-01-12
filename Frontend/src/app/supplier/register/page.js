"use client";

import { useState } from "react";
import Link from "next/link";

export default function SupplierRegister() {
    const [formData, setFormData] = useState({
        companyName: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
        productCategories: [],
        capacity: "",
        moq: "",
        serviceLocations: "",
    });
    const [step, setStep] = useState(1);

    const categories = [
        "Textiles & Fabrics",
        "Electronics",
        "Machinery & Equipment",
        "Packaging Materials",
        "Chemicals",
        "Food & Beverages",
        "Metals & Minerals",
        "Plastics",
        "Other"
    ];

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleCategoryToggle = (cat) => {
        const current = formData.productCategories;
        if (current.includes(cat)) {
            setFormData({ ...formData, productCategories: current.filter(c => c !== cat) });
        } else {
            setFormData({ ...formData, productCategories: [...current, cat] });
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // After registration, redirect to KYC
        window.location.href = "/supplier/verify";
    };

    return (
        <div style={{
            minHeight: "100vh",
            backgroundColor: "#f8fafc",
            fontFamily: "'Inter', system-ui, sans-serif"
        }}>
            {/* Header */}
            <header style={{ padding: "20px 24px", backgroundColor: "white", borderBottom: "1px solid #e2e8f0" }}>
                <div style={{ maxWidth: "600px", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Link href="/supplier" style={{ fontWeight: "bold", fontSize: "20px", color: "#0f172a", textDecoration: "none" }}>
                        Chidiya<span style={{ color: "#3b82f6" }}>AI</span>
                    </Link>
                    <Link href="/supplier/login" style={{ fontSize: "14px", color: "#64748b", textDecoration: "none" }}>
                        Already registered? Sign in
                    </Link>
                </div>
            </header>

            {/* Progress */}
            <div style={{ backgroundColor: "#e2e8f0", height: "4px" }}>
                <div style={{ width: `${(step / 2) * 100}%`, height: "100%", backgroundColor: "#3b82f6", transition: "width 0.3s" }} />
            </div>

            {/* Form */}
            <main style={{ maxWidth: "600px", margin: "0 auto", padding: "48px 24px" }}>
                <div style={{ textAlign: "center", marginBottom: "40px" }}>
                    <h1 style={{ fontSize: "28px", fontWeight: "bold", color: "#0f172a", marginBottom: "8px" }}>
                        Become a Supplier at ChidiyaAI
                    </h1>
                    <p style={{ color: "#64748b" }}>Step {step} of 2</p>
                </div>

                <form onSubmit={handleSubmit}>
                    {step === 1 && (
                        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                            <div>
                                <label style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#0f172a", marginBottom: "6px" }}>
                                    Company Name *
                                </label>
                                <input
                                    type="text"
                                    name="companyName"
                                    value={formData.companyName}
                                    onChange={handleChange}
                                    required
                                    placeholder="Your Company Pvt. Ltd."
                                    style={{
                                        width: "100%",
                                        padding: "12px",
                                        border: "1px solid #e2e8f0",
                                        borderRadius: "8px",
                                        fontSize: "14px",
                                        boxSizing: "border-box"
                                    }}
                                />
                            </div>

                            <div>
                                <label style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#0f172a", marginBottom: "6px" }}>
                                    Business Email *
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    placeholder="contact@yourcompany.com"
                                    style={{
                                        width: "100%",
                                        padding: "12px",
                                        border: "1px solid #e2e8f0",
                                        borderRadius: "8px",
                                        fontSize: "14px",
                                        boxSizing: "border-box"
                                    }}
                                />
                            </div>

                            <div>
                                <label style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#0f172a", marginBottom: "6px" }}>
                                    Phone Number *
                                </label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    required
                                    placeholder="+91 98765 43210"
                                    style={{
                                        width: "100%",
                                        padding: "12px",
                                        border: "1px solid #e2e8f0",
                                        borderRadius: "8px",
                                        fontSize: "14px",
                                        boxSizing: "border-box"
                                    }}
                                />
                            </div>

                            <div>
                                <label style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#0f172a", marginBottom: "6px" }}>
                                    Password *
                                </label>
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    placeholder="••••••••"
                                    style={{
                                        width: "100%",
                                        padding: "12px",
                                        border: "1px solid #e2e8f0",
                                        borderRadius: "8px",
                                        fontSize: "14px",
                                        boxSizing: "border-box"
                                    }}
                                />
                            </div>

                            <button
                                type="button"
                                onClick={() => setStep(2)}
                                disabled={!formData.companyName || !formData.email || !formData.phone || !formData.password}
                                style={{
                                    width: "100%",
                                    padding: "14px",
                                    backgroundColor: formData.companyName && formData.email && formData.phone && formData.password ? "#0f172a" : "#e2e8f0",
                                    color: formData.companyName && formData.email && formData.phone && formData.password ? "white" : "#94a3b8",
                                    border: "none",
                                    borderRadius: "8px",
                                    fontSize: "16px",
                                    fontWeight: "500",
                                    cursor: formData.companyName && formData.email && formData.phone && formData.password ? "pointer" : "not-allowed",
                                    marginTop: "12px"
                                }}
                            >
                                Continue
                            </button>
                        </div>
                    )}

                    {step === 2 && (
                        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                            <div>
                                <label style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#0f172a", marginBottom: "12px" }}>
                                    Product Categories *
                                </label>
                                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                                    {categories.map((cat) => (
                                        <button
                                            key={cat}
                                            type="button"
                                            onClick={() => handleCategoryToggle(cat)}
                                            style={{
                                                padding: "8px 16px",
                                                borderRadius: "20px",
                                                border: formData.productCategories.includes(cat) ? "2px solid #3b82f6" : "1px solid #e2e8f0",
                                                backgroundColor: formData.productCategories.includes(cat) ? "#eff6ff" : "white",
                                                color: formData.productCategories.includes(cat) ? "#3b82f6" : "#64748b",
                                                fontSize: "13px",
                                                cursor: "pointer"
                                            }}
                                        >
                                            {cat}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#0f172a", marginBottom: "6px" }}>
                                    Monthly Capacity
                                </label>
                                <select
                                    name="capacity"
                                    value={formData.capacity}
                                    onChange={handleChange}
                                    style={{
                                        width: "100%",
                                        padding: "12px",
                                        border: "1px solid #e2e8f0",
                                        borderRadius: "8px",
                                        fontSize: "14px",
                                        backgroundColor: "white"
                                    }}
                                >
                                    <option value="">Select capacity</option>
                                    <option value="small">Up to ₹5 Lakh</option>
                                    <option value="medium">₹5 Lakh - ₹25 Lakh</option>
                                    <option value="large">₹25 Lakh - ₹1 Crore</option>
                                    <option value="enterprise">₹1 Crore+</option>
                                </select>
                            </div>

                            <div>
                                <label style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#0f172a", marginBottom: "6px" }}>
                                    Minimum Order Quantity (MOQ)
                                </label>
                                <input
                                    type="text"
                                    name="moq"
                                    value={formData.moq}
                                    onChange={handleChange}
                                    placeholder="e.g., 100 units, ₹10,000"
                                    style={{
                                        width: "100%",
                                        padding: "12px",
                                        border: "1px solid #e2e8f0",
                                        borderRadius: "8px",
                                        fontSize: "14px",
                                        boxSizing: "border-box"
                                    }}
                                />
                            </div>

                            <div>
                                <label style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#0f172a", marginBottom: "6px" }}>
                                    Service Locations
                                </label>
                                <input
                                    type="text"
                                    name="serviceLocations"
                                    value={formData.serviceLocations}
                                    onChange={handleChange}
                                    placeholder="e.g., Delhi NCR, Mumbai, Pan India"
                                    style={{
                                        width: "100%",
                                        padding: "12px",
                                        border: "1px solid #e2e8f0",
                                        borderRadius: "8px",
                                        fontSize: "14px",
                                        boxSizing: "border-box"
                                    }}
                                />
                            </div>

                            <div style={{ display: "flex", gap: "12px", marginTop: "12px" }}>
                                <button
                                    type="button"
                                    onClick={() => setStep(1)}
                                    style={{
                                        flex: 1,
                                        padding: "14px",
                                        backgroundColor: "white",
                                        border: "1px solid #e2e8f0",
                                        borderRadius: "8px",
                                        fontSize: "16px",
                                        fontWeight: "500",
                                        cursor: "pointer"
                                    }}
                                >
                                    Back
                                </button>
                                <button
                                    type="submit"
                                    disabled={formData.productCategories.length === 0}
                                    style={{
                                        flex: 1,
                                        padding: "14px",
                                        backgroundColor: formData.productCategories.length > 0 ? "#0f172a" : "#e2e8f0",
                                        color: formData.productCategories.length > 0 ? "white" : "#94a3b8",
                                        border: "none",
                                        borderRadius: "8px",
                                        fontSize: "16px",
                                        fontWeight: "500",
                                        cursor: formData.productCategories.length > 0 ? "pointer" : "not-allowed"
                                    }}
                                >
                                    Continue to KYC
                                </button>
                            </div>
                        </div>
                    )}
                </form>
            </main>
        </div>
    );
}

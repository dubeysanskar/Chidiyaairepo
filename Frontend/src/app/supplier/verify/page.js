"use client";

import { useState } from "react";
import Link from "next/link";

export default function SupplierKYC() {
    const [formData, setFormData] = useState({
        gstNumber: "",
        panNumber: "",
        iecNumber: "",
        industry: "",
        otherLicenses: ""
    });
    const [files, setFiles] = useState({
        gstCertificate: null,
        panCard: null,
        iecCertificate: null,
        industryLicense: null
    });
    const [submitted, setSubmitted] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        setFiles({ ...files, [e.target.name]: e.target.files[0] });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setSubmitted(true);
        // In production, upload to backend
        setTimeout(() => {
            window.location.href = "/supplier/dashboard";
        }, 3000);
    };

    if (submitted) {
        return (
            <div style={{
                minHeight: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "#f8fafc",
                fontFamily: "'Inter', system-ui, sans-serif"
            }}>
                <div style={{ textAlign: "center", maxWidth: "400px", padding: "40px" }}>
                    <div style={{
                        width: "80px",
                        height: "80px",
                        borderRadius: "50%",
                        backgroundColor: "#dcfce7",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        margin: "0 auto 24px",
                        fontSize: "32px"
                    }}>✓</div>
                    <h1 style={{ fontSize: "24px", fontWeight: "bold", color: "#0f172a", marginBottom: "12px" }}>
                        KYC Submitted Successfully
                    </h1>
                    <p style={{ color: "#64748b", marginBottom: "24px" }}>
                        Your verification documents have been submitted. Our team will review them within 24-48 hours.
                    </p>
                    <p style={{ color: "#94a3b8", fontSize: "14px" }}>
                        Redirecting to dashboard...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div style={{
            minHeight: "100vh",
            backgroundColor: "#f8fafc",
            fontFamily: "'Inter', system-ui, sans-serif"
        }}>
            {/* Header */}
            <header style={{ padding: "20px 24px", backgroundColor: "white", borderBottom: "1px solid #e2e8f0" }}>
                <div style={{ maxWidth: "700px", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Link href="/supplier" style={{ fontWeight: "bold", fontSize: "20px", color: "#0f172a", textDecoration: "none" }}>
                        Chidiya<span style={{ color: "#3b82f6" }}>AI</span>
                    </Link>
                </div>
            </header>

            {/* Form */}
            <main style={{ maxWidth: "700px", margin: "0 auto", padding: "48px 24px" }}>
                <div style={{ textAlign: "center", marginBottom: "40px" }}>
                    <span style={{
                        display: "inline-block",
                        padding: "6px 16px",
                        backgroundColor: "#fef3c7",
                        color: "#b45309",
                        borderRadius: "20px",
                        fontSize: "13px",
                        marginBottom: "16px"
                    }}>
                        Verification Required
                    </span>
                    <h1 style={{ fontSize: "28px", fontWeight: "bold", color: "#0f172a", marginBottom: "8px" }}>
                        Complete KYC Verification
                    </h1>
                    <p style={{ color: "#64748b" }}>
                        Submit your documents to become a verified supplier
                    </p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div style={{ backgroundColor: "white", borderRadius: "16px", padding: "32px", marginBottom: "24px" }}>
                        <h2 style={{ fontSize: "18px", fontWeight: "600", color: "#0f172a", marginBottom: "24px" }}>
                            GST Details (Mandatory)
                        </h2>

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                            <div>
                                <label style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#0f172a", marginBottom: "6px" }}>
                                    GST Number *
                                </label>
                                <input
                                    type="text"
                                    name="gstNumber"
                                    value={formData.gstNumber}
                                    onChange={handleChange}
                                    placeholder="22AAAAA0000A1Z5"
                                    required
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
                                    GST Certificate *
                                </label>
                                <input
                                    type="file"
                                    name="gstCertificate"
                                    onChange={handleFileChange}
                                    accept=".pdf,.jpg,.png"
                                    required
                                    style={{
                                        width: "100%",
                                        padding: "10px",
                                        border: "1px solid #e2e8f0",
                                        borderRadius: "8px",
                                        fontSize: "14px",
                                        boxSizing: "border-box"
                                    }}
                                />
                            </div>
                        </div>
                    </div>

                    <div style={{ backgroundColor: "white", borderRadius: "16px", padding: "32px", marginBottom: "24px" }}>
                        <h2 style={{ fontSize: "18px", fontWeight: "600", color: "#0f172a", marginBottom: "24px" }}>
                            PAN Details (Mandatory)
                        </h2>

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                            <div>
                                <label style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#0f172a", marginBottom: "6px" }}>
                                    PAN Number *
                                </label>
                                <input
                                    type="text"
                                    name="panNumber"
                                    value={formData.panNumber}
                                    onChange={handleChange}
                                    placeholder="ABCDE1234F"
                                    required
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
                                    PAN Card *
                                </label>
                                <input
                                    type="file"
                                    name="panCard"
                                    onChange={handleFileChange}
                                    accept=".pdf,.jpg,.png"
                                    required
                                    style={{
                                        width: "100%",
                                        padding: "10px",
                                        border: "1px solid #e2e8f0",
                                        borderRadius: "8px",
                                        fontSize: "14px",
                                        boxSizing: "border-box"
                                    }}
                                />
                            </div>
                        </div>
                    </div>

                    <div style={{ backgroundColor: "white", borderRadius: "16px", padding: "32px", marginBottom: "24px" }}>
                        <h2 style={{ fontSize: "18px", fontWeight: "600", color: "#0f172a", marginBottom: "24px" }}>
                            IEC (If applicable for exporters)
                        </h2>

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                            <div>
                                <label style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#0f172a", marginBottom: "6px" }}>
                                    IEC Number
                                </label>
                                <input
                                    type="text"
                                    name="iecNumber"
                                    value={formData.iecNumber}
                                    onChange={handleChange}
                                    placeholder="0123456789"
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
                                    IEC Certificate
                                </label>
                                <input
                                    type="file"
                                    name="iecCertificate"
                                    onChange={handleFileChange}
                                    accept=".pdf,.jpg,.png"
                                    style={{
                                        width: "100%",
                                        padding: "10px",
                                        border: "1px solid #e2e8f0",
                                        borderRadius: "8px",
                                        fontSize: "14px",
                                        boxSizing: "border-box"
                                    }}
                                />
                            </div>
                        </div>
                    </div>

                    <div style={{ backgroundColor: "white", borderRadius: "16px", padding: "32px", marginBottom: "24px" }}>
                        <h2 style={{ fontSize: "18px", fontWeight: "600", color: "#0f172a", marginBottom: "24px" }}>
                            Industry-Specific Licenses
                        </h2>

                        <div style={{ marginBottom: "16px" }}>
                            <label style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#0f172a", marginBottom: "6px" }}>
                                Select Industry
                            </label>
                            <select
                                name="industry"
                                value={formData.industry}
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
                                <option value="">Select if applicable</option>
                                <option value="food">Food & Beverages (FSSAI)</option>
                                <option value="pharma">Pharmaceuticals (Drug License)</option>
                                <option value="chemicals">Chemicals (Pollution Control)</option>
                                <option value="other">Other</option>
                            </select>
                        </div>

                        <div>
                            <label style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#0f172a", marginBottom: "6px" }}>
                                Upload License (if any)
                            </label>
                            <input
                                type="file"
                                name="industryLicense"
                                onChange={handleFileChange}
                                accept=".pdf,.jpg,.png"
                                style={{
                                    width: "100%",
                                    padding: "10px",
                                    border: "1px solid #e2e8f0",
                                    borderRadius: "8px",
                                    fontSize: "14px",
                                    boxSizing: "border-box"
                                }}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={!formData.gstNumber || !formData.panNumber}
                        style={{
                            width: "100%",
                            padding: "16px",
                            backgroundColor: formData.gstNumber && formData.panNumber ? "#0f172a" : "#e2e8f0",
                            color: formData.gstNumber && formData.panNumber ? "white" : "#94a3b8",
                            border: "none",
                            borderRadius: "8px",
                            fontSize: "16px",
                            fontWeight: "500",
                            cursor: formData.gstNumber && formData.panNumber ? "pointer" : "not-allowed"
                        }}
                    >
                        Submit for Verification
                    </button>

                    <p style={{ textAlign: "center", marginTop: "16px", fontSize: "13px", color: "#64748b" }}>
                        By submitting, you agree to our <Link href="/terms" style={{ color: "#3b82f6" }}>Terms</Link> and <Link href="/privacy" style={{ color: "#3b82f6" }}>Privacy Policy</Link>
                    </p>
                </form>
            </main>
        </div>
    );
}

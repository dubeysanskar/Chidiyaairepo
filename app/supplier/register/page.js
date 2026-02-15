"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function SupplierRegister() {
    // ---- State ----
    const [step, setStep] = useState(1);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    // Step 1 — Account Info
    const [formData, setFormData] = useState({
        companyName: "",
        email: "",
        phone: "",
        password: "",
    });
    const [showPassword, setShowPassword] = useState(false);

    // Step 2 — Business Details
    const [location, setLocation] = useState("");
    const [otherLocation, setOtherLocation] = useState("");
    const [categoryId, setCategoryId] = useState("");
    const [otherCategory, setOtherCategory] = useState("");
    const [categoryDescription, setCategoryDescription] = useState("");
    const [categoryTemplates, setCategoryTemplates] = useState([]);
    const [loadingCategories, setLoadingCategories] = useState(true);

    // Step 3 — Documents
    const [docData, setDocData] = useState({
        panNumber: "",
        gstNumber: "",
        iecNumber: "",
        industry: "",
    });
    const [files, setFiles] = useState({
        panCard: null,
        gstCertificate: null,
        catalog: null,
        iecCertificate: null,
        industryLicense: null,
    });
    const [uploadProgress, setUploadProgress] = useState({});

    const locationOptions = [
        "Pan India", "Delhi NCR", "Mumbai", "Bangalore", "Chennai",
        "Kolkata", "Hyderabad", "Pune", "Ahmedabad", "Jaipur",
        "Lucknow", "Noida", "Gurugram", "North India", "South India",
        "West India", "East India", "Other",
    ];

    const industryOptions = [
        "Packaging", "Food & Beverage", "Textiles", "Pharmaceuticals",
        "Electronics", "Construction", "Automotive", "Chemicals", "Other",
    ];

    // Fetch categories on mount
    useEffect(() => {
        async function fetchCategories() {
            try {
                const res = await fetch("/api/categories/templates");
                if (res.ok) {
                    const data = await res.json();
                    setCategoryTemplates(data.categories || []);
                }
            } catch (err) {
                console.error("Failed to fetch categories:", err);
            } finally {
                setLoadingCategories(false);
            }
        }
        fetchCategories();
    }, []);

    // ---- Handlers ----
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // File upload helper
    const uploadFile = async (file) => {
        const formDataObj = new FormData();
        formDataObj.append("file", file);
        const res = await fetch("/api/upload", { method: "POST", body: formDataObj });
        const data = await res.json();
        if (data.url) return data.url;
        throw new Error("Upload failed");
    };

    const handleFileChange = (field) => (e) => {
        const file = e.target.files?.[0];
        if (file) {
            setFiles(prev => ({ ...prev, [field]: file }));
        }
    };

    // Step navigation
    const handleStep1Continue = () => {
        if (!formData.companyName || !formData.email || !formData.phone || !formData.password) {
            setError("Please fill all required fields");
            return;
        }
        if (formData.password.length < 6) {
            setError("Password must be at least 6 characters");
            return;
        }
        setError("");
        setStep(2);
    };

    const handleStep2Continue = () => {
        const loc = location === "Other" ? otherLocation : location;
        const cat = categoryId === "other" ? otherCategory : categoryId;
        if (!loc || !cat || !categoryDescription) {
            setError("Please fill all required fields");
            return;
        }
        setError("");
        setStep(3);
    };

    // Register account
    const registerAccount = async () => {
        const loc = location === "Other" ? otherLocation : location;
        const catId = categoryId === "other" ? "" : categoryId;

        const res = await fetch("/api/supplier/auth", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                action: "register",
                companyName: formData.companyName,
                email: formData.email,
                phone: formData.phone,
                password: formData.password,
                location: loc,
                categoryId: catId,
                categoryDescription,
            }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Registration failed");
        return data;
    };

    // Final submit — Step 3
    const handleFinalSubmit = async (e) => {
        e.preventDefault();

        if (!docData.panNumber) {
            setError("PAN number is required");
            return;
        }
        if (!files.panCard) {
            setError("PAN card upload is required");
            return;
        }
        if (!docData.gstNumber) {
            setError("GST number is required");
            return;
        }
        if (!files.gstCertificate) {
            setError("GST certificate upload is required");
            return;
        }

        setLoading(true);
        setError("");

        try {
            // 1. Register
            await registerAccount();

            // 2. Upload files
            const uploadedDocs = [];
            for (const [key, file] of Object.entries(files)) {
                if (file) {
                    setUploadProgress(prev => ({ ...prev, [key]: "uploading" }));
                    try {
                        const url = await uploadFile(file);
                        uploadedDocs.push({ docType: key, fileName: file.name, fileUrl: url });
                        setUploadProgress(prev => ({ ...prev, [key]: "done" }));
                    } catch {
                        setUploadProgress(prev => ({ ...prev, [key]: "failed" }));
                        throw new Error(`Failed to upload ${file.name}`);
                    }
                }
            }

            // 3. Submit document metadata
            if (uploadedDocs.length > 0) {
                const docRes = await fetch("/api/supplier/documents", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        panNumber: docData.panNumber,
                        gstNumber: docData.gstNumber || null,
                        iecNumber: docData.iecNumber || null,
                        industry: docData.industry || null,
                        documents: uploadedDocs,
                    }),
                });
                const docResult = await docRes.json();
                if (!docRes.ok) throw new Error(docResult.error || "Document submission failed");
            }

            // 4. Redirect to pending page — admin will review
            window.location.href = "/supplier/pending";

        } catch (err) {
            setError(err.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    // ---- Styles ----
    const inputStyle = {
        width: "100%", padding: "12px 14px", border: "1px solid #e2e8f0",
        borderRadius: "10px", fontSize: "14px", outline: "none", backgroundColor: "#f8fafc",
        transition: "border-color 0.2s", boxSizing: "border-box",
    };
    const labelStyle = { display: "block", fontSize: "13px", fontWeight: "600", color: "#334155", marginBottom: "6px" };
    const btnPrimary = {
        padding: "14px 32px", backgroundColor: "#0f172a", color: "white",
        border: "none", borderRadius: "10px", fontWeight: "600", fontSize: "15px",
        cursor: "pointer", transition: "background 0.2s",
    };

    return (
        <div style={{ minHeight: "100vh", backgroundColor: "#f8fafc", fontFamily: "'Inter', system-ui, sans-serif" }}>
            {/* Header */}
            <header style={{ padding: "16px 24px", backgroundColor: "white", borderBottom: "1px solid #e2e8f0" }}>
                <div style={{ maxWidth: "600px", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Link href="/supplier" style={{ fontWeight: "bold", fontSize: "20px", color: "#0f172a", textDecoration: "none" }}>
                        Chidiya<span style={{ color: "#3b82f6" }}>AI</span>
                    </Link>
                    <Link href="/supplier/login" style={{ fontSize: "14px", color: "#3b82f6", textDecoration: "none" }}>
                        Already registered? Login
                    </Link>
                </div>
            </header>

            {/* Progress Steps */}
            <div style={{ maxWidth: "600px", margin: "0 auto", padding: "32px 24px 0" }}>
                <div style={{ display: "flex", gap: "8px", marginBottom: "32px" }}>
                    {[1, 2, 3].map(s => (
                        <div key={s} style={{
                            flex: 1, height: "4px", borderRadius: "4px",
                            backgroundColor: s <= step ? "#0f172a" : "#e2e8f0",
                            transition: "background-color 0.3s",
                        }} />
                    ))}
                </div>

                {/* Step Labels */}
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "24px" }}>
                    {["Account Info", "Business Details", "Documents"].map((label, i) => (
                        <span key={i} style={{
                            fontSize: "12px", fontWeight: i + 1 <= step ? "600" : "400",
                            color: i + 1 <= step ? "#0f172a" : "#94a3b8",
                        }}>{label}</span>
                    ))}
                </div>
            </div>

            {/* Form */}
            <div style={{ maxWidth: "600px", margin: "0 auto", padding: "0 24px 60px" }}>

                {error && (
                    <div style={{
                        padding: "12px 16px", backgroundColor: "#fef2f2", border: "1px solid #fecaca",
                        color: "#dc2626", borderRadius: "10px", fontSize: "13px", marginBottom: "20px",
                    }}>⚠️ {error}</div>
                )}

                {/* ========================= STEP 1: ACCOUNT INFO ========================= */}
                {step === 1 && (
                    <div>
                        <h2 style={{ fontSize: "22px", fontWeight: "700", color: "#0f172a", marginBottom: "8px" }}>
                            Create Your Account
                        </h2>
                        <p style={{ color: "#64748b", fontSize: "14px", marginBottom: "28px" }}>
                            Enter your business information to get started
                        </p>

                        <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
                            <div>
                                <label style={labelStyle}>Company Name *</label>
                                <input type="text" name="companyName" value={formData.companyName}
                                    onChange={handleChange} placeholder="Your company name"
                                    style={inputStyle} />
                            </div>
                            <div>
                                <label style={labelStyle}>Business Email *</label>
                                <input type="email" name="email" value={formData.email}
                                    onChange={handleChange} placeholder="company@example.com"
                                    style={inputStyle} />
                            </div>
                            <div>
                                <label style={labelStyle}>Phone Number *</label>
                                <input type="tel" name="phone" value={formData.phone}
                                    onChange={handleChange} placeholder="+91 XXXXX XXXXX"
                                    style={inputStyle} />
                            </div>
                            <div>
                                <label style={labelStyle}>Password *</label>
                                <div style={{ position: "relative" }}>
                                    <input type={showPassword ? "text" : "password"} name="password"
                                        value={formData.password} onChange={handleChange}
                                        placeholder="Minimum 6 characters" style={inputStyle} />
                                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                                        style={{
                                            position: "absolute", right: "12px", top: "50%",
                                            transform: "translateY(-50%)", background: "none",
                                            border: "none", cursor: "pointer", fontSize: "14px", color: "#64748b",
                                        }}>
                                        {showPassword ? (
                                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                                                <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                                                <line x1="1" y1="1" x2="23" y2="23" />
                                            </svg>
                                        ) : (
                                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                                <circle cx="12" cy="12" r="3" />
                                            </svg>
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* GST Coming Soon Banner */}
                            <div style={{
                                padding: "16px 20px", backgroundColor: "#f0f9ff",
                                border: "1px solid #bae6fd", borderRadius: "12px",
                                display: "flex", alignItems: "center", gap: "12px",
                            }}>
                                <span style={{ fontSize: "24px" }}>🏷️</span>
                                <div>
                                    <div style={{ fontSize: "14px", fontWeight: "600", color: "#0c4a6e" }}>
                                        GST Verification — Coming Soon
                                    </div>
                                    <div style={{ fontSize: "12px", color: "#0369a1", marginTop: "2px" }}>
                                        Automatic GSTIN verification and business profile fetching will be available soon.
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div style={{ marginTop: "28px", display: "flex", justifyContent: "flex-end" }}>
                            <button type="button" onClick={handleStep1Continue} style={btnPrimary}>
                                Continue →
                            </button>
                        </div>
                    </div>
                )}

                {/* ========================= STEP 2: BUSINESS DETAILS ========================= */}
                {step === 2 && (
                    <div>
                        <h2 style={{ fontSize: "22px", fontWeight: "700", color: "#0f172a", marginBottom: "8px" }}>
                            Business Details
                        </h2>
                        <p style={{ color: "#64748b", fontSize: "14px", marginBottom: "28px" }}>
                            Tell us more about your business
                        </p>

                        <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
                            <div>
                                <label style={labelStyle}>Business Location *</label>
                                <select value={location} onChange={e => setLocation(e.target.value)}
                                    style={inputStyle}>
                                    <option value="">Select location</option>
                                    {locationOptions.map(l => <option key={l} value={l}>{l}</option>)}
                                </select>
                                {location === "Other" && (
                                    <input type="text" value={otherLocation}
                                        onChange={e => setOtherLocation(e.target.value)}
                                        placeholder="Enter your location"
                                        style={{ ...inputStyle, marginTop: "8px" }} />
                                )}
                            </div>

                            <div>
                                <label style={labelStyle}>Primary Product Category *</label>
                                {loadingCategories ? (
                                    <div style={{ padding: "12px", color: "#64748b", fontSize: "13px" }}>Loading categories...</div>
                                ) : (
                                    <select value={categoryId} onChange={e => setCategoryId(e.target.value)}
                                        style={inputStyle}>
                                        <option value="">Select category</option>
                                        {categoryTemplates.map(c => (
                                            <option key={c.id} value={c.id}>{c.name}</option>
                                        ))}
                                        <option value="other">Other (specify below)</option>
                                    </select>
                                )}
                                {categoryId === "other" && (
                                    <input type="text" value={otherCategory}
                                        onChange={e => setOtherCategory(e.target.value)}
                                        placeholder="Enter your category"
                                        style={{ ...inputStyle, marginTop: "8px" }} />
                                )}
                            </div>

                            <div>
                                <label style={labelStyle}>Description of Your Products *</label>
                                <textarea value={categoryDescription}
                                    onChange={e => setCategoryDescription(e.target.value)}
                                    placeholder="Describe the products you manufacture/supply..."
                                    rows={4}
                                    style={{ ...inputStyle, resize: "vertical" }} />
                            </div>
                        </div>

                        <div style={{ marginTop: "28px", display: "flex", justifyContent: "space-between" }}>
                            <button type="button" onClick={() => { setStep(1); setError(""); }}
                                style={{ ...btnPrimary, backgroundColor: "white", color: "#0f172a", border: "1px solid #e2e8f0" }}>
                                ← Back
                            </button>
                            <button type="button" onClick={handleStep2Continue} style={btnPrimary}>
                                Continue →
                            </button>
                        </div>
                    </div>
                )}

                {/* ========================= STEP 3: DOCUMENTS ========================= */}
                {step === 3 && (
                    <form onSubmit={handleFinalSubmit}>
                        <h2 style={{ fontSize: "22px", fontWeight: "700", color: "#0f172a", marginBottom: "8px" }}>
                            Upload Documents
                        </h2>
                        <p style={{ color: "#64748b", fontSize: "14px", marginBottom: "28px" }}>
                            Upload your KYC documents for admin verification
                        </p>

                        <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
                            {/* PAN */}
                            <div>
                                <label style={labelStyle}>PAN Number *</label>
                                <input type="text" value={docData.panNumber}
                                    onChange={e => setDocData(prev => ({ ...prev, panNumber: e.target.value.toUpperCase() }))}
                                    placeholder="ABCDE1234F" maxLength={10} style={inputStyle} />
                            </div>
                            <div>
                                <label style={labelStyle}>PAN Card Upload *</label>
                                <input type="file" accept="image/*,.pdf" onChange={handleFileChange("panCard")}
                                    style={inputStyle} />
                                {uploadProgress.panCard && (
                                    <span style={{ fontSize: "12px", color: uploadProgress.panCard === "done" ? "#16a34a" : "#f59e0b" }}>
                                        {uploadProgress.panCard === "done" ? "✅ Uploaded" : "⏳ Uploading..."}
                                    </span>
                                )}
                            </div>

                            {/* GST */}
                            <div>
                                <label style={labelStyle}>GST Number *</label>
                                <input type="text" value={docData.gstNumber}
                                    onChange={e => setDocData(prev => ({ ...prev, gstNumber: e.target.value.toUpperCase() }))}
                                    placeholder="22AAAAA0000A1Z5" maxLength={15} style={inputStyle} />
                            </div>
                            <div>
                                <label style={labelStyle}>GST Certificate Upload *</label>
                                <input type="file" accept="image/*,.pdf" onChange={handleFileChange("gstCertificate")}
                                    style={inputStyle} />
                                {uploadProgress.gstCertificate && (
                                    <span style={{ fontSize: "12px", color: uploadProgress.gstCertificate === "done" ? "#16a34a" : "#f59e0b" }}>
                                        {uploadProgress.gstCertificate === "done" ? "✅ Uploaded" : "⏳ Uploading..."}
                                    </span>
                                )}
                            </div>

                            {/* Business Catalog (optional) */}
                            <div>
                                <label style={labelStyle}>Business Catalog (optional)</label>
                                <input type="file" accept="image/*,.pdf" onChange={handleFileChange("catalog")}
                                    style={inputStyle} />
                                {uploadProgress.catalog && (
                                    <span style={{ fontSize: "12px", color: uploadProgress.catalog === "done" ? "#16a34a" : "#f59e0b" }}>
                                        {uploadProgress.catalog === "done" ? "✅ Uploaded" : "⏳ Uploading..."}
                                    </span>
                                )}
                            </div>

                            {/* IEC (optional) */}
                            <div>
                                <label style={labelStyle}>IEC Number (optional — for exporters)</label>
                                <input type="text" value={docData.iecNumber}
                                    onChange={e => setDocData(prev => ({ ...prev, iecNumber: e.target.value }))}
                                    placeholder="IEC number" style={inputStyle} />
                            </div>
                            <div>
                                <label style={labelStyle}>IEC Certificate (optional)</label>
                                <input type="file" accept="image/*,.pdf" onChange={handleFileChange("iecCertificate")}
                                    style={inputStyle} />
                            </div>

                            {/* Industry License (optional) */}
                            <div>
                                <label style={labelStyle}>Industry-Specific License (optional)</label>
                                <select value={docData.industry}
                                    onChange={e => setDocData(prev => ({ ...prev, industry: e.target.value }))}
                                    style={inputStyle}>
                                    <option value="">Select industry (if applicable)</option>
                                    {industryOptions.map(i => <option key={i} value={i}>{i}</option>)}
                                </select>
                            </div>
                            {docData.industry && (
                                <div>
                                    <label style={labelStyle}>{docData.industry} License (optional)</label>
                                    <input type="file" accept="image/*,.pdf" onChange={handleFileChange("industryLicense")}
                                        style={inputStyle} />
                                </div>
                            )}
                        </div>

                        {/* Admin Review Notice */}
                        <div style={{
                            marginTop: "24px", padding: "16px 20px",
                            backgroundColor: "#fef3c7", border: "1px solid #fde68a",
                            borderRadius: "12px", display: "flex", alignItems: "center", gap: "12px",
                        }}>
                            <span style={{ fontSize: "24px" }}>📋</span>
                            <div>
                                <div style={{ fontSize: "14px", fontWeight: "600", color: "#92400e" }}>
                                    Admin Review Required
                                </div>
                                <div style={{ fontSize: "12px", color: "#a16207", marginTop: "2px" }}>
                                    After submission, your application will be reviewed by our admin team.
                                    You&apos;ll receive an email once approved (typically 24-48 hours).
                                </div>
                            </div>
                        </div>

                        <div style={{ marginTop: "28px", display: "flex", justifyContent: "space-between" }}>
                            <button type="button" onClick={() => { setStep(2); setError(""); }}
                                style={{ ...btnPrimary, backgroundColor: "white", color: "#0f172a", border: "1px solid #e2e8f0" }}>
                                ← Back
                            </button>
                            <button type="submit" disabled={loading}
                                style={{ ...btnPrimary, opacity: loading ? 0.6 : 1, cursor: loading ? "not-allowed" : "pointer" }}>
                                {loading ? "Submitting..." : "Submit for Review ✓"}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}

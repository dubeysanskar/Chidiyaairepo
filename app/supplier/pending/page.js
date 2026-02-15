"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function SupplierPending() {
    const [status, setStatus] = useState(null);
    const [loading, setLoading] = useState(true);
    const [supplierName, setSupplierName] = useState("");

    useEffect(() => {
        checkStatus();
    }, []);

    const checkStatus = async () => {
        try {
            const res = await fetch("/api/supplier/verify");
            if (res.status === 401) {
                window.location.href = "/supplier/login";
                return;
            }
            const data = await res.json();
            if (res.ok) {
                setStatus(data.status);
                setSupplierName(data.companyName);

                // If already approved, redirect to dashboard
                if (data.status === "approved") {
                    window.location.href = "/supplier/dashboard";
                }
            }
        } catch (error) {
            console.error("Failed to check status", error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        // Clear supplier token cookie
        document.cookie = "supplier_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        window.location.href = "/supplier";
    };

    if (loading) {
        return (
            <div style={{
                minHeight: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "#f8fafc",
                fontFamily: "'Inter', system-ui, sans-serif"
            }}>
                <div style={{ color: "#64748b" }}>Loading...</div>
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
                <div style={{ maxWidth: "600px", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Link href="/supplier" style={{ fontWeight: "bold", fontSize: "20px", color: "#0f172a", textDecoration: "none" }}>
                        Chidiya<span style={{ color: "#3b82f6" }}>AI</span>
                    </Link>
                    <button
                        onClick={handleLogout}
                        style={{
                            fontSize: "14px",
                            color: "#64748b",
                            background: "none",
                            border: "none",
                            cursor: "pointer"
                        }}
                    >
                        Logout
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <main style={{ maxWidth: "600px", margin: "0 auto", padding: "80px 24px", textAlign: "center" }}>
                {(status === "pending" || status === "pending_admin_review") && (
                    <>
                        <div style={{
                            width: "100px",
                            height: "100px",
                            borderRadius: "50%",
                            backgroundColor: "#fef3c7",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            margin: "0 auto 32px",
                            fontSize: "48px"
                        }}>⏳</div>

                        <h1 style={{ fontSize: "28px", fontWeight: "bold", color: "#0f172a", marginBottom: "16px" }}>
                            Application Under Review
                        </h1>

                        <p style={{ color: "#64748b", marginBottom: "32px", lineHeight: "1.6" }}>
                            Thank you, <strong>{supplierName}</strong>! Your registration and KYC documents have been submitted successfully.
                            Our team is reviewing your application.
                        </p>

                        <div style={{
                            backgroundColor: "white",
                            borderRadius: "16px",
                            padding: "24px",
                            border: "1px solid #e2e8f0",
                            marginBottom: "32px"
                        }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "16px", justifyContent: "center" }}>
                                <div style={{
                                    width: "48px",
                                    height: "48px",
                                    borderRadius: "50%",
                                    backgroundColor: "#dbeafe",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: "20px"
                                }}>🕐</div>
                                <div style={{ textAlign: "left" }}>
                                    <div style={{ fontSize: "18px", fontWeight: "600", color: "#0f172a" }}>
                                        Expected Review Time
                                    </div>
                                    <div style={{ color: "#64748b", fontSize: "14px" }}>
                                        24 - 48 hours
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div style={{
                            backgroundColor: "#f0fdf4",
                            borderRadius: "12px",
                            padding: "16px",
                            marginBottom: "32px"
                        }}>
                            <p style={{ color: "#166534", fontSize: "14px", margin: 0 }}>
                                📧 We'll notify you via email once your account is approved!
                            </p>
                        </div>



                        <Link
                            href="/"
                            style={{
                                display: "inline-block",
                                padding: "14px 32px",
                                backgroundColor: "white",
                                color: "#0f172a",
                                border: "1px solid #e2e8f0",
                                borderRadius: "8px",
                                fontSize: "16px",
                                fontWeight: "500",
                                textDecoration: "none"
                            }}
                        >
                            Go to Home
                        </Link>
                    </>
                )}

                {status === "suspended" && (
                    <>
                        <div style={{
                            width: "100px",
                            height: "100px",
                            borderRadius: "50%",
                            backgroundColor: "#fee2e2",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            margin: "0 auto 32px",
                            fontSize: "48px"
                        }}>❌</div>

                        <h1 style={{ fontSize: "28px", fontWeight: "bold", color: "#0f172a", marginBottom: "16px" }}>
                            Application Rejected
                        </h1>

                        <p style={{ color: "#64748b", marginBottom: "32px", lineHeight: "1.6" }}>
                            Unfortunately, your application was not approved at this time.
                            Please contact our support team for more information.
                        </p>

                        <Link
                            href="mailto:support@chidiya.ai"
                            style={{
                                display: "inline-block",
                                padding: "14px 32px",
                                backgroundColor: "#0f172a",
                                color: "white",
                                border: "none",
                                borderRadius: "8px",
                                fontSize: "16px",
                                fontWeight: "500",
                                textDecoration: "none"
                            }}
                        >
                            Contact Support
                        </Link>
                    </>
                )}

                {status === "banned" && (
                    <>
                        <div style={{
                            width: "100px",
                            height: "100px",
                            borderRadius: "50%",
                            backgroundColor: "#fee2e2",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            margin: "0 auto 32px",
                            fontSize: "48px"
                        }}>🚫</div>

                        <h1 style={{ fontSize: "28px", fontWeight: "bold", color: "#0f172a", marginBottom: "16px" }}>
                            Account Banned
                        </h1>

                        <p style={{ color: "#64748b", marginBottom: "32px", lineHeight: "1.6" }}>
                            Your account has been banned. Please contact support for more information.
                        </p>
                    </>
                )}
            </main>
        </div>
    );
}

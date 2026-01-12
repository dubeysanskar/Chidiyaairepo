"use client";

import { useState } from "react";
import Link from "next/link";

export default function SupplierLogin() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();
        // After login, redirect to dashboard
        window.location.href = "/supplier/dashboard";
    };

    return (
        <div style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#f8fafc",
            fontFamily: "'Inter', system-ui, sans-serif",
            padding: "20px"
        }}>
            <div style={{
                width: "100%",
                maxWidth: "420px",
                backgroundColor: "white",
                borderRadius: "16px",
                padding: "40px",
                boxShadow: "0 4px 20px rgba(0,0,0,0.08)"
            }}>
                {/* Logo */}
                <div style={{ textAlign: "center", marginBottom: "32px" }}>
                    <Link href="/supplier" style={{ textDecoration: "none" }}>
                        <span style={{ fontSize: "24px", fontWeight: "bold", color: "#0f172a" }}>
                            Chidiya<span style={{ color: "#3b82f6" }}>AI</span>
                        </span>
                    </Link>
                    <p style={{ color: "#64748b", marginTop: "8px", fontSize: "14px" }}>
                        Supplier Portal Login
                    </p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: "16px" }}>
                        <label style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#0f172a", marginBottom: "6px" }}>
                            Email
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="contact@yourcompany.com"
                            style={{
                                width: "100%",
                                padding: "12px",
                                border: "1px solid #e2e8f0",
                                borderRadius: "8px",
                                fontSize: "14px",
                                outline: "none",
                                boxSizing: "border-box"
                            }}
                        />
                    </div>

                    <div style={{ marginBottom: "24px" }}>
                        <label style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#0f172a", marginBottom: "6px" }}>
                            Password
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            style={{
                                width: "100%",
                                padding: "12px",
                                border: "1px solid #e2e8f0",
                                borderRadius: "8px",
                                fontSize: "14px",
                                outline: "none",
                                boxSizing: "border-box"
                            }}
                        />
                    </div>

                    <button
                        type="submit"
                        style={{
                            width: "100%",
                            padding: "14px",
                            backgroundColor: "#0f172a",
                            color: "white",
                            border: "none",
                            borderRadius: "8px",
                            fontSize: "16px",
                            fontWeight: "500",
                            cursor: "pointer"
                        }}
                    >
                        Sign In to Supplier Portal
                    </button>
                </form>

                <p style={{ textAlign: "center", marginTop: "24px", fontSize: "14px", color: "#64748b" }}>
                    Don't have a supplier account?{" "}
                    <Link href="/supplier/register" style={{ color: "#3b82f6", textDecoration: "none", fontWeight: "500" }}>
                        Register
                    </Link>
                </p>

                <div style={{ textAlign: "center", marginTop: "24px", paddingTop: "24px", borderTop: "1px solid #e2e8f0" }}>
                    <Link href="/auth/signin" style={{ fontSize: "13px", color: "#64748b", textDecoration: "none" }}>
                        Looking for Buyer Login? →
                    </Link>
                </div>
            </div>
        </div>
    );
}

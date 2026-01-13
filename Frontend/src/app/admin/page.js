"use client";

import { useState } from "react";

export default function AdminLogin() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        // Mock authentication - redirect to dashboard
        setTimeout(() => {
            if (email && password) {
                window.location.href = "/admin/dashboard";
            } else {
                setError("Please enter email and password");
                setLoading(false);
            }
        }, 1000);
    };

    return (
        <div style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#0f172a",
            fontFamily: "'Inter', system-ui, sans-serif",
            padding: "20px"
        }}>
            <div style={{
                width: "100%",
                maxWidth: "400px",
                backgroundColor: "#1e293b",
                borderRadius: "16px",
                padding: "40px",
                boxShadow: "0 25px 50px rgba(0,0,0,0.25)"
            }}>
                {/* Logo */}
                <div style={{ textAlign: "center", marginBottom: "32px" }}>
                    <div style={{
                        width: "60px",
                        height: "60px",
                        borderRadius: "12px",
                        background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        margin: "0 auto 16px",
                        fontSize: "24px"
                    }}>
                        🛡️
                    </div>
                    <h1 style={{ fontSize: "24px", fontWeight: "bold", color: "white", marginBottom: "4px" }}>
                        Chidiya<span style={{ color: "#3b82f6" }}>AI</span>
                    </h1>
                    <p style={{ color: "#94a3b8", fontSize: "14px" }}>Admin Portal</p>
                </div>

                {/* Error Message */}
                {error && (
                    <div style={{
                        padding: "12px",
                        backgroundColor: "rgba(239,68,68,0.1)",
                        border: "1px solid rgba(239,68,68,0.3)",
                        borderRadius: "8px",
                        color: "#f87171",
                        fontSize: "14px",
                        marginBottom: "20px",
                        textAlign: "center"
                    }}>
                        {error}
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: "20px" }}>
                        <label style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#94a3b8", marginBottom: "8px" }}>
                            Email Address
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="admin@chidiyaai.com"
                            style={{
                                width: "100%",
                                padding: "14px 16px",
                                backgroundColor: "#0f172a",
                                border: "1px solid #334155",
                                borderRadius: "8px",
                                fontSize: "15px",
                                color: "white",
                                outline: "none",
                                boxSizing: "border-box"
                            }}
                        />
                    </div>

                    <div style={{ marginBottom: "24px" }}>
                        <label style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#94a3b8", marginBottom: "8px" }}>
                            Password
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••••"
                            style={{
                                width: "100%",
                                padding: "14px 16px",
                                backgroundColor: "#0f172a",
                                border: "1px solid #334155",
                                borderRadius: "8px",
                                fontSize: "15px",
                                color: "white",
                                outline: "none",
                                boxSizing: "border-box"
                            }}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            width: "100%",
                            padding: "14px",
                            background: loading ? "#475569" : "linear-gradient(135deg, #3b82f6, #8b5cf6)",
                            color: "white",
                            border: "none",
                            borderRadius: "8px",
                            fontSize: "16px",
                            fontWeight: "600",
                            cursor: loading ? "not-allowed" : "pointer"
                        }}
                    >
                        {loading ? "Signing in..." : "Sign in to Admin"}
                    </button>
                </form>

                {/* Footer */}
                <p style={{ textAlign: "center", marginTop: "24px", fontSize: "13px", color: "#64748b" }}>
                    Protected area. Authorized personnel only.
                </p>
            </div>
        </div>
    );
}

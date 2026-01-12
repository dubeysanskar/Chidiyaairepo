"use client";

import Link from "next/link";
import { useState } from "react";

export default function SignUp() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();
        // Redirect to chat after signup
        window.location.href = "/chat";
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
                    <Link href="/" style={{ textDecoration: "none" }}>
                        <span style={{ fontSize: "24px", fontWeight: "bold", color: "#0f172a" }}>
                            Chidiya<span style={{ color: "#3b82f6" }}>AI</span>
                        </span>
                    </Link>
                    <p style={{ color: "#64748b", marginTop: "8px", fontSize: "14px" }}>
                        Create your free account
                    </p>
                </div>

                {/* Google Sign Up */}
                <button style={{
                    width: "100%",
                    padding: "12px",
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                    backgroundColor: "white",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "10px",
                    fontSize: "14px",
                    fontWeight: "500",
                    color: "#0f172a",
                    marginBottom: "24px"
                }}>
                    <svg width="18" height="18" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    Continue with Google
                </button>

                <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "24px" }}>
                    <div style={{ flex: 1, height: "1px", backgroundColor: "#e2e8f0" }}></div>
                    <span style={{ color: "#94a3b8", fontSize: "13px" }}>or</span>
                    <div style={{ flex: 1, height: "1px", backgroundColor: "#e2e8f0" }}></div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: "16px" }}>
                        <label style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#0f172a", marginBottom: "6px" }}>
                            Full Name
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="John Doe"
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

                    <div style={{ marginBottom: "16px" }}>
                        <label style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#0f172a", marginBottom: "6px" }}>
                            Email
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@company.com"
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
                            padding: "12px",
                            backgroundColor: "#0f172a",
                            color: "white",
                            border: "none",
                            borderRadius: "8px",
                            fontSize: "14px",
                            fontWeight: "500",
                            cursor: "pointer"
                        }}
                    >
                        Create Account
                    </button>
                </form>

                <p style={{ textAlign: "center", marginTop: "24px", fontSize: "14px", color: "#64748b" }}>
                    Already have an account?{" "}
                    <Link href="/auth/signin" style={{ color: "#3b82f6", textDecoration: "none", fontWeight: "500" }}>
                        Sign in
                    </Link>
                </p>

                <p style={{ textAlign: "center", marginTop: "16px", fontSize: "12px", color: "#94a3b8" }}>
                    By signing up, you agree to our{" "}
                    <Link href="/terms" style={{ color: "#64748b", textDecoration: "underline" }}>Terms</Link>
                    {" "}and{" "}
                    <Link href="/privacy" style={{ color: "#64748b", textDecoration: "underline" }}>Privacy Policy</Link>
                </p>
            </div>
        </div>
    );
}

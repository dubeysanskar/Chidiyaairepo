"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

function ResetPasswordContent() {
    const searchParams = useSearchParams();
    const token = searchParams.get("token");

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        if (password.length < 6) {
            setError("Password must be at least 6 characters");
            return;
        }

        setLoading(true);

        try {
            const res = await fetch("/api/supplier/reset-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token, password }),
            });

            const data = await res.json();

            if (res.ok) {
                setSuccess(true);
            } else {
                setError(data.error || "Failed to reset password");
            }
        } catch (err) {
            setError("Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    if (!token) {
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
                    boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                    textAlign: "center"
                }}>
                    <div style={{
                        width: "80px",
                        height: "80px",
                        borderRadius: "50%",
                        backgroundColor: "#fee2e2",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        margin: "0 auto 24px",
                        fontSize: "36px"
                    }}>❌</div>

                    <h1 style={{ fontSize: "24px", fontWeight: "bold", color: "#0f172a", marginBottom: "12px" }}>
                        Invalid Reset Link
                    </h1>
                    <p style={{ color: "#64748b", marginBottom: "24px" }}>
                        This password reset link is invalid or has expired.
                    </p>

                    <Link
                        href="/supplier/forgot-password"
                        style={{
                            display: "inline-block",
                            padding: "14px 32px",
                            backgroundColor: "#0f172a",
                            color: "white",
                            borderRadius: "8px",
                            textDecoration: "none",
                            fontWeight: "500"
                        }}
                    >
                        Request New Link
                    </Link>
                </div>
            </div>
        );
    }

    if (success) {
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
                    boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                    textAlign: "center"
                }}>
                    <div style={{
                        width: "80px",
                        height: "80px",
                        borderRadius: "50%",
                        backgroundColor: "#dcfce7",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        margin: "0 auto 24px",
                        fontSize: "36px"
                    }}>✓</div>

                    <h1 style={{ fontSize: "24px", fontWeight: "bold", color: "#0f172a", marginBottom: "12px" }}>
                        Password Reset Successful
                    </h1>
                    <p style={{ color: "#64748b", marginBottom: "32px" }}>
                        Your password has been reset. You can now log in with your new password.
                    </p>

                    <Link
                        href="/supplier/login"
                        style={{
                            display: "inline-block",
                            padding: "14px 32px",
                            backgroundColor: "#0f172a",
                            color: "white",
                            borderRadius: "8px",
                            textDecoration: "none",
                            fontWeight: "500"
                        }}
                    >
                        Go to Login
                    </Link>
                </div>
            </div>
        );
    }

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
                        Create New Password
                    </p>
                </div>

                <form onSubmit={handleSubmit}>
                    {error && (
                        <div style={{
                            padding: "12px 16px",
                            backgroundColor: "#fef2f2",
                            border: "1px solid #fecaca",
                            borderRadius: "8px",
                            color: "#dc2626",
                            marginBottom: "16px",
                            fontSize: "14px"
                        }}>
                            {error}
                        </div>
                    )}

                    <div style={{ marginBottom: "16px" }}>
                        <label style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#0f172a", marginBottom: "6px" }}>
                            New Password
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
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
                            Confirm Password
                        </label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="••••••••"
                            required
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
                        disabled={loading || !password || !confirmPassword}
                        style={{
                            width: "100%",
                            padding: "14px",
                            backgroundColor: loading || !password || !confirmPassword ? "#94a3b8" : "#0f172a",
                            color: "white",
                            border: "none",
                            borderRadius: "8px",
                            fontSize: "16px",
                            fontWeight: "500",
                            cursor: loading || !password || !confirmPassword ? "not-allowed" : "pointer"
                        }}
                    >
                        {loading ? "Resetting..." : "Reset Password"}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default function ResetPassword() {
    return (
        <Suspense fallback={
            <div style={{
                minHeight: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "#f8fafc"
            }}>
                <div>Loading...</div>
            </div>
        }>
            <ResetPasswordContent />
        </Suspense>
    );
}

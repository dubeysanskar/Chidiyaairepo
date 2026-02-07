"use client"

import Link from "next/link"
import Image from "next/image"
import { useState, FormEvent } from "react"

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("")
    const [error, setError] = useState("")
    const [success, setSuccess] = useState("")
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError("")
        setSuccess("")

        try {
            const res = await fetch("/api/buyer/forgot-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            })

            const data = await res.json()

            if (!res.ok) {
                setError(data.error || "Failed to send reset link")
                return
            }

            setSuccess("Password reset link sent to your email!")
        } catch {
            setError("Something went wrong")
        } finally {
            setLoading(false)
        }
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
                    <Link href="/" style={{ textDecoration: "none", display: "inline-block" }}>
                        <Image
                            src="/assests/chidiyaailogo.png"
                            alt="ChidiyaAI"
                            width={180}
                            height={48}
                            style={{ height: "48px", width: "auto" }}
                            priority
                        />
                    </Link>
                    <h1 style={{ color: "#0f172a", marginTop: "16px", fontSize: "20px", fontWeight: "600" }}>
                        Reset Your Password
                    </h1>
                    <p style={{ color: "#64748b", marginTop: "8px", fontSize: "14px" }}>
                        Enter your email and we&apos;ll send you a reset link
                    </p>
                </div>

                {/* Success Message */}
                {success && (
                    <div style={{
                        padding: "12px",
                        backgroundColor: "#f0fdf4",
                        border: "1px solid #bbf7d0",
                        borderRadius: "8px",
                        color: "#16a34a",
                        fontSize: "14px",
                        marginBottom: "16px",
                        textAlign: "center"
                    }}>
                        {success}
                    </div>
                )}

                {/* Error Message */}
                {error && (
                    <div style={{
                        padding: "12px",
                        backgroundColor: "#fef2f2",
                        border: "1px solid #fecaca",
                        borderRadius: "8px",
                        color: "#dc2626",
                        fontSize: "14px",
                        marginBottom: "16px"
                    }}>
                        {error}
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: "24px" }}>
                        <label style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#0f172a", marginBottom: "6px" }}>
                            Email Address
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@company.com"
                            required
                            style={{
                                width: "100%",
                                padding: "12px",
                                border: "1px solid #e2e8f0",
                                borderRadius: "8px",
                                fontSize: "14px",
                                outline: "none",
                                boxSizing: "border-box",
                                color: "#0f172a",
                                backgroundColor: "white"
                            }}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            width: "100%",
                            padding: "12px",
                            backgroundColor: loading ? "#64748b" : "#0f172a",
                            color: "white",
                            border: "none",
                            borderRadius: "8px",
                            fontSize: "14px",
                            fontWeight: "500",
                            cursor: loading ? "not-allowed" : "pointer"
                        }}
                    >
                        {loading ? "Sending..." : "Send Reset Link"}
                    </button>
                </form>

                <p style={{ textAlign: "center", marginTop: "24px", fontSize: "14px", color: "#64748b" }}>
                    Remember your password?{" "}
                    <Link href="/account/login" style={{ color: "#3b82f6", textDecoration: "none", fontWeight: "500" }}>
                        Sign in
                    </Link>
                </p>

                <Link
                    href="/"
                    style={{
                        display: "block",
                        textAlign: "center",
                        marginTop: "16px",
                        fontSize: "14px",
                        color: "#64748b",
                        textDecoration: "none"
                    }}
                >
                    ← Back to Home
                </Link>
            </div>
        </div>
    )
}

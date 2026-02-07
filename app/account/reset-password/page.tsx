"use client"

import Link from "next/link"
import Image from "next/image"
import { useState, FormEvent, Suspense } from "react"
import { useSearchParams } from "next/navigation"

function ResetPasswordForm() {
    const searchParams = useSearchParams()
    const token = searchParams.get("token") || ""
    const emailParam = searchParams.get("email") || ""

    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [error, setError] = useState("")
    const [success, setSuccess] = useState("")
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault()

        if (password !== confirmPassword) {
            setError("Passwords do not match")
            return
        }

        if (password.length < 6) {
            setError("Password must be at least 6 characters")
            return
        }

        setLoading(true)
        setError("")
        setSuccess("")

        try {
            const res = await fetch("/api/buyer/reset-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: emailParam, token, password }),
            })

            const data = await res.json()

            if (!res.ok) {
                setError(data.error || "Failed to reset password")
                return
            }

            setSuccess("Password reset successfully! Redirecting to login...")
            setTimeout(() => {
                window.location.href = "/account/login"
            }, 2000)
        } catch {
            setError("Something went wrong")
        } finally {
            setLoading(false)
        }
    }

    if (!token || !emailParam) {
        return (
            <div style={{ textAlign: "center" }}>
                <p style={{ color: "#dc2626", marginBottom: "16px" }}>
                    Invalid or missing reset link.
                </p>
                <Link href="/account/forgot-password" style={{ color: "#3b82f6", textDecoration: "none" }}>
                    Request a new reset link
                </Link>
            </div>
        )
    }

    return (
        <>
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
                        minLength={6}
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
                    {loading ? "Resetting..." : "Reset Password"}
                </button>
            </form>
        </>
    )
}

export default function ResetPasswordPage() {
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
                        Set New Password
                    </h1>
                    <p style={{ color: "#64748b", marginTop: "8px", fontSize: "14px" }}>
                        Enter your new password below
                    </p>
                </div>

                <Suspense fallback={<div style={{ textAlign: "center", color: "#64748b" }}>Loading...</div>}>
                    <ResetPasswordForm />
                </Suspense>

                <Link
                    href="/account/login"
                    style={{
                        display: "block",
                        textAlign: "center",
                        marginTop: "24px",
                        fontSize: "14px",
                        color: "#64748b",
                        textDecoration: "none"
                    }}
                >
                    ← Back to Login
                </Link>
            </div>
        </div>
    )
}

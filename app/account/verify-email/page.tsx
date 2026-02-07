"use client"

import Link from "next/link"
import Image from "next/image"
import { useState, useEffect, FormEvent } from "react"
import { useSearchParams } from "next/navigation"

export default function VerifyEmailPage() {
    const searchParams = useSearchParams()
    const emailParam = searchParams.get("email") || ""

    const [otp, setOtp] = useState("")
    const [error, setError] = useState("")
    const [success, setSuccess] = useState("")
    const [loading, setLoading] = useState(false)
    const [resending, setResending] = useState(false)
    const [countdown, setCountdown] = useState(0)

    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
            return () => clearTimeout(timer)
        }
    }, [countdown])

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault()
        if (!emailParam) {
            setError("Email is required. Please go back and register again.")
            return
        }

        setLoading(true)
        setError("")
        setSuccess("")

        try {
            const res = await fetch("/api/auth/verify-email", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: emailParam, otp }),
            })

            const data = await res.json()

            if (!res.ok) {
                setError(data.error || "Verification failed")
                return
            }

            setSuccess("Email verified successfully! Redirecting...")
            setTimeout(() => {
                window.location.href = "/account"
            }, 1500)
        } catch {
            setError("Something went wrong")
        } finally {
            setLoading(false)
        }
    }

    const handleResendOTP = async () => {
        if (!emailParam) {
            setError("Email is required")
            return
        }

        setResending(true)
        setError("")

        try {
            const res = await fetch("/api/auth/verify-email", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: emailParam }),
            })

            const data = await res.json()

            if (!res.ok) {
                setError(data.error || "Failed to resend OTP")
                return
            }

            setSuccess("New OTP sent to your email!")
            setCountdown(60) // 60 second cooldown
        } catch {
            setError("Failed to resend OTP")
        } finally {
            setResending(false)
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
                        Verify Your Email
                    </h1>
                    <p style={{ color: "#64748b", marginTop: "8px", fontSize: "14px" }}>
                        We sent a 6-digit code to<br />
                        <strong style={{ color: "#0f172a" }}>{emailParam}</strong>
                    </p>
                    <p style={{ color: "#94a3b8", marginTop: "4px", fontSize: "12px" }}>
                        Code expires in 10 minutes
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
                            Verification Code
                        </label>
                        <input
                            type="text"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                            placeholder="Enter 6-digit code"
                            required
                            maxLength={6}
                            style={{
                                width: "100%",
                                padding: "14px",
                                border: "1px solid #e2e8f0",
                                borderRadius: "8px",
                                fontSize: "18px",
                                fontWeight: "600",
                                letterSpacing: "8px",
                                textAlign: "center",
                                outline: "none",
                                boxSizing: "border-box",
                                color: "#0f172a",
                                backgroundColor: "white"
                            }}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading || otp.length !== 6}
                        style={{
                            width: "100%",
                            padding: "12px",
                            backgroundColor: loading || otp.length !== 6 ? "#94a3b8" : "#0f172a",
                            color: "white",
                            border: "none",
                            borderRadius: "8px",
                            fontSize: "14px",
                            fontWeight: "500",
                            cursor: loading || otp.length !== 6 ? "not-allowed" : "pointer"
                        }}
                    >
                        {loading ? "Verifying..." : "Verify Email"}
                    </button>
                </form>

                {/* Resend OTP */}
                <div style={{ textAlign: "center", marginTop: "24px" }}>
                    <p style={{ fontSize: "14px", color: "#64748b", marginBottom: "8px" }}>
                        Didn&apos;t receive the code?
                    </p>
                    <button
                        onClick={handleResendOTP}
                        disabled={resending || countdown > 0}
                        style={{
                            background: "none",
                            border: "none",
                            color: countdown > 0 ? "#94a3b8" : "#3b82f6",
                            fontSize: "14px",
                            fontWeight: "500",
                            cursor: countdown > 0 ? "not-allowed" : "pointer",
                            textDecoration: countdown > 0 ? "none" : "underline"
                        }}
                    >
                        {resending ? "Sending..." : countdown > 0 ? `Resend in ${countdown}s` : "Resend Code"}
                    </button>
                </div>

                <Link
                    href="/account/register"
                    style={{
                        display: "block",
                        textAlign: "center",
                        marginTop: "24px",
                        fontSize: "14px",
                        color: "#64748b",
                        textDecoration: "none"
                    }}
                >
                    ← Use a different email
                </Link>
            </div>
        </div>
    )
}

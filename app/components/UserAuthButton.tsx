"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

export default function UserAuthButton() {
    const [user, setUser] = useState<{ name?: string; email?: string; image?: string } | null>(null);
    const [loading, setLoading] = useState(true);
    const [showDropdown, setShowDropdown] = useState(false);

    useEffect(() => {
        // Check auth status via fetch
        fetch("/api/auth/session")
            .then(res => res.json())
            .then(data => {
                if (data?.user) {
                    setUser(data.user);
                }
                setLoading(false);
            })
            .catch(() => {
                setLoading(false);
            });
    }, []);

    const handleLogout = async () => {
        try {
            // 1. Clear custom JWT token first
            await fetch("/api/auth/logout", { method: "POST" });

            // 2. Also try to sign out of NextAuth (for Google login)
            try {
                const csrfRes = await fetch("/api/auth/csrf");
                const { csrfToken } = await csrfRes.json();
                await fetch("/api/auth/signout", {
                    method: "POST",
                    headers: { "Content-Type": "application/x-www-form-urlencoded" },
                    body: `csrfToken=${csrfToken}`,
                });
            } catch {
                // NextAuth signout failed, but JWT is cleared
            }

            // Clear user state and redirect to home
            setUser(null);
            setShowDropdown(false);
            window.location.href = "/";
        } catch {
            // Fallback to redirect
            window.location.href = "/";
        }
    };

    if (loading) {
        return (
            <div style={{
                padding: "8px 16px",
                backgroundColor: "#f1f5f9",
                borderRadius: "8px",
                fontSize: "14px",
                color: "#64748b"
            }}>
                ...
            </div>
        );
    }

    if (user) {
        return (
            <div style={{ position: "relative" }}>
                <button
                    onClick={() => setShowDropdown(!showDropdown)}
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        padding: "6px 12px",
                        backgroundColor: "#f1f5f9",
                        border: "none",
                        borderRadius: "24px",
                        cursor: "pointer",
                        fontSize: "14px",
                        fontWeight: "500",
                        color: "#0f172a"
                    }}
                >
                    {user.image ? (
                        <img
                            src={user.image}
                            alt="Profile"
                            referrerPolicy="no-referrer"
                            style={{
                                width: "28px",
                                height: "28px",
                                borderRadius: "50%",
                                border: "2px solid white",
                                boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
                            }}
                        />
                    ) : (
                        <div style={{
                            width: "28px",
                            height: "28px",
                            borderRadius: "50%",
                            background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "white",
                            fontSize: "12px",
                            fontWeight: "600"
                        }}>
                            {user.name?.charAt(0).toUpperCase() || "U"}
                        </div>
                    )}
                    <span>{user.name?.split(" ")[0] || "User"}</span>
                    <span style={{ fontSize: "10px", color: "#64748b" }}>▼</span>
                </button>

                {showDropdown && (
                    <>
                        <div
                            style={{
                                position: "fixed",
                                inset: 0,
                                zIndex: 40
                            }}
                            onClick={() => setShowDropdown(false)}
                        />
                        <div style={{
                            position: "absolute",
                            top: "100%",
                            right: 0,
                            marginTop: "8px",
                            backgroundColor: "white",
                            borderRadius: "12px",
                            boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
                            minWidth: "200px",
                            zIndex: 50,
                            overflow: "hidden"
                        }}>
                            <div style={{
                                padding: "12px 16px",
                                borderBottom: "1px solid #e2e8f0"
                            }}>
                                <p style={{ margin: 0, fontWeight: "600", color: "#0f172a", fontSize: "14px" }}>
                                    {user.name}
                                </p>
                                <p style={{ margin: "4px 0 0", fontSize: "12px", color: "#64748b" }}>
                                    {user.email}
                                </p>
                            </div>
                            <div style={{ padding: "8px" }}>
                                <Link
                                    href="/account/dashboard"
                                    style={{
                                        display: "block",
                                        padding: "10px 12px",
                                        borderRadius: "8px",
                                        color: "#0f172a",
                                        textDecoration: "none",
                                        fontSize: "14px"
                                    }}
                                    onClick={() => setShowDropdown(false)}
                                >
                                    📊 Dashboard
                                </Link>
                                <Link
                                    href="/account/chat"
                                    style={{
                                        display: "block",
                                        padding: "10px 12px",
                                        borderRadius: "8px",
                                        color: "#0f172a",
                                        textDecoration: "none",
                                        fontSize: "14px"
                                    }}
                                    onClick={() => setShowDropdown(false)}
                                >
                                    🔍 Find Suppliers
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    style={{
                                        display: "block",
                                        width: "100%",
                                        padding: "10px 12px",
                                        borderRadius: "8px",
                                        color: "#dc2626",
                                        backgroundColor: "transparent",
                                        border: "none",
                                        fontSize: "14px",
                                        textAlign: "left",
                                        cursor: "pointer"
                                    }}
                                >
                                    🚪 Logout
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        );
    }

    // Not signed in
    return (
        <Link
            href="/account/login"
            style={{
                padding: "8px 16px",
                fontSize: "14px",
                fontWeight: "500",
                color: "#3b82f6",
                backgroundColor: "#eff6ff",
                border: "1px solid #bfdbfe",
                borderRadius: "8px",
                textDecoration: "none"
            }}
        >
            Sign In
        </Link>
    );
}

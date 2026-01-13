"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import "./admin.css";

const navItems = [
    { id: "dashboard", label: "Dashboard", icon: "📊", href: "/admin/dashboard" },
    { id: "suppliers", label: "Suppliers", icon: "🏭", href: "/admin/suppliers" },
    { id: "buyers", label: "Buyers", icon: "👥", href: "/admin/buyers" },
    { id: "categories", label: "Categories", icon: "📁", href: "/admin/categories" },
    { id: "logs", label: "Audit Logs", icon: "📋", href: "/admin/logs" },
];

export default function AdminLayout({ children }) {
    const pathname = usePathname();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    // Don't show layout on login page
    if (pathname === "/admin") {
        return children;
    }

    return (
        <div className="admin-layout-container">
            {/* Desktop Sidebar */}
            <aside className="admin-sidebar-desktop">
                {/* Logo */}
                <div style={{ marginBottom: "32px", paddingLeft: "12px" }}>
                    <Link href="/admin/dashboard" style={{ textDecoration: "none" }}>
                        <span style={{ fontSize: "20px", fontWeight: "bold", color: "white" }}>
                            Chidiya<span style={{ color: "#3b82f6" }}>AI</span>
                        </span>
                        <span style={{
                            display: "block",
                            fontSize: "11px",
                            color: "#64748b",
                            marginTop: "2px",
                            textTransform: "uppercase",
                            letterSpacing: "1px"
                        }}>
                            Admin Panel
                        </span>
                    </Link>
                </div>

                {/* Navigation */}
                <nav style={{ flex: 1 }}>
                    {navItems.map((item) => {
                        const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                        return (
                            <Link
                                key={item.id}
                                href={item.href}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "12px",
                                    padding: "12px 16px",
                                    marginBottom: "4px",
                                    borderRadius: "8px",
                                    textDecoration: "none",
                                    backgroundColor: isActive ? "rgba(59,130,246,0.15)" : "transparent",
                                    color: isActive ? "#3b82f6" : "#94a3b8",
                                    fontSize: "14px",
                                    fontWeight: isActive ? "500" : "400"
                                }}
                            >
                                <span style={{ fontSize: "18px" }}>{item.icon}</span>
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                {/* Admin Info */}
                <div style={{
                    padding: "16px",
                    backgroundColor: "#0f172a",
                    borderRadius: "12px",
                    marginTop: "auto"
                }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <div style={{
                            width: "40px",
                            height: "40px",
                            borderRadius: "50%",
                            backgroundColor: "#3b82f6",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "white",
                            fontWeight: "bold"
                        }}>
                            AD
                        </div>
                        <div>
                            <div style={{ color: "white", fontSize: "14px", fontWeight: "500" }}>Admin User</div>
                            <div style={{ color: "#64748b", fontSize: "12px" }}>Super Admin</div>
                        </div>
                    </div>
                    <Link
                        href="/admin"
                        style={{
                            display: "block",
                            marginTop: "12px",
                            padding: "8px",
                            backgroundColor: "#334155",
                            borderRadius: "6px",
                            color: "#94a3b8",
                            textDecoration: "none",
                            fontSize: "13px",
                            textAlign: "center"
                        }}
                    >
                        Sign Out
                    </Link>
                </div>
            </aside>

            {/* Mobile Header */}
            <header className="admin-header-mobile">
                <Link href="/admin/dashboard" style={{ textDecoration: "none" }}>
                    <span style={{ fontSize: "18px", fontWeight: "bold", color: "white" }}>
                        Chidiya<span style={{ color: "#3b82f6" }}>AI</span>
                        <span style={{ fontSize: "10px", color: "#64748b", marginLeft: "8px" }}>ADMIN</span>
                    </span>
                </Link>
                <button
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    style={{
                        padding: "8px",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center"
                    }}
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                        {mobileMenuOpen ? (
                            <path d="M6 18L18 6M6 6l12 12" />
                        ) : (
                            <path d="M4 6h16M4 12h16M4 18h16" />
                        )}
                    </svg>
                </button>
            </header>

            {/* Mobile Menu Dropdown */}
            {mobileMenuOpen && (
                <div style={{
                    position: "fixed",
                    top: "56px",
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: "#1e293b",
                    zIndex: 49,
                    padding: "16px",
                    overflowY: "auto"
                }}>
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.id}
                                href={item.href}
                                onClick={() => setMobileMenuOpen(false)}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "12px",
                                    padding: "16px",
                                    marginBottom: "8px",
                                    borderRadius: "8px",
                                    textDecoration: "none",
                                    backgroundColor: isActive ? "rgba(59,130,246,0.15)" : "transparent",
                                    color: isActive ? "#3b82f6" : "#94a3b8",
                                    fontSize: "16px"
                                }}
                            >
                                <span style={{ fontSize: "20px" }}>{item.icon}</span>
                                {item.label}
                            </Link>
                        );
                    })}
                    <div style={{ borderTop: "1px solid #334155", marginTop: "16px", paddingTop: "16px" }}>
                        <Link
                            href="/admin"
                            style={{
                                display: "block",
                                padding: "14px",
                                backgroundColor: "#334155",
                                borderRadius: "8px",
                                color: "#94a3b8",
                                textDecoration: "none",
                                textAlign: "center"
                            }}
                        >
                            Sign Out
                        </Link>
                    </div>
                </div>
            )}

            {/* Main Content */}
            <main className="admin-content-main">
                {children}
            </main>
        </div>
    );
}

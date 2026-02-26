"use client";

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import UserAuthButton from '@/app/components/UserAuthButton';
import ScheduleMeetingModal from '@/app/components/ScheduleMeetingModal';

export default function Navbar({ menus }) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [showMeetingModal, setShowMeetingModal] = useState(false);

    useEffect(() => {
        setMounted(true);
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Show desktop layout until mounted (prevents hydration issues)
    // After mounted, use actual isMobile value
    const showMobileNav = mounted && isMobile;

    return (
        <>
            <header style={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                zIndex: 100,
                backgroundColor: "rgba(255,255,255,0.95)",
                backdropFilter: "blur(10px)",
                borderBottom: "1px solid #e2e8f0"
            }}>
                <div style={{
                    maxWidth: "1200px",
                    margin: "0 auto",
                    padding: "0 16px",
                    height: "64px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between"
                }}>
                    {/* Logo */}
                    <Link href="/" style={{ display: "flex", alignItems: "center", textDecoration: "none" }}>
                        <Image
                            src="/assests/chidiyaailogo.png"
                            alt="ChidiyaAI"
                            width={100}
                            height={40}
                            style={{ height: "40px", width: "auto" }}
                            priority
                        />
                    </Link>

                    {/* Desktop Navigation */}
                    <nav style={{
                        display: showMobileNav ? "none" : "flex",
                        alignItems: "center",
                        gap: "8px"
                    }}>
                        {menus?.map((item) => (
                            <Link
                                key={item.id}
                                href={item.url}
                                style={{
                                    padding: "8px 16px",
                                    fontSize: "14px",
                                    fontWeight: item.highlight ? "500" : "400",
                                    color: item.highlight ? "#3b82f6" : "#64748b",
                                    textDecoration: "none",
                                    borderRadius: "6px"
                                }}
                            >
                                {item.title}
                            </Link>
                        ))}
                        <button
                            onClick={() => setShowMeetingModal(true)}
                            style={{
                                padding: "8px 16px",
                                fontSize: "13px",
                                fontWeight: "500",
                                color: "white",
                                backgroundColor: "#0f172a",
                                border: "none",
                                borderRadius: "8px",
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                gap: "6px",
                            }}
                        >
                            📅 Schedule Meeting
                        </button>
                    </nav>

                    {/* Desktop Buttons */}
                    <div style={{
                        display: showMobileNav ? "none" : "flex",
                        alignItems: "center",
                        gap: "12px"
                    }}>
                        <UserAuthButton />
                    </div>

                    {/* Mobile: Sign in + Hamburger */}
                    <div style={{
                        display: showMobileNav ? "flex" : "none",
                        alignItems: "center",
                        gap: "8px"
                    }}>
                        <UserAuthButton />
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            style={{
                                padding: "8px",
                                background: "none",
                                border: "none",
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center"
                            }}
                            aria-label="Toggle menu"
                        >
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0f172a" strokeWidth="2">
                                {mobileMenuOpen ? (
                                    <path d="M6 18L18 6M6 6l12 12" />
                                ) : (
                                    <path d="M4 6h16M4 12h16M4 18h16" />
                                )}
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Mobile Menu Dropdown */}
                {showMobileNav && mobileMenuOpen && (
                    <div style={{
                        backgroundColor: "white",
                        borderTop: "1px solid #e2e8f0",
                        padding: "16px"
                    }}>
                        {menus?.map((item) => (
                            <Link
                                key={item.id}
                                href={item.url}
                                onClick={() => setMobileMenuOpen(false)}
                                style={{
                                    display: "block",
                                    padding: "12px 16px",
                                    fontSize: "16px",
                                    fontWeight: item.highlight ? "500" : "400",
                                    color: item.highlight ? "#3b82f6" : "#0f172a",
                                    textDecoration: "none",
                                    borderRadius: "8px"
                                }}
                            >
                                {item.title}
                            </Link>
                        ))}
                        <button
                            onClick={() => { setShowMeetingModal(true); setMobileMenuOpen(false); }}
                            style={{
                                display: "block",
                                width: "100%",
                                padding: "12px 16px",
                                fontSize: "16px",
                                fontWeight: "500",
                                color: "white",
                                backgroundColor: "#0f172a",
                                border: "none",
                                borderRadius: "8px",
                                cursor: "pointer",
                                marginTop: "8px",
                                textAlign: "left",
                            }}
                        >
                            📅 Schedule Meeting
                        </button>
                    </div>
                )}
            </header>

            {/* Schedule Meeting Modal */}
            <ScheduleMeetingModal
                isOpen={showMeetingModal}
                onClose={() => setShowMeetingModal(false)}
            />
        </>
    );
}

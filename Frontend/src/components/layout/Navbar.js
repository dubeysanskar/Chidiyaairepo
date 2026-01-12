"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

export default function Navbar() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 10);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <nav className={`fixed top-0 left-0 right-0 z-50 transition-all ${isScrolled ? "bg-white shadow-sm" : "bg-transparent"}`}>
            <div className="max-w-6xl mx-auto px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        </div>
                        <span className="text-lg font-bold text-slate-900">
                            Chidiya<span className="text-blue-500">AI</span>
                        </span>
                    </Link>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center gap-8">
                        <Link href="#features" className="text-sm text-slate-600 hover:text-slate-900">
                            Product
                        </Link>
                        <Link href="#pricing" className="text-sm text-slate-600 hover:text-slate-900">
                            Pricing
                        </Link>
                    </div>

                    {/* Auth */}
                    <div className="hidden md:flex items-center gap-4">
                        <Link href="/auth/signin" className="text-sm text-slate-600 hover:text-slate-900">
                            Sign in
                        </Link>
                        <Link
                            href="/auth/signup"
                            className="px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors"
                        >
                            Try for free
                        </Link>
                    </div>

                    {/* Mobile Menu */}
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="md:hidden p-2"
                    >
                        <svg className="w-6 h-6 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            {isMobileMenuOpen ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            )}
                        </svg>
                    </button>
                </div>

                {/* Mobile Dropdown */}
                {isMobileMenuOpen && (
                    <div className="md:hidden py-4 bg-white border-t">
                        <div className="flex flex-col gap-4">
                            <Link href="#features" className="text-slate-600 px-4">Product</Link>
                            <Link href="#pricing" className="text-slate-600 px-4">Pricing</Link>
                            <Link href="/auth/signin" className="text-slate-600 px-4">Sign in</Link>
                            <Link href="/auth/signup" className="mx-4 px-4 py-2 bg-slate-900 text-white text-center rounded-lg">
                                Try for free
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
}

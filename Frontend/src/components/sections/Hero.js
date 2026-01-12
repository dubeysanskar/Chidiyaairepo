"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Button from "../ui/Button";

const heroSlides = [
    {
        id: 1,
        type: "agent",
        title: "Meet Chidi",
        subtitle: "Your Always-On",
        highlight: "B2B Sourcing Partner",
        description:
            "Chidi continuously matches you with verified suppliers and profitable deals. Search with your own requirements by chatting with our AI.",
    },
    {
        id: 2,
        type: "value",
        title: "Simplifying B2B",
        subtitle: "",
        highlight: "Supplier Discovery",
        description:
            "Your business deserves suppliers that match your requirements. We help you find verified, trusted partners.",
    },
];

export default function Hero() {
    const [activeSlide, setActiveSlide] = useState(0);
    const [searchQuery, setSearchQuery] = useState("");
    const [placeholderText, setPlaceholderText] = useState("");

    const placeholders = [
        "Search for packaging suppliers...",
        "Find textile manufacturers...",
        "Looking for metal fabricators...",
    ];

    useEffect(() => {
        let currentPlaceholder = 0;
        let currentChar = 0;
        let isDeleting = false;
        let pauseCounter = 0;

        const typingInterval = setInterval(() => {
            if (pauseCounter > 0) {
                pauseCounter--;
                return;
            }

            const fullText = placeholders[currentPlaceholder];

            if (!isDeleting) {
                setPlaceholderText(fullText.substring(0, currentChar + 1));
                currentChar++;

                if (currentChar === fullText.length) {
                    pauseCounter = 20;
                    isDeleting = true;
                }
            } else {
                setPlaceholderText(fullText.substring(0, currentChar - 1));
                currentChar--;

                if (currentChar === 0) {
                    isDeleting = false;
                    currentPlaceholder = (currentPlaceholder + 1) % placeholders.length;
                }
            }
        }, 80);

        return () => clearInterval(typingInterval);
    }, []);

    useEffect(() => {
        const slideInterval = setInterval(() => {
            setActiveSlide((prev) => (prev + 1) % heroSlides.length);
        }, 6000);
        return () => clearInterval(slideInterval);
    }, []);

    const currentSlide = heroSlides[activeSlide];

    return (
        <section className="relative min-h-[90vh] flex items-center pt-24 pb-16 overflow-hidden">
            {/* Simple gradient background */}
            <div className="absolute inset-0 bg-gradient-to-b from-blue-50 to-white" />

            <div className="relative z-10 max-w-6xl mx-auto px-6 lg:px-8 w-full">
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    {/* Left Content */}
                    <div>
                        {/* Slide Indicators */}
                        <div className="flex gap-2 mb-8">
                            {heroSlides.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => setActiveSlide(index)}
                                    className={`h-1.5 rounded-full transition-all duration-300 ${index === activeSlide
                                            ? "w-10 bg-blue-500"
                                            : "w-5 bg-slate-200"
                                        }`}
                                />
                            ))}
                        </div>

                        {/* Title */}
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 leading-tight mb-6">
                            {currentSlide.title}
                            {currentSlide.subtitle && (
                                <span className="block">{currentSlide.subtitle}</span>
                            )}
                            <span className="block gradient-text">{currentSlide.highlight}</span>
                        </h1>

                        {/* Description */}
                        <p className="text-lg text-slate-600 mb-10 max-w-md leading-relaxed">
                            {currentSlide.description}
                        </p>

                        {/* Search Box */}
                        <div className="mb-10">
                            <div className="flex items-center bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
                                <div className="pl-4">
                                    <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </div>
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder={placeholderText}
                                    className="flex-1 px-4 py-4 text-slate-700 placeholder-slate-400 bg-transparent focus:outline-none"
                                />
                                <Link
                                    href={searchQuery ? `/onboarding?q=${encodeURIComponent(searchQuery)}` : "/onboarding"}
                                    className="m-1.5 px-6 py-3 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors"
                                >
                                    Search
                                </Link>
                            </div>
                        </div>

                        {/* CTA Buttons */}
                        <div className="flex flex-wrap gap-4">
                            <Button href="/onboarding" variant="primary" size="lg">
                                Start Sourcing
                            </Button>
                            <Button href="#features" variant="outline" size="lg">
                                Learn More
                            </Button>
                        </div>
                    </div>

                    {/* Right Content - Agent Card */}
                    <div className="hidden lg:block">
                        <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-6 max-w-sm ml-auto">
                            {/* Agent Header */}
                            <div className="flex items-center gap-3 mb-5 pb-5 border-b border-slate-100">
                                <div className="w-12 h-12 rounded-full gradient-bg flex items-center justify-center">
                                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-900">Chidi</h3>
                                    <p className="text-sm text-slate-500">AI Sourcing Agent</p>
                                </div>
                                <span className="ml-auto w-2 h-2 bg-green-500 rounded-full" />
                            </div>

                            {/* Chat Message */}
                            <div className="bg-slate-50 rounded-lg p-4 mb-4">
                                <p className="text-sm text-slate-600 leading-relaxed">
                                    Found <span className="font-semibold text-slate-900">23 verified suppliers</span> matching your requirements in Delhi NCR.
                                </p>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-2">
                                <span className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-full text-xs font-medium">
                                    View All
                                </span>
                                <span className="px-3 py-1.5 bg-slate-100 text-slate-600 rounded-full text-xs font-medium">
                                    Refine
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

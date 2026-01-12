"use client";

import { useState } from "react";

const features = [
    {
        id: "agent",
        label: "Agent Mode",
        title: "Deals sent to you, personally matched",
        description: "Chidi monitors and sends deals matching your profile and preferences automatically.",
        benefits: [
            "Automatic deal discovery",
            "Real-time notifications",
            "Personalized matching scores",
        ],
    },
    {
        id: "chat",
        label: "Chat Mode",
        title: "Search deals anytime with Chidi",
        description: "Chat with Chidi 24/7 to find deals by category, budget, or volume.",
        benefits: [
            "Natural language search",
            "Filter by any criteria",
            "Instant recommendations",
        ],
    },
];

export default function Features() {
    const [activeFeature, setActiveFeature] = useState("agent");
    const currentFeature = features.find((f) => f.id === activeFeature);

    return (
        <section id="features" className="py-20 bg-white">
            <div className="max-w-5xl mx-auto px-6 lg:px-8">
                {/* Header */}
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold text-slate-900 mb-3">
                        Two ways to find suppliers
                    </h2>
                    <p className="text-slate-600">
                        Get deals delivered to you or search on demand. Your choice.
                    </p>
                </div>

                {/* Tabs */}
                <div className="flex justify-center gap-3 mb-10">
                    {features.map((feature) => (
                        <button
                            key={feature.id}
                            onClick={() => setActiveFeature(feature.id)}
                            className={`px-6 py-3 rounded-full text-sm font-medium transition-all ${activeFeature === feature.id
                                    ? "bg-slate-900 text-white"
                                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                }`}
                        >
                            {feature.label}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="bg-slate-50 rounded-2xl p-8 md:p-10">
                    <div className="max-w-2xl mx-auto text-center">
                        <h3 className="text-xl font-bold text-slate-900 mb-3">
                            {currentFeature.title}
                        </h3>
                        <p className="text-slate-600 mb-6">
                            {currentFeature.description}
                        </p>
                        <div className="flex flex-wrap justify-center gap-3">
                            {currentFeature.benefits.map((benefit, i) => (
                                <span key={i} className="flex items-center gap-2 px-4 py-2 bg-white rounded-full text-sm text-slate-700 shadow-sm">
                                    <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    {benefit}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

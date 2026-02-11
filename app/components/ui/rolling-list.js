"use client";

import { cn } from "@/lib/utils";

const colorClassMap = {
    blue: "text-blue-500",
};

function RollingTextItem({ item }) {
    return (
        <div className="group relative w-full cursor-pointer border-b border-neutral-200 py-4 md:py-6">
            {/* Rolling text */}
            <div className="relative overflow-hidden h-[50px] md:h-20">
                <div className="transition-transform duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] md:group-hover:-translate-y-1/2">
                    {/* State 1: Normal - Dark text for visibility */}
                    <div className="h-[50px] md:h-20 flex items-center">
                        <h2 className="text-3xl md:text-6xl font-black text-slate-900 uppercase tracking-tighter">
                            {item.title}
                        </h2>
                    </div>

                    {/* State 2: Hover (Italic + Color) - Only on desktop */}
                    <div className="h-[50px] md:h-20 hidden md:flex items-center">
                        <h2
                            className={cn(
                                "text-3xl md:text-6xl font-black uppercase tracking-tighter italic",
                                colorClassMap[item.color]
                            )}
                        >
                            {item.title}
                        </h2>
                    </div>
                </div>
            </div>

            {/* Category Label - Hidden on mobile */}
            <span className="absolute top-6 md:top-8 right-0 text-xs font-bold uppercase tracking-widest text-slate-400 transition-opacity duration-300 md:group-hover:opacity-0 hidden md:block">
                {item.category}
            </span>

            {/* Description - Always visible on mobile, hover on desktop */}
            <p className="text-sm text-slate-500 mt-2 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300">
                {item.description}
            </p>

            {/* Icon Reveal Effect - Desktop only */}
            <div
                className={cn(
                    "pointer-events-none absolute right-0 top-1/2 z-20 h-32 w-48 -translate-y-1/2 overflow-hidden rounded-lg shadow-2xl",
                    "transition-all duration-500 ease-out",
                    "opacity-0 scale-95 rotate-3 translate-x-4",
                    "md:group-hover:opacity-100 md:group-hover:scale-100 md:group-hover:rotate-0 md:group-hover:translate-x-0",
                    "hidden md:block"
                )}
            >
                <div className="relative h-full w-full bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
                    <span className="text-6xl">{item.icon}</span>
                </div>
            </div>
        </div>
    );
}

function RollingTextList() {
    const items = [
        {
            id: 1,
            title: "Verified",
            category: "Trust",
            description: "Verified supplier and rigorously reviewed for quality, credibility, and reliability.",
            icon: "✅",
            color: "blue",
        },
        {
            id: 2,
            title: "Savings",
            category: "ROI",
            description: "Discover better prices and reduce sourcing costs automatically.",
            icon: "💰",
            color: "blue",
        },
        {
            id: 3,
            title: "Fast",
            category: "Speed",
            description: "Get matched in minute, AI handles the heavy lifting so you move faster.",
            icon: "⚡",
            color: "blue",
        },
        {
            id: 4,
            title: "Alerts",
            category: "Updates",
            description: "Never miss a deal. Get notified automatically when prices drop.",
            icon: "🔔",
            color: "blue",
        },
        {
            id: 5,
            title: "Compare",
            category: "Analysis",
            description: "Compare prices. Pick better.",
            icon: "📊",
            color: "blue",
        },
        {
            id: 6,
            title: "Private",
            category: "Security",
            description: "We never share your phone number with any suppliers.",
            icon: "🔒",
            color: "blue",
        },
    ];

    return (
        <div className="mx-auto flex w-full max-w-3xl flex-col items-center justify-center px-4 py-8 md:py-12">
            <h3 className="mb-2 text-sm font-bold uppercase tracking-widest text-slate-500">
                Let your agent do the work
            </h3>
            <p className="mb-6 md:mb-8 text-slate-400 text-center text-sm md:text-base">
                ChidiyaAI monitors opportunities and delivers personally matched deals — automatically.
            </p>
            <div className="w-full flex flex-col">
                {items.map((item) => (
                    <RollingTextItem key={item.id} item={item} />
                ))}
            </div>
        </div>
    );
}

export { RollingTextList };

"use client";

import { cn } from "@/lib/utils";
import Image from "next/image";

const colorClassMap = {
    blue: "text-blue-500",
};

function RollingTextItem({ item }) {
    return (
        <div className="group relative w-full cursor-pointer border-b border-neutral-200 py-6">
            {/* Rolling text */}
            <div className="relative overflow-hidden h-[60px] md:h-20">
                <div className="transition-transform duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] group-hover:-translate-y-1/2">
                    {/* State 1: Normal - Dark text for visibility */}
                    <div className="h-[60px] md:h-20 flex items-center">
                        <h2 className="text-4xl md:text-6xl font-black text-slate-900 uppercase tracking-tighter">
                            {item.title}
                        </h2>
                    </div>

                    {/* State 2: Hover (Italic + Color) */}
                    <div className="h-[60px] md:h-20 flex items-center">
                        <h2
                            className={cn(
                                "text-4xl md:text-6xl font-black uppercase tracking-tighter italic",
                                colorClassMap[item.color]
                            )}
                        >
                            {item.title}
                        </h2>
                    </div>
                </div>
            </div>

            {/* Category Label */}
            <span className="absolute top-8 right-0 text-xs font-bold uppercase tracking-widest text-slate-400 transition-opacity duration-300 group-hover:opacity-0 hidden md:block">
                {item.category}
            </span>

            {/* Description on hover */}
            <p className="text-sm text-slate-500 mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                {item.description}
            </p>

            {/* Image Reveal Effect */}
            <div
                className={cn(
                    "pointer-events-none absolute right-0 top-1/2 z-20 h-32 w-48 -translate-y-1/2 overflow-hidden rounded-lg shadow-2xl",
                    "transition-all duration-500 ease-out",
                    "opacity-0 scale-95 rotate-3 translate-x-4",
                    "group-hover:opacity-100 group-hover:scale-100 group-hover:rotate-0 group-hover:translate-x-0"
                )}
            >
                <div className="relative h-full w-full">
                    <Image
                        src={item.src}
                        alt={item.alt}
                        fill
                        className="object-cover grayscale transition-all duration-500 ease-out group-hover:grayscale-0"
                    />
                    <div className="absolute inset-0 bg-blue-600/15 mix-blend-overlay" />
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
            description: "Every supplier is GST-verified and vetted by our team.",
            src: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&auto=format&fit=crop&q=60",
            alt: "GST Verified Suppliers",
            color: "blue",
        },
        {
            id: 2,
            title: "Savings",
            category: "ROI",
            description: "Our users save an average of ₹50,000 per month on sourcing.",
            src: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=400&auto=format&fit=crop&q=60",
            alt: "Save money on sourcing",
            color: "blue",
        },
        {
            id: 3,
            title: "Fast",
            category: "Speed",
            description: "Get matched in minutes, not days. AI does the heavy lifting.",
            src: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&auto=format&fit=crop&q=60",
            alt: "10x faster matching",
            color: "blue",
        },
        {
            id: 4,
            title: "Alerts",
            category: "Updates",
            description: "Never miss a deal. Get notified when prices drop.",
            src: "https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?w=400&auto=format&fit=crop&q=60",
            alt: "Price drop alerts",
            color: "blue",
        },
        {
            id: 5,
            title: "Compare",
            category: "Analysis",
            description: "Side-by-side price and quality comparisons.",
            src: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&auto=format&fit=crop&q=60",
            alt: "Compare suppliers",
            color: "blue",
        },
        {
            id: 6,
            title: "Private",
            category: "Security",
            description: "Your data is never sold. Direct supplier connections.",
            src: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=400&auto=format&fit=crop&q=60",
            alt: "Privacy first platform",
            color: "blue",
        },
    ];

    return (
        <div className="mx-auto flex w-full max-w-3xl flex-col items-center justify-center px-4 py-12">
            <h3 className="mb-2 text-sm font-bold uppercase tracking-widest text-slate-500">
                What You Get With ChidiyaAI
            </h3>
            <p className="mb-8 text-slate-400 text-center">
                Better than IndiaMart. Faster, smarter, and verified.
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

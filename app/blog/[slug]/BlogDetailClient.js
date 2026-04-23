"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const BRAND_COLOR = "#3b82f6";

export default function BlogDetailClient({ blog }) {
    const [currentSlide, setCurrentSlide] = useState(0);
    useEffect(() => { window.scrollTo(0, 0); }, []);

    const formatDate = (d) => new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
    const carouselImages = blog.media?.filter(m => m.mediaType === "image") || [];
    const videoMedia = blog.media?.find(m => m.mediaType === "video");

    const renderContent = (content) => {
        if (!content) return null;
        return content.split("\n\n").map((block, i) => {
            if (block.startsWith("## ")) return <h2 key={i} style={{ fontSize: "1.8rem", fontWeight: 700, color: "#0f172a", margin: "40px 0 16px", paddingBottom: 10, borderBottom: "2px solid rgba(59,130,246,0.1)" }}>{block.slice(3)}</h2>;
            if (block.startsWith("# ")) return <h1 key={i} style={{ fontSize: "2.4rem", fontWeight: 800, color: "#0f172a", margin: "40px 0 16px" }}>{block.slice(2)}</h1>;
            if (block.includes("\n- ")) {
                const lines = block.split("\n");
                const intro = lines[0] && !lines[0].startsWith("- ") ? lines[0] : null;
                const items = lines.filter(l => l.startsWith("- "));
                return (
                    <div key={i}>
                        {intro && <p style={{ fontSize: "1rem", lineHeight: 1.8, color: "#475569", margin: "16px 0 8px" }}>{intro}</p>}
                        <ul style={{ paddingLeft: 20, margin: "12px 0 20px", lineHeight: 1.9, color: "#475569", listStyleType: "none" }}>
                            {items.map((line, j) => {
                                const text = line.replace(/^- /, "");
                                const parts = text.split(/\*\*(.*?)\*\*/g);
                                return (
                                    <li key={j} style={{ paddingLeft: 24, position: "relative", marginBottom: 6 }}>
                                        <span style={{ position: "absolute", left: 0, top: 10, width: 6, height: 6, borderRadius: "50%", background: BRAND_COLOR }} />
                                        {parts.map((part, k) => k % 2 === 1 ? <strong key={k} style={{ color: "#0f172a" }}>{part}</strong> : part)}
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                );
            }
            const parts = block.split(/\*\*(.*?)\*\*/g);
            return <p key={i} style={{ fontSize: "1rem", lineHeight: 1.85, color: "#475569", margin: "16px 0" }}>{parts.map((part, k) => k % 2 === 1 ? <strong key={k} style={{ color: "#0f172a" }}>{part}</strong> : part)}</p>;
        });
    };

    return (
        <div style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
            {/* Hero */}
            <div style={{ position: "relative", minHeight: 360, display: "flex", alignItems: "flex-end", overflow: "hidden" }}>
                {blog.coverImage && <img src={blog.coverImage} alt={blog.title} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />}
                <div style={{ position: "absolute", inset: 0, background: blog.coverImage ? "linear-gradient(180deg, rgba(15,23,42,0.3) 0%, rgba(15,23,42,0.85) 100%)" : "linear-gradient(135deg, #0f172a 0%, #1e3a5f 40%, #3b82f6 100%)" }} />
                <div style={{ position: "relative", zIndex: 10, maxWidth: 1100, margin: "0 auto", width: "100%", padding: "120px 24px 40px" }}>
                    <Link href="/blog" style={{ color: "rgba(255,255,255,0.8)", fontWeight: 500, fontSize: ".95rem", textDecoration: "none", marginBottom: 16, display: "inline-block" }}>← Back to Blog</Link>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                        <span style={{ padding: "4px 14px", borderRadius: 20, background: "rgba(59,130,246,0.3)", color: "#fbbf24", fontSize: ".85rem", fontWeight: 600 }}>{blog.category}</span>
                    </div>
                    <h1 style={{ fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 800, lineHeight: 1.2, color: "white", maxWidth: 750 }}>{blog.title}</h1>
                    <p style={{ fontSize: ".95rem", color: "rgba(255,255,255,0.6)", marginTop: 12 }}>{formatDate(blog.createdAt)} · ChidiyaAI</p>
                </div>
            </div>

            {/* Carousel */}
            {blog.postType === "carousel" && carouselImages.length > 0 && (
                <div style={{ maxWidth: 800, margin: "40px auto 0", padding: "0 24px" }}>
                    <div style={{ position: "relative", borderRadius: 16, overflow: "hidden", background: "#f1f5f9" }}>
                        <img src={carouselImages[currentSlide]?.mediaUrl} alt="" style={{ width: "100%", maxHeight: 480, objectFit: "contain", display: "block" }} />
                        {carouselImages.length > 1 && (
                            <>
                                <button onClick={() => setCurrentSlide(p => p > 0 ? p - 1 : carouselImages.length - 1)} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", width: 40, height: 40, borderRadius: "50%", background: "rgba(0,0,0,0.5)", color: "#fff", border: "none", fontSize: 18, cursor: "pointer" }}>‹</button>
                                <button onClick={() => setCurrentSlide(p => p < carouselImages.length - 1 ? p + 1 : 0)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", width: 40, height: 40, borderRadius: "50%", background: "rgba(0,0,0,0.5)", color: "#fff", border: "none", fontSize: 18, cursor: "pointer" }}>›</button>
                                <div style={{ display: "flex", gap: 6, justifyContent: "center", padding: "12px 0" }}>
                                    {carouselImages.map((_, idx) => <button key={idx} onClick={() => setCurrentSlide(idx)} style={{ width: 8, height: 8, borderRadius: "50%", border: "none", cursor: "pointer", background: idx === currentSlide ? BRAND_COLOR : "#d1d5db" }} />)}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* Video */}
            {blog.postType === "video" && videoMedia && (
                <div style={{ maxWidth: 800, margin: "40px auto 0", padding: "0 24px" }}>
                    <video src={videoMedia.mediaUrl} controls playsInline style={{ width: "100%", borderRadius: 16, background: "#000", maxHeight: 500 }} poster={blog.coverImage || undefined} />
                </div>
            )}

            {/* Content */}
            <article style={{ paddingTop: 48, paddingBottom: 80 }}>
                <div style={{ maxWidth: 780, margin: "0 auto", padding: "0 24px" }}>
                    <div>{renderContent(blog.content)}</div>

                    {/* CTA */}
                    <div style={{ marginTop: 56, padding: 40, borderRadius: 16, background: "linear-gradient(135deg, #0f172a 0%, #3b82f6 100%)", textAlign: "center", position: "relative", overflow: "hidden" }}>
                        <div style={{ position: "absolute", top: -30, right: -30, width: 120, height: 120, borderRadius: "50%", background: "rgba(59,130,246,0.2)" }} />
                        <h3 style={{ fontSize: "2rem", fontWeight: 700, color: "white", marginBottom: 8 }}>Need Help Sourcing?</h3>
                        <p style={{ color: "rgba(255,255,255,0.7)", marginBottom: 24, maxWidth: 440, margin: "0 auto 24px" }}>Let our AI find the best suppliers for your business.</p>
                        <Link href="/account/chat" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "12px 32px", background: "#fbbf24", color: "#0f172a", borderRadius: 50, fontWeight: 600, textDecoration: "none" }}>Start Sourcing →</Link>
                    </div>
                </div>
            </article>
        </div>
    );
}

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const BRAND_COLOR = "#3b82f6";

export default function BlogClient() {
    const [blogs, setBlogs] = useState([]);
    const [showAll, setShowAll] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            try {
                const res = await fetch("/api/blog?published=true");
                if (res.ok) setBlogs(await res.json());
            } catch { /* silent */ }
            setLoading(false);
        })();
    }, []);

    const formatDate = (d) => new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
    const categories = ["all", ...new Set(blogs.map(b => b.category).filter(Boolean))];
    const filtered = selectedCategory === "all" ? blogs : blogs.filter(b => b.category === selectedCategory);
    const displayed = showAll ? filtered : filtered.slice(0, 6);

    return (
        <div style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
            {/* Hero Banner */}
            <section style={{ position: "relative", minHeight: 300, display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg, #0f172a 0%, #1e3a5f 40%, #3b82f6 100%)", overflow: "hidden" }}>
                <div style={{ position: "absolute", inset: 0, opacity: 0.06, backgroundImage: "radial-gradient(circle at 20% 50%, #fff 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
                <div style={{ position: "relative", zIndex: 10, textAlign: "center", padding: "80px 20px 60px" }}>
                    <h1 style={{ fontSize: "clamp(2.2rem, 5vw, 3.5rem)", fontWeight: 900, color: "#fff", marginBottom: 12 }}>
                        News & <span style={{ color: "#fbbf24" }}>Blog</span>
                    </h1>
                    <p style={{ fontSize: "1.1rem", color: "rgba(255,255,255,0.7)", maxWidth: 500, margin: "0 auto" }}>
                        Industry insights, tips, and guidance for B2B sourcing
                    </p>
                </div>
            </section>

            {/* Blog Grid */}
            <section style={{ padding: "60px 0 80px" }}>
                <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px" }}>
                    {/* Category Filter */}
                    {categories.length > 1 && (
                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 40, justifyContent: "center" }}>
                            {categories.map(cat => (
                                <button key={cat} onClick={() => { setSelectedCategory(cat); setShowAll(false); }}
                                    style={{ padding: "8px 20px", borderRadius: 50, border: "none", fontSize: 13, fontWeight: 600, cursor: "pointer", background: selectedCategory === cat ? BRAND_COLOR : "#f1f5f9", color: selectedCategory === cat ? "#fff" : "#64748b", transition: "all 0.2s" }}>
                                    {cat === "all" ? "All" : cat}
                                </button>
                            ))}
                        </div>
                    )}

                    {loading ? (
                        <p style={{ textAlign: "center", padding: "60px 0", color: "#94a3b8" }}>Loading...</p>
                    ) : displayed.length === 0 ? (
                        <p style={{ textAlign: "center", padding: "60px 0", color: "#94a3b8", fontSize: 18, fontWeight: 600 }}>Posts coming soon</p>
                    ) : (
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 28 }}>
                            {displayed.map(b => (
                                <Link key={b.slug} href={`/blog/${b.slug}`} style={{ textDecoration: "none", color: "inherit" }}>
                                    <article style={{ borderRadius: 16, overflow: "hidden", background: "#fff", border: "1px solid rgba(0,0,0,0.06)", transition: "all 0.3s", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}
                                        onMouseOver={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 12px 28px rgba(0,0,0,0.08)"; }}
                                        onMouseOut={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.04)"; }}>
                                        <div style={{ position: "relative", height: 200, overflow: "hidden" }}>
                                            {b.coverImage ? (
                                                <img src={b.coverImage} alt={b.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                            ) : (
                                                <div style={{ width: "100%", height: "100%", background: `linear-gradient(135deg, #0f172a, ${BRAND_COLOR})`, display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.2)", fontSize: "4rem", fontWeight: 800 }}>
                                                    {b.category?.charAt(0) || "B"}
                                                </div>
                                            )}
                                        </div>
                                        <div style={{ padding: "20px 24px 24px" }}>
                                            <span style={{ display: "inline-block", padding: "3px 12px", borderRadius: 20, fontSize: 11, fontWeight: 600, background: "rgba(59,130,246,0.08)", color: BRAND_COLOR, marginBottom: 10 }}>{b.category}</span>
                                            <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#0f172a", lineHeight: 1.4, marginBottom: 8, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{b.title}</h3>
                                            <p style={{ fontSize: 13, lineHeight: 1.7, color: "#64748b", marginBottom: 16, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{b.excerpt}</p>
                                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                                <span style={{ fontSize: 12, color: "#94a3b8" }}>{formatDate(b.createdAt)}</span>
                                                <span style={{ fontSize: 13, fontWeight: 600, color: BRAND_COLOR }}>Read More →</span>
                                            </div>
                                        </div>
                                    </article>
                                </Link>
                            ))}
                        </div>
                    )}

                    {!showAll && filtered.length > 6 && (
                        <div style={{ textAlign: "center", marginTop: 48 }}>
                            <button onClick={() => setShowAll(true)} style={{ background: BRAND_COLOR, color: "#fff", padding: "14px 36px", borderRadius: 50, fontWeight: 600, fontSize: "1rem", cursor: "pointer", border: "none" }}>View All ({filtered.length})</button>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}

"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { RollingTextList } from "@/components/ui/rolling-list";
import { MagneticText } from "@/components/ui/morphing-cursor";
import { RatingInteraction } from "@/components/ui/emoji-rating";
import Navbar from "@/components/ui/navbar";
import AnimatedSection from "@/components/ui/AnimatedSection";
import { useIsMobile } from "@/hooks/useIsMobile";

// Menu items for navbar
const navMenus = [
  { id: 1, title: "Features", url: "#features", dropdown: false },
  { id: 2, title: "Pricing", url: "#pricing", dropdown: false },
  { id: 3, title: "Reviews", url: "#testimonials", dropdown: false },
  { id: 4, title: "Sell on ChidiyaAI", url: "/supplier", dropdown: false, highlight: true },
];

// ─── Inline SVG Decorative Patterns ───────────────────────────────────────────

/** Dot grid pattern — visible on sides */
function DotGridDecoration({ side = "left", color = "#3b82f6", opacity = 0.18, top = "10%", size = 200 }) {
  const cols = 8;
  const rows = 10;
  const gap = size / cols;
  const posStyle = side === "left"
    ? { left: "20px", top }
    : { right: "20px", top };

  return (
    <svg
      width={size}
      height={gap * rows}
      style={{ position: "absolute", ...posStyle, opacity, pointerEvents: "none" }}
      aria-hidden="true"
    >
      {Array.from({ length: rows }).map((_, r) =>
        Array.from({ length: cols }).map((_, c) => (
          <circle
            key={`${r}-${c}`}
            cx={gap / 2 + c * gap}
            cy={gap / 2 + r * gap}
            r="3"
            fill={color}
          />
        ))
      )}
    </svg>
  );
}

/** Concentric circles decoration */
function CirclesDecoration({ side = "right", color = "#3b82f6", opacity = 0.12, top = "15%" }) {
  const posStyle = side === "left"
    ? { left: "-60px", top }
    : { right: "-60px", top };

  return (
    <svg
      width="280"
      height="280"
      style={{ position: "absolute", ...posStyle, opacity, pointerEvents: "none" }}
      aria-hidden="true"
    >
      <circle cx="140" cy="140" r="130" fill="none" stroke={color} strokeWidth="1.5" />
      <circle cx="140" cy="140" r="100" fill="none" stroke={color} strokeWidth="1.2" strokeDasharray="8 6" />
      <circle cx="140" cy="140" r="70" fill="none" stroke={color} strokeWidth="1" />
      <circle cx="140" cy="140" r="40" fill="none" stroke={color} strokeWidth="0.8" strokeDasharray="4 4" />
      <circle cx="140" cy="140" r="12" fill={color} opacity="0.3" />
    </svg>
  );
}

/** Wavy lines decoration */
function WavyLinesDecoration({ side = "left", color = "#6366f1", opacity = 0.15, top = "20%" }) {
  const posStyle = side === "left"
    ? { left: "10px", top }
    : { right: "10px", top };

  return (
    <svg
      width="180"
      height="400"
      style={{ position: "absolute", ...posStyle, opacity, pointerEvents: "none" }}
      aria-hidden="true"
    >
      <path d="M 30 0 Q 150 50 30 100 Q -90 150 30 200 Q 150 250 30 300 Q -90 350 30 400" fill="none" stroke={color} strokeWidth="2" />
      <path d="M 80 20 Q 180 70 80 120 Q -20 170 80 220 Q 180 270 80 320 Q -20 370 80 400" fill="none" stroke={color} strokeWidth="1.5" strokeDasharray="8 8" />
      <path d="M 130 40 Q 200 90 130 140 Q 60 190 130 240 Q 200 290 130 340" fill="none" stroke={color} strokeWidth="1" strokeDasharray="4 6" />
    </svg>
  );
}

/** Diagonal lines decoration */
function DiagonalLinesDecoration({ side = "right", color = "#3b82f6", opacity = 0.1, top = "5%" }) {
  const posStyle = side === "left"
    ? { left: "0px", top }
    : { right: "0px", top };

  return (
    <svg
      width="200"
      height="500"
      style={{ position: "absolute", ...posStyle, opacity, pointerEvents: "none" }}
      aria-hidden="true"
    >
      {Array.from({ length: 15 }).map((_, i) => (
        <line
          key={i}
          x1={0}
          y1={i * 35}
          x2={200}
          y2={i * 35 + 80}
          stroke={color}
          strokeWidth={i % 3 === 0 ? "2" : "1"}
          strokeDasharray={i % 2 === 0 ? "none" : "6 6"}
        />
      ))}
    </svg>
  );
}

/** Cross / Plus pattern */
function CrossPatternDecoration({ side = "left", color = "#8b5cf6", opacity = 0.12, top = "10%" }) {
  const posStyle = side === "left"
    ? { left: "30px", top }
    : { right: "30px", top };

  const crosses = [
    { x: 20, y: 30 }, { x: 80, y: 10 }, { x: 50, y: 80 },
    { x: 120, y: 50 }, { x: 30, y: 140 }, { x: 100, y: 120 },
    { x: 60, y: 200 }, { x: 140, y: 170 }, { x: 20, y: 250 },
    { x: 110, y: 230 }, { x: 70, y: 290 },
  ];

  return (
    <svg
      width="170"
      height="320"
      style={{ position: "absolute", ...posStyle, opacity, pointerEvents: "none" }}
      aria-hidden="true"
    >
      {crosses.map((p, i) => (
        <g key={i}>
          <line x1={p.x - 8} y1={p.y} x2={p.x + 8} y2={p.y} stroke={color} strokeWidth="2" />
          <line x1={p.x} y1={p.y - 8} x2={p.x} y2={p.y + 8} stroke={color} strokeWidth="2" />
        </g>
      ))}
    </svg>
  );
}

/** Triangle scatter decoration */
function TriangleDecoration({ side = "right", color = "#3b82f6", opacity = 0.13, top = "12%" }) {
  const posStyle = side === "left"
    ? { left: "15px", top }
    : { right: "15px", top };

  const triangles = [
    { x: 30, y: 20, s: 14, r: 0 },
    { x: 100, y: 60, s: 10, r: 45 },
    { x: 50, y: 120, s: 16, r: 90 },
    { x: 130, y: 100, s: 12, r: 30 },
    { x: 70, y: 200, s: 14, r: 60 },
    { x: 20, y: 260, s: 10, r: 120 },
    { x: 110, y: 240, s: 18, r: 180 },
    { x: 60, y: 330, s: 12, r: 15 },
  ];

  return (
    <svg
      width="170"
      height="370"
      style={{ position: "absolute", ...posStyle, opacity, pointerEvents: "none" }}
      aria-hidden="true"
    >
      {triangles.map((t, i) => (
        <polygon
          key={i}
          points={`${t.x},${t.y - t.s} ${t.x - t.s},${t.y + t.s} ${t.x + t.s},${t.y + t.s}`}
          fill="none"
          stroke={color}
          strokeWidth="1.5"
          transform={`rotate(${t.r} ${t.x} ${t.y})`}
        />
      ))}
    </svg>
  );
}

/** Diamond pattern decoration */
function DiamondDecoration({ side = "left", color = "#3b82f6", opacity = 0.14, top = "8%" }) {
  const posStyle = side === "left"
    ? { left: "25px", top }
    : { right: "25px", top };

  const diamonds = [
    { x: 40, y: 30, s: 12 }, { x: 110, y: 70, s: 16 },
    { x: 30, y: 130, s: 10 }, { x: 90, y: 170, s: 14 },
    { x: 60, y: 230, s: 18 }, { x: 130, y: 260, s: 12 },
    { x: 40, y: 310, s: 14 }, { x: 100, y: 350, s: 10 },
  ];

  return (
    <svg
      width="170"
      height="400"
      style={{ position: "absolute", ...posStyle, opacity, pointerEvents: "none" }}
      aria-hidden="true"
    >
      {diamonds.map((d, i) => (
        <polygon
          key={i}
          points={`${d.x},${d.y - d.s} ${d.x + d.s},${d.y} ${d.x},${d.y + d.s} ${d.x - d.s},${d.y}`}
          fill={i % 3 === 0 ? color : "none"}
          fillOpacity={i % 3 === 0 ? 0.2 : 0}
          stroke={color}
          strokeWidth="1.5"
        />
      ))}
    </svg>
  );
}

/** Zigzag lines decoration */
function ZigzagDecoration({ side = "right", color = "#6366f1", opacity = 0.13, top = "15%" }) {
  const posStyle = side === "left"
    ? { left: "10px", top }
    : { right: "10px", top };

  return (
    <svg
      width="160"
      height="400"
      style={{ position: "absolute", ...posStyle, opacity, pointerEvents: "none" }}
      aria-hidden="true"
    >
      <polyline points="20,0 60,30 20,60 60,90 20,120 60,150 20,180 60,210 20,240 60,270 20,300 60,330 20,360 60,390" fill="none" stroke={color} strokeWidth="2" />
      <polyline points="80,15 120,45 80,75 120,105 80,135 120,165 80,195 120,225 80,255 120,285 80,315 120,345 80,375" fill="none" stroke={color} strokeWidth="1.5" strokeDasharray="6 4" />
    </svg>
  );
}

/** Floating blob shape */
function BlobDecoration({ side = "left", color = "#3b82f6", opacity = 0.06, top = "5%" }) {
  const posStyle = side === "left"
    ? { left: "-80px", top }
    : { right: "-80px", top };

  return (
    <svg
      width="350"
      height="350"
      style={{ position: "absolute", ...posStyle, opacity, pointerEvents: "none" }}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={`blob-${side}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={color} stopOpacity="0.4" />
          <stop offset="100%" stopColor={color} stopOpacity="0.05" />
        </linearGradient>
      </defs>
      <path
        d="M175,30 C260,20 330,90 320,175 C310,260 240,330 160,320 C80,310 20,250 30,170 C40,90 90,40 175,30Z"
        fill={`url(#blob-${side})`}
      />
    </svg>
  );
}


// ─── Animated counter component ───────────────────────────────────────────────

function AnimatedCounter({ end, duration = 2000, suffix = "" }) {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true);
        }
      },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [isVisible]);

  useEffect(() => {
    if (!isVisible) return;
    let start = 0;
    const increment = end / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [isVisible, end, duration]);

  return <span ref={ref}>{count}{suffix}</span>;
}


// ─── MAIN PAGE ────────────────────────────────────────────────────────────────

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const isMobile = useIsMobile();

  const partners = ["TechCorp", "StyleHub", "GreenMart", "FastTrade", "PrimeBiz", "MaxSupply"];

  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif", color: "#0f172a" }}>
      <Navbar menus={navMenus} />

      {/* ════════════════════════════ HERO — UNCHANGED ════════════════════════════ */}
      <section style={{
        paddingTop: isMobile ? "80px" : "120px",
        paddingBottom: isMobile ? "40px" : "60px",
        paddingLeft: isMobile ? "16px" : "24px",
        paddingRight: isMobile ? "16px" : "24px",
        background: "linear-gradient(180deg, #f0f7ff 0%, #e8f4ff 30%, #ffffff 100%)",
        minHeight: isMobile ? "auto" : "85vh",
        position: "relative",
        overflow: "hidden"
      }}>
        {!isMobile && (
          <>
            <div style={{ position: "absolute", top: "10%", left: "10%", width: "400px", height: "400px", background: "radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 70%)", borderRadius: "50%", pointerEvents: "none" }} />
            <div style={{ position: "absolute", top: "30%", right: "5%", width: "300px", height: "300px", background: "radial-gradient(circle, rgba(139,92,246,0.06) 0%, transparent 70%)", borderRadius: "50%", pointerEvents: "none" }} />
          </>
        )}
        <div style={{ maxWidth: "1100px", margin: "0 auto", position: "relative", zIndex: 1 }}>
          <div style={{ textAlign: "center", maxWidth: "800px", margin: "0 auto" }}>
            <h1 style={{ fontSize: isMobile ? "32px" : "56px", fontWeight: "700", color: "#0f172a", lineHeight: "1.1", marginBottom: "16px", letterSpacing: "-1px" }}>
              Find <span style={{ color: "#3b82f6" }}>Verified</span> Suppliers<br />
              <span style={{ color: "#3b82f6" }}>10x Faster</span>
            </h1>
            <div style={{ marginBottom: "24px" }}>
              <MagneticText text="Smarter Service" hoverText="Better Results" />
            </div>
            <p style={{ fontSize: isMobile ? "16px" : "20px", color: "#64748b", marginBottom: "40px", lineHeight: "1.6", padding: isMobile ? "0 8px" : "0" }}>
              ChidiyaAI is your AI-powered B2B sourcing partner. Get matched with verified wholesalers, compare prices, and close deals — all in one place.
            </p>
            <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", maxWidth: "600px", margin: "0 auto 32px", backgroundColor: "white", borderRadius: "16px", boxShadow: "0 8px 30px rgba(0,0,0,0.12)", border: "2px solid #e2e8f0", overflow: "hidden" }}>
              <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder={isMobile ? "What are you looking for?" : "What are you looking to source? e.g., textile, electronics..."} style={{ flex: 1, padding: isMobile ? "16px" : "20px 24px", border: "none", outline: "none", fontSize: "16px", backgroundColor: "transparent" }} />
              <Link href="/onboarding" style={{ backgroundColor: "#3b82f6", color: "white", padding: isMobile ? "16px" : "20px 32px", textDecoration: "none", fontWeight: "600", fontSize: "16px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                Search <span>→</span>
              </Link>
            </div>
            <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", justifyContent: "center", gap: "16px", padding: isMobile ? "0 16px" : "0" }}>
              <Link href="/onboarding" style={{ backgroundColor: "#0f172a", color: "white", padding: "14px 28px", borderRadius: "8px", textDecoration: "none", fontWeight: "500", textAlign: "center" }}>Start Sourcing Free</Link>
              <Link href="#meet-chidi" style={{ backgroundColor: "white", color: "#0f172a", padding: "14px 28px", borderRadius: "8px", textDecoration: "none", fontWeight: "500", border: "1px solid #e2e8f0", textAlign: "center" }}>See How It Works</Link>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════ PARTNER LOGOS — MARQUEE ════════════════════ */}
      <section style={{ padding: isMobile ? "32px 16px" : "48px 0", backgroundColor: "white", borderBottom: "1px solid #f1f5f9", overflow: "hidden" }}>
        <AnimatedSection animation="fadeIn" duration={600}>
          <p style={{ fontSize: "12px", color: "#94a3b8", marginBottom: "24px", textTransform: "uppercase", letterSpacing: "2px", textAlign: "center", fontWeight: "600" }}>
            Trusted by verified wholesaler partners
          </p>
        </AnimatedSection>
        <div className="marquee-container" style={{ padding: "8px 0" }}>
          <div className="marquee-track" style={{ gap: isMobile ? "40px" : "64px", alignItems: "center" }}>
            {[...partners, ...partners, ...partners, ...partners].map((partner, i) => (
              <div key={i} style={{ fontSize: isMobile ? "18px" : "24px", fontWeight: "700", color: "#cbd5e1", whiteSpace: "nowrap", letterSpacing: "-0.5px", padding: "0 8px" }}>
                {partner}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════ MEET CHIDIYA ═══════════════════════════════ */}
      <section id="meet-chidi" style={{ padding: isMobile ? "60px 16px" : "100px 24px", backgroundColor: "#f8fafc", position: "relative", overflow: "hidden" }}>
        {/* ── Side Decorations: DOT GRID left + CONCENTRIC CIRCLES right ── */}
        {!isMobile && (
          <>
            <DotGridDecoration side="left" color="#3b82f6" opacity={0.18} top="8%" size={200} />
            <CirclesDecoration side="right" color="#6366f1" opacity={0.14} top="20%" />
            <WavyLinesDecoration side="left" color="#8b5cf6" opacity={0.08} top="55%" />
            <BlobDecoration side="right" color="#3b82f6" opacity={0.05} top="60%" />
          </>
        )}

        <div style={{ maxWidth: "1100px", margin: "0 auto", position: "relative", zIndex: 1 }}>
          <AnimatedSection animation="fadeUp" duration={600}>
            <div style={{ textAlign: "center", marginBottom: "60px" }}>
              <span style={{ display: "inline-block", padding: "8px 18px", background: "linear-gradient(135deg, #eff6ff, #e0e7ff)", color: "#3b82f6", borderRadius: "24px", fontSize: "13px", fontWeight: "600", marginBottom: "16px", letterSpacing: "0.5px", border: "1px solid rgba(59,130,246,0.15)" }}>
                ✨ Meet Chidiya
              </span>
              <h2 style={{ fontSize: isMobile ? "28px" : "42px", fontWeight: "bold", color: "#0f172a", marginBottom: "20px", lineHeight: "1.2" }}>
                Your Always-On{!isMobile && <br />}Wholesale Assistant
              </h2>
            </div>
          </AnimatedSection>

          {/* Agent Mode */}
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: isMobile ? "24px" : "40px", marginBottom: "60px", alignItems: "center" }}>
            <AnimatedSection animation="slideLeft" delay={100}>
              <div style={{ padding: isMobile ? "20px" : "40px" }}>
                <div style={{ display: "inline-block", padding: "8px 14px", background: "linear-gradient(135deg, #dcfce7, #d1fae5)", color: "#15803d", borderRadius: "12px", fontSize: "12px", fontWeight: "700", marginBottom: "20px", letterSpacing: "1px" }}>🤖 AGENT MODE</div>
                <h3 style={{ fontSize: isMobile ? "24px" : "28px", fontWeight: "bold", color: "#0f172a", marginBottom: "16px", lineHeight: "1.3" }}>Deals sent to you, personally matched</h3>
                <p style={{ fontSize: "16px", color: "#64748b", marginBottom: "24px", lineHeight: "1.7" }}>Chidiya monitors opportunities and sends you deals that match your profile, activity, and preferences — without you lifting a finger.</p>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", color: "#3b82f6", fontWeight: "500", padding: "12px 16px", background: "rgba(59,130,246,0.05)", borderRadius: "12px", border: "1px solid rgba(59,130,246,0.1)" }}>
                  <span style={{ fontSize: "20px" }}>📧</span>
                  <span>Receive curated deals via email from Chidiya</span>
                </div>
              </div>
            </AnimatedSection>
            <AnimatedSection animation="slideRight" delay={200}>
              <div style={{ borderRadius: "24px", padding: "3px", background: "linear-gradient(135deg, rgba(59,130,246,0.2), rgba(139,92,246,0.15), rgba(59,130,246,0.1))", boxShadow: "0 25px 60px rgba(59,130,246,0.12), 0 8px 24px rgba(0,0,0,0.06)", order: isMobile ? -1 : 0 }}>
                <div style={{ backgroundColor: "white", borderRadius: "22px", padding: "24px", height: isMobile ? "200px" : "400px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <div style={{ backgroundColor: "#f1f5f9", borderRadius: "16px", width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#94a3b8", fontSize: "16px" }}>
                    [Agent Mode Demo - Email Notifications]
                  </div>
                </div>
              </div>
            </AnimatedSection>
          </div>

          {/* Chat Mode */}
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: isMobile ? "24px" : "40px", alignItems: "center" }}>
            <AnimatedSection animation="slideLeft" delay={100}>
              <div style={{ borderRadius: "24px", padding: "3px", background: "linear-gradient(135deg, rgba(99,102,241,0.2), rgba(59,130,246,0.15), rgba(139,92,246,0.1))", boxShadow: "0 25px 60px rgba(99,102,241,0.12), 0 8px 24px rgba(0,0,0,0.06)" }}>
                <div style={{ backgroundColor: "white", borderRadius: "22px", padding: "24px", height: isMobile ? "200px" : "400px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <div style={{ backgroundColor: "#f1f5f9", borderRadius: "16px", width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#94a3b8", fontSize: isMobile ? "14px" : "16px" }}>
                    [Chat Mode Demo - AI Conversation]
                  </div>
                </div>
              </div>
            </AnimatedSection>
            <AnimatedSection animation="slideRight" delay={200}>
              <div style={{ padding: isMobile ? "20px" : "40px" }}>
                <div style={{ display: "inline-block", padding: "8px 14px", background: "linear-gradient(135deg, #eff6ff, #dbeafe)", color: "#3b82f6", borderRadius: "12px", fontSize: "12px", fontWeight: "700", marginBottom: "20px", letterSpacing: "1px" }}>💬 CHAT MODE</div>
                <h3 style={{ fontSize: isMobile ? "24px" : "28px", fontWeight: "bold", color: "#0f172a", marginBottom: "16px", lineHeight: "1.3" }}>Search deals anytime with Chidiya</h3>
                <p style={{ fontSize: "16px", color: "#64748b", marginBottom: "24px", lineHeight: "1.7" }}>Chat with Chidiya 24/7 to find deals by category, ROI, budget, or volume — all from verified suppliers.</p>
                <Link href="/auth/signin?redirect=onboarding" style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "linear-gradient(135deg, #0f172a, #1e293b)", color: "white", padding: "14px 28px", borderRadius: "12px", textDecoration: "none", fontWeight: "600", boxShadow: "0 4px 14px rgba(15,23,42,0.3)" }}>
                  Chat with Chidiya <span>→</span>
                </Link>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* ════════════════════════════ FEATURES — ROLLING LIST ════════════════════ */}
      <section id="features" style={{ padding: isMobile ? "60px 16px" : "100px 24px", backgroundColor: "white", position: "relative", overflow: "hidden" }}>
        {/* ── Side Decorations: CROSS PATTERN left + TRIANGLE right ── */}
        {!isMobile && (
          <>
            <CrossPatternDecoration side="left" color="#3b82f6" opacity={0.16} top="5%" />
            <TriangleDecoration side="right" color="#6366f1" opacity={0.14} top="8%" />
            <DotGridDecoration side="right" color="#8b5cf6" opacity={0.08} top="65%" size={120} />
          </>
        )}

        <AnimatedSection animation="fadeUp" style={{ position: "relative", zIndex: 1 }}>
          <div style={{ maxWidth: "1000px", margin: "0 auto", display: "flex", justifyContent: "center", alignItems: "center" }}>
            <RollingTextList />
          </div>
        </AnimatedSection>
      </section>

      {/* ════════════════════════════ VIDEO TUTORIAL ═════════════════════════════ */}
      <section style={{
        padding: isMobile ? "60px 16px" : "100px 24px",
        background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)",
        backgroundSize: "200% 200%",
        animation: "anim-gradient-shift 15s ease infinite",
        position: "relative",
        overflow: "hidden"
      }}>
        {/* ── Side Decorations: DIAGONAL LINES left + ZIGZAG right (light on dark) ── */}
        {!isMobile && (
          <>
            <DiagonalLinesDecoration side="left" color="#60a5fa" opacity={0.12} top="5%" />
            <ZigzagDecoration side="right" color="#818cf8" opacity={0.1} top="10%" />
            <DotGridDecoration side="right" color="#60a5fa" opacity={0.08} top="60%" size={120} />
            <CirclesDecoration side="left" color="#818cf8" opacity={0.07} top="55%" />
          </>
        )}

        <div style={{ maxWidth: "900px", margin: "0 auto", textAlign: "center", position: "relative", zIndex: 1 }}>
          <AnimatedSection animation="fadeUp" duration={600}>
            <span style={{ display: "inline-block", padding: "8px 18px", background: "linear-gradient(135deg, rgba(59,130,246,0.25), rgba(99,102,241,0.2))", color: "#60a5fa", borderRadius: "24px", fontSize: "13px", fontWeight: "600", marginBottom: "16px", border: "1px solid rgba(96,165,250,0.2)", letterSpacing: "0.5px" }}>
              🎬 Quick Tutorial
            </span>
            <h2 style={{ fontSize: isMobile ? "28px" : "36px", fontWeight: "bold", color: "white", marginBottom: "16px" }}>See ChidiyaAI in Action</h2>
            <p style={{ fontSize: isMobile ? "16px" : "18px", color: "#94a3b8", marginBottom: "40px" }}>Watch how businesses find verified suppliers in under 2 minutes</p>
          </AnimatedSection>

          <AnimatedSection animation="scaleIn" delay={200}>
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "24px" }}>
              {/* Hindi Version */}
              <div>
                <div style={{ textAlign: "center", marginBottom: "12px" }}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "8px 20px", background: "rgba(59,130,246,0.15)", borderRadius: "24px", color: "#60a5fa", fontSize: "14px", fontWeight: "600", border: "1px solid rgba(96,165,250,0.2)" }}>
                    🇮🇳 Listen in Hindi
                  </span>
                </div>
                <div style={{ borderRadius: "16px", overflow: "hidden", border: "1px solid rgba(59,130,246,0.2)", boxShadow: "0 0 40px rgba(59,130,246,0.12), 0 16px 48px rgba(0,0,0,0.25)", backgroundColor: "#0f172a" }}>
                  <video
                    controls
                    preload="metadata"
                    playsInline
                    style={{ width: "100%", height: "auto", display: "block", objectFit: "contain" }}
                    poster=""
                  >
                    <source src="/videos/hindi.mp4" type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                </div>
              </div>

              {/* English Version */}
              <div>
                <div style={{ textAlign: "center", marginBottom: "12px" }}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "8px 20px", background: "rgba(99,102,241,0.15)", borderRadius: "24px", color: "#a5b4fc", fontSize: "14px", fontWeight: "600", border: "1px solid rgba(165,180,252,0.2)" }}>
                    🌐 Listen in English
                  </span>
                </div>
                <div style={{ borderRadius: "16px", overflow: "hidden", border: "1px solid rgba(99,102,241,0.2)", boxShadow: "0 0 40px rgba(99,102,241,0.12), 0 16px 48px rgba(0,0,0,0.25)", backgroundColor: "#0f172a" }}>
                  <video
                    controls
                    preload="metadata"
                    playsInline
                    style={{ width: "100%", height: "auto", display: "block", objectFit: "contain" }}
                    poster=""
                  >
                    <source src="/videos/ChidiyaAIengad.mp4" type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                </div>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ════════════════════════════ PROVEN PERFORMANCE ═════════════════════════ */}
      <section style={{ padding: isMobile ? "60px 16px" : "100px 24px", backgroundColor: "white", position: "relative", overflow: "hidden" }}>
        {/* ── Side Decorations: DIAMOND left + WAVY right ── */}
        {!isMobile && (
          <>
            <DiamondDecoration side="left" color="#3b82f6" opacity={0.16} top="10%" />
            <WavyLinesDecoration side="right" color="#6366f1" opacity={0.12} top="8%" />
            <BlobDecoration side="left" color="#8b5cf6" opacity={0.04} top="55%" />
          </>
        )}

        <div style={{ maxWidth: "900px", margin: "0 auto", position: "relative", zIndex: 1 }}>
          <AnimatedSection animation="fadeUp">
            <div style={{ textAlign: "center", marginBottom: "48px" }}>
              <span style={{ display: "inline-block", padding: "8px 18px", background: "linear-gradient(135deg, #eff6ff, #e0e7ff)", color: "#3b82f6", borderRadius: "24px", fontSize: "13px", fontWeight: "600", marginBottom: "16px", border: "1px solid rgba(59,130,246,0.15)" }}>📊 Results</span>
              <h2 style={{ fontSize: isMobile ? "28px" : "36px", fontWeight: "bold", color: "#0f172a", marginBottom: "8px" }}>Proven Performance</h2>
              <p style={{ color: "#64748b", fontSize: "16px" }}>Growing every day with businesses like yours</p>
            </div>
          </AnimatedSection>

          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(4, 1fr)", gap: isMobile ? "16px" : "24px", textAlign: "center" }}>
            {[
              { end: 500, suffix: "+", label: "Verified Suppliers", color: "#3b82f6", bg: "rgba(59,130,246,0.06)", icon: "🏭" },
              { end: 2000, suffix: "+", label: "Successful Matches", color: "#6366f1", bg: "rgba(99,102,241,0.06)", icon: "🤝" },
              { end: 25, suffix: "L+", label: "Buyer Savings", prefix: "₹", color: "#8b5cf6", bg: "rgba(139,92,246,0.06)", icon: "💰" },
              { end: 95, suffix: "%", label: "Satisfaction Rate", color: "#10b981", bg: "rgba(16,185,129,0.06)", icon: "⭐" },
            ].map((stat, i) => (
              <AnimatedSection key={i} animation="fadeUp" delay={i * 120}>
                <div style={{
                  padding: isMobile ? "24px 12px" : "32px 16px",
                  borderRadius: "20px",
                  backgroundColor: stat.bg,
                  border: `1px solid ${stat.color}20`,
                  transition: "transform 0.3s ease, box-shadow 0.3s ease",
                }}>
                  <div style={{ fontSize: "28px", marginBottom: "8px" }}>{stat.icon}</div>
                  <div style={{ fontSize: isMobile ? "36px" : "48px", fontWeight: "800", color: stat.color, marginBottom: "8px", letterSpacing: "-1px" }}>
                    {stat.prefix || ""}<AnimatedCounter end={stat.end} suffix={stat.suffix} />
                  </div>
                  <div style={{ color: "#64748b", fontSize: "14px", fontWeight: "500" }}>{stat.label}</div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════ SIMPLIFY SECTION ═══════════════════════════ */}
      <section style={{ padding: isMobile ? "60px 16px" : "100px 24px", backgroundColor: "#f8fafc", position: "relative", overflow: "hidden" }}>
        {/* ── Side Decorations: ZIGZAG left + DOT GRID right ── */}
        {!isMobile && (
          <>
            <ZigzagDecoration side="left" color="#3b82f6" opacity={0.13} top="10%" />
            <DotGridDecoration side="right" color="#6366f1" opacity={0.15} top="15%" size={180} />
            <TriangleDecoration side="left" color="#8b5cf6" opacity={0.08} top="60%" />
          </>
        )}

        <div style={{ maxWidth: "1100px", margin: "0 auto", position: "relative", zIndex: 1 }}>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: isMobile ? "32px" : "60px", alignItems: "center" }}>
            <AnimatedSection animation="slideLeft">
              <div>
                <div style={{ width: "60px", height: "4px", background: "linear-gradient(90deg, #3b82f6, #6366f1)", borderRadius: "2px", marginBottom: "24px" }} />
                <h2 style={{ fontSize: isMobile ? "28px" : "40px", fontWeight: "bold", color: "#0f172a", marginBottom: "20px", lineHeight: "1.2" }}>
                  Simplify the way you find new products for your store
                </h2>
                <p style={{ fontSize: isMobile ? "16px" : "18px", color: "#64748b", marginBottom: "32px", lineHeight: "1.7" }}>
                  Stop wasting hours on IndiaMart. ChidiyaAI brings verified suppliers directly to you, with transparent pricing and instant communication.
                </p>
                <Link href="/onboarding" style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "linear-gradient(135deg, #3b82f6, #2563eb)", color: "white", padding: "16px 32px", borderRadius: "14px", textDecoration: "none", fontWeight: "600", fontSize: "16px", boxShadow: "0 8px 24px rgba(59,130,246,0.3)" }}>
                  Get Started Free <span>→</span>
                </Link>
              </div>
            </AnimatedSection>
            <AnimatedSection animation="slideRight" delay={200}>
              <div style={{ borderRadius: "24px", padding: "3px", background: "linear-gradient(135deg, rgba(59,130,246,0.15), rgba(139,92,246,0.1))", boxShadow: "0 25px 60px rgba(0,0,0,0.08), 0 0 40px rgba(59,130,246,0.06)" }}>
                <div style={{ backgroundColor: "#0f172a", borderRadius: "22px", overflow: "hidden" }}>
                  <video
                    controls
                    preload="metadata"
                    playsInline
                    style={{ width: "100%", height: "auto", display: "block", objectFit: "contain" }}
                  >
                    <source src="/videos/ChidiyaAI.mp4" type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* ════════════════════════════ TESTIMONIALS — ENHANCED ════════════════════ */}
      <section id="testimonials" style={{ padding: isMobile ? "60px 16px" : "100px 24px", backgroundColor: "white", position: "relative", overflow: "hidden" }}>
        {/* ── Side Decorations: CIRCLES left + CROSS right ── */}
        {!isMobile && (
          <>
            <CirclesDecoration side="left" color="#3b82f6" opacity={0.12} top="5%" />
            <CrossPatternDecoration side="right" color="#6366f1" opacity={0.14} top="3%" />
            <DiamondDecoration side="left" color="#8b5cf6" opacity={0.08} top="55%" />
            <DotGridDecoration side="right" color="#3b82f6" opacity={0.1} top="65%" size={140} />
          </>
        )}

        <div style={{ maxWidth: "1100px", margin: "0 auto", position: "relative", zIndex: 1 }}>
          <AnimatedSection animation="fadeUp">
            <div style={{ textAlign: "center", marginBottom: isMobile ? "40px" : "60px" }}>
              <span style={{ display: "inline-block", padding: "8px 18px", background: "linear-gradient(135deg, #fef3c7, #fde68a)", color: "#b45309", borderRadius: "24px", fontSize: "13px", fontWeight: "600", marginBottom: "16px", border: "1px solid rgba(180,83,9,0.15)" }}>
                ⭐ Testimonials
              </span>
              <h2 style={{ fontSize: isMobile ? "28px" : "40px", fontWeight: "bold", color: "#0f172a", marginBottom: "12px" }}>
                Loved by Businesses Across India
              </h2>
              <p style={{ fontSize: isMobile ? "16px" : "18px", color: "#64748b", maxWidth: "600px", margin: "0 auto" }}>
                From small retailers to large enterprises — see how ChidiyaAI is transforming B2B sourcing for thousands of businesses.
              </p>
            </div>
          </AnimatedSection>

          {/* ── Stats banner above testimonials ── */}
          <AnimatedSection animation="fadeUp" delay={100}>
            <div style={{
              display: "grid",
              gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(4, 1fr)",
              gap: "16px",
              marginBottom: "48px",
              padding: "24px",
              background: "linear-gradient(135deg, #0f172a, #1e293b)",
              borderRadius: "20px",
              textAlign: "center"
            }}>
              {[
                { value: "4.9/5", label: "Average Rating", icon: "⭐" },
                { value: "1200+", label: "Happy Buyers", icon: "😊" },
                { value: "98%", label: "Would Recommend", icon: "👍" },
                { value: "2min", label: "Avg Response Time", icon: "⚡" },
              ].map((s, i) => (
                <div key={i} style={{ padding: "12px" }}>
                  <div style={{ fontSize: "20px", marginBottom: "4px" }}>{s.icon}</div>
                  <div style={{ fontSize: isMobile ? "22px" : "28px", fontWeight: "800", color: "white", marginBottom: "4px" }}>{s.value}</div>
                  <div style={{ fontSize: "12px", color: "#94a3b8", fontWeight: "500", textTransform: "uppercase", letterSpacing: "0.5px" }}>{s.label}</div>
                </div>
              ))}
            </div>
          </AnimatedSection>

          {/* ── Video Testimonial Cards ── */}
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)", gap: "24px", marginBottom: "48px" }}>
            {[
              { name: "Rajesh Kumar", role: "Owner, TechFab Industries", quote: "ChidiyaAI helped us find verified suppliers 10x faster. Saved us ₹3 lakh in the first month!", stars: 5, savings: "₹3L saved", industry: "Electronics" },
              { name: "Priya Sharma", role: "Procurement, Sharma Textiles", quote: "The AI matching is incredible. We get exactly what we need, with verified GST suppliers only.", stars: 5, savings: "50% faster", industry: "Textiles" },
              { name: "Amit Patel", role: "Director, Green Earth Exports", quote: "Chidi understands our requirements perfectly. It's like having a dedicated sourcing team 24/7.", stars: 5, savings: "24/7 access", industry: "Agriculture" }
            ].map((t, i) => (
              <AnimatedSection key={i} animation="fadeUp" delay={i * 150}>
                <div style={{
                  borderRadius: "20px",
                  overflow: "hidden",
                  background: "linear-gradient(180deg, #f8fafc, white)",
                  border: "1px solid #e2e8f0",
                  boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
                  transition: "transform 0.3s ease, box-shadow 0.3s ease"
                }}>
                  {/* Video Placeholder */}
                  <div style={{ background: "linear-gradient(135deg, #1e293b, #0f172a)", aspectRatio: "9/12", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
                    {/* Industry badge */}
                    <span style={{ position: "absolute", top: "12px", left: "12px", padding: "4px 10px", background: "rgba(59,130,246,0.2)", color: "#60a5fa", borderRadius: "8px", fontSize: "11px", fontWeight: "600", backdropFilter: "blur(8px)" }}>
                      {t.industry}
                    </span>
                    {/* Key metric badge */}
                    <span style={{ position: "absolute", top: "12px", right: "12px", padding: "4px 10px", background: "rgba(16,185,129,0.2)", color: "#34d399", borderRadius: "8px", fontSize: "11px", fontWeight: "600", backdropFilter: "blur(8px)" }}>
                      {t.savings}
                    </span>
                    <div style={{ width: "60px", height: "60px", borderRadius: "50%", background: "rgba(255,255,255,0.1)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", border: "1px solid rgba(255,255,255,0.15)" }}>
                      <span style={{ fontSize: "24px", color: "white", marginLeft: "4px" }}>▶</span>
                    </div>
                    <p style={{ position: "absolute", bottom: "12px", left: "12px", right: "12px", color: "#94a3b8", fontSize: "12px" }}>[YouTube Shorts Placeholder]</p>
                  </div>
                  <div style={{ padding: "20px" }}>
                    <div style={{ marginBottom: "10px" }}>
                      {Array.from({ length: t.stars }).map((_, j) => (
                        <span key={j} style={{ color: "#f59e0b", fontSize: "16px", marginRight: "2px" }}>★</span>
                      ))}
                    </div>
                    <p style={{ fontSize: "14px", color: "#475569", marginBottom: "16px", lineHeight: "1.6", fontStyle: "italic" }}>"{t.quote}"</p>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <div style={{ width: "42px", height: "42px", borderRadius: "50%", background: "linear-gradient(135deg, #3b82f6, #6366f1)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: "700", fontSize: "16px" }}>
                        {t.name[0]}
                      </div>
                      <div>
                        <div style={{ fontWeight: "600", color: "#0f172a", fontSize: "14px" }}>{t.name}</div>
                        <div style={{ fontSize: "12px", color: "#64748b" }}>{t.role}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>

          {/* ── Written Testimonials Row ── */}
          <AnimatedSection animation="fadeUp" delay={100}>
            <div style={{
              display: "grid",
              gridTemplateColumns: isMobile ? "1fr" : "repeat(2, 1fr)",
              gap: "24px",
              marginBottom: "48px"
            }}>
              {[
                { name: "Deepak Verma", role: "Founder, UrbanKraft Interiors", quote: "We used to spend entire weeks finding furniture wholesalers on IndiaMart. With ChidiyaAI, identical quality was matched in 2 hours. The price comparison feature alone paid for our subscription.", stars: 5, avatar: "D" },
                { name: "Meera Reddy", role: "COO, Bharat Foods Pvt Ltd", quote: "What impressed us most is the GST verification. Every supplier Chidiya recommended was legitimate. No more wasted time on fake sellers. Our procurement costs dropped 30% in the first quarter.", stars: 5, avatar: "M" },
                { name: "Suresh Nair", role: "Owner, Kerala Spice Traders", quote: "As a small business owner, I don't have a procurement team. Chidiya acts like one. It understands my repeat orders, suggests better deals, and even alerts me when prices drop on my regular items.", stars: 5, avatar: "S" },
                { name: "Ananya Gupta", role: "Supply Chain Head, NexGen Retail", quote: "We handle 200+ SKUs and sourcing was chaos before ChidiyaAI. Now we have a single dashboard for all our suppliers, automated reorder suggestions, and real-time price tracking. Game changer.", stars: 5, avatar: "A" },
              ].map((t, i) => (
                <div key={i} style={{
                  padding: "28px",
                  borderRadius: "20px",
                  background: i % 2 === 0
                    ? "linear-gradient(135deg, #eff6ff, #f8fafc)"
                    : "linear-gradient(135deg, #f5f3ff, #f8fafc)",
                  border: "1px solid #e2e8f0",
                  position: "relative",
                  overflow: "hidden"
                }}>
                  {/* Large decorative quote */}
                  <span style={{
                    position: "absolute",
                    top: "12px",
                    right: "20px",
                    fontSize: "80px",
                    color: i % 2 === 0 ? "rgba(59,130,246,0.06)" : "rgba(99,102,241,0.06)",
                    fontFamily: "Georgia, serif",
                    lineHeight: 1
                  }}>❝</span>

                  <div style={{ marginBottom: "16px" }}>
                    {Array.from({ length: t.stars }).map((_, j) => (
                      <span key={j} style={{ color: "#f59e0b", fontSize: "16px", marginRight: "2px" }}>★</span>
                    ))}
                  </div>
                  <p style={{ fontSize: "15px", color: "#334155", marginBottom: "20px", lineHeight: "1.7", position: "relative", zIndex: 1 }}>
                    "{t.quote}"
                  </p>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div style={{
                      width: "44px", height: "44px", borderRadius: "50%",
                      background: i % 2 === 0
                        ? "linear-gradient(135deg, #3b82f6, #2563eb)"
                        : "linear-gradient(135deg, #6366f1, #4f46e5)",
                      display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: "700", fontSize: "18px"
                    }}>
                      {t.avatar}
                    </div>
                    <div>
                      <div style={{ fontWeight: "600", color: "#0f172a", fontSize: "15px" }}>{t.name}</div>
                      <div style={{ fontSize: "13px", color: "#64748b" }}>{t.role}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </AnimatedSection>

          {/* ── Trust badges row ── */}
          <AnimatedSection animation="fadeIn" delay={200}>
            <div style={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "center",
              gap: "16px",
              padding: "24px 0"
            }}>
              {[
                { icon: "🔒", text: "GST Verified" },
                { icon: "🛡️", text: "Secure Payments" },
                { icon: "📋", text: "Quality Assured" },
                { icon: "🔄", text: "Easy Returns" },
                { icon: "💬", text: "24/7 Support" },
              ].map((badge, i) => (
                <div key={i} style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "10px 18px",
                  borderRadius: "12px",
                  background: "rgba(59,130,246,0.04)",
                  border: "1px solid rgba(59,130,246,0.1)",
                  fontSize: "14px",
                  fontWeight: "500",
                  color: "#475569"
                }}>
                  <span style={{ fontSize: "18px" }}>{badge.icon}</span>
                  {badge.text}
                </div>
              ))}
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ════════════════════════════ PRICING ════════════════════════════════════ */}
      <section id="pricing" style={{ padding: isMobile ? "60px 16px" : "100px 24px", backgroundColor: "#f8fafc", position: "relative", overflow: "hidden" }}>
        {/* ── Side Decorations: DOT GRID left + WAVY LINES right ── */}
        {!isMobile && (
          <>
            <DotGridDecoration side="left" color="#3b82f6" opacity={0.15} top="8%" size={180} />
            <WavyLinesDecoration side="right" color="#6366f1" opacity={0.12} top="10%" />
            <CirclesDecoration side="left" color="#8b5cf6" opacity={0.08} top="60%" />
            <DiagonalLinesDecoration side="right" color="#3b82f6" opacity={0.06} top="55%" />
          </>
        )}

        <div style={{ maxWidth: "1000px", margin: "0 auto", position: "relative", zIndex: 1 }}>
          <AnimatedSection animation="fadeUp">
            <div style={{ textAlign: "center", marginBottom: "48px" }}>
              <span style={{ display: "inline-block", padding: "8px 18px", background: "linear-gradient(135deg, #eff6ff, #e0e7ff)", color: "#3b82f6", borderRadius: "24px", fontSize: "13px", fontWeight: "600", marginBottom: "16px", border: "1px solid rgba(59,130,246,0.15)" }}>💎 Pricing</span>
              <h2 style={{ fontSize: isMobile ? "28px" : "40px", fontWeight: "bold", color: "#0f172a", marginBottom: "16px" }}>Simple, Transparent Pricing</h2>
              <p style={{ fontSize: isMobile ? "16px" : "18px", color: "#64748b", marginBottom: "24px" }}>Start free. Upgrade when you&apos;re ready.</p>
              <Link href="/pricing" style={{ display: "inline-block", padding: "12px 24px", background: "linear-gradient(135deg, #0f172a, #1e293b)", color: "white", borderRadius: "10px", textDecoration: "none", fontSize: "14px", fontWeight: "600", boxShadow: "0 4px 14px rgba(15,23,42,0.25)" }}>
                View Full Pricing →
              </Link>
            </div>
          </AnimatedSection>

          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)", gap: "24px" }}>
            {/* Free */}
            <AnimatedSection animation="fadeUp" delay={0}>
              <div style={{ backgroundColor: "white", borderRadius: "20px", padding: "32px", border: "1px solid #e2e8f0", boxShadow: "0 4px 20px rgba(0,0,0,0.04)", height: "100%" }}>
                <h3 style={{ fontSize: "20px", fontWeight: "bold", color: "#0f172a", marginBottom: "4px" }}>Free</h3>
                <p style={{ fontSize: "14px", color: "#64748b", marginBottom: "20px" }}>For trying out</p>
                <div style={{ fontSize: "40px", fontWeight: "800", color: "#0f172a", marginBottom: "24px" }}>₹0</div>
                <ul style={{ listStyle: "none", padding: 0, marginBottom: "24px" }}>
                  {["10 searches/month", "Basic matching", "Email support"].map((f, i) => (
                    <li key={i} style={{ padding: "8px 0", fontSize: "14px", color: "#475569", display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ color: "#10b981", fontSize: "16px" }}>✓</span> {f}
                    </li>
                  ))}
                </ul>
                <Link href="/onboarding" style={{ display: "block", textAlign: "center", padding: "14px", border: "1px solid #e2e8f0", borderRadius: "12px", color: "#0f172a", textDecoration: "none", fontWeight: "600" }}>Get Started</Link>
              </div>
            </AnimatedSection>

            {/* Pro */}
            <AnimatedSection animation="fadeUp" delay={150}>
              <div className="shimmer-overlay" style={{ background: "linear-gradient(135deg, #0f172a, #1e293b)", borderRadius: "20px", padding: isMobile ? "24px" : "32px", color: "white", transform: isMobile ? "none" : "scale(1.05)", boxShadow: "0 20px 60px rgba(15,23,42,0.4), 0 0 40px rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.2)", position: "relative", height: "100%" }}>
                <span style={{ display: "inline-block", padding: "6px 14px", background: "linear-gradient(135deg, #3b82f6, #6366f1)", borderRadius: "20px", fontSize: "12px", marginBottom: "12px", fontWeight: "600" }}>⚡ Most Popular</span>
                <h3 style={{ fontSize: "20px", fontWeight: "bold", marginBottom: "4px" }}>Pro</h3>
                <p style={{ fontSize: "14px", color: "#94a3b8", marginBottom: "20px" }}>For growing businesses</p>
                <div style={{ fontSize: "40px", fontWeight: "800", marginBottom: "24px" }}>₹2,999<span style={{ fontSize: "16px", fontWeight: "normal", color: "#94a3b8" }}>/mo</span></div>
                <ul style={{ listStyle: "none", padding: 0, marginBottom: "24px" }}>
                  {["Unlimited searches", "Advanced AI matching", "Priority support", "Supplier verification reports"].map((f, i) => (
                    <li key={i} style={{ padding: "8px 0", fontSize: "14px", color: "#cbd5e1", display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ color: "#60a5fa" }}>✓</span> {f}
                    </li>
                  ))}
                </ul>
                <Link href="/onboarding?plan=pro" style={{ display: "block", textAlign: "center", padding: "14px", backgroundColor: "white", borderRadius: "12px", color: "#0f172a", textDecoration: "none", fontWeight: "600" }}>Start Free Trial</Link>
              </div>
            </AnimatedSection>

            {/* Enterprise */}
            <AnimatedSection animation="fadeUp" delay={300}>
              <div style={{ backgroundColor: "white", borderRadius: "20px", padding: "32px", border: "1px solid #e2e8f0", boxShadow: "0 4px 20px rgba(0,0,0,0.04)", height: "100%" }}>
                <h3 style={{ fontSize: "20px", fontWeight: "bold", color: "#0f172a", marginBottom: "4px" }}>Enterprise</h3>
                <p style={{ fontSize: "14px", color: "#64748b", marginBottom: "20px" }}>For large organizations</p>
                <div style={{ fontSize: "40px", fontWeight: "800", color: "#0f172a", marginBottom: "24px" }}>Custom</div>
                <ul style={{ listStyle: "none", padding: 0, marginBottom: "24px" }}>
                  {["Everything in Pro", "Dedicated account manager", "API access", "Custom integrations"].map((f, i) => (
                    <li key={i} style={{ padding: "8px 0", fontSize: "14px", color: "#475569", display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ color: "#10b981", fontSize: "16px" }}>✓</span> {f}
                    </li>
                  ))}
                </ul>
                <Link href="/contact" style={{ display: "block", textAlign: "center", padding: "14px", border: "1px solid #e2e8f0", borderRadius: "12px", color: "#0f172a", textDecoration: "none", fontWeight: "600" }}>Contact Sales</Link>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* ════════════════════════════ CTA SECTION ════════════════════════════════ */}
      <section style={{
        padding: isMobile ? "80px 16px" : "120px 24px",
        background: "linear-gradient(135deg, #0f172a 0%, #1e293b 25%, #0f172a 50%, #1a1f37 75%, #0f172a 100%)",
        backgroundSize: "400% 400%",
        animation: "anim-gradient-shift 12s ease infinite",
        position: "relative",
        overflow: "hidden"
      }}>
        {/* Wave divider */}
        <svg style={{ position: "absolute", top: "-1px", left: 0, width: "100%", pointerEvents: "none" }} height="60" viewBox="0 0 1440 60" preserveAspectRatio="none">
          <path d="M0,20 C360,55 720,5 1080,35 C1260,48 1380,20 1440,28 L1440,0 L0,0 Z" fill="#f8fafc" />
        </svg>

        {/* ── Side Decorations on dark bg ── */}
        {!isMobile && (
          <>
            <DiagonalLinesDecoration side="left" color="#60a5fa" opacity={0.1} top="10%" />
            <DotGridDecoration side="right" color="#818cf8" opacity={0.09} top="20%" size={140} />
            <CrossPatternDecoration side="right" color="#60a5fa" opacity={0.06} top="55%" />
          </>
        )}

        <div style={{ maxWidth: "700px", margin: "0 auto", textAlign: "center", position: "relative", zIndex: 1 }}>
          <AnimatedSection animation="fadeUp">
            <h2 style={{ fontSize: isMobile ? "28px" : "44px", fontWeight: "800", color: "white", marginBottom: "16px", lineHeight: "1.2", letterSpacing: "-0.5px" }}>
              Ready to transform your B2B sourcing?
            </h2>
            <p style={{ fontSize: isMobile ? "16px" : "18px", color: "#94a3b8", marginBottom: "40px", lineHeight: "1.6" }}>
              Join hundreds of businesses saving time and money with ChidiyaAI
            </p>
          </AnimatedSection>
          <AnimatedSection animation="scaleIn" delay={200}>
            <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", justifyContent: "center", gap: "16px" }}>
              <Link href="/onboarding" style={{ background: "linear-gradient(135deg, #ffffff, #f1f5f9)", color: "#0f172a", padding: "16px 36px", borderRadius: "14px", textDecoration: "none", fontWeight: "700", fontSize: "16px", boxShadow: "0 8px 30px rgba(255,255,255,0.15)", textAlign: "center" }}>
                Get Started Free ✨
              </Link>
              <Link href="/contact" style={{ border: "1px solid rgba(255,255,255,0.2)", color: "white", padding: "16px 36px", borderRadius: "14px", textDecoration: "none", fontWeight: "600", fontSize: "16px", backdropFilter: "blur(8px)", backgroundColor: "rgba(255,255,255,0.05)", textAlign: "center" }}>
                Talk to Sales →
              </Link>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ════════════════════════════ RATING ═════════════════════════════════════ */}
      <section style={{ padding: "60px 24px", backgroundColor: "white", borderTop: "1px solid #e2e8f0", position: "relative" }}>
        {!isMobile && (
          <>
            <DotGridDecoration side="left" color="#3b82f6" opacity={0.08} top="10%" size={100} />
            <TriangleDecoration side="right" color="#6366f1" opacity={0.06} top="5%" />
          </>
        )}
        <div style={{ maxWidth: "500px", margin: "0 auto", textAlign: "center" }}>
          <AnimatedSection animation="scaleIn">
            <div style={{ padding: "32px", borderRadius: "24px", background: "linear-gradient(135deg, rgba(59,130,246,0.03), rgba(139,92,246,0.03))", border: "1px solid rgba(59,130,246,0.08)" }}>
              <p style={{ fontSize: "12px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.2em", color: "#94a3b8", marginBottom: "24px" }}>How was your experience?</p>
              <RatingInteraction />
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ════════════════════════════ FOOTER ═════════════════════════════════════ */}
      <footer style={{ padding: isMobile ? "40px 16px" : "60px 24px", backgroundColor: "#0f172a", position: "relative" }}>
        <svg style={{ position: "absolute", top: "-1px", left: 0, width: "100%", pointerEvents: "none" }} height="40" viewBox="0 0 1440 40" preserveAspectRatio="none">
          <path d="M0,15 C480,40 960,0 1440,20 L1440,0 L0,0 Z" fill="white" />
        </svg>
        <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "2fr 1fr 1fr 1fr 1fr", gap: isMobile ? "24px" : "40px", marginBottom: "40px" }}>
            <div>
              <div style={{ fontWeight: "bold", fontSize: "22px", color: "white", marginBottom: "12px" }}>Chidiya<span style={{ color: "#3b82f6" }}>AI</span></div>
              <p style={{ color: "#64748b", fontSize: "14px", marginBottom: "20px", lineHeight: "1.6" }}>AI-powered B2B sourcing platform for Indian businesses.</p>
              <div style={{ display: "flex", gap: "10px" }}>
                {[{ name: "Twitter", icon: "𝕏" }, { name: "LinkedIn", icon: "in" }, { name: "Instagram", icon: "📷" }, { name: "YouTube", icon: "▶" }].map((social, i) => (
                  <a key={i} href="#" style={{ width: "40px", height: "40px", borderRadius: "10px", background: "linear-gradient(135deg, #1e293b, #334155)", display: "flex", alignItems: "center", justifyContent: "center", color: "#94a3b8", fontSize: "14px", textDecoration: "none", border: "1px solid rgba(255,255,255,0.06)" }}>
                    {social.icon}
                  </a>
                ))}
              </div>
            </div>
            <div>
              <div style={{ fontWeight: "600", color: "white", marginBottom: "16px", fontSize: "15px" }}>Product</div>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <Link href="#features" style={{ color: "#64748b", textDecoration: "none", fontSize: "14px" }}>Features</Link>
                <Link href="#pricing" style={{ color: "#64748b", textDecoration: "none", fontSize: "14px" }}>Pricing</Link>
                <Link href="#testimonials" style={{ color: "#64748b", textDecoration: "none", fontSize: "14px" }}>Reviews</Link>
              </div>
            </div>
            <div>
              <div style={{ fontWeight: "600", color: "white", marginBottom: "16px", fontSize: "15px" }}>Company</div>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <Link href="/about" style={{ color: "#64748b", textDecoration: "none", fontSize: "14px" }}>About</Link>
                <Link href="/blog" style={{ color: "#64748b", textDecoration: "none", fontSize: "14px" }}>Blog</Link>
                <Link href="/contact" style={{ color: "#64748b", textDecoration: "none", fontSize: "14px" }}>Contact</Link>
              </div>
            </div>
            <div>
              <div style={{ fontWeight: "600", color: "white", marginBottom: "16px", fontSize: "15px" }}>Legal</div>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <Link href="/privacy" style={{ color: "#64748b", textDecoration: "none", fontSize: "14px" }}>Privacy</Link>
                <Link href="/terms" style={{ color: "#64748b", textDecoration: "none", fontSize: "14px" }}>Terms</Link>
              </div>
            </div>
            <div>
              <div style={{ fontWeight: "600", color: "white", marginBottom: "16px", fontSize: "15px" }}>Support</div>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <Link href="/help" style={{ color: "#64748b", textDecoration: "none", fontSize: "14px" }}>Help Center</Link>
                <Link href="/faq" style={{ color: "#64748b", textDecoration: "none", fontSize: "14px" }}>FAQ</Link>
              </div>
            </div>
          </div>
          <div style={{ borderTop: "1px solid #1e293b", paddingTop: "24px", textAlign: "center", color: "#64748b", fontSize: "14px" }}>
            © 2025 ChidiyaAI. All rights reserved. Made with ❤️ in India
          </div>
        </div>
      </footer>
    </div>
  );
}

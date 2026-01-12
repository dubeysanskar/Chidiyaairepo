"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";

// Animated counter component
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

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");

  // Partner brands (placeholder names)
  const partners = ["TechCorp", "StyleHub", "GreenMart", "FastTrade", "PrimeBiz", "MaxSupply"];

  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif", color: "#0f172a" }}>
      {/* Navbar */}
      <nav style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        backgroundColor: "rgba(255,255,255,0.95)",
        backdropFilter: "blur(10px)",
        borderBottom: "1px solid #e2e8f0",
        padding: "0 24px",
        height: "64px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between"
      }}>
        <Link href="/" style={{ fontWeight: "bold", fontSize: "20px", color: "#0f172a", textDecoration: "none" }}>
          Chidiya<span style={{ color: "#3b82f6" }}>AI</span>
        </Link>
        <div style={{ display: "flex", gap: "32px", alignItems: "center" }}>
          <Link href="#features" style={{ color: "#64748b", textDecoration: "none", fontSize: "14px" }}>Features</Link>
          <Link href="#pricing" style={{ color: "#64748b", textDecoration: "none", fontSize: "14px" }}>Pricing</Link>
          <Link href="#testimonials" style={{ color: "#64748b", textDecoration: "none", fontSize: "14px" }}>Reviews</Link>
        </div>
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <Link href="/supplier" style={{
            color: "#3b82f6",
            textDecoration: "none",
            fontSize: "14px",
            fontWeight: "500"
          }}>
            Sell on ChidiyaAI
          </Link>
          <Link href="/auth/signin" style={{ color: "#64748b", textDecoration: "none", fontSize: "14px" }}>
            Sign in
          </Link>
          <Link href="/onboarding" style={{
            backgroundColor: "#0f172a",
            color: "white",
            padding: "10px 20px",
            borderRadius: "8px",
            textDecoration: "none",
            fontSize: "14px",
            fontWeight: "500"
          }}>
            Try for free
          </Link>
        </div>
      </nav>

      {/* Hero Section with Light Gradient */}
      <section style={{
        paddingTop: "120px",
        paddingBottom: "60px",
        background: "linear-gradient(180deg, #f0f7ff 0%, #e8f4ff 30%, #ffffff 100%)",
        minHeight: "85vh",
        position: "relative",
        overflow: "hidden"
      }}>
        {/* Subtle gradient orbs */}
        <div style={{
          position: "absolute",
          top: "10%",
          left: "10%",
          width: "400px",
          height: "400px",
          background: "radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 70%)",
          borderRadius: "50%",
          pointerEvents: "none"
        }} />
        <div style={{
          position: "absolute",
          top: "30%",
          right: "5%",
          width: "300px",
          height: "300px",
          background: "radial-gradient(circle, rgba(139,92,246,0.06) 0%, transparent 70%)",
          borderRadius: "50%",
          pointerEvents: "none"
        }} />

        <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 24px", position: "relative", zIndex: 1 }}>
          <div style={{ textAlign: "center", maxWidth: "800px", margin: "0 auto" }}>
            <h1 style={{
              fontSize: "56px",
              fontWeight: "700",
              color: "#0f172a",
              lineHeight: "1.1",
              marginBottom: "24px",
              letterSpacing: "-1px"
            }}>
              Find Verified Suppliers<br />
              <span style={{
                background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent"
              }}>10x Faster</span>
            </h1>
            <p style={{ fontSize: "20px", color: "#64748b", marginBottom: "40px", lineHeight: "1.6" }}>
              ChidiyaAI is your AI-powered B2B sourcing partner. Get matched with verified wholesalers, compare prices, and close deals — all in one place.
            </p>

            {/* Prominent Search Box */}
            <div style={{
              display: "flex",
              maxWidth: "600px",
              margin: "0 auto 32px",
              backgroundColor: "white",
              borderRadius: "16px",
              boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
              border: "2px solid #e2e8f0",
              overflow: "hidden"
            }}>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="What are you looking to source? e.g., textile, electronics..."
                style={{
                  flex: 1,
                  padding: "20px 24px",
                  border: "none",
                  outline: "none",
                  fontSize: "16px",
                  backgroundColor: "transparent"
                }}
              />
              <Link href="/onboarding" style={{
                backgroundColor: "#3b82f6",
                color: "white",
                padding: "20px 32px",
                textDecoration: "none",
                fontWeight: "600",
                fontSize: "16px",
                display: "flex",
                alignItems: "center",
                gap: "8px"
              }}>
                Search
                <span>→</span>
              </Link>
            </div>

            <div style={{ display: "flex", justifyContent: "center", gap: "16px" }}>
              <Link href="/onboarding" style={{
                backgroundColor: "#0f172a",
                color: "white",
                padding: "14px 28px",
                borderRadius: "8px",
                textDecoration: "none",
                fontWeight: "500"
              }}>
                Start Sourcing Free
              </Link>
              <Link href="#meet-chidi" style={{
                backgroundColor: "white",
                color: "#0f172a",
                padding: "14px 28px",
                borderRadius: "8px",
                textDecoration: "none",
                fontWeight: "500",
                border: "1px solid #e2e8f0"
              }}>
                See How It Works
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Partner Logos Section */}
      <section style={{ padding: "60px 24px", backgroundColor: "white", borderBottom: "1px solid #f1f5f9" }}>
        <div style={{ maxWidth: "1000px", margin: "0 auto", textAlign: "center" }}>
          <p style={{ fontSize: "14px", color: "#94a3b8", marginBottom: "32px", textTransform: "uppercase", letterSpacing: "1px" }}>
            Trusted by verified wholesaler partners
          </p>
          <div style={{
            display: "flex",
            justifyContent: "center",
            gap: "48px",
            flexWrap: "wrap",
            alignItems: "center"
          }}>
            {partners.map((partner, i) => (
              <div
                key={i}
                style={{
                  fontSize: "24px",
                  fontWeight: "bold",
                  color: "#cbd5e1",
                  transition: "all 0.3s ease",
                  cursor: "pointer",
                  filter: "grayscale(100%)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = "#3b82f6";
                  e.currentTarget.style.filter = "grayscale(0%)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = "#cbd5e1";
                  e.currentTarget.style.filter = "grayscale(100%)";
                }}
              >
                {partner}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Meet Chidiya Section - Sticky Scroll Effect */}
      <section id="meet-chidi" style={{ padding: "100px 24px", backgroundColor: "#f8fafc" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "80px", alignItems: "center" }}>
            {/* Left - Sticky Content */}
            <div style={{ position: "sticky", top: "100px" }}>
              <span style={{
                display: "inline-block",
                padding: "6px 14px",
                backgroundColor: "#eff6ff",
                color: "#3b82f6",
                borderRadius: "20px",
                fontSize: "13px",
                fontWeight: "500",
                marginBottom: "16px"
              }}>
                Meet Chidiya
              </span>
              <h2 style={{ fontSize: "42px", fontWeight: "bold", color: "#0f172a", marginBottom: "20px", lineHeight: "1.2" }}>
                Your Always-On<br />Wholesale Assistant
              </h2>
              <p style={{ fontSize: "18px", color: "#64748b", marginBottom: "32px", lineHeight: "1.7" }}>
                Chidiya is your AI-powered sourcing agent that works 24/7. Get personalized supplier matches, price comparisons, and deal alerts — automatically.
              </p>
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {["AI-powered supplier matching", "Real-time price alerts", "Verified GST suppliers only", "Direct chat with suppliers"].map((item, i) => (
                  <li key={i} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 0", fontSize: "16px", color: "#475569" }}>
                    <span style={{ color: "#22c55e", fontSize: "18px" }}>✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Right - Scrolling Image Placeholder */}
            <div>
              <div style={{
                backgroundColor: "white",
                borderRadius: "20px",
                padding: "40px",
                boxShadow: "0 20px 60px rgba(0,0,0,0.1)",
                marginBottom: "40px"
              }}>
                <div style={{
                  backgroundColor: "#f1f5f9",
                  borderRadius: "12px",
                  height: "300px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#94a3b8",
                  fontSize: "16px"
                }}>
                  [Chidi AI Demo Image Placeholder]
                </div>
              </div>
              <div style={{
                backgroundColor: "white",
                borderRadius: "20px",
                padding: "24px",
                boxShadow: "0 10px 40px rgba(0,0,0,0.08)"
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
                  <div style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white"
                  }}>⚡</div>
                  <div>
                    <div style={{ fontWeight: "600", color: "#0f172a" }}>Chidiya</div>
                    <div style={{ fontSize: "13px", color: "#64748b" }}>AI Sourcing Agent</div>
                  </div>
                </div>
                <p style={{ fontSize: "14px", color: "#475569", backgroundColor: "#f8fafc", padding: "12px", borderRadius: "8px" }}>
                  "Found 23 verified textile suppliers in Delhi NCR matching your requirements. Average savings: ₹45,000/order."
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - ROI Focus */}
      <section id="features" style={{ padding: "100px 24px", backgroundColor: "white" }}>
        <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "60px" }}>
            <h2 style={{ fontSize: "40px", fontWeight: "bold", color: "#0f172a", marginBottom: "16px" }}>
              What you get with ChidiyayaAI
            </h2>
            <p style={{ fontSize: "18px", color: "#64748b" }}>
              Better than IndiaMart. Faster, smarter, and verified.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "24px" }}>
            {[
              { icon: "🛡️", title: "100% Verified", desc: "Every supplier is GST-verified and vetted by our team." },
              { icon: "💰", title: "Save ₹50K+ Monthly", desc: "Our users save an average of ₹50,000 per month on sourcing." },
              { icon: "⚡", title: "10x Faster Matching", desc: "Get matched in minutes, not days. AI does the heavy lifting." },
              { icon: "🔔", title: "Price Drop Alerts", desc: "Never miss a deal. Get notified when prices drop." },
              { icon: "📊", title: "Compare Instantly", desc: "Side-by-side price and quality comparisons." },
              { icon: "🔒", title: "Privacy First", desc: "Your data is never sold. Direct supplier connections." }
            ].map((item, i) => (
              <div key={i} style={{
                backgroundColor: "#f8fafc",
                borderRadius: "16px",
                padding: "28px",
                transition: "all 0.3s ease"
              }}>
                <div style={{ fontSize: "32px", marginBottom: "16px" }}>{item.icon}</div>
                <h3 style={{ fontSize: "18px", fontWeight: "600", color: "#0f172a", marginBottom: "8px" }}>{item.title}</h3>
                <p style={{ fontSize: "14px", color: "#64748b", lineHeight: "1.6", margin: 0 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Video Tutorial Section */}
      <section style={{ padding: "100px 24px", backgroundColor: "#0f172a" }}>
        <div style={{ maxWidth: "900px", margin: "0 auto", textAlign: "center" }}>
          <span style={{
            display: "inline-block",
            padding: "6px 14px",
            backgroundColor: "rgba(59,130,246,0.2)",
            color: "#60a5fa",
            borderRadius: "20px",
            fontSize: "13px",
            fontWeight: "500",
            marginBottom: "16px"
          }}>
            Quick Tutorial
          </span>
          <h2 style={{ fontSize: "36px", fontWeight: "bold", color: "white", marginBottom: "16px" }}>
            See ChidiyaAI in Action
          </h2>
          <p style={{ fontSize: "18px", color: "#94a3b8", marginBottom: "40px" }}>
            Watch how businesses find verified suppliers in under 2 minutes
          </p>

          {/* Video Embed Placeholder */}
          <div style={{
            backgroundColor: "#1e293b",
            borderRadius: "16px",
            aspectRatio: "16/9",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "1px solid #334155"
          }}>
            <div style={{ textAlign: "center" }}>
              <div style={{
                width: "80px",
                height: "80px",
                borderRadius: "50%",
                backgroundColor: "#3b82f6",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 16px",
                cursor: "pointer"
              }}>
                <span style={{ fontSize: "32px", color: "white", marginLeft: "6px" }}>▶</span>
              </div>
              <p style={{ color: "#64748b", fontSize: "14px" }}>[YouTube Video Embed Placeholder]</p>
            </div>
          </div>
        </div>
      </section>

      {/* Proven Performance - Animated Counters */}
      <section style={{ padding: "80px 24px", backgroundColor: "white" }}>
        <div style={{ maxWidth: "900px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "48px" }}>
            <h2 style={{ fontSize: "36px", fontWeight: "bold", color: "#0f172a", marginBottom: "8px" }}>
              Proven Performance
            </h2>
            <p style={{ color: "#64748b" }}>Growing every day with businesses like yours</p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "32px", textAlign: "center" }}>
            <div>
              <div style={{ fontSize: "48px", fontWeight: "bold", color: "#3b82f6", marginBottom: "8px" }}>
                <AnimatedCounter end={500} suffix="+" />
              </div>
              <div style={{ color: "#64748b", fontSize: "14px" }}>Verified Suppliers</div>
            </div>
            <div>
              <div style={{ fontSize: "48px", fontWeight: "bold", color: "#3b82f6", marginBottom: "8px" }}>
                <AnimatedCounter end={2000} suffix="+" />
              </div>
              <div style={{ color: "#64748b", fontSize: "14px" }}>Successful Matches</div>
            </div>
            <div>
              <div style={{ fontSize: "48px", fontWeight: "bold", color: "#3b82f6", marginBottom: "8px" }}>
                ₹<AnimatedCounter end={25} suffix="L+" />
              </div>
              <div style={{ color: "#64748b", fontSize: "14px" }}>Buyer Savings</div>
            </div>
            <div>
              <div style={{ fontSize: "48px", fontWeight: "bold", color: "#3b82f6", marginBottom: "8px" }}>
                <AnimatedCounter end={95} suffix="%" />
              </div>
              <div style={{ color: "#64748b", fontSize: "14px" }}>Satisfaction Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* Simplify Section with Image */}
      <section style={{ padding: "100px 24px", backgroundColor: "#f8fafc" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "60px", alignItems: "center" }}>
            <div>
              <h2 style={{ fontSize: "40px", fontWeight: "bold", color: "#0f172a", marginBottom: "20px", lineHeight: "1.2" }}>
                Simplify the way you find new products for your store
              </h2>
              <p style={{ fontSize: "18px", color: "#64748b", marginBottom: "32px", lineHeight: "1.7" }}>
                Stop wasting hours on IndiaMart. ChidiyaAI brings verified suppliers directly to you, with transparent pricing and instant communication.
              </p>
              <Link href="/onboarding" style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                backgroundColor: "#3b82f6",
                color: "white",
                padding: "16px 32px",
                borderRadius: "8px",
                textDecoration: "none",
                fontWeight: "500",
                fontSize: "16px"
              }}>
                Get Started Free
                <span>→</span>
              </Link>
            </div>
            <div style={{
              backgroundColor: "white",
              borderRadius: "20px",
              height: "400px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 20px 60px rgba(0,0,0,0.1)",
              color: "#94a3b8"
            }}>
              [Product Discovery Image Placeholder]
            </div>
          </div>
        </div>
      </section>

      {/* Video Testimonials Section */}
      <section id="testimonials" style={{ padding: "100px 24px", backgroundColor: "white" }}>
        <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "60px" }}>
            <h2 style={{ fontSize: "40px", fontWeight: "bold", color: "#0f172a", marginBottom: "16px" }}>
              What Our Users Say
            </h2>
            <p style={{ fontSize: "18px", color: "#64748b" }}>
              Real businesses, real results
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "24px" }}>
            {[
              { name: "Rajesh Kumar", role: "Owner, TechFab Industries", quote: "ChidiyaAI helped us find verified suppliers 10x faster. Saved us ₹3 lakh in the first month!" },
              { name: "Priya Sharma", role: "Procurement, Sharma Textiles", quote: "The AI matching is incredible. We get exactly what we need, with verified GST suppliers only." },
              { name: "Amit Patel", role: "Director, Green Earth Exports", quote: "Chidi understands our requirements perfectly. It's like having a dedicated sourcing team 24/7." }
            ].map((t, i) => (
              <div key={i} style={{
                backgroundColor: "#f8fafc",
                borderRadius: "16px",
                overflow: "hidden"
              }}>
                {/* Video Placeholder */}
                <div style={{
                  backgroundColor: "#1e293b",
                  aspectRatio: "9/12",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  position: "relative"
                }}>
                  <div style={{
                    width: "60px",
                    height: "60px",
                    borderRadius: "50%",
                    backgroundColor: "rgba(255,255,255,0.2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer"
                  }}>
                    <span style={{ fontSize: "24px", color: "white", marginLeft: "4px" }}>▶</span>
                  </div>
                  <p style={{ position: "absolute", bottom: "12px", left: "12px", right: "12px", color: "#94a3b8", fontSize: "12px" }}>
                    [YouTube Shorts Placeholder]
                  </p>
                </div>
                <div style={{ padding: "20px" }}>
                  <p style={{ fontSize: "14px", color: "#475569", marginBottom: "16px", lineHeight: "1.6" }}>"{t.quote}"</p>
                  <div style={{ fontWeight: "600", color: "#0f172a" }}>{t.name}</div>
                  <div style={{ fontSize: "13px", color: "#64748b" }}>{t.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" style={{ padding: "100px 24px", backgroundColor: "#f8fafc" }}>
        <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "48px" }}>
            <h2 style={{ fontSize: "40px", fontWeight: "bold", color: "#0f172a", marginBottom: "16px" }}>
              Simple, Transparent Pricing
            </h2>
            <p style={{ fontSize: "18px", color: "#64748b", marginBottom: "24px" }}>
              Start free. Upgrade when you're ready.
            </p>

            {/* Monthly/Yearly Toggle Placeholder */}
            <Link href="/pricing" style={{
              display: "inline-block",
              padding: "12px 24px",
              backgroundColor: "#0f172a",
              color: "white",
              borderRadius: "8px",
              textDecoration: "none",
              fontSize: "14px",
              fontWeight: "500"
            }}>
              View Full Pricing →
            </Link>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "24px" }}>
            {/* Free */}
            <div style={{ backgroundColor: "white", borderRadius: "16px", padding: "32px", border: "1px solid #e2e8f0" }}>
              <h3 style={{ fontSize: "20px", fontWeight: "bold", color: "#0f172a", marginBottom: "4px" }}>Free</h3>
              <p style={{ fontSize: "14px", color: "#64748b", marginBottom: "20px" }}>For trying out</p>
              <div style={{ fontSize: "40px", fontWeight: "bold", color: "#0f172a", marginBottom: "24px" }}>₹0</div>
              <ul style={{ listStyle: "none", padding: 0, marginBottom: "24px" }}>
                <li style={{ padding: "8px 0", fontSize: "14px", color: "#475569" }}>✓ 10 searches/month</li>
                <li style={{ padding: "8px 0", fontSize: "14px", color: "#475569" }}>✓ Basic matching</li>
                <li style={{ padding: "8px 0", fontSize: "14px", color: "#475569" }}>✓ Email support</li>
              </ul>
              <Link href="/onboarding" style={{ display: "block", textAlign: "center", padding: "12px", border: "1px solid #e2e8f0", borderRadius: "8px", color: "#0f172a", textDecoration: "none", fontWeight: "500" }}>Get Started</Link>
            </div>

            {/* Pro */}
            <div style={{ backgroundColor: "#0f172a", borderRadius: "16px", padding: "32px", color: "white", transform: "scale(1.05)" }}>
              <span style={{ display: "inline-block", padding: "4px 12px", backgroundColor: "#3b82f6", borderRadius: "20px", fontSize: "12px", marginBottom: "12px" }}>Most Popular</span>
              <h3 style={{ fontSize: "20px", fontWeight: "bold", marginBottom: "4px" }}>Pro</h3>
              <p style={{ fontSize: "14px", color: "#94a3b8", marginBottom: "20px" }}>For growing businesses</p>
              <div style={{ fontSize: "40px", fontWeight: "bold", marginBottom: "24px" }}>₹2,999<span style={{ fontSize: "16px", fontWeight: "normal", color: "#94a3b8" }}>/mo</span></div>
              <ul style={{ listStyle: "none", padding: 0, marginBottom: "24px" }}>
                <li style={{ padding: "8px 0", fontSize: "14px", color: "#cbd5e1" }}>✓ Unlimited searches</li>
                <li style={{ padding: "8px 0", fontSize: "14px", color: "#cbd5e1" }}>✓ Advanced AI matching</li>
                <li style={{ padding: "8px 0", fontSize: "14px", color: "#cbd5e1" }}>✓ Priority support</li>
                <li style={{ padding: "8px 0", fontSize: "14px", color: "#cbd5e1" }}>✓ Supplier verification reports</li>
              </ul>
              <Link href="/onboarding?plan=pro" style={{ display: "block", textAlign: "center", padding: "12px", backgroundColor: "white", borderRadius: "8px", color: "#0f172a", textDecoration: "none", fontWeight: "500" }}>Start Free Trial</Link>
            </div>

            {/* Enterprise */}
            <div style={{ backgroundColor: "white", borderRadius: "16px", padding: "32px", border: "1px solid #e2e8f0" }}>
              <h3 style={{ fontSize: "20px", fontWeight: "bold", color: "#0f172a", marginBottom: "4px" }}>Enterprise</h3>
              <p style={{ fontSize: "14px", color: "#64748b", marginBottom: "20px" }}>For large organizations</p>
              <div style={{ fontSize: "40px", fontWeight: "bold", color: "#0f172a", marginBottom: "24px" }}>Custom</div>
              <ul style={{ listStyle: "none", padding: 0, marginBottom: "24px" }}>
                <li style={{ padding: "8px 0", fontSize: "14px", color: "#475569" }}>✓ Everything in Pro</li>
                <li style={{ padding: "8px 0", fontSize: "14px", color: "#475569" }}>✓ Dedicated account manager</li>
                <li style={{ padding: "8px 0", fontSize: "14px", color: "#475569" }}>✓ API access</li>
                <li style={{ padding: "8px 0", fontSize: "14px", color: "#475569" }}>✓ Custom integrations</li>
              </ul>
              <Link href="/contact" style={{ display: "block", textAlign: "center", padding: "12px", border: "1px solid #e2e8f0", borderRadius: "8px", color: "#0f172a", textDecoration: "none", fontWeight: "500" }}>Contact Sales</Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{ padding: "100px 24px", backgroundColor: "#0f172a" }}>
        <div style={{ maxWidth: "700px", margin: "0 auto", textAlign: "center" }}>
          <h2 style={{ fontSize: "40px", fontWeight: "bold", color: "white", marginBottom: "16px" }}>
            Ready to transform your B2B sourcing?
          </h2>
          <p style={{ fontSize: "18px", color: "#94a3b8", marginBottom: "32px" }}>
            Join hundreds of businesses saving time and money with ChidiyayaAI
          </p>
          <div style={{ display: "flex", justifyContent: "center", gap: "16px" }}>
            <Link href="/onboarding" style={{ backgroundColor: "white", color: "#0f172a", padding: "16px 32px", borderRadius: "8px", textDecoration: "none", fontWeight: "500" }}>Get Started Free</Link>
            <Link href="/contact" style={{ border: "1px solid #475569", color: "white", padding: "16px 32px", borderRadius: "8px", textDecoration: "none", fontWeight: "500" }}>Talk to Sales</Link>
          </div>
        </div>
      </section>

      {/* Footer with Social Links */}
      <footer style={{ padding: "60px 24px", backgroundColor: "#0f172a", borderTop: "1px solid #1e293b" }}>
        <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr", gap: "40px", marginBottom: "40px" }}>
            <div>
              <div style={{ fontWeight: "bold", fontSize: "20px", color: "white", marginBottom: "12px" }}>
                Chidiya<span style={{ color: "#3b82f6" }}>AI</span>
              </div>
              <p style={{ color: "#64748b", fontSize: "14px", marginBottom: "20px" }}>
                AI-powered B2B sourcing platform for Indian businesses.
              </p>
              {/* Social Icons */}
              <div style={{ display: "flex", gap: "12px" }}>
                {["Twitter", "LinkedIn", "Instagram", "YouTube"].map((social, i) => (
                  <a key={i} href="#" style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "8px",
                    backgroundColor: "#1e293b",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#64748b",
                    fontSize: "12px",
                    textDecoration: "none"
                  }}>
                    {social[0]}
                  </a>
                ))}
              </div>
            </div>
            <div>
              <div style={{ fontWeight: "600", color: "white", marginBottom: "16px" }}>Product</div>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <Link href="#features" style={{ color: "#64748b", textDecoration: "none", fontSize: "14px" }}>Features</Link>
                <Link href="#pricing" style={{ color: "#64748b", textDecoration: "none", fontSize: "14px" }}>Pricing</Link>
                <Link href="#testimonials" style={{ color: "#64748b", textDecoration: "none", fontSize: "14px" }}>Reviews</Link>
              </div>
            </div>
            <div>
              <div style={{ fontWeight: "600", color: "white", marginBottom: "16px" }}>Company</div>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <Link href="/about" style={{ color: "#64748b", textDecoration: "none", fontSize: "14px" }}>About</Link>
                <Link href="/blog" style={{ color: "#64748b", textDecoration: "none", fontSize: "14px" }}>Blog</Link>
                <Link href="/contact" style={{ color: "#64748b", textDecoration: "none", fontSize: "14px" }}>Contact</Link>
              </div>
            </div>
            <div>
              <div style={{ fontWeight: "600", color: "white", marginBottom: "16px" }}>Legal</div>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <Link href="/privacy" style={{ color: "#64748b", textDecoration: "none", fontSize: "14px" }}>Privacy</Link>
                <Link href="/terms" style={{ color: "#64748b", textDecoration: "none", fontSize: "14px" }}>Terms</Link>
              </div>
            </div>
            <div>
              <div style={{ fontWeight: "600", color: "white", marginBottom: "16px" }}>Support</div>
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

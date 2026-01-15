"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { RollingTextList } from "@/app/components/ui/rolling-list";
import { MagneticText } from "@/app/components/ui/morphing-cursor";
import { RatingInteraction } from "@/app/components/ui/emoji-rating";
import Navbar from "@/app/components/ui/navbar";
import { useIsMobile } from "@/app/hooks/useIsMobile";

// Menu items for navbar
const navMenus = [
  { id: 1, title: "Features", url: "#features", dropdown: false },
  { id: 2, title: "Pricing", url: "#pricing", dropdown: false },
  { id: 3, title: "Reviews", url: "#testimonials", dropdown: false },
  { id: 4, title: "Sell on ChidiyaAI", url: "/supplier", dropdown: false, highlight: true },
];

// Animated counter component
function AnimatedCounter({ end, duration = 2000, suffix = "" }: { end: number; duration?: number; suffix?: string }) {
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
  const isMobile = useIsMobile();
  const router = useRouter();
  const [user, setUser] = useState<{ email: string; role?: string } | null>(null);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subLoading, setSubLoading] = useState(false);
  const [showSubOptions, setShowSubOptions] = useState(false);

  // ... (useEffect remains same)

  const openSubOptions = () => {
    setShowSubOptions(true);
  };

  const handleRenew = () => {
    // Logic for "Renew / Existing"
    if (user) {
      // If logged in, go to checkout directly
      router.push("/checkout");
    } else {
      // If not logged in, go to login then checkout
      router.push("/supplier/login?next=checkout");
    }
  };

  const handleNewApp = () => {
    // Logic for "New Application"
    router.push("/supplier/register");
  };
  useEffect(() => {
    // Razorpay Script
    const scriptUrl = "https://checkout.razorpay.com/v1/checkout.js";
    if (!document.querySelector(`script[src="${scriptUrl}"]`)) {
      const script = document.createElement("script");
      script.src = scriptUrl;
      script.async = true;
      document.body.appendChild(script);
    }

    // Check Auth via Server Action
    import("@/app/actions/auth").then(({ getUser }) => {
      getUser().then((userData) => {
        if (userData) {
          setUser(userData);
        }
      });
    });
  }, []);

  const handleSubscribe = async (plan: string) => {
    if (!user) {
      router.push("/supplier/login?next=pricing"); // Redirect to supplier login if not authenticated
      return;
    }

    if (user.role && user.role !== "supplier") {
      if (confirm("You are currently using a free Buyer account. To subscribe to the Pro plan, you need a Supplier account. Would you like to create one?")) {
        router.push("/supplier/register?next=pricing");
      }
      return;
    }

    setSubLoading(true);
    const amount = plan === "pro" ? 299900 : 299900; // ₹2,999 in paise

    try {
      const res = await fetch("/api/payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, email: user.email, plan }),
      });

      const order = await res.json();
      if (!res.ok) throw new Error(order.error || "Payment initiation failed");
      if (!order.id) throw new Error("Payment initiation failed! No Order ID returned.");

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount,
        currency: "INR",
        name: "ChidiyaAI",
        description: "Pro Subscription",
        order_id: order.id,
        handler: async (response: any) => {
          alert("Payment successful! Payment ID: " + response.razorpay_payment_id);

          const expiryDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

          try {
            const updateRes = await fetch("/api/users/updateSubscription", {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                email: user.email,
                subscribe: true,
                subscriptionExpiry: expiryDate,
                orderId: order.id,
              }),
            });

            if (!updateRes.ok) throw new Error("Failed to update subscription");

            alert("Subscription activated successfully!");
            setIsSubscribed(true);
          } catch (error) {
            console.error("Subscription update failed:", error);
            alert("Payment succeeded, but subscription update failed.");
          }
          setSubLoading(false);
        },
        prefill: { email: user.email },
        theme: { color: "#3b82f6" },
      };

      const rzp1 = new (window as any).Razorpay(options);
      rzp1.open();
    } catch (error: any) {
      alert(error.message);
      setSubLoading(false);
    }
  };

  // Partner brands (placeholder names)
  const partners = ["TechCorp", "StyleHub", "GreenMart", "FastTrade", "PrimeBiz", "MaxSupply"];

  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif", color: "#0f172a" }}>
      {/* Navbar */}
      <Navbar menus={navMenus} />

      {/* Hero Section with Light Gradient */}
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
        {/* Subtle gradient orbs - hidden on mobile */}
        {!isMobile && (
          <>
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
          </>
        )}

        <div style={{ maxWidth: "1100px", margin: "0 auto", position: "relative", zIndex: 1 }}>
          <div style={{ textAlign: "center", maxWidth: "800px", margin: "0 auto" }}>
            {/* Hero Main Text */}
            <h1 style={{
              fontSize: isMobile ? "32px" : "56px",
              fontWeight: "700",
              color: "#0f172a",
              lineHeight: "1.1",
              marginBottom: "16px",
              letterSpacing: "-1px"
            }}>
              Find <span style={{ color: "#3b82f6" }}>Verified</span> Suppliers<br />
              <span style={{ color: "#3b82f6" }}>10x Faster</span>
            </h1>

            {/* MagneticText Component */}
            <div style={{ marginBottom: "24px" }}>
              <MagneticText text="Smarter Service" hoverText="Better Results" />
            </div>

            <p style={{ fontSize: isMobile ? "16px" : "20px", color: "#64748b", marginBottom: "40px", lineHeight: "1.6", padding: isMobile ? "0 8px" : "0" }}>
              ChidiyaAI is your AI-powered B2B sourcing partner. Get matched with verified wholesalers, compare prices, and close deals — all in one place.
            </p>

            {/* Prominent Search Box */}
            <div style={{
              display: "flex",
              flexDirection: isMobile ? "column" : "row",
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
                placeholder={isMobile ? "What are you looking for?" : "What are you looking to source? e.g., textile, electronics..."}
                style={{
                  flex: 1,
                  padding: isMobile ? "16px" : "20px 24px",
                  border: "none",
                  outline: "none",
                  fontSize: "16px",
                  backgroundColor: "transparent"
                }}
              />
              <Link href="/account/register" style={{
                backgroundColor: "#3b82f6",
                color: "white",
                padding: isMobile ? "16px" : "20px 32px",
                textDecoration: "none",
                fontWeight: "600",
                fontSize: "16px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px"
              }}>
                Search
                <span>→</span>
              </Link>
            </div>

            <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", justifyContent: "center", gap: "16px", padding: isMobile ? "0 16px" : "0" }}>
              <Link href="/account/register" style={{
                backgroundColor: "#0f172a",
                color: "white",
                padding: "14px 28px",
                borderRadius: "8px",
                textDecoration: "none",
                fontWeight: "500",
                textAlign: "center"
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
                border: "1px solid #e2e8f0",
                textAlign: "center"
              }}>
                See How It Works
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Partner Logos Section */}
      <section style={{ padding: isMobile ? "40px 16px" : "60px 0", backgroundColor: "white", borderBottom: "1px solid #f1f5f9" }}>
        <p style={{ fontSize: "12px", color: "#94a3b8", marginBottom: "24px", textTransform: "uppercase", letterSpacing: "1px", textAlign: "center" }}>
          Trusted by verified wholesaler partners
        </p>
        <div style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: isMobile ? "16px" : "32px",
          padding: "0 16px"
        }}>
          {partners.map((partner, i) => (
            <div
              key={i}
              style={{
                fontSize: isMobile ? "16px" : "20px",
                fontWeight: "bold",
                color: "#cbd5e1"
              }}
            >
              {partner}
            </div>
          ))}
        </div>
      </section>

      {/* Meet Chidiya Section */}
      <section id="meet-chidi" style={{ padding: isMobile ? "60px 16px" : "100px 24px", backgroundColor: "#f8fafc" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: "60px" }}>
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
            <h2 style={{ fontSize: isMobile ? "28px" : "42px", fontWeight: "bold", color: "#0f172a", marginBottom: "20px", lineHeight: "1.2" }}>
              Your Always-On{!isMobile && <br />}Wholesale Assistant
            </h2>
          </div>

          {/* Agent Mode Card */}
          <div style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
            gap: isMobile ? "24px" : "40px",
            marginBottom: "40px",
            alignItems: "center"
          }}>
            <div style={{ padding: isMobile ? "20px" : "40px" }}>
              <div style={{
                display: "inline-block",
                padding: "6px 12px",
                backgroundColor: "#dcfce7",
                color: "#15803d",
                borderRadius: "12px",
                fontSize: "12px",
                fontWeight: "600",
                marginBottom: "16px"
              }}>
                🤖 AGENT MODE
              </div>
              <h3 style={{ fontSize: "28px", fontWeight: "bold", color: "#0f172a", marginBottom: "16px" }}>
                Deals sent to you, personally matched
              </h3>
              <p style={{ fontSize: "16px", color: "#64748b", marginBottom: "24px", lineHeight: "1.7" }}>
                Chidiya monitors opportunities and sends you deals that match your profile, activity, and preferences — without you lifting a finger.
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", color: "#3b82f6", fontWeight: "500" }}>
                <span>📧</span>
                <span>Receive curated deals via email from Chidiya</span>
              </div>
            </div>
            <div style={{
              backgroundColor: "white",
              borderRadius: "20px",
              padding: "24px",
              boxShadow: "0 20px 60px rgba(0,0,0,0.1)",
              height: isMobile ? "200px" : "400px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              order: isMobile ? -1 : 0
            }}>
              <div style={{
                backgroundColor: "#f1f5f9",
                borderRadius: "16px",
                width: "100%",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#94a3b8",
                fontSize: "16px"
              }}>
                [Agent Mode Demo - Email Notifications]
              </div>
            </div>
          </div>

          {/* Chat Mode Card */}
          <div style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
            gap: isMobile ? "24px" : "40px",
            alignItems: "center"
          }}>
            <div style={{
              backgroundColor: "white",
              borderRadius: "20px",
              padding: "24px",
              boxShadow: "0 20px 60px rgba(0,0,0,0.1)",
              height: isMobile ? "200px" : "400px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}>
              <div style={{
                backgroundColor: "#f1f5f9",
                borderRadius: "16px",
                width: "100%",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#94a3b8",
                fontSize: isMobile ? "14px" : "16px"
              }}>
                [Chat Mode Demo - AI Conversation]
              </div>
            </div>
            <div style={{ padding: isMobile ? "20px" : "40px" }}>
              <div style={{
                display: "inline-block",
                padding: "6px 12px",
                backgroundColor: "#eff6ff",
                color: "#3b82f6",
                borderRadius: "12px",
                fontSize: "12px",
                fontWeight: "600",
                marginBottom: "16px"
              }}>
                💬 CHAT MODE
              </div>
              <h3 style={{ fontSize: "28px", fontWeight: "bold", color: "#0f172a", marginBottom: "16px" }}>
                Search deals anytime with Chidiya
              </h3>
              <p style={{ fontSize: "16px", color: "#64748b", marginBottom: "24px", lineHeight: "1.7" }}>
                Chat with Chidiya 24/7 to find deals by category, ROI, budget, or volume — all from verified suppliers.
              </p>
              <Link href="/auth/signin?redirect=onboarding" style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                backgroundColor: "#0f172a",
                color: "white",
                padding: "14px 24px",
                borderRadius: "8px",
                textDecoration: "none",
                fontWeight: "500"
              }}>
                Chat with Chidiya
                <span>→</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - Rolling Text List */}
      <section id="features" style={{ padding: isMobile ? "60px 16px" : "100px 24px", backgroundColor: "white" }}>
        <div style={{ maxWidth: "1000px", margin: "0 auto", display: "flex", justifyContent: "center", alignItems: "center" }}>
          <RollingTextList />
        </div>
      </section>

      {/* Video Tutorial Section */}
      <section style={{ padding: isMobile ? "60px 16px" : "100px 24px", backgroundColor: "#0f172a" }}>
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
          <h2 style={{ fontSize: isMobile ? "28px" : "36px", fontWeight: "bold", color: "white", marginBottom: "16px" }}>
            See ChidiyaAI in Action
          </h2>
          <p style={{ fontSize: isMobile ? "16px" : "18px", color: "#94a3b8", marginBottom: "40px" }}>
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
      <section style={{ padding: isMobile ? "60px 16px" : "100px 24px", backgroundColor: "white" }}>
        <div style={{ maxWidth: "900px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "48px" }}>
            <h2 style={{ fontSize: isMobile ? "28px" : "36px", fontWeight: "bold", color: "#0f172a", marginBottom: "8px" }}>
              Proven Performance
            </h2>
            <p style={{ color: "#64748b" }}>Growing every day with businesses like yours</p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(4, 1fr)", gap: isMobile ? "24px" : "32px", textAlign: "center" }}>
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
      <section style={{ padding: isMobile ? "60px 16px" : "100px 24px", backgroundColor: "#f8fafc" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: isMobile ? "32px" : "60px", alignItems: "center" }}>
            <div>
              <h2 style={{ fontSize: isMobile ? "28px" : "40px", fontWeight: "bold", color: "#0f172a", marginBottom: "20px", lineHeight: "1.2" }}>
                Simplify the way you find new products for your store
              </h2>
              <p style={{ fontSize: isMobile ? "16px" : "18px", color: "#64748b", marginBottom: "32px", lineHeight: "1.7" }}>
                Stop wasting hours on IndiaMart. ChidiyaAI brings verified suppliers directly to you, with transparent pricing and instant communication.
              </p>
              <Link href="/account/register" style={{
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
              height: isMobile ? "200px" : "400px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 20px 60px rgba(0,0,0,0.1)",
              color: "#94a3b8",
              fontSize: isMobile ? "14px" : "16px"
            }}>
              [Product Discovery Image Placeholder]
            </div>
          </div>
        </div>
      </section>

      {/* Video Testimonials Section */}
      <section id="testimonials" style={{ padding: isMobile ? "60px 16px" : "100px 24px", backgroundColor: "white" }}>
        <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: isMobile ? "40px" : "60px" }}>
            <h2 style={{ fontSize: isMobile ? "28px" : "40px", fontWeight: "bold", color: "#0f172a", marginBottom: "16px" }}>
              What Our Users Say
            </h2>
            <p style={{ fontSize: isMobile ? "16px" : "18px", color: "#64748b" }}>
              Real businesses, real results
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)", gap: "24px" }}>
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
      <section id="pricing" style={{ padding: isMobile ? "60px 16px" : "100px 24px", backgroundColor: "#f8fafc" }}>
        <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "48px" }}>
            <h2 style={{ fontSize: isMobile ? "28px" : "40px", fontWeight: "bold", color: "#0f172a", marginBottom: "16px" }}>
              Simple, Transparent Pricing
            </h2>
            <p style={{ fontSize: isMobile ? "16px" : "18px", color: "#64748b", marginBottom: "24px" }}>
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

          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)", gap: "24px" }}>
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
            <div style={{ backgroundColor: "#0f172a", borderRadius: "16px", padding: isMobile ? "24px" : "32px", color: "white", transform: isMobile ? "none" : "scale(1.05)" }}>
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
              {isSubscribed ? (
                <button disabled className="block w-full text-center padding-3 bg-gray-500 rounded-lg text-white font-medium cursor-not-allowed opacity-70 p-3">
                  Active Plan
                </button>
              ) : (
                <button
                  onClick={openSubOptions}
                  disabled={subLoading}
                  className="block w-full text-center p-3 bg-white rounded-lg text-[#0f172a] font-medium hover:bg-gray-100 transition-colors"
                >
                  {subLoading ? "Processing..." : "Start Free Trial"}
                </button>
              )}
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
      <section style={{ padding: isMobile ? "60px 16px" : "100px 24px", backgroundColor: "#0f172a" }}>
        <div style={{ maxWidth: "700px", margin: "0 auto", textAlign: "center" }}>
          <h2 style={{ fontSize: isMobile ? "28px" : "40px", fontWeight: "bold", color: "white", marginBottom: "16px" }}>
            Ready to transform your B2B sourcing?
          </h2>
          <p style={{ fontSize: isMobile ? "16px" : "18px", color: "#94a3b8", marginBottom: "32px" }}>
            Join hundreds of businesses saving time and money with ChidiyaAI
          </p>
          <div style={{ display: "flex", justifyContent: "center", gap: "16px" }}>
            <Link href="/onboarding" style={{ backgroundColor: "white", color: "#0f172a", padding: "16px 32px", borderRadius: "8px", textDecoration: "none", fontWeight: "500" }}>Get Started Free</Link>
            <Link href="/contact" style={{ border: "1px solid #475569", color: "white", padding: "16px 32px", borderRadius: "8px", textDecoration: "none", fontWeight: "500" }}>Talk to Sales</Link>
          </div>
        </div>
      </section>

      {/* Rating Section */}
      <section style={{ padding: "60px 24px", backgroundColor: "white", borderTop: "1px solid #e2e8f0" }}>
        <div style={{ maxWidth: "500px", margin: "0 auto", textAlign: "center" }}>
          <p style={{ fontSize: "12px", fontWeight: "500", textTransform: "uppercase", letterSpacing: "0.2em", color: "#94a3b8", marginBottom: "24px" }}>
            How was your experience?
          </p>
          <RatingInteraction />
        </div>
      </section>

      {/* Footer with Social Links */}
      <footer style={{ padding: isMobile ? "40px 16px" : "60px 24px", backgroundColor: "#0f172a", borderTop: "1px solid #1e293b" }}>
        <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
          <div style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr 1fr" : "2fr 1fr 1fr 1fr 1fr",
            gap: isMobile ? "24px" : "40px",
            marginBottom: "40px"
          }}>
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
      {/* Subscription Options Modal */}
      {showSubOptions && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0,0,0,0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: "white",
            padding: "32px",
            borderRadius: "16px",
            maxWidth: "400px",
            width: "90%",
            textAlign: "center"
          }}>
            <h3 style={{ fontSize: "20px", fontWeight: "bold", marginBottom: "24px", color: "#0f172a" }}>
              Choose an Option
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <button
                onClick={handleNewApp}
                style={{
                  padding: "16px",
                  backgroundColor: "#3b82f6",
                  color: "white",
                  borderRadius: "12px",
                  border: "none",
                  fontWeight: "600",
                  cursor: "pointer",
                  fontSize: "16px"
                }}
              >
                Create New Account
              </button>

              <button
                onClick={handleRenew}
                style={{
                  padding: "16px",
                  backgroundColor: "white",
                  color: "#0f172a",
                  borderRadius: "12px",
                  border: "1px solid #e2e8f0",
                  fontWeight: "600",
                  cursor: "pointer",
                  fontSize: "16px"
                }}
              >
                Renew / Existing Account
              </button>
            </div>

            <button
              onClick={() => setShowSubOptions(false)}
              style={{
                marginTop: "24px",
                color: "#64748b",
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: "14px",
                textDecoration: "underline"
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

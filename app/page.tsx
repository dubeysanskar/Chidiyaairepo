"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef, useCallback } from "react";
import dynamic from "next/dynamic";
import Navbar from "@/app/components/ui/navbar";
import GlobalChatWidget from "@/app/components/GlobalChatWidget";
import { useIsMobile } from "@/app/hooks/useIsMobile";

// Dynamic imports for heavy components (bundle-dynamic-imports)
const RollingTextList = dynamic(() => import("@/app/components/ui/rolling-list").then(mod => ({ default: mod.RollingTextList })), { ssr: false });
const MagneticText = dynamic(() => import("@/app/components/ui/morphing-cursor").then(mod => ({ default: mod.MagneticText })), { ssr: false });
const RatingInteraction = dynamic(() => import("@/app/components/ui/emoji-rating").then(mod => ({ default: mod.RatingInteraction })), { ssr: false });

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

  // Buyer subscription - opens Razorpay for ₹499
  const handleBuyerSubscribe = async () => {
    if (!user) {
      // Redirect to buyer login if not authenticated
      router.push("/account/login?redirect=/account/chat");
      return;
    }

    setSubLoading(true);
    const amount = 49900; // ₹499 in paise

    try {
      const res = await fetch("/api/payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, email: user.email, plan: "buyer_pro" }),
      });

      const order = await res.json();
      if (!res.ok) throw new Error(order.error || "Payment initiation failed");
      if (!order.id) throw new Error("Payment initiation failed! No Order ID returned.");

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount,
        currency: "INR",
        name: "ChidiyaAI",
        description: "Buyer Pro Subscription - ₹499/mo",
        order_id: order.id,
        handler: async (response: any) => {
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
                plan: "buyer_pro",
              }),
            });

            if (!updateRes.ok) throw new Error("Failed to update subscription");

            alert("Subscription activated successfully! You now have unlimited enquiries.");
            setIsSubscribed(true);
          } catch (error) {
            console.error("Subscription update failed:", error);
            alert("Payment succeeded, but subscription update failed. Please contact support.");
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
              ChidiyaAI helps you find the right suppliers, compare prices, and close deals faster.
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
              <button
                onClick={() => {
                  // Store query in sessionStorage for use in chat
                  if (searchQuery) {
                    sessionStorage.setItem('pendingSearchQuery', searchQuery);
                  }
                  // Always go directly to chat
                  router.push('/account/chat');
                }}
                style={{
                  backgroundColor: "#3b82f6",
                  color: "white",
                  padding: isMobile ? "16px" : "20px 32px",
                  border: "none",
                  fontWeight: "600",
                  fontSize: "16px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  cursor: "pointer"
                }}
              >
                Search
                <span>→</span>
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", justifyContent: "center", gap: "16px", padding: isMobile ? "0 16px" : "0" }}>
              <button
                onClick={() => {
                  // Go directly to chat
                  router.push('/account/chat');
                }}
                style={{
                  backgroundColor: "#0f172a",
                  color: "white",
                  padding: "14px 28px",
                  borderRadius: "8px",
                  border: "none",
                  fontWeight: "500",
                  textAlign: "center",
                  cursor: "pointer"
                }}
              >
                Start Sourcing Free
              </button>
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
              AI That Works for{!isMobile && <br />}Your Business
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
                Deals matched just for you
              </h3>
              <p style={{ fontSize: "16px", color: "#64748b", marginBottom: "24px", lineHeight: "1.7" }}>
                Chidiya finds and sends the right deals based on what matters to your business.
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", color: "#3b82f6", fontWeight: "500" }}>
                <span>📧</span>
                <span>ChidiyaAI monitors opportunities and delivers personally matched deals — automatically.</span>
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
                Simplify the way you find new products for your store.
              </h2>
              <p style={{ fontSize: isMobile ? "16px" : "18px", color: "#64748b", marginBottom: "32px", lineHeight: "1.7" }}>
                Stop wasting time on outdated sourcing methods. ChidiyaAI connects you with verified suppliers, transparent pricing, and instant communication — all in one place.
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
            <p style={{ fontSize: isMobile ? "16px" : "18px", color: "#64748b" }}>
              Start free. Upgrade when you're ready.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(2, 1fr)", gap: "24px", maxWidth: "700px", margin: "0 auto" }}>
            {/* Free */}
            <div style={{ backgroundColor: "white", borderRadius: "16px", padding: "32px", border: "1px solid #e2e8f0" }}>
              <h3 style={{ fontSize: "20px", fontWeight: "bold", color: "#0f172a", marginBottom: "4px" }}>Free</h3>
              <p style={{ fontSize: "14px", color: "#64748b", marginBottom: "20px" }}>For trying out</p>
              <div style={{ fontSize: "40px", fontWeight: "bold", color: "#0f172a", marginBottom: "24px" }}>₹0</div>
              <ul style={{ listStyle: "none", padding: 0, marginBottom: "24px" }}>
                <li style={{ padding: "8px 0", fontSize: "14px", color: "#475569" }}>✓ 5 free enquiries</li>
                <li style={{ padding: "8px 0", fontSize: "14px", color: "#475569" }}>✓ Basic supplier matching</li>
                <li style={{ padding: "8px 0", fontSize: "14px", color: "#475569" }}>✓ Email support</li>
              </ul>
              <Link href="/account/chat" style={{ display: "block", textAlign: "center", padding: "12px", border: "1px solid #e2e8f0", borderRadius: "8px", color: "#0f172a", textDecoration: "none", fontWeight: "500" }}>Get Started</Link>
            </div>

            {/* Pro */}
            <div style={{ backgroundColor: "#0f172a", borderRadius: "16px", padding: isMobile ? "24px" : "32px", color: "white" }}>
              <span style={{ display: "inline-block", padding: "4px 12px", backgroundColor: "#3b82f6", borderRadius: "20px", fontSize: "12px", marginBottom: "12px" }}>Most Popular</span>
              <h3 style={{ fontSize: "20px", fontWeight: "bold", marginBottom: "4px" }}>Pro</h3>
              <p style={{ fontSize: "14px", color: "#94a3b8", marginBottom: "20px" }}>For serious buyers</p>
              <div style={{ fontSize: "40px", fontWeight: "bold", marginBottom: "24px" }}>₹499<span style={{ fontSize: "16px", fontWeight: "normal", color: "#94a3b8" }}>/mo</span></div>
              <ul style={{ listStyle: "none", padding: 0, marginBottom: "24px" }}>
                <li style={{ padding: "8px 0", fontSize: "14px", color: "#cbd5e1" }}>✓ Unlimited enquiries</li>
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
                  onClick={handleBuyerSubscribe}
                  disabled={subLoading}
                  className="block w-full text-center p-3 bg-white rounded-lg text-[#0f172a] font-medium hover:bg-gray-100 transition-colors"
                >
                  {subLoading ? "Processing..." : "Subscribe Now"}
                </button>
              )}
            </div>
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

      {/* Footer with Legal Links & Marquee */}
      <footer style={{ backgroundColor: "#0f172a", borderTop: "1px solid #1e293b" }}>
        <div style={{ padding: isMobile ? "40px 16px" : "60px 24px" }}>
          <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
            <div style={{
              display: "grid",
              gridTemplateColumns: isMobile ? "1fr 1fr" : "2fr 1fr 1fr 1fr 1fr",
              gap: isMobile ? "24px" : "40px",
              marginBottom: "40px"
            }}>
              <div>
                <Link href="/" style={{ display: "inline-block", marginBottom: "12px" }}>
                  <img src="/assests/chidiyaailogo.png" alt="ChidiyaAI" style={{ height: "40px", width: "auto" }} />
                </Link>
                <p style={{ color: "#64748b", fontSize: "14px", marginBottom: "20px" }}>
                  AI-powered B2B sourcing platform for Indian businesses.
                </p>
                {/* Social Media Icons */}
                <div style={{ display: "flex", gap: "12px" }}>
                  <a href="https://twitter.com/chidiyaai" target="_blank" rel="noopener noreferrer" style={{
                    width: "36px", height: "36px", borderRadius: "8px", backgroundColor: "#1e293b",
                    display: "flex", alignItems: "center", justifyContent: "center", color: "#94a3b8", textDecoration: "none"
                  }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
                  </a>
                  <a href="https://linkedin.com/company/chidiyaai" target="_blank" rel="noopener noreferrer" style={{
                    width: "36px", height: "36px", borderRadius: "8px", backgroundColor: "#1e293b",
                    display: "flex", alignItems: "center", justifyContent: "center", color: "#94a3b8", textDecoration: "none"
                  }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
                  </a>
                  <a href="https://instagram.com/chidiyaai" target="_blank" rel="noopener noreferrer" style={{
                    width: "36px", height: "36px", borderRadius: "8px", backgroundColor: "#1e293b",
                    display: "flex", alignItems: "center", justifyContent: "center", color: "#94a3b8", textDecoration: "none"
                  }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg>
                  </a>
                  <a href="https://youtube.com/@chidiyaai" target="_blank" rel="noopener noreferrer" style={{
                    width: "36px", height: "36px", borderRadius: "8px", backgroundColor: "#1e293b",
                    display: "flex", alignItems: "center", justifyContent: "center", color: "#94a3b8", textDecoration: "none"
                  }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" /></svg>
                  </a>
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
                  <Link href="/supplier" style={{ color: "#64748b", textDecoration: "none", fontSize: "14px" }}>For Suppliers</Link>
                  <Link href="/contact" style={{ color: "#64748b", textDecoration: "none", fontSize: "14px" }}>Contact</Link>
                </div>
              </div>
              <div>
                <div style={{ fontWeight: "600", color: "white", marginBottom: "16px" }}>Legal</div>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  <Link href="/terms" style={{ color: "#64748b", textDecoration: "none", fontSize: "14px" }}>Terms & Conditions</Link>
                  <Link href="/privacy" style={{ color: "#64748b", textDecoration: "none", fontSize: "14px" }}>Privacy Policy</Link>
                  <Link href="/terms/buyer" style={{ color: "#64748b", textDecoration: "none", fontSize: "14px" }}>Buyer Terms</Link>
                  <Link href="/terms/supplier" style={{ color: "#64748b", textDecoration: "none", fontSize: "14px" }}>Supplier Terms</Link>
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
        </div>
        {/* ChidiyaAI Marquee - Continuous, Faster, Same BG as footer */}
        <div style={{ backgroundColor: "#0f172a", padding: "20px 0", overflow: "hidden", borderTop: "1px solid #1e293b" }}>
          <div className="marquee-track">
            <div className="marquee-content">
              {[...Array(20)].map((_, i) => (
                <span key={i} style={{ color: "white", fontWeight: "800", fontSize: isMobile ? "60px" : "100px", marginRight: "100px", textTransform: "uppercase", letterSpacing: "0.02em", whiteSpace: "nowrap" }}>
                  Chidiya AI
                </span>
              ))}
            </div>
          </div>
        </div>
        <style>{`
          .marquee-track {
            display: flex;
            width: 100%;
          }
          .marquee-content {
            display: flex;
            animation: marquee-scroll 16s linear infinite;
            will-change: transform;
          }
          @keyframes marquee-scroll {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
        `}</style>
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

      {/* Global Chat Helper Widget */}
      <GlobalChatWidget />
    </div>
  );
}

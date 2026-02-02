"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import SupplierCard from "@/app/components/SupplierCard";

interface Supplier {
    id: string;
    companyName: string;
    city: string;
    state?: string;
    productCategories: string[];
    moq?: string;
    badges: string[];
    phone?: string;
    description?: string;
    matchScore?: number;
    rating?: number;
    price?: string;
    priceUnit?: string;
}

interface Message {
    id: number;
    role: "user" | "assistant";
    content: string;
    timestamp: Date;
    suppliers?: Supplier[];
    followUpOptions?: string[];
}

interface UserRequirements {
    location: string;
    category: string;
    quantity: string;
    budget: string;
    searchMode?: "know" | "recommend";
}

// 5 Main product categories
const productCategories = [
    "Corrugated Boxes",
    "Bubble Wrap",
    "Paper Cups",
    "BOPP Tapes",
    "Shipping Bags",
];

// Major cities - sorted by proximity to Delhi
const allLocations = [
    // Core NCR
    "New Delhi", "Noida", "Gurugram", "Greater Noida", "Ghaziabad", "Faridabad",
    // UP
    "Lucknow", "Meerut", "Agra", "Mathura", "Aligarh", "Prayagraj",
    // Haryana
    "Sonipat", "Panipat", "Rohtak", "Ambala", "Karnal",
    // Rajasthan
    "Jaipur", "Alwar", "Bhiwadi",
    // Uttarakhand
    "Dehradun", "Haridwar", "Rishikesh",
    // Punjab
    "Chandigarh", "Ludhiana", "Patiala", "Amritsar",
];

const quantities = ["Less than 100 units", "100 - 500 units", "500 - 1000 units", "1000+ units", "Bulk Order"];
const budgets = ["Under ₹50,000", "₹50,000 - ₹1 Lakh", "₹1 Lakh - ₹5 Lakh", "₹5 Lakh+", "Flexible"];

function ChatContent() {
    const searchParams = useSearchParams();
    const sessionIdFromUrl = searchParams.get("session");

    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const [showQuestionnaire, setShowQuestionnaire] = useState(true);
    const [questionStep, setQuestionStep] = useState(0);
    const [chatComplete, setChatComplete] = useState(false);
    const [contactsViewed, setContactsViewed] = useState(0); // Track contacts viewed per chat (limit: 3)
    const [showSubscriptionPrompt, setShowSubscriptionPrompt] = useState(false);
    const [currentSessionId, setCurrentSessionId] = useState<string | null>(sessionIdFromUrl);
    const [requirements, setRequirements] = useState<UserRequirements>({
        location: "",
        category: "",
        quantity: "",
        budget: "",
    });

    // User auth state
    const [user, setUser] = useState<{ email: string } | null>(null);
    const [authChecked, setAuthChecked] = useState(false);

    // For "Other" option and search
    const [showOtherInput, setShowOtherInput] = useState(false);
    const [otherValue, setOtherValue] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [filteredLocations, setFilteredLocations] = useState(allLocations.slice(0, 8));

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [subLoading, setSubLoading] = useState(false);

    // Load existing session if sessionId is provided
    useEffect(() => {
        if (sessionIdFromUrl && authChecked && user) {
            loadExistingSession(sessionIdFromUrl);
        }
    }, [sessionIdFromUrl, authChecked, user]);

    const loadExistingSession = async (sessionId: string) => {
        try {
            const res = await fetch(`/api/chat/session?id=${sessionId}`);
            const data = await res.json();
            if (data.success && data.session) {
                // Load requirements from session
                setRequirements({
                    location: data.session.location || "",
                    category: data.session.category || "",
                    quantity: data.session.quantity || "",
                    budget: data.session.budget || "",
                });
                // Load messages from session
                if (data.session.messages && data.session.messages.length > 0) {
                    const loadedMessages: Message[] = data.session.messages.map((msg: { role: string; content: string; createdAt: string }, idx: number) => ({
                        id: idx + 1,
                        role: msg.role === "user" ? "user" : "assistant",
                        content: msg.content,
                        timestamp: new Date(msg.createdAt),
                    }));
                    setMessages(loadedMessages);
                }
                // Skip questionnaire since we're resuming
                setShowQuestionnaire(false);
                setCurrentSessionId(sessionId);
            }
        } catch (error) {
            console.error("Failed to load session:", error);
        }
    };

    // Load Razorpay Script
    useEffect(() => {
        const scriptUrl = "https://checkout.razorpay.com/v1/checkout.js";
        if (!document.querySelector(`script[src="${scriptUrl}"]`)) {
            const script = document.createElement("script");
            script.src = scriptUrl;
            script.async = true;
            document.body.appendChild(script);
        }
    }, []);

    // Handle subscription payment
    const handleChatSubscribe = async () => {
        if (!user) {
            window.location.href = `/account/login?redirect=/account/chat`;
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

                        alert("Subscription activated! You now have unlimited access.");
                        setShowSubscriptionPrompt(false);
                        // Reload to reflect new subscription status
                        window.location.reload();
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

    // Check auth status on mount
    useEffect(() => {
        fetch("/api/auth/session")
            .then(res => res.json())
            .then(data => {
                if (data?.user) {
                    setUser(data.user);
                } else {
                    // User is not logged in - redirect to login immediately
                    // Don't show the location question first
                    const pendingQuery = sessionStorage.getItem('pendingSearchQuery');
                    const redirectUrl = pendingQuery
                        ? `/account/login?redirect=/account/chat`
                        : `/account/login?redirect=/account/chat`;
                    window.location.href = redirectUrl;
                    return;
                }
                setAuthChecked(true);
            })
            .catch(() => {
                // On error, redirect to login
                window.location.href = `/account/login?redirect=/account/chat`;
            });
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // Filter locations based on search
    useEffect(() => {
        if (searchQuery.trim()) {
            const filtered = allLocations.filter(loc =>
                loc.toLowerCase().includes(searchQuery.toLowerCase())
            ).slice(0, 8);
            setFilteredLocations(filtered);
        } else {
            setFilteredLocations(allLocations.slice(0, 8));
        }
    }, [searchQuery]);

    const handleQuestionSelect = (value: string) => {
        if (value === "OTHER") {
            setShowOtherInput(true);
            return;
        }

        // Only 1 step now: location
        const newReqs = { ...requirements, location: value };
        setRequirements(newReqs);
        setShowOtherInput(false);
        setOtherValue("");
        setSearchQuery("");

        // Single question - start chat immediately
        setShowQuestionnaire(false);
        startChat(newReqs);
    };

    const handleOtherSubmit = () => {
        if (!otherValue.trim()) return;
        handleQuestionSelect(otherValue.trim());
    };

    const handleSkip = () => {
        setShowOtherInput(false);
        setOtherValue("");
        setSearchQuery("");
        // Location is required - cannot skip, but handle gracefully
        // If somehow called, just start with default
        setShowQuestionnaire(false);
        startChat({ ...requirements, location: requirements.location || "India" });
    };

    const startChat = async (reqs: UserRequirements) => {
        // Save chat session to database
        try {
            await fetch("/api/buyer/chat-session", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    location: reqs.location,
                }),
            });
        } catch (err) {
            console.error("Failed to save chat session:", err);
        }

        // Show initial AI message asking for category, size, features, quantity - AUTO-GENERATED, not from Gemini
        const locationName = reqs.location || "your area";

        setMessages([{
            id: 1,
            role: "assistant",
            content: `Welcome! I'll help you find the best suppliers in ${locationName}.

To show you the most relevant results, please tell me:

What product category do you need? (e.g., Paper Cups, Boxes, Polythene)
What size or capacity? (e.g., 65ml, 250ml, A4 size)
Any specific features? (e.g., printed, plain, food-grade)
Quantity needed? (e.g., 1000 pieces, 5000 units)

Just describe your requirements in a single message and I'll find the best matches for you!`,
            timestamp: new Date(),
        }]);

        // Check for pending search query from hero section (sessionStorage or URL params)
        setTimeout(() => {
            // Check sessionStorage first
            const pendingQuery = sessionStorage.getItem('pendingSearchQuery');
            if (pendingQuery) {
                sessionStorage.removeItem('pendingSearchQuery');
                setInputValue(pendingQuery);
                // Auto-submit the query after a brief delay
                setTimeout(() => {
                    handleSend(pendingQuery);
                }, 500);
                return;
            }

            // Check URL params as fallback
            const urlParams = new URLSearchParams(window.location.search);
            const queryFromUrl = urlParams.get('q');
            if (queryFromUrl) {
                setInputValue(queryFromUrl);
                // Auto-submit the query
                setTimeout(() => {
                    handleSend(queryFromUrl);
                }, 500);
                // Clean up URL
                window.history.replaceState({}, '', '/account/chat');
            }
        }, 100);
    };

    const handleSend = async (text = inputValue) => {
        if (!text.trim()) return;

        const userMessage: Message = {
            id: Date.now(),
            role: "user",
            content: text,
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMessage]);
        setInputValue("");
        setIsTyping(true);

        try {
            const conversationHistory = messages.map((msg) => ({
                role: msg.role === "user" ? "user" : "model",
                content: msg.content,
            }));

            const response = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    message: text,
                    conversationHistory,
                    userRequirements: requirements,
                    messageCount: messages.length + 1,
                }),
            });

            const data = await response.json();
            setIsTyping(false);

            // Handle daily limit exceeded - show in chat instead of redirect
            if (data.limitExceeded) {
                setMessages((prev) => [...prev, {
                    id: Date.now() + 1,
                    role: "assistant",
                    content: `You've reached today's search limit (${data.limit} searches per day).

Your search was not processed. You can continue viewing your current results.

To get unlimited searches, subscribe to ChidiyaAI Premium.`,
                    timestamp: new Date(),
                }]);
                // Show subscription prompt
                setShowSubscriptionPrompt(true);
                return;
            }

            if (data.success) {
                // Clean markdown and shorten response
                const cleanResponse = data.response
                    .replace(/\*\*/g, "")
                    .replace(/\*/g, "")
                    .replace(/#{1,3}\s/g, "");

                setMessages((prev) => [...prev, {
                    id: Date.now() + 1,
                    role: "assistant",
                    content: cleanResponse,
                    timestamp: new Date(),
                    suppliers: data.suppliers,
                }]);

                // Check if chat should complete (after showing suppliers)
                if (data.hasSuppliers && messages.length >= 4) {
                    setTimeout(() => setChatComplete(true), 5000);
                }
            } else {
                // Handle error response
                setMessages((prev) => [...prev, {
                    id: Date.now() + 1,
                    role: "assistant",
                    content: data.response || "Sorry, I couldn't process your request. Please try again.",
                    timestamp: new Date(),
                }]);
            }
        } catch {
            setIsTyping(false);
            setMessages((prev) => [...prev, {
                id: Date.now() + 1,
                role: "assistant",
                content: "Sorry, I encountered an error. Please try again.",
                timestamp: new Date(),
            }]);
        }
    };



    const handleViewContact = async (supplierId: string): Promise<boolean> => {
        // Check if user has exceeded 3 contacts per chat
        if (contactsViewed >= 3) {
            setShowSubscriptionPrompt(true);
            return false;
        }

        try {
            const res = await fetch("/api/buyer/view-contact", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ supplierId }),
            });

            const data = await res.json();

            // Check if daily limit exceeded (5 contacts per day)
            if (!data.success && data.limitExceeded) {
                setShowSubscriptionPrompt(true);
                return false;
            }

            // Increment local counter
            setContactsViewed(prev => prev + 1);
            return true;
        } catch (err) {
            console.error("Error logging contact view:", err);
            return false;
        }
    };

    const handleSaveSupplier = async (supplierId: string) => {
        try {
            await fetch("/api/buyer/save-supplier", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ supplierId }),
            });
        } catch (err) {
            console.error("Error saving supplier:", err);
        }
    };

    const handleNewChat = () => {
        setMessages([]);
        setChatComplete(false);
        setShowQuestionnaire(true);
        setQuestionStep(0);
        setRequirements({ location: "", category: "", quantity: "", budget: "" });
    };

    // Question steps config - ONLY 1 QUESTION: Location
    const questionSteps = [
        {
            title: "📍 Where do you need suppliers?",
            subtitle: "Select your city to find nearby suppliers",
            options: filteredLocations,
            hasSearch: true,
            hasOther: true,
            otherPlaceholder: "Enter city/area name..."
        },
    ];

    // Pre-chat questionnaire
    if (showQuestionnaire) {
        const currentStep = questionSteps[questionStep];
        return (
            <div style={{
                minHeight: "100vh",
                display: "flex",
                flexDirection: "column",
                fontFamily: "'Inter', system-ui, sans-serif",
                backgroundColor: "#f8fafc"
            }}>
                {/* Navigation Header */}
                <header style={{
                    backgroundColor: "white",
                    borderBottom: "1px solid #e2e8f0",
                    padding: "12px 24px"
                }}>
                    <div style={{ maxWidth: "900px", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center" }}>
                            <Image
                                src="/assests/chidiyaailogo.png"
                                alt="ChidiyaAI"
                                width={130}
                                height={35}
                                style={{ height: "35px", width: "auto" }}
                                priority
                            />
                        </Link>
                        <div style={{ display: "flex", gap: "16px", fontSize: "14px" }}>
                            <Link href="/" style={{ color: "#64748b", textDecoration: "none" }}>Home</Link>
                            <Link href="/account/dashboard" style={{ color: "#64748b", textDecoration: "none" }}>Dashboard</Link>
                        </div>
                    </div>
                </header>

                <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
                    <div style={{
                        maxWidth: "500px",
                        width: "100%",
                        backgroundColor: "white",
                        borderRadius: "20px",
                        boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
                        overflow: "hidden"
                    }}>
                        {/* Progress bar */}
                        <div style={{ height: "4px", backgroundColor: "#e2e8f0" }}>
                            <div style={{
                                height: "100%",
                                width: `${((questionStep + 1) / questionSteps.length) * 100}%`,
                                backgroundColor: "#3b82f6",
                                transition: "width 0.3s"
                            }} />
                        </div>

                        <div style={{ padding: "32px" }}>
                            <div style={{ textAlign: "center", marginBottom: "24px" }}>
                                <div style={{
                                    width: "60px",
                                    height: "60px",
                                    margin: "0 auto 16px"
                                }}>
                                    <Image
                                        src="/assests/chidiyaaiicon.png"
                                        alt="ChidiyaAI"
                                        width={60}
                                        height={60}
                                        style={{ width: "60px", height: "60px" }}
                                    />
                                </div>
                                <h2 style={{ fontSize: "20px", fontWeight: "600", color: "#0f172a", margin: "0 0 8px" }}>
                                    {currentStep.title}
                                </h2>
                                <p style={{ fontSize: "14px", color: "#64748b", margin: 0 }}>
                                    Step {questionStep + 1} of {questionSteps.length}
                                </p>
                            </div>

                            {/* Search input for locations */}
                            {currentStep.hasSearch && (
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="🔍 Search cities..."
                                    style={{
                                        width: "100%",
                                        padding: "12px 16px",
                                        border: "1px solid #e2e8f0",
                                        borderRadius: "10px",
                                        fontSize: "14px",
                                        marginBottom: "16px",
                                        outline: "none",
                                        boxSizing: "border-box",
                                        color: "#0f172a",
                                        backgroundColor: "white"
                                    }}
                                />
                            )}

                            {/* Options grid */}
                            {!showOtherInput && (
                                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "10px" }}>
                                    {currentStep.options.map((option) => (
                                        <button
                                            key={option}
                                            onClick={() => handleQuestionSelect(option)}
                                            style={{
                                                padding: "12px 14px",
                                                backgroundColor: "#f8fafc",
                                                color: "#0f172a",
                                                border: "1px solid #e2e8f0",
                                                borderRadius: "10px",
                                                fontSize: "13px",
                                                cursor: "pointer",
                                                textAlign: "left",
                                                transition: "all 0.2s"
                                            }}
                                        >
                                            {option}
                                        </button>
                                    ))}
                                    {currentStep.hasOther && (
                                        <button
                                            onClick={() => handleQuestionSelect("OTHER")}
                                            style={{
                                                padding: "12px 14px",
                                                backgroundColor: "#f0f9ff",
                                                color: "#0369a1",
                                                border: "1px dashed #0ea5e9",
                                                borderRadius: "10px",
                                                fontSize: "13px",
                                                cursor: "pointer",
                                                textAlign: "left",
                                                gridColumn: currentStep.options.length % 2 === 0 ? "span 2" : "span 1"
                                            }}
                                        >
                                            ✏️ Other (Specify)
                                        </button>
                                    )}
                                </div>
                            )}

                            {/* Other input */}
                            {showOtherInput && (
                                <div style={{ marginTop: "8px" }}>
                                    <input
                                        type="text"
                                        value={otherValue}
                                        onChange={(e) => setOtherValue(e.target.value)}
                                        onKeyPress={(e) => e.key === "Enter" && handleOtherSubmit()}
                                        placeholder={currentStep.otherPlaceholder}
                                        autoFocus
                                        style={{
                                            width: "100%",
                                            padding: "14px 16px",
                                            border: "2px solid #3b82f6",
                                            borderRadius: "10px",
                                            fontSize: "15px",
                                            outline: "none",
                                            boxSizing: "border-box",
                                            color: "#0f172a",
                                            backgroundColor: "white"
                                        }}
                                    />
                                    <div style={{ display: "flex", gap: "10px", marginTop: "12px" }}>
                                        <button
                                            onClick={() => { setShowOtherInput(false); setOtherValue(""); }}
                                            style={{
                                                flex: 1,
                                                padding: "12px",
                                                backgroundColor: "#f1f5f9",
                                                color: "#64748b",
                                                border: "none",
                                                borderRadius: "8px",
                                                fontSize: "14px",
                                                cursor: "pointer"
                                            }}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleOtherSubmit}
                                            disabled={!otherValue.trim()}
                                            style={{
                                                flex: 1,
                                                padding: "12px",
                                                backgroundColor: otherValue.trim() ? "#3b82f6" : "#e2e8f0",
                                                color: otherValue.trim() ? "white" : "#94a3b8",
                                                border: "none",
                                                borderRadius: "8px",
                                                fontSize: "14px",
                                                cursor: otherValue.trim() ? "pointer" : "not-allowed"
                                            }}
                                        >
                                            Continue
                                        </button>
                                    </div>
                                </div>
                            )}

                            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "24px" }}>
                                <button
                                    onClick={() => questionStep > 0 && setQuestionStep(questionStep - 1)}
                                    disabled={questionStep === 0}
                                    style={{
                                        padding: "10px 20px",
                                        backgroundColor: "transparent",
                                        color: questionStep === 0 ? "#94a3b8" : "#64748b",
                                        border: "none",
                                        fontSize: "14px",
                                        cursor: questionStep === 0 ? "not-allowed" : "pointer"
                                    }}
                                >
                                    ← Back
                                </button>
                                <button
                                    onClick={handleSkip}
                                    style={{
                                        padding: "10px 20px",
                                        backgroundColor: "transparent",
                                        color: "#3b82f6",
                                        border: "none",
                                        fontSize: "14px",
                                        cursor: "pointer",
                                        fontWeight: "500"
                                    }}
                                >
                                    Skip →
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Main chat interface
    return (
        <div style={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            fontFamily: "'Inter', system-ui, sans-serif",
            backgroundColor: "#f8fafc"
        }}>
            {/* Header */}
            <header style={{
                position: "sticky",
                top: 0,
                zIndex: 50,
                backgroundColor: "white",
                borderBottom: "1px solid #e2e8f0",
                padding: "14px 24px"
            }}>
                <div style={{ maxWidth: "900px", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "8px" }}>
                            <Image
                                src="/assests/chidiyaaiicon.png"
                                alt="ChidiyaAI"
                                width={32}
                                height={32}
                                style={{ width: "32px", height: "32px" }}
                            />
                            <span style={{ fontSize: "17px", fontWeight: "bold", color: "#0f172a" }}>
                                Chidiya<span style={{ color: "#3b82f6" }}>AI</span>
                            </span>
                        </Link>
                        <span style={{ width: "6px", height: "6px", backgroundColor: "#22c55e", borderRadius: "50%" }} />
                    </div>
                    <div style={{ display: "flex", gap: "16px", fontSize: "14px" }}>
                        <Link href="/account/dashboard" style={{ color: "#64748b", textDecoration: "none" }}>Dashboard</Link>
                        <button onClick={handleNewChat} style={{ color: "#3b82f6", background: "none", border: "none", cursor: "pointer", fontWeight: "500" }}>
                            New Search
                        </button>
                    </div>
                </div>
            </header>

            {/* Requirements Tags */}
            {(requirements.category || requirements.location) && (
                <div style={{ backgroundColor: "white", borderBottom: "1px solid #e2e8f0", padding: "10px 24px" }}>
                    <div style={{ maxWidth: "900px", margin: "0 auto", display: "flex", gap: "8px", flexWrap: "wrap" }}>
                        {requirements.category && (
                            <span style={{ padding: "4px 12px", backgroundColor: "#dcfce7", color: "#15803d", borderRadius: "16px", fontSize: "12px" }}>
                                📦 {requirements.category}
                            </span>
                        )}
                        {requirements.location && (
                            <span style={{ padding: "4px 12px", backgroundColor: "#dbeafe", color: "#1d4ed8", borderRadius: "16px", fontSize: "12px" }}>
                                📍 {requirements.location}
                            </span>
                        )}
                        {requirements.quantity && (
                            <span style={{ padding: "4px 12px", backgroundColor: "#fef3c7", color: "#b45309", borderRadius: "16px", fontSize: "12px" }}>
                                📊 {requirements.quantity}
                            </span>
                        )}
                    </div>
                </div>
            )}

            {/* Messages */}
            <main style={{ flex: 1, overflowY: "auto", padding: "20px" }}>
                <div style={{ maxWidth: "900px", margin: "0 auto" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                        {messages.map((message) => (
                            <div key={message.id}>
                                <div style={{ display: "flex", justifyContent: message.role === "user" ? "flex-end" : "flex-start" }}>
                                    <div style={{
                                        maxWidth: "75%",
                                        padding: "14px 18px",
                                        borderRadius: "16px",
                                        backgroundColor: message.role === "user" ? "#0f172a" : "white",
                                        color: message.role === "user" ? "white" : "#0f172a",
                                        boxShadow: message.role === "user" ? "none" : "0 2px 8px rgba(0,0,0,0.04)",
                                        border: message.role === "user" ? "none" : "1px solid #e2e8f0",
                                        fontSize: "14px",
                                        lineHeight: "1.6"
                                    }}>
                                        <p style={{ margin: 0, whiteSpace: "pre-wrap" }}>{message.content}</p>
                                    </div>
                                </div>

                                {/* Supplier Cards */}
                                {message.suppliers && message.suppliers.length > 0 && (
                                    <div style={{ marginTop: "16px", marginLeft: "0" }}>
                                        <p style={{
                                            margin: "0 0 12px",
                                            fontSize: "14px",
                                            fontWeight: "600",
                                            color: "#0f172a"
                                        }}>
                                            🎯 Top {message.suppliers.length} Matching Suppliers
                                        </p>
                                        <div style={{
                                            display: "grid",
                                            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                                            gap: "12px"
                                        }}>
                                            {message.suppliers.map((supplier) => (
                                                <SupplierCard
                                                    key={supplier.id}
                                                    supplier={supplier}
                                                    onViewContact={handleViewContact}
                                                    onSave={handleSaveSupplier}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}

                        {isTyping && (
                            <div style={{ display: "flex", justifyContent: "flex-start" }}>
                                <div style={{
                                    padding: "14px 18px",
                                    borderRadius: "16px",
                                    backgroundColor: "white",
                                    boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                                    border: "1px solid #e2e8f0"
                                }}>
                                    <div style={{ display: "flex", gap: "5px" }}>
                                        <div style={{ width: "7px", height: "7px", backgroundColor: "#94a3b8", borderRadius: "50%", animation: "bounce 1s infinite" }} />
                                        <div style={{ width: "7px", height: "7px", backgroundColor: "#94a3b8", borderRadius: "50%", animation: "bounce 1s infinite 0.15s" }} />
                                        <div style={{ width: "7px", height: "7px", backgroundColor: "#94a3b8", borderRadius: "50%", animation: "bounce 1s infinite 0.3s" }} />
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                </div>
            </main>

            {/* Input */}
            <div style={{
                position: "sticky",
                bottom: 0,
                backgroundColor: "white",
                borderTop: "1px solid #e2e8f0",
                padding: "14px 24px"
            }}>
                <div style={{ maxWidth: "900px", margin: "0 auto" }}>
                    <div style={{ display: "flex", gap: "10px" }}>
                        <input
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyPress={(e) => e.key === "Enter" && handleSend()}
                            placeholder="Type your message..."
                            style={{
                                flex: 1,
                                padding: "12px 18px",
                                border: "1px solid #e2e8f0",
                                borderRadius: "12px",
                                fontSize: "14px",
                                outline: "none",
                                backgroundColor: "#f8fafc",
                                color: "#0f172a"
                            }}
                        />
                        <button
                            onClick={() => handleSend()}
                            disabled={!inputValue.trim()}
                            style={{
                                padding: "12px 20px",
                                backgroundColor: inputValue.trim() ? "#0f172a" : "#e2e8f0",
                                color: inputValue.trim() ? "white" : "#94a3b8",
                                border: "none",
                                borderRadius: "12px",
                                cursor: inputValue.trim() ? "pointer" : "not-allowed",
                                fontWeight: "500",
                                fontSize: "14px"
                            }}
                        >
                            Send
                        </button>
                    </div>
                </div>
            </div>

            {/* Subscription Prompt Modal */}
            {showSubscriptionPrompt && (
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
                        borderRadius: "20px",
                        padding: "32px",
                        maxWidth: "400px",
                        width: "90%",
                        textAlign: "center",
                        boxShadow: "0 20px 60px rgba(0,0,0,0.2)"
                    }}>
                        <div style={{
                            width: "64px",
                            height: "64px",
                            backgroundColor: "#fef3c7",
                            borderRadius: "50%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            margin: "0 auto 20px",
                            fontSize: "28px"
                        }}>
                            🔒
                        </div>
                        <h2 style={{
                            margin: "0 0 12px",
                            fontSize: "22px",
                            fontWeight: "700",
                            color: "#0f172a"
                        }}>
                            Limit Reached!
                        </h2>
                        <p style={{
                            margin: "0 0 8px",
                            fontSize: "14px",
                            color: "#64748b",
                            lineHeight: "1.6"
                        }}>
                            You&apos;ve used your free daily limit:
                        </p>
                        <div style={{
                            backgroundColor: "#f8fafc",
                            borderRadius: "12px",
                            padding: "16px",
                            margin: "16px 0"
                        }}>
                            <p style={{ margin: "0 0 8px", fontSize: "13px", color: "#64748b" }}>
                                ✅ <strong>3 contacts</strong> per chat
                            </p>
                            <p style={{ margin: "0 0 8px", fontSize: "13px", color: "#64748b" }}>
                                ✅ <strong>5 contacts</strong> per day
                            </p>
                            <p style={{ margin: "0", fontSize: "13px", color: "#64748b" }}>
                                ✅ <strong>3 queries</strong> per day
                            </p>
                        </div>
                        <p style={{
                            margin: "16px 0",
                            fontSize: "14px",
                            color: "#0f172a",
                            fontWeight: "500"
                        }}>
                            Upgrade for <strong>unlimited access</strong>!
                        </p>
                        <button
                            onClick={handleChatSubscribe}
                            disabled={subLoading}
                            style={{
                                width: "100%",
                                padding: "14px",
                                backgroundColor: subLoading ? "#64748b" : "#0f172a",
                                color: "white",
                                border: "none",
                                borderRadius: "12px",
                                fontSize: "16px",
                                fontWeight: "600",
                                cursor: subLoading ? "not-allowed" : "pointer",
                                marginBottom: "12px"
                            }}
                        >
                            {subLoading ? "Processing..." : "Subscribe ₹499/month"}
                        </button>
                        <button
                            onClick={() => setShowSubscriptionPrompt(false)}
                            style={{
                                width: "100%",
                                padding: "12px",
                                backgroundColor: "transparent",
                                color: "#64748b",
                                border: "none",
                                fontSize: "14px",
                                cursor: "pointer"
                            }}
                        >
                            Maybe Later
                        </button>
                        <p style={{
                            margin: "16px 0 0",
                            fontSize: "12px",
                            color: "#94a3b8",
                            textAlign: "center"
                        }}>
                            If it&apos;s a mistake,{" "}
                            <a
                                href="mailto:support@chidiyaai.com"
                                style={{ color: "#3b82f6", textDecoration: "underline" }}
                            >
                                contact us
                            </a>
                        </p>
                    </div>
                </div>
            )}

            <style jsx global>{`
                @keyframes bounce {
                    0%, 60%, 100% { transform: translateY(0); }
                    30% { transform: translateY(-4px); }
                }
            `}</style>
        </div>
    );
}

export default function Chat() {
    return (
        <Suspense fallback={
            <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#f0f5ff" }}>
                <div>Loading chat...</div>
            </div>
        }>
            <ChatContent />
        </Suspense>
    );
}

"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import GlobalChatWidget from "@/app/components/GlobalChatWidget";
import GSTCalculator, { GSTCalculatorButton } from "@/app/components/GSTCalculator";

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

interface ChatHistoryItem {
    id: string;
    title: string;
    category: string;
    location: string;
    messages: Message[];
    requirements: UserRequirements;
    updatedAt: string;
}

function ChatContent() {
    const searchParams = useSearchParams();
    const sessionIdFromUrl = searchParams.get("session");

    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const [showQuestionnaire, setShowQuestionnaire] = useState(true);
    const [questionStep, setQuestionStep] = useState(0);
    const [chatComplete, setChatComplete] = useState(false);
    const [contactsViewed, setContactsViewed] = useState(0);
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
    const [showGSTCalculator, setShowGSTCalculator] = useState(false);
    const [showHelperGuide, setShowHelperGuide] = useState(false);

    // Chat history state
    const [chatHistory, setChatHistory] = useState<ChatHistoryItem[]>([]);
    const [showHistoryDropdown, setShowHistoryDropdown] = useState(false);

    // Mobile detection
    const [isMobile, setIsMobile] = useState(false);
    useEffect(() => {
        const checkMobile = () => {
            const mobile = window.innerWidth < 768;
            setIsMobile(mobile);
            if (!mobile) setShowHistoryDropdown(true);
            else setShowHistoryDropdown(false);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Theme state — light by default
    const [darkMode, setDarkMode] = useState(false);

    // User limits for profile section
    const [userLimits, setUserLimits] = useState<{
        searchesUsed: number; searchLimit: number;
        contactsUsed: number; contactLimit: number;
        isPro: boolean; proExpiry: string | null;
    }>({ searchesUsed: 0, searchLimit: 5, contactsUsed: 0, contactLimit: 5, isPro: false, proExpiry: null });

    // Load dark mode preference from localStorage
    useEffect(() => {
        try {
            const saved = localStorage.getItem("chidiyaai_dark_mode");
            if (saved === "true") setDarkMode(true);
        } catch { /* ignore */ }
    }, []);

    const toggleDarkMode = () => {
        setDarkMode(prev => {
            const next = !prev;
            try { localStorage.setItem("chidiyaai_dark_mode", String(next)); } catch { /* ignore */ }
            return next;
        });
    };

    // Theme colors
    const t = {
        bg: darkMode ? "#0f172a" : "#ffffff",
        bgSecondary: darkMode ? "#1e293b" : "#f8fafc",
        bgTertiary: darkMode ? "#334155" : "#e2e8f0",
        border: darkMode ? "#334155" : "#e2e8f0",
        borderLight: darkMode ? "#1e293b" : "#f1f5f9",
        text: darkMode ? "#e2e8f0" : "#1e293b",
        textSecondary: darkMode ? "#94a3b8" : "#64748b",
        textMuted: darkMode ? "#64748b" : "#94a3b8",
        userBubble: "#3b82f6",
        aiBubble: darkMode ? "#1e293b" : "#f1f5f9",
        aiBubbleBorder: darkMode ? "#334155" : "#e2e8f0",
        aiBubbleText: darkMode ? "#e2e8f0" : "#1e293b",
        inputBg: darkMode ? "#1e293b" : "#ffffff",
        inputBorder: darkMode ? "#334155" : "#d1d5db",
        sidebarActive: darkMode ? "#334155" : "#e2e8f0",
        sidebarHover: darkMode ? "#1e293b80" : "#f1f5f9",
        tagBg: darkMode ? "rgba(34,197,94,0.1)" : "#dcfce7",
        tagColor: darkMode ? "#4ade80" : "#15803d",
        tagBlueBg: darkMode ? "rgba(59,130,246,0.1)" : "#dbeafe",
        tagBlueColor: darkMode ? "#60a5fa" : "#1d4ed8",
        tagYellowBg: darkMode ? "rgba(234,179,8,0.1)" : "#fef3c7",
        tagYellowColor: darkMode ? "#facc15" : "#b45309",
        modalBg: darkMode ? "#1e293b" : "#ffffff",
        modalBorder: darkMode ? "#334155" : "#e2e8f0",
        modalInfoBg: darkMode ? "#0f172a" : "#f8fafc",
    };

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [subLoading, setSubLoading] = useState(false);

    // Load chat history from database on mount
    const fetchChatHistory = async () => {
        try {
            const res = await fetch("/api/buyer/chat-history");
            if (res.ok) {
                const data = await res.json();
                if (data.success && data.sessions) {
                    setChatHistory(data.sessions.map((s: { id: string; title?: string; category?: string; location?: string; updatedAt: string }) => ({
                        id: s.id,
                        category: s.title || s.category || "Chat",
                        location: s.location || "",
                        messages: [],
                        requirements: { location: s.location || "", category: s.category || "", quantity: "", budget: "" },
                        updatedAt: s.updatedAt,
                    })));
                }
            }
        } catch { /* ignore fetch errors */ }
    };

    useEffect(() => {
        if (user) fetchChatHistory();
    }, [user]);

    // Save messages to database via API
    const saveChatToHistory = async (msgs: Message[], reqs: UserRequirements) => {
        if (msgs.length < 2 || !currentSessionId) return;
        try {
            // Find the latest user and assistant messages to save
            const lastUser = [...msgs].reverse().find(m => m.role === "user");
            const lastAssistant = [...msgs].reverse().find(m => m.role === "assistant");

            await fetch("/api/buyer/chat-session", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    sessionId: currentSessionId,
                    userMessage: lastUser?.content,
                    assistantMessage: lastAssistant?.content,
                    suppliers: lastAssistant?.suppliers,
                }),
            });

            // Refresh history sidebar
            fetchChatHistory();
        } catch { /* ignore save errors */ }
    };

    const loadChatFromHistory = async (item: ChatHistoryItem) => {
        setCurrentSessionId(item.id);
        setShowQuestionnaire(false);
        setChatComplete(false);
        setShowHistoryDropdown(false);

        // Load full session messages from DB
        try {
            const res = await fetch(`/api/buyer/chat-session?sessionId=${item.id}`);
            if (res.ok) {
                const data = await res.json();
                if (data.success && data.session) {
                    const loadedMsgs = data.session.messages.map((m: { role: string; content: string; createdAt: string }, i: number) => ({
                        id: i + 1,
                        role: m.role as "user" | "assistant",
                        content: m.content,
                        timestamp: new Date(m.createdAt),
                    }));
                    setMessages(loadedMsgs);
                    setRequirements({
                        location: data.session.location || "",
                        category: data.session.category || "",
                        quantity: data.session.quantity || "",
                        budget: data.session.budget || "",
                    });
                }
            }
        } catch {
            // Fallback to item messages if API fails
            if (item.messages.length > 0) {
                setMessages(item.messages.map(m => ({ ...m, timestamp: new Date(m.timestamp) })));
                setRequirements(item.requirements);
            }
        }
    };

    const deleteChatFromHistory = async (id: string) => {
        try {
            await fetch(`/api/buyer/chat-session?sessionId=${id}`, { method: "DELETE" });
            setChatHistory(prev => prev.filter(h => h.id !== id));
        } catch { /* ignore */ }
    };

    // Load existing session if sessionId is provided — skip questionnaire
    useEffect(() => {
        if (sessionIdFromUrl) {
            setShowQuestionnaire(false);
            if (authChecked && user) {
                loadExistingSession(sessionIdFromUrl);
            }
        }
    }, [sessionIdFromUrl, authChecked, user]);

    const loadExistingSession = async (sessionId: string) => {
        try {
            const res = await fetch(`/api/buyer/chat-session?sessionId=${sessionId}`);
            if (!res.ok) return;
            const data = await res.json();
            if (data.success && data.session) {
                setRequirements({
                    location: data.session.location || "",
                    category: data.session.category || "",
                    quantity: data.session.quantity || "",
                    budget: data.session.budget || "",
                });
                if (data.session.messages && data.session.messages.length > 0) {
                    const loadedMessages: Message[] = data.session.messages.map((msg: { role: string; content: string; createdAt: string }, idx: number) => ({
                        id: idx + 1,
                        role: msg.role === "user" ? "user" : "assistant",
                        content: msg.content,
                        timestamp: new Date(msg.createdAt),
                    }));
                    setMessages(loadedMessages);
                } else {
                    // Session exists but no messages — show welcome
                    const locationName = data.session.location || "your area";
                    setMessages([{
                        id: 1,
                        role: "assistant",
                        content: `Welcome back! This was your search for suppliers in ${locationName}. Send a message to continue.`,
                        timestamp: new Date(),
                    }]);
                }
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
        // Save chat session to database and capture session ID
        try {
            const sessionRes = await fetch("/api/buyer/chat-session", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    location: reqs.location,
                    category: reqs.category,
                    quantity: reqs.quantity,
                    budget: reqs.budget,
                    title: reqs.category ? reqs.category.substring(0, 30) : "New Search",
                }),
            });
            const sessionData = await sessionRes.json();
            if (sessionData.success && sessionData.sessionId) {
                setCurrentSessionId(sessionData.sessionId);
                fetchChatHistory();

                // Save the initial greeting message to DB
                const locationName = reqs.location || "your area";
                const greetingContent = `Welcome! I'll help you find the best suppliers in ${locationName}.\n\nTo show you the most relevant results, please tell me:\n\nWhat product category do you need? (e.g., Paper Cups, Boxes, Polythene)\nWhat size or capacity? (e.g., 65ml, 250ml, A4 size)\nAny specific features? (e.g., printed, plain, food-grade)\nQuantity needed? (e.g., 1000 pieces, 5000 units)\n\nJust describe your requirements in a single message and I'll find the best matches for you!`;
                await fetch("/api/buyer/chat-session", {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        sessionId: sessionData.sessionId,
                        assistantMessage: greetingContent,
                    }),
                });
            }
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

            // Update session title from first user message
            if (currentSessionId && messages.filter(m => m.role === "user").length === 0) {
                fetch("/api/buyer/chat-session", {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        sessionId: currentSessionId,
                        title: text.substring(0, 30),
                    }),
                }).then(() => fetchChatHistory()).catch(() => { });
            }

            // Save user message to DB
            if (currentSessionId) {
                fetch("/api/buyer/chat-session", {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        sessionId: currentSessionId,
                        userMessage: text,
                    }),
                }).catch(() => { });
            }

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
                const cleanResponse = data.response
                    .replace(/\*\*/g, "")
                    .replace(/\*/g, "")
                    .replace(/#{1,3}\s/g, "");

                const aiMsg: Message = {
                    id: Date.now() + 1,
                    role: "assistant",
                    content: cleanResponse,
                    timestamp: new Date(),
                    suppliers: data.suppliers,
                };
                setMessages((prev) => [...prev, aiMsg]);

                // Save assistant message to DB
                if (currentSessionId) {
                    fetch("/api/buyer/chat-session", {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            sessionId: currentSessionId,
                            assistantMessage: cleanResponse,
                            suppliers: data.suppliers,
                        }),
                    }).catch(() => { });
                }

                if (data.hasSuppliers && messages.length >= 4) {
                    setTimeout(() => setChatComplete(true), 5000);
                }
            } else {
                const errMsg: Message = {
                    id: Date.now() + 1,
                    role: "assistant",
                    content: data.response || "Sorry, I couldn't process your request. Please try again.",
                    timestamp: new Date(),
                };
                setMessages((prev) => [...prev, errMsg]);

                // Save error response to DB too
                if (currentSessionId) {
                    fetch("/api/buyer/chat-session", {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            sessionId: currentSessionId,
                            assistantMessage: errMsg.content,
                        }),
                    }).catch(() => { });
                }
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



    const handleViewContact = async (supplierId: string): Promise<string | false> => {
        // Check if user has exceeded 3 contacts per chat
        if (contactsViewed >= 3) {
            setShowSubscriptionPrompt(true);
            return false;
        }

        try {
            const res = await fetch("/api/buyer/view-contact", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ supplierId, sessionId: currentSessionId }),
            });

            const data = await res.json();

            // Check if daily limit exceeded (5 contacts per day)
            if (!data.success && data.limitExceeded) {
                setShowSubscriptionPrompt(true);
                return false;
            }

            // Increment local counter
            setContactsViewed(prev => prev + 1);
            return data.phone || "Contact not available";
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
        // Save current chat before clearing
        if (messages.length >= 2) {
            saveChatToHistory(messages, requirements);
        }
        setMessages([]);
        setChatComplete(false);
        setShowQuestionnaire(true);
        setQuestionStep(0);
        setCurrentSessionId(null);
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

    // Group chat history by date
    const groupHistoryByDate = () => {
        const groups: Record<string, ChatHistoryItem[]> = {};
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const yesterday = new Date(today.getTime() - 86400000);
        const lastWeek = new Date(today.getTime() - 7 * 86400000);

        chatHistory.forEach(item => {
            const d = new Date(item.updatedAt);
            let key: string;
            if (d >= today) key = "Today";
            else if (d >= yesterday) key = "Yesterday";
            else if (d >= lastWeek) key = "Last 7 Days";
            else key = "Older";

            if (!groups[key]) groups[key] = [];
            groups[key].push(item);
        });

        return groups;
    };

    const groupedHistory = groupHistoryByDate();
    const groupOrder = ["Today", "Yesterday", "Last 7 Days", "Older"];

    // Main chat interface with sidebar
    return (
        <div style={{
            height: "100vh",
            display: "flex",
            fontFamily: "'Inter', system-ui, sans-serif",
            backgroundColor: t.bg,
            overflow: "hidden",
            transition: "background-color 0.3s ease"
        }}>
            {/* ============ SIDEBAR BACKDROP (mobile only) ============ */}
            {isMobile && showHistoryDropdown && (
                <div
                    onClick={() => setShowHistoryDropdown(false)}
                    style={{
                        position: "fixed",
                        top: 0, left: 0, right: 0, bottom: 0,
                        backgroundColor: "rgba(0,0,0,0.5)",
                        zIndex: 998,
                        transition: "opacity 0.3s ease"
                    }}
                />
            )}

            {/* ============ SIDEBAR ============ */}
            <div style={{
                ...(isMobile ? {
                    position: "fixed" as const,
                    top: 0,
                    left: showHistoryDropdown ? 0 : -300,
                    width: "280px",
                    height: "100vh",
                    zIndex: 999,
                    boxShadow: showHistoryDropdown ? "4px 0 24px rgba(0,0,0,0.2)" : "none",
                } : {
                    width: showHistoryDropdown ? "280px" : "0px",
                    minWidth: showHistoryDropdown ? "280px" : "0px",
                }),
                transition: "all 0.3s ease",
                backgroundColor: t.bgSecondary,
                borderRight: showHistoryDropdown ? `1px solid ${t.border}` : "none",
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
                flexShrink: 0
            }}>
                {/* Sidebar Header */}
                <div style={{ padding: "16px", borderBottom: `1px solid ${t.border}` }}>
                    <button
                        onClick={handleNewChat}
                        style={{
                            width: "100%",
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                            padding: "12px 16px",
                            backgroundColor: t.bgTertiary,
                            border: `1px solid ${t.border}`,
                            borderRadius: "12px",
                            color: t.text,
                            fontSize: "14px",
                            fontWeight: "500",
                            cursor: "pointer"
                        }}
                    >
                        <span style={{ fontSize: "16px" }}>+</span>
                        New Search
                    </button>
                </div>

                {/* Session List */}
                <div style={{ flex: 1, overflowY: "auto", padding: "8px" }}>
                    {chatHistory.length === 0 ? (
                        <div style={{ padding: "16px", textAlign: "center" }}>
                            <p style={{ color: t.textMuted, fontSize: "12px" }}>No chat history yet</p>
                        </div>
                    ) : (
                        groupOrder.map(group =>
                            groupedHistory[group] && groupedHistory[group].length > 0 && (
                                <div key={group} style={{ marginBottom: "16px" }}>
                                    <p style={{
                                        padding: "8px 12px",
                                        fontSize: "10px",
                                        fontWeight: "600",
                                        color: t.textMuted,
                                        textTransform: "uppercase",
                                        letterSpacing: "0.05em",
                                        margin: 0
                                    }}>
                                        {group}
                                    </p>
                                    {groupedHistory[group].map(item => (
                                        <div
                                            key={item.id}
                                            style={{
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "space-between",
                                                padding: "8px 12px",
                                                borderRadius: "8px",
                                                cursor: "pointer",
                                                marginBottom: "2px",
                                                backgroundColor: currentSessionId === item.id ? t.sidebarActive : "transparent",
                                                color: currentSessionId === item.id ? t.text : t.textSecondary
                                            }}
                                            onClick={() => { loadChatFromHistory(item); if (isMobile) setShowHistoryDropdown(false); }}
                                            onMouseEnter={(e) => {
                                                if (currentSessionId !== item.id) e.currentTarget.style.backgroundColor = t.sidebarHover;
                                            }}
                                            onMouseLeave={(e) => {
                                                if (currentSessionId !== item.id) e.currentTarget.style.backgroundColor = "transparent";
                                            }}
                                        >
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <p style={{
                                                    margin: 0,
                                                    fontSize: "13px",
                                                    overflow: "hidden",
                                                    textOverflow: "ellipsis",
                                                    whiteSpace: "nowrap",
                                                    lineHeight: "1.4"
                                                }}>
                                                    {item.title || item.category || "General Chat"}
                                                </p>
                                                {item.location && (
                                                    <p style={{ margin: "2px 0 0", fontSize: "10px", color: t.textMuted }}>
                                                        📍 {item.location}
                                                    </p>
                                                )}
                                            </div>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); deleteChatFromHistory(item.id); }}
                                                style={{
                                                    background: "none",
                                                    border: "none",
                                                    cursor: "pointer",
                                                    color: t.textMuted,
                                                    fontSize: "12px",
                                                    padding: "4px",
                                                    flexShrink: 0,
                                                    opacity: 0.5
                                                }}
                                                title="Delete chat"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )
                        )
                    )}
                </div>

                {/* Profile / Limits Section */}
                <div style={{
                    padding: "12px",
                    borderTop: `1px solid ${t.border}`,
                    backgroundColor: t.bgSecondary
                }}>
                    {user && (
                        <div style={{ marginBottom: "12px" }}>
                            <div style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "10px",
                                padding: "8px 12px",
                                borderRadius: "10px",
                                backgroundColor: t.bgTertiary,
                                marginBottom: "8px"
                            }}>
                                <div style={{
                                    width: "32px", height: "32px",
                                    borderRadius: "50%",
                                    background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    color: "white", fontSize: "14px", fontWeight: "600",
                                    flexShrink: 0
                                }}>
                                    {user.email.charAt(0).toUpperCase()}
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <p style={{
                                        margin: 0, fontSize: "12px", fontWeight: "600", color: t.text,
                                        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap"
                                    }}>
                                        {user.email}
                                    </p>
                                    <p style={{ margin: "2px 0 0", fontSize: "10px", color: t.textMuted }}>
                                        {userLimits.isPro ? "⭐ Pro" : "Free Plan"}
                                    </p>
                                </div>
                            </div>
                            {/* Daily Limits */}
                            <div style={{ padding: "0 4px" }}>
                                <div style={{ marginBottom: "6px" }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10px", color: t.textSecondary, marginBottom: "3px" }}>
                                        <span>Searches</span>
                                        <span>{userLimits.searchesUsed}/{userLimits.searchLimit}</span>
                                    </div>
                                    <div style={{ height: "4px", backgroundColor: t.bgTertiary, borderRadius: "2px", overflow: "hidden" }}>
                                        <div style={{
                                            height: "100%",
                                            width: `${Math.min(100, (userLimits.searchesUsed / userLimits.searchLimit) * 100)}%`,
                                            backgroundColor: userLimits.searchesUsed >= userLimits.searchLimit ? "#ef4444" : "#3b82f6",
                                            borderRadius: "2px",
                                            transition: "width 0.3s ease"
                                        }} />
                                    </div>
                                </div>
                                <div style={{ marginBottom: "8px" }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10px", color: t.textSecondary, marginBottom: "3px" }}>
                                        <span>Contacts</span>
                                        <span>{userLimits.contactsUsed}/{userLimits.contactLimit}</span>
                                    </div>
                                    <div style={{ height: "4px", backgroundColor: t.bgTertiary, borderRadius: "2px", overflow: "hidden" }}>
                                        <div style={{
                                            height: "100%",
                                            width: `${Math.min(100, (userLimits.contactsUsed / userLimits.contactLimit) * 100)}%`,
                                            backgroundColor: userLimits.contactsUsed >= userLimits.contactLimit ? "#ef4444" : "#22c55e",
                                            borderRadius: "2px",
                                            transition: "width 0.3s ease"
                                        }} />
                                    </div>
                                </div>
                            </div>
                            {!userLimits.isPro && (
                                <button
                                    onClick={() => setShowSubscriptionPrompt(true)}
                                    style={{
                                        width: "100%",
                                        padding: "8px 12px",
                                        background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
                                        color: "white",
                                        border: "none",
                                        borderRadius: "8px",
                                        fontSize: "12px",
                                        fontWeight: "600",
                                        cursor: "pointer",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        gap: "6px"
                                    }}
                                >
                                    ⚡ Go Pro — ₹499/mo
                                </button>
                            )}
                            {userLimits.isPro && userLimits.proExpiry && (
                                <p style={{ margin: 0, fontSize: "10px", color: t.textMuted, textAlign: "center" }}>
                                    Pro expires: {new Date(userLimits.proExpiry).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                                </p>
                            )}
                        </div>
                    )}

                    {/* Theme Toggle */}
                    <button
                        onClick={toggleDarkMode}
                        style={{
                            width: "100%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            padding: "8px 12px",
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            borderRadius: "8px",
                            color: t.textSecondary,
                            fontSize: "13px"
                        }}
                    >
                        <span>{darkMode ? "🌙 Dark Mode" : "☀️ Light Mode"}</span>
                        <span style={{
                            width: "36px", height: "20px",
                            backgroundColor: darkMode ? "#3b82f6" : t.bgTertiary,
                            borderRadius: "10px",
                            position: "relative",
                            transition: "background-color 0.3s ease"
                        }}>
                            <span style={{
                                width: "16px", height: "16px",
                                backgroundColor: "white",
                                borderRadius: "50%",
                                position: "absolute",
                                top: "2px",
                                left: darkMode ? "18px" : "2px",
                                transition: "left 0.3s ease",
                                boxShadow: "0 1px 3px rgba(0,0,0,0.2)"
                            }} />
                        </span>
                    </button>

                    {/* Nav Links */}
                    <Link href="/" style={{
                        display: "flex", alignItems: "center", gap: "8px",
                        padding: "8px 12px", color: t.textSecondary, textDecoration: "none",
                        fontSize: "13px", borderRadius: "8px"
                    }}>
                        🏠 Home
                    </Link>
                    <Link href="/account/dashboard" style={{
                        display: "flex", alignItems: "center", gap: "8px",
                        padding: "8px 12px", color: t.textSecondary, textDecoration: "none",
                        fontSize: "13px", borderRadius: "8px"
                    }}>
                        📊 Dashboard
                    </Link>
                </div>
            </div>

            {/* ============ MAIN CONTENT ============ */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
                {/* Top Nav */}
                <header style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "12px 20px",
                    borderBottom: `1px solid ${t.border}`,
                    backgroundColor: t.bg,
                    transition: "background-color 0.3s ease"
                }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        {/* Sidebar toggle */}
                        <button
                            onClick={() => setShowHistoryDropdown(!showHistoryDropdown)}
                            style={{
                                padding: "8px",
                                background: "none",
                                border: "none",
                                cursor: "pointer",
                                color: t.textSecondary,
                                fontSize: "18px",
                                borderRadius: "8px",
                                display: "flex",
                                alignItems: "center"
                            }}
                        >
                            {showHistoryDropdown ? "◀" : "☰"}
                        </button>
                        <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "8px" }}>
                            <Image
                                src="/assests/chidiyaaiicon.png"
                                alt="ChidiyaAI"
                                width={32}
                                height={32}
                                style={{ width: "32px", height: "32px" }}
                            />
                            <span style={{ fontSize: "17px", fontWeight: "bold", color: t.text }}>
                                Chidiya<span style={{ color: "#3b82f6" }}>AI</span>
                            </span>
                        </Link>
                        <span style={{ width: "6px", height: "6px", backgroundColor: "#22c55e", borderRadius: "50%" }} />
                    </div>
                    <div style={{ display: "flex", gap: isMobile ? "8px" : "16px", fontSize: "14px", alignItems: "center" }}>
                        <GSTCalculatorButton onClick={() => setShowGSTCalculator(true)} />
                        <button
                            onClick={() => setShowHelperGuide(!showHelperGuide)}
                            style={{
                                display: "flex", alignItems: "center", gap: "6px",
                                padding: isMobile ? "8px" : "8px 14px",
                                background: showHelperGuide ? "linear-gradient(135deg, #8b5cf6, #6d28d9)" : "linear-gradient(135deg, #3b82f6, #8b5cf6)",
                                color: "white",
                                border: "none",
                                borderRadius: "8px",
                                fontSize: "12px",
                                fontWeight: "600",
                                cursor: "pointer"
                            }}
                            title="Ask Chidiya Helper"
                        >
                            <Image src="/favicon-32x32.png" alt="" width={16} height={16} style={{ borderRadius: "50%" }} />
                            {!isMobile && (showHelperGuide ? "Close Guide" : "Helper Guide")}
                        </button>
                        {!isMobile && (
                            <>
                                <Link href="/" style={{ color: t.textSecondary, textDecoration: "none", fontSize: "13px" }}>Home</Link>
                                <Link href="/account/dashboard" style={{ color: t.textSecondary, textDecoration: "none", fontSize: "13px" }}>Dashboard</Link>
                            </>
                        )}
                    </div>
                </header>

                {/* Requirements Tags */}
                {(requirements.category || requirements.location) && (
                    <div style={{ backgroundColor: t.bgSecondary, borderBottom: `1px solid ${t.border}`, padding: "10px 20px" }}>
                        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                            {requirements.category && (
                                <span style={{ padding: "4px 12px", backgroundColor: t.tagBg, color: t.tagColor, borderRadius: "16px", fontSize: "12px", border: `1px solid ${darkMode ? "rgba(34,197,94,0.2)" : "#bbf7d0"}` }}>
                                    📦 {requirements.category}
                                </span>
                            )}
                            {requirements.location && (
                                <span style={{ padding: "4px 12px", backgroundColor: t.tagBlueBg, color: t.tagBlueColor, borderRadius: "16px", fontSize: "12px", border: `1px solid ${darkMode ? "rgba(59,130,246,0.2)" : "#bfdbfe"}` }}>
                                    📍 {requirements.location}
                                </span>
                            )}
                            {requirements.quantity && (
                                <span style={{ padding: "4px 12px", backgroundColor: t.tagYellowBg, color: t.tagYellowColor, borderRadius: "16px", fontSize: "12px", border: `1px solid ${darkMode ? "rgba(234,179,8,0.2)" : "#fde68a"}` }}>
                                    📊 {requirements.quantity}
                                </span>
                            )}
                        </div>
                    </div>
                )}

                {/* Messages */}
                <main style={{ flex: 1, overflowY: "auto", padding: isMobile ? "12px" : "20px", backgroundColor: t.bg, transition: "background-color 0.3s ease" }}>
                    <div style={{ maxWidth: "800px", margin: "0 auto" }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                            {messages.map((message) => (
                                <div key={message.id}>
                                    <div style={{ display: "flex", justifyContent: message.role === "user" ? "flex-end" : "flex-start" }}>
                                        <div style={{
                                            maxWidth: isMobile ? "90%" : "75%",
                                            padding: "14px 18px",
                                            borderRadius: message.role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                                            backgroundColor: message.role === "user" ? t.userBubble : t.aiBubble,
                                            color: message.role === "user" ? "white" : t.aiBubbleText,
                                            border: message.role === "user" ? "none" : `1px solid ${t.aiBubbleBorder}`,
                                            fontSize: "14px",
                                            lineHeight: "1.6"
                                        }}>
                                            <p style={{ margin: 0, whiteSpace: "pre-wrap" }}>{message.content}</p>
                                            <p style={{
                                                margin: "4px 0 0",
                                                fontSize: "10px",
                                                color: message.role === "user" ? "rgba(255,255,255,0.6)" : t.textMuted
                                            }}>
                                                {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Supplier Results Table */}
                                    {message.suppliers && message.suppliers.length > 0 && (
                                        <div style={{ marginTop: "16px" }}>
                                            <p style={{
                                                margin: "0 0 12px",
                                                fontSize: "14px",
                                                fontWeight: "600",
                                                color: t.text
                                            }}>
                                                🎯 Top {message.suppliers.length} Matching Suppliers
                                            </p>

                                            {/* Mobile: Stacked Cards */}
                                            {isMobile ? (
                                                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                                                    {message.suppliers.map((supplier) => (
                                                        <div key={supplier.id} style={{
                                                            borderRadius: "12px",
                                                            border: `1px solid ${t.border}`,
                                                            backgroundColor: darkMode ? "#1e293b" : "#f8fafc",
                                                            padding: "14px",
                                                            overflow: "hidden"
                                                        }}>
                                                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                                                                <div>
                                                                    <p style={{ margin: 0, fontWeight: "600", fontSize: "14px", color: t.text }}>{supplier.companyName}</p>
                                                                    <p style={{ margin: "2px 0 0", fontSize: "12px", color: t.textSecondary }}>📍 {supplier.city || "—"}</p>
                                                                </div>
                                                                {supplier.matchScore && (
                                                                    <span style={{ padding: "2px 8px", backgroundColor: "rgba(34,197,94,0.15)", color: "#22c55e", borderRadius: "8px", fontSize: "11px", fontWeight: "600", whiteSpace: "nowrap" }}>
                                                                        {supplier.matchScore}%
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "8px" }}>
                                                                {supplier.productCategories?.slice(0, 2).map((cat, i) => (
                                                                    <span key={i} style={{
                                                                        padding: "2px 8px",
                                                                        backgroundColor: darkMode ? "rgba(59,130,246,0.15)" : "#eff6ff",
                                                                        color: darkMode ? "#93c5fd" : "#2563eb",
                                                                        borderRadius: "8px", fontSize: "11px"
                                                                    }}>{cat}</span>
                                                                ))}
                                                                {supplier.badges?.slice(0, 2).map((badge, i) => (
                                                                    <span key={`b-${i}`} style={{
                                                                        padding: "2px 6px",
                                                                        backgroundColor: darkMode ? "rgba(34,197,94,0.15)" : "#f0fdf4",
                                                                        color: darkMode ? "#86efac" : "#16a34a",
                                                                        borderRadius: "6px", fontSize: "10px"
                                                                    }}>{badge}</span>
                                                                ))}
                                                            </div>
                                                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: t.textSecondary, marginBottom: "10px" }}>
                                                                <span>MOQ: {supplier.moq || "—"}</span>
                                                                <span style={{ fontWeight: "600", color: t.text }}>
                                                                    {supplier.price ? `₹${supplier.price}${supplier.priceUnit ? `/${supplier.priceUnit}` : ""}` : "Price: —"}
                                                                </span>
                                                            </div>
                                                            <div style={{ display: "flex", gap: "8px" }}>
                                                                <button
                                                                    onClick={async () => {
                                                                        const result = await handleViewContact(supplier.id);
                                                                        if (result) { alert(`📞 Contact: ${result}`); }
                                                                    }}
                                                                    style={{ flex: 1, padding: "8px", backgroundColor: "#3b82f6", color: "white", border: "none", borderRadius: "8px", fontSize: "12px", cursor: "pointer", fontWeight: "600" }}
                                                                >
                                                                    📞 Contact
                                                                </button>
                                                                <button
                                                                    onClick={() => handleSaveSupplier(supplier.id)}
                                                                    style={{ flex: 1, padding: "8px", backgroundColor: darkMode ? "#334155" : "#f1f5f9", color: t.textSecondary, border: `1px solid ${t.border}`, borderRadius: "8px", fontSize: "12px", cursor: "pointer", fontWeight: "600" }}
                                                                >
                                                                    ⭐ Save
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                /* Desktop: Table */
                                                <div style={{ overflowX: "auto", borderRadius: "12px", border: `1px solid ${t.border}` }}>
                                                    <table style={{
                                                        width: "100%",
                                                        borderCollapse: "collapse",
                                                        fontSize: "13px",
                                                        minWidth: "600px"
                                                    }}>
                                                        <thead>
                                                            <tr style={{ backgroundColor: darkMode ? "#1e293b" : "#f8fafc" }}>
                                                                <th style={{ padding: "10px 14px", textAlign: "left", color: t.textSecondary, fontWeight: "600", borderBottom: `1px solid ${t.border}`, whiteSpace: "nowrap" }}>Company</th>
                                                                <th style={{ padding: "10px 14px", textAlign: "left", color: t.textSecondary, fontWeight: "600", borderBottom: `1px solid ${t.border}`, whiteSpace: "nowrap" }}>City</th>
                                                                <th style={{ padding: "10px 14px", textAlign: "left", color: t.textSecondary, fontWeight: "600", borderBottom: `1px solid ${t.border}`, whiteSpace: "nowrap" }}>Categories</th>
                                                                <th style={{ padding: "10px 14px", textAlign: "left", color: t.textSecondary, fontWeight: "600", borderBottom: `1px solid ${t.border}`, whiteSpace: "nowrap" }}>MOQ</th>
                                                                <th style={{ padding: "10px 14px", textAlign: "left", color: t.textSecondary, fontWeight: "600", borderBottom: `1px solid ${t.border}`, whiteSpace: "nowrap" }}>Price</th>
                                                                <th style={{ padding: "10px 14px", textAlign: "left", color: t.textSecondary, fontWeight: "600", borderBottom: `1px solid ${t.border}`, whiteSpace: "nowrap" }}>Badges</th>
                                                                <th style={{ padding: "10px 14px", textAlign: "center", color: t.textSecondary, fontWeight: "600", borderBottom: `1px solid ${t.border}`, whiteSpace: "nowrap" }}>Actions</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {message.suppliers.map((supplier) => (
                                                                <tr key={supplier.id} style={{ borderBottom: `1px solid ${t.border}` }}>
                                                                    <td style={{ padding: "12px 14px", color: t.text, fontWeight: "500" }}>
                                                                        {supplier.companyName}
                                                                        {supplier.matchScore && (
                                                                            <span style={{ display: "block", fontSize: "10px", color: "#22c55e", fontWeight: "400" }}>
                                                                                {supplier.matchScore}% match
                                                                            </span>
                                                                        )}
                                                                    </td>
                                                                    <td style={{ padding: "12px 14px", color: t.textSecondary }}>{supplier.city || "—"}</td>
                                                                    <td style={{ padding: "12px 14px" }}>
                                                                        <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
                                                                            {supplier.productCategories?.slice(0, 2).map((cat, i) => (
                                                                                <span key={i} style={{
                                                                                    padding: "2px 8px",
                                                                                    backgroundColor: darkMode ? "rgba(59,130,246,0.15)" : "#eff6ff",
                                                                                    color: darkMode ? "#93c5fd" : "#2563eb",
                                                                                    borderRadius: "8px",
                                                                                    fontSize: "11px"
                                                                                }}>{cat}</span>
                                                                            ))}
                                                                        </div>
                                                                    </td>
                                                                    <td style={{ padding: "12px 14px", color: t.textSecondary, whiteSpace: "nowrap" }}>{supplier.moq || "—"}</td>
                                                                    <td style={{ padding: "12px 14px", color: t.text, fontWeight: "500", whiteSpace: "nowrap" }}>
                                                                        {supplier.price ? `₹${supplier.price}${supplier.priceUnit ? `/${supplier.priceUnit}` : ""}` : "—"}
                                                                    </td>
                                                                    <td style={{ padding: "12px 14px" }}>
                                                                        <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
                                                                            {supplier.badges?.slice(0, 2).map((badge, i) => (
                                                                                <span key={i} style={{
                                                                                    padding: "2px 6px",
                                                                                    backgroundColor: darkMode ? "rgba(34,197,94,0.15)" : "#f0fdf4",
                                                                                    color: darkMode ? "#86efac" : "#16a34a",
                                                                                    borderRadius: "6px",
                                                                                    fontSize: "10px"
                                                                                }}>{badge}</span>
                                                                            ))}
                                                                        </div>
                                                                    </td>
                                                                    <td style={{ padding: "12px 14px", textAlign: "center" }}>
                                                                        <div style={{ display: "flex", gap: "6px", justifyContent: "center" }}>
                                                                            <button
                                                                                onClick={async () => {
                                                                                    const result = await handleViewContact(supplier.id);
                                                                                    if (result) {
                                                                                        alert(`📞 Contact: ${result}`);
                                                                                    }
                                                                                }}
                                                                                style={{
                                                                                    padding: "6px 12px",
                                                                                    backgroundColor: "#3b82f6",
                                                                                    color: "white",
                                                                                    border: "none",
                                                                                    borderRadius: "6px",
                                                                                    fontSize: "11px",
                                                                                    cursor: "pointer",
                                                                                    fontWeight: "500",
                                                                                    whiteSpace: "nowrap"
                                                                                }}
                                                                            >
                                                                                📞 Contact
                                                                            </button>
                                                                            <button
                                                                                onClick={() => handleSaveSupplier(supplier.id)}
                                                                                style={{
                                                                                    padding: "6px 12px",
                                                                                    backgroundColor: darkMode ? "#334155" : "#f1f5f9",
                                                                                    color: t.textSecondary,
                                                                                    border: `1px solid ${t.border}`,
                                                                                    borderRadius: "6px",
                                                                                    fontSize: "11px",
                                                                                    cursor: "pointer",
                                                                                    fontWeight: "500",
                                                                                    whiteSpace: "nowrap"
                                                                                }}
                                                                            >
                                                                                ⭐ Save
                                                                            </button>
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}

                            {isTyping && (
                                <div style={{ display: "flex", justifyContent: "flex-start" }}>
                                    <div style={{
                                        padding: "14px 18px",
                                        borderRadius: "16px 16px 16px 4px",
                                        backgroundColor: t.aiBubble,
                                        border: `1px solid ${t.aiBubbleBorder}`
                                    }}>
                                        <div style={{ display: "flex", gap: "5px" }}>
                                            <div style={{ width: "7px", height: "7px", backgroundColor: t.textMuted, borderRadius: "50%", animation: "bounce 1s infinite" }} />
                                            <div style={{ width: "7px", height: "7px", backgroundColor: t.textMuted, borderRadius: "50%", animation: "bounce 1s infinite 0.15s" }} />
                                            <div style={{ width: "7px", height: "7px", backgroundColor: t.textMuted, borderRadius: "50%", animation: "bounce 1s infinite 0.3s" }} />
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
                    borderTop: `1px solid ${t.border}`,
                    padding: isMobile ? "10px 12px" : "14px 20px",
                    backgroundColor: t.bg,
                    transition: "background-color 0.3s ease"
                }}>
                    <div style={{ maxWidth: "800px", margin: "0 auto" }}>
                        <div style={{ display: "flex", gap: "10px" }}>
                            <input
                                type="text"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                                placeholder="Type your message..."
                                style={{
                                    flex: 1,
                                    padding: "12px 18px",
                                    border: `1px solid ${t.inputBorder}`,
                                    borderRadius: "12px",
                                    fontSize: "14px",
                                    outline: "none",
                                    backgroundColor: t.inputBg,
                                    color: t.text,
                                    transition: "all 0.3s ease"
                                }}
                            />
                            <button
                                onClick={() => handleSend()}
                                disabled={!inputValue.trim()}
                                style={{
                                    padding: "12px 20px",
                                    backgroundColor: inputValue.trim() ? "#3b82f6" : t.bgTertiary,
                                    color: inputValue.trim() ? "white" : t.textMuted,
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
                        <p style={{ textAlign: "center", fontSize: "11px", color: t.textMuted, marginTop: "8px" }}>
                            Powered by Gemini AI • ChidiyaAI helps you find verified suppliers
                        </p>
                    </div>
                </div>
            </div>

            {/* Subscription Prompt Modal */}
            {showSubscriptionPrompt && (
                <div style={{
                    position: "fixed",
                    top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: "rgba(0,0,0,0.5)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    zIndex: 1000
                }}>
                    <div style={{
                        backgroundColor: t.modalBg,
                        borderRadius: "20px",
                        padding: "32px",
                        maxWidth: "400px",
                        width: "90%",
                        textAlign: "center",
                        boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
                        border: `1px solid ${t.modalBorder}`
                    }}>
                        <div style={{
                            width: "64px", height: "64px",
                            backgroundColor: t.tagYellowBg,
                            borderRadius: "50%",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            margin: "0 auto 20px",
                            fontSize: "28px"
                        }}>
                            🔒
                        </div>
                        <h2 style={{ margin: "0 0 12px", fontSize: "22px", fontWeight: "700", color: t.text }}>
                            Limit Reached!
                        </h2>
                        <p style={{ margin: "0 0 8px", fontSize: "14px", color: t.textSecondary, lineHeight: "1.6" }}>
                            You&apos;ve used your free daily limit:
                        </p>
                        <div style={{
                            backgroundColor: t.modalInfoBg,
                            borderRadius: "12px",
                            padding: "16px",
                            margin: "16px 0",
                            border: `1px solid ${t.modalBorder}`
                        }}>
                            <p style={{ margin: "0 0 8px", fontSize: "13px", color: t.textSecondary }}>
                                ✅ <strong>3 contacts</strong> per chat
                            </p>
                            <p style={{ margin: "0 0 8px", fontSize: "13px", color: t.textSecondary }}>
                                ✅ <strong>5 contacts</strong> per day
                            </p>
                            <p style={{ margin: "0", fontSize: "13px", color: t.textSecondary }}>
                                ✅ <strong>3 queries</strong> per day
                            </p>
                        </div>
                        <p style={{ margin: "16px 0", fontSize: "14px", color: t.text, fontWeight: "500" }}>
                            Upgrade for <strong>unlimited access</strong>!
                        </p>
                        <button
                            onClick={handleChatSubscribe}
                            disabled={subLoading}
                            style={{
                                width: "100%",
                                padding: "14px",
                                backgroundColor: subLoading ? t.bgTertiary : "#3b82f6",
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
                                color: t.textSecondary,
                                border: "none",
                                fontSize: "14px",
                                cursor: "pointer"
                            }}
                        >
                            Maybe Later
                        </button>
                        <p style={{ margin: "16px 0 0", fontSize: "12px", color: t.textMuted, textAlign: "center" }}>
                            If it&apos;s a mistake,{" "}
                            <a href="mailto:support@chidiyaai.com" style={{ color: "#3b82f6", textDecoration: "underline" }}>
                                contact us
                            </a>
                        </p>
                    </div>
                </div>
            )}

            {/* GST Calculator Modal */}
            <GSTCalculator isOpen={showGSTCalculator} onClose={() => setShowGSTCalculator(false)} />

            {/* Helper Guide Widget */}
            {showHelperGuide && <GlobalChatWidget />}


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

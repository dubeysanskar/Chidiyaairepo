"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";

const suggestedQuestions = [
    "Show me top-rated suppliers",
    "Filter by lowest MOQ",
    "Which suppliers offer credit terms?",
    "Compare prices across suppliers",
];

export default function Chat() {
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        const requirements = localStorage.getItem("sourcingRequirements");
        let welcomeMessage = "Hello! I'm Chidiya, your AI sourcing assistant. How can I help you find suppliers today?";

        if (requirements) {
            const parsed = JSON.parse(requirements);
            welcomeMessage = `Welcome! Based on your requirements for "${parsed[1] || "your products"}", I've found some excellent matches. Let me show you the top verified suppliers.`;
        }

        setMessages([{
            id: 1,
            role: "assistant",
            content: welcomeMessage,
            timestamp: new Date(),
        }]);

        setTimeout(() => {
            setMessages((prev) => [...prev, {
                id: 2,
                role: "assistant",
                content: "I found 15 verified suppliers matching your criteria. Here are the top 3:",
                timestamp: new Date(),
                suppliers: [
                    { name: "Premium Textile Corp", location: "Delhi NCR", rating: 4.8, verified: true, moq: "200 units" },
                    { name: "Quality Fabrics Ltd", location: "Mumbai", rating: 4.6, verified: true, moq: "100 units" },
                    { name: "Excel Manufacturing", location: "Gujarat", rating: 4.5, verified: true, moq: "500 units" },
                ],
            }]);
        }, 1500);
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSend = (text = inputValue) => {
        if (!text.trim()) return;
        setMessages((prev) => [...prev, {
            id: Date.now(),
            role: "user",
            content: text,
            timestamp: new Date(),
        }]);
        setInputValue("");
        setIsTyping(true);

        setTimeout(() => {
            setIsTyping(false);
            setMessages((prev) => [...prev, {
                id: Date.now() + 1,
                role: "assistant",
                content: generateResponse(text),
                timestamp: new Date(),
            }]);
        }, 1500);
    };

    const generateResponse = (query) => {
        const lowerQuery = query.toLowerCase();
        if (lowerQuery.includes("price") || lowerQuery.includes("cost")) {
            return "Based on current market rates, prices range from ₹150-450 per unit depending on quality and quantity. Would you like me to get specific quotes from the top suppliers?";
        }
        if (lowerQuery.includes("moq") || lowerQuery.includes("minimum")) {
            return "The minimum order quantities vary: Premium Textile Corp starts at 200 units, Quality Fabrics Ltd at 100 units, and Excel Manufacturing at 500 units. I can filter suppliers by your preferred MOQ.";
        }
        if (lowerQuery.includes("verified") || lowerQuery.includes("gst")) {
            return "All suppliers in our recommendations are GST verified. Premium Textile Corp and Quality Fabrics Ltd also have ISO certification. Would you like to see their verification documents?";
        }
        return "I understand you're looking for more information. Let me analyze your query and find the best suppliers that match. Would you like to see detailed profiles of any specific supplier?";
    };

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
                padding: "16px 24px"
            }}>
                <div style={{ maxWidth: "900px", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                        <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "8px" }}>
                            <div style={{
                                width: "32px",
                                height: "32px",
                                borderRadius: "8px",
                                background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: "white"
                            }}>⚡</div>
                            <span style={{ fontSize: "18px", fontWeight: "bold", color: "#0f172a" }}>
                                Chidiya<span style={{ color: "#3b82f6" }}>AI</span>
                            </span>
                        </Link>
                        <div style={{ width: "1px", height: "24px", backgroundColor: "#e2e8f0" }} />
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <span style={{ width: "8px", height: "8px", backgroundColor: "#22c55e", borderRadius: "50%" }} />
                            <span style={{ fontSize: "14px", color: "#64748b" }}>Chidiya is online</span>
                        </div>
                    </div>
                    <div style={{ display: "flex", gap: "16px" }}>
                        <Link href="/dashboard" style={{ fontSize: "14px", color: "#64748b", textDecoration: "none" }}>My Dashboard</Link>
                        <Link href="/onboarding" style={{ fontSize: "14px", color: "#3b82f6", textDecoration: "none", fontWeight: "500" }}>New Search</Link>
                    </div>
                </div>
            </header>

            {/* Messages */}
            <main style={{ flex: 1, overflowY: "auto", padding: "24px" }}>
                <div style={{ maxWidth: "900px", margin: "0 auto" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                        {messages.map((message) => (
                            <div key={message.id} style={{ display: "flex", justifyContent: message.role === "user" ? "flex-end" : "flex-start" }}>
                                <div style={{
                                    maxWidth: "75%",
                                    padding: "16px 20px",
                                    borderRadius: "16px",
                                    backgroundColor: message.role === "user" ? "#0f172a" : "white",
                                    color: message.role === "user" ? "white" : "#0f172a",
                                    boxShadow: message.role === "user" ? "none" : "0 2px 8px rgba(0,0,0,0.06)",
                                    border: message.role === "user" ? "none" : "1px solid #e2e8f0"
                                }}>
                                    <p style={{ margin: 0, lineHeight: "1.6" }}>{message.content}</p>

                                    {/* Supplier Cards */}
                                    {message.suppliers && (
                                        <div style={{ marginTop: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
                                            {message.suppliers.map((supplier, index) => (
                                                <div key={index} style={{
                                                    backgroundColor: "#f8fafc",
                                                    borderRadius: "12px",
                                                    padding: "16px",
                                                    cursor: "pointer",
                                                    transition: "background-color 0.2s"
                                                }}>
                                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                                                        <div>
                                                            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                                                                <span style={{ fontWeight: "600", color: "#0f172a" }}>{supplier.name}</span>
                                                                {supplier.verified && (
                                                                    <span style={{
                                                                        padding: "2px 8px",
                                                                        backgroundColor: "#dcfce7",
                                                                        color: "#15803d",
                                                                        borderRadius: "10px",
                                                                        fontSize: "11px",
                                                                        fontWeight: "500"
                                                                    }}>✓ Verified</span>
                                                                )}
                                                            </div>
                                                            <div style={{ fontSize: "13px", color: "#64748b" }}>{supplier.location}</div>
                                                        </div>
                                                        <div style={{ display: "flex", alignItems: "center", gap: "4px", color: "#f59e0b" }}>
                                                            <span>★</span>
                                                            <span style={{ fontSize: "14px", fontWeight: "500" }}>{supplier.rating}</span>
                                                        </div>
                                                    </div>
                                                    <div style={{ fontSize: "13px", color: "#475569" }}>MOQ: {supplier.moq}</div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}

                        {/* Typing Indicator */}
                        {isTyping && (
                            <div style={{ display: "flex", justifyContent: "flex-start" }}>
                                <div style={{
                                    padding: "16px 20px",
                                    borderRadius: "16px",
                                    backgroundColor: "white",
                                    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                                    border: "1px solid #e2e8f0"
                                }}>
                                    <div style={{ display: "flex", gap: "6px" }}>
                                        <div style={{ width: "8px", height: "8px", backgroundColor: "#94a3b8", borderRadius: "50%", animation: "bounce 1s infinite" }} />
                                        <div style={{ width: "8px", height: "8px", backgroundColor: "#94a3b8", borderRadius: "50%", animation: "bounce 1s infinite 0.15s" }} />
                                        <div style={{ width: "8px", height: "8px", backgroundColor: "#94a3b8", borderRadius: "50%", animation: "bounce 1s infinite 0.3s" }} />
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                </div>
            </main>

            {/* Suggested Questions */}
            {messages.length <= 2 && (
                <div style={{ backgroundColor: "white", borderTop: "1px solid #e2e8f0", padding: "16px 24px" }}>
                    <div style={{ maxWidth: "900px", margin: "0 auto" }}>
                        <p style={{ fontSize: "13px", color: "#64748b", marginBottom: "12px" }}>Suggested questions:</p>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                            {suggestedQuestions.map((question, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleSend(question)}
                                    style={{
                                        padding: "8px 16px",
                                        backgroundColor: "#f1f5f9",
                                        border: "none",
                                        borderRadius: "20px",
                                        fontSize: "13px",
                                        color: "#475569",
                                        cursor: "pointer"
                                    }}
                                >
                                    {question}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Input */}
            <div style={{
                position: "sticky",
                bottom: 0,
                backgroundColor: "white",
                borderTop: "1px solid #e2e8f0",
                padding: "16px 24px"
            }}>
                <div style={{ maxWidth: "900px", margin: "0 auto" }}>
                    <div style={{ display: "flex", gap: "12px" }}>
                        <input
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyPress={(e) => e.key === "Enter" && handleSend()}
                            placeholder="Ask Chidiya about suppliers..."
                            style={{
                                flex: 1,
                                padding: "14px 20px",
                                border: "1px solid #e2e8f0",
                                borderRadius: "12px",
                                fontSize: "15px",
                                outline: "none",
                                backgroundColor: "#f8fafc"
                            }}
                        />
                        <button
                            onClick={() => handleSend()}
                            disabled={!inputValue.trim()}
                            style={{
                                padding: "14px 20px",
                                backgroundColor: inputValue.trim() ? "#0f172a" : "#e2e8f0",
                                color: inputValue.trim() ? "white" : "#94a3b8",
                                border: "none",
                                borderRadius: "12px",
                                cursor: inputValue.trim() ? "pointer" : "not-allowed",
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                                fontWeight: "500"
                            }}
                        >
                            Send
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

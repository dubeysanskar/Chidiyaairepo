"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { MessageCircle, X, Send, ChevronDown, Sparkles, Folder } from "lucide-react";

interface Message {
    id: number;
    role: "user" | "assistant";
    content: string;
    timestamp: Date;
}

interface Category {
    id: string;
    name: string;
    description?: string;
    slug: string;
    supplierCount: number;
}

export default function GlobalChatWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [showPopup, setShowPopup] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const [categories, setCategories] = useState<Category[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [showCategorySelect, setShowCategorySelect] = useState(true);
    const [categoriesLoading, setCategoriesLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Show popup after 3 seconds on page load
    useEffect(() => {
        const timer = setTimeout(() => {
            if (!isOpen) {
                setShowPopup(true);
                setTimeout(() => setShowPopup(false), 5000);
            }
        }, 3000);
        return () => clearTimeout(timer);
    }, [isOpen]);

    // Scroll to bottom on new messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // Fetch categories when widget opens
    useEffect(() => {
        if (isOpen && categories.length === 0) {
            fetchCategories();
        }
    }, [isOpen, categories.length]);

    const fetchCategories = async () => {
        setCategoriesLoading(true);
        try {
            const res = await fetch("/api/global-chat");
            const data = await res.json();
            if (data.success) {
                setCategories(data.categories);
            }
        } catch (err) {
            console.error("Failed to fetch categories:", err);
        } finally {
            setCategoriesLoading(false);
        }
    };

    const handleCategorySelect = (categoryName: string) => {
        setSelectedCategory(categoryName);
        setShowCategorySelect(false);
        setMessages([{
            id: 1,
            role: "assistant",
            content: `Great choice! You selected "${categoryName}". I can tell you about the products, specifications, and terminology for this category. What would you like to know?`,
            timestamp: new Date(),
        }]);
    };

    const handleSkipCategory = () => {
        setSelectedCategory(null);
        setShowCategorySelect(false);
        setMessages([{
            id: 1,
            role: "assistant",
            content: "Hey! I'm Chidiya 🐦 your product guide. Ask me about any category or product specs - like what 3PLY means or what products we offer!",
            timestamp: new Date(),
        }]);
    };

    const sendMessage = async () => {
        if (!inputValue.trim() || isTyping) return;

        const userMsg: Message = {
            id: messages.length + 1,
            role: "user",
            content: inputValue.trim(),
            timestamp: new Date(),
        };

        setMessages(prev => [...prev, userMsg]);
        setInputValue("");
        setIsTyping(true);

        try {
            const res = await fetch("/api/global-chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    message: userMsg.content,
                    selectedCategory,
                    conversationHistory: messages.map(m => ({
                        role: m.role,
                        content: m.content,
                    })),
                }),
            });

            const data = await res.json();
            if (data.success) {
                setMessages(prev => [...prev, {
                    id: prev.length + 1,
                    role: "assistant",
                    content: data.response,
                    timestamp: new Date(),
                }]);
            } else {
                setMessages(prev => [...prev, {
                    id: prev.length + 1,
                    role: "assistant",
                    content: "Sorry, I'm having trouble right now. Please try again!",
                    timestamp: new Date(),
                }]);
            }
        } catch {
            setMessages(prev => [...prev, {
                id: prev.length + 1,
                role: "assistant",
                content: "Oops! Something went wrong. Please try again.",
                timestamp: new Date(),
            }]);
        } finally {
            setIsTyping(false);
        }
    };

    const handleClose = () => {
        setIsOpen(false);
    };

    const handleOpen = () => {
        setIsOpen(true);
        setShowPopup(false);
        // Always reset to category selection screen when opening
        setShowCategorySelect(true);
        setSelectedCategory(null);
        setMessages([]);
    };

    const handleBackToCategories = () => {
        setShowCategorySelect(true);
        setSelectedCategory(null);
        setMessages([]);
    };

    return (
        <>
            {/* Floating Chat Button */}
            {!isOpen && (
                <div style={{ position: "fixed", bottom: "24px", right: "24px", zIndex: 9999 }}>
                    {/* Popup Message */}
                    {showPopup && (
                        <div style={{
                            position: "absolute",
                            bottom: "70px",
                            right: "0",
                            backgroundColor: "white",
                            padding: "12px 18px",
                            borderRadius: "12px",
                            boxShadow: "0 4px 24px rgba(0,0,0,0.15)",
                            whiteSpace: "nowrap",
                            fontSize: "14px",
                            color: "#0f172a",
                            fontWeight: "500",
                            animation: "slideUp 0.3s ease",
                        }}>
                            <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>Have doubts? Ask Chidiya! <Image src="/favicon-32x32.png" alt="" width={18} height={18} style={{ display: "inline-block", verticalAlign: "middle" }} /></span>
                            <div style={{
                                position: "absolute",
                                bottom: "-6px",
                                right: "24px",
                                width: "12px",
                                height: "12px",
                                backgroundColor: "white",
                                transform: "rotate(45deg)",
                                boxShadow: "2px 2px 4px rgba(0,0,0,0.1)",
                            }} />
                        </div>
                    )}

                    {/* Chat Button */}
                    <button
                        onClick={handleOpen}
                        style={{
                            width: "60px",
                            height: "60px",
                            borderRadius: "50%",
                            backgroundColor: "#3b82f6",
                            color: "white",
                            border: "none",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            boxShadow: "0 4px 20px rgba(59,130,246,0.4)",
                            transition: "all 0.3s",
                        }}
                    >
                        <MessageCircle size={26} />
                    </button>
                </div>
            )}

            {/* Chat Window */}
            {isOpen && (
                <div style={{
                    position: "fixed",
                    bottom: "24px",
                    right: "24px",
                    width: "380px",
                    maxWidth: "calc(100vw - 48px)",
                    height: "520px",
                    maxHeight: "calc(100vh - 100px)",
                    backgroundColor: "white",
                    borderRadius: "16px",
                    boxShadow: "0 8px 40px rgba(0,0,0,0.2)",
                    display: "flex",
                    flexDirection: "column",
                    overflow: "hidden",
                    zIndex: 9999,
                    animation: "slideUp 0.3s ease",
                }}>
                    {/* Header */}
                    <div style={{
                        background: "linear-gradient(135deg, #3b82f6, #2563eb)",
                        color: "white",
                        padding: "16px 20px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                    }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <div style={{
                                width: "36px",
                                height: "36px",
                                borderRadius: "50%",
                                backgroundColor: "white",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                overflow: "hidden",
                            }}>
                                <Image src="/favicon-32x32.png" alt="ChidiyaAI" width={28} height={28} style={{ borderRadius: "50%" }} />
                            </div>
                            <div>
                                <div style={{ fontWeight: "600", fontSize: "15px" }}>Chidiya Helper</div>
                                <div style={{ fontSize: "11px", opacity: 0.8 }}>
                                    {selectedCategory ? `📦 ${selectedCategory}` : "Product Guide"}
                                </div>
                            </div>
                        </div>
                        <div style={{ display: "flex", gap: "8px" }}>
                            {!showCategorySelect && (
                                <button
                                    onClick={handleBackToCategories}
                                    style={{
                                        background: "rgba(255,255,255,0.2)",
                                        border: "none",
                                        color: "white",
                                        padding: "4px 10px",
                                        borderRadius: "6px",
                                        cursor: "pointer",
                                        fontSize: "11px",
                                    }}
                                >
                                    ← Categories
                                </button>
                            )}
                            <button
                                onClick={handleClose}
                                style={{
                                    background: "none",
                                    border: "none",
                                    color: "white",
                                    cursor: "pointer",
                                    padding: "4px",
                                }}
                            >
                                <X size={20} />
                            </button>
                        </div>
                    </div>

                    {/* Category Selection Screen */}
                    {showCategorySelect ? (
                        <div style={{
                            flex: 1,
                            overflow: "auto",
                            padding: "20px",
                            display: "flex",
                            flexDirection: "column",
                        }}>
                            <div style={{ textAlign: "center", marginBottom: "16px" }}>
                                <Sparkles size={28} style={{ color: "#3b82f6", margin: "0 auto 8px" }} />
                                <h3 style={{ fontSize: "16px", fontWeight: "600", color: "#0f172a", margin: "0 0 6px" }}>
                                    Which category interests you?
                                </h3>
                                <p style={{ fontSize: "13px", color: "#64748b", margin: 0 }}>
                                    Select a category to explore, or skip to ask anything
                                </p>
                            </div>

                            {categoriesLoading ? (
                                <div style={{ textAlign: "center", padding: "20px", color: "#64748b" }}>
                                    Loading categories...
                                </div>
                            ) : (
                                <div style={{ display: "flex", flexDirection: "column", gap: "8px", flex: 1 }}>
                                    {categories.map((cat) => (
                                        <button
                                            key={cat.id}
                                            onClick={() => handleCategorySelect(cat.name)}
                                            style={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: "12px",
                                                padding: "12px 14px",
                                                backgroundColor: "#f8fafc",
                                                border: "1px solid #e2e8f0",
                                                borderRadius: "10px",
                                                cursor: "pointer",
                                                textAlign: "left",
                                                transition: "all 0.2s",
                                            }}
                                        >
                                            <Folder size={18} style={{ color: "#3b82f6", flexShrink: 0 }} />
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontSize: "14px", fontWeight: "500", color: "#0f172a" }}>
                                                    {cat.name}
                                                </div>
                                                {cat.supplierCount > 0 && (
                                                    <div style={{ fontSize: "11px", color: "#64748b" }}>
                                                        {cat.supplierCount} supplier{cat.supplierCount > 1 ? 's' : ''}
                                                    </div>
                                                )}
                                            </div>
                                            <ChevronDown size={14} style={{ color: "#94a3b8", transform: "rotate(-90deg)" }} />
                                        </button>
                                    ))}
                                </div>
                            )}

                            <button
                                onClick={handleSkipCategory}
                                style={{
                                    marginTop: "12px",
                                    padding: "10px",
                                    backgroundColor: "transparent",
                                    border: "1px dashed #cbd5e1",
                                    borderRadius: "10px",
                                    color: "#3b82f6",
                                    cursor: "pointer",
                                    fontSize: "13px",
                                    fontWeight: "500",
                                }}
                            >
                                Skip → Ask anything
                            </button>
                        </div>
                    ) : (
                        <>
                            {/* Messages Area */}
                            <div style={{
                                flex: 1,
                                overflow: "auto",
                                padding: "16px",
                                display: "flex",
                                flexDirection: "column",
                                gap: "12px",
                            }}>
                                {messages.map((msg) => (
                                    <div
                                        key={msg.id}
                                        style={{
                                            display: "flex",
                                            justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
                                        }}
                                    >
                                        <div style={{
                                            maxWidth: "85%",
                                            padding: "10px 14px",
                                            borderRadius: msg.role === "user"
                                                ? "14px 14px 4px 14px"
                                                : "14px 14px 14px 4px",
                                            backgroundColor: msg.role === "user" ? "#3b82f6" : "#f1f5f9",
                                            color: msg.role === "user" ? "white" : "#0f172a",
                                            fontSize: "13px",
                                            lineHeight: "1.5",
                                        }}>
                                            {msg.content}
                                        </div>
                                    </div>
                                ))}

                                {isTyping && (
                                    <div style={{ display: "flex", justifyContent: "flex-start" }}>
                                        <div style={{
                                            padding: "10px 14px",
                                            borderRadius: "14px 14px 14px 4px",
                                            backgroundColor: "#f1f5f9",
                                            fontSize: "13px",
                                            color: "#64748b",
                                        }}>
                                            <span style={{ animation: "bounce 1s infinite" }}>●</span>
                                            <span style={{ animation: "bounce 1s infinite 0.2s" }}> ●</span>
                                            <span style={{ animation: "bounce 1s infinite 0.4s" }}> ●</span>
                                        </div>
                                    </div>
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Quick Questions (only for first message) */}
                            {messages.length <= 1 && (
                                <div style={{
                                    padding: "8px 16px",
                                    display: "flex",
                                    gap: "6px",
                                    flexWrap: "wrap",
                                    borderTop: "1px solid #f1f5f9",
                                }}>
                                    {selectedCategory ? (
                                        <>
                                            <button onClick={() => { setInputValue(`What products are in ${selectedCategory}?`); }} style={quickBtnStyle}>Products?</button>
                                            <button onClick={() => { setInputValue("What specs should I look for?"); }} style={quickBtnStyle}>Specs?</button>
                                            <button onClick={() => { setInputValue("What is MOQ?"); }} style={quickBtnStyle}>MOQ?</button>
                                        </>
                                    ) : (
                                        <>
                                            <button onClick={() => { setInputValue("What is 3PLY?"); }} style={quickBtnStyle}>What is 3PLY?</button>
                                            <button onClick={() => { setInputValue("What categories do you have?"); }} style={quickBtnStyle}>Categories</button>
                                            <button onClick={() => { setInputValue("What does GSM mean?"); }} style={quickBtnStyle}>GSM?</button>
                                        </>
                                    )}
                                </div>
                            )}

                            {/* Input Area */}
                            <div style={{
                                padding: "12px 16px",
                                borderTop: "1px solid #e2e8f0",
                                display: "flex",
                                gap: "8px",
                                alignItems: "center",
                            }}>
                                <input
                                    type="text"
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                                    placeholder="Ask about products..."
                                    style={{
                                        flex: 1,
                                        padding: "10px 14px",
                                        border: "1px solid #e2e8f0",
                                        borderRadius: "10px",
                                        fontSize: "13px",
                                        outline: "none",
                                        color: "#0f172a",
                                        backgroundColor: "white",
                                    }}
                                />
                                <button
                                    onClick={sendMessage}
                                    disabled={!inputValue.trim() || isTyping}
                                    style={{
                                        width: "38px",
                                        height: "38px",
                                        borderRadius: "10px",
                                        backgroundColor: inputValue.trim() ? "#3b82f6" : "#e2e8f0",
                                        color: inputValue.trim() ? "white" : "#94a3b8",
                                        border: "none",
                                        cursor: inputValue.trim() ? "pointer" : "default",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        flexShrink: 0,
                                    }}
                                >
                                    <Send size={16} />
                                </button>
                            </div>
                        </>
                    )}
                </div>
            )}

            {/* Global Styles */}
            <style jsx global>{`
                @keyframes slideUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </>
    );
}

const quickBtnStyle: React.CSSProperties = {
    padding: "6px 12px",
    backgroundColor: "#eff6ff",
    color: "#3b82f6",
    border: "1px solid #bfdbfe",
    borderRadius: "16px",
    fontSize: "12px",
    cursor: "pointer",
    fontWeight: "500",
};

"use client";

import { useState, useRef, useEffect } from "react";
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
    supplierCount?: number;
}

export default function GlobalChatWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [showPopup, setShowPopup] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const [categories, setCategories] = useState<Category[]>([]);
    const [showCategories, setShowCategories] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Show popup after 3 seconds on page load
    useEffect(() => {
        const timer = setTimeout(() => {
            if (!isOpen) {
                setShowPopup(true);
                // Hide popup after 5 seconds
                setTimeout(() => setShowPopup(false), 5000);
            }
        }, 3000);
        return () => clearTimeout(timer);
    }, [isOpen]);

    // Scroll to bottom on new messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // Add initial message when opened
    useEffect(() => {
        if (isOpen && messages.length === 0) {
            setMessages([{
                id: 1,
                role: "assistant",
                content: "Hey! I'm Chidiya 🐦 your product guide. Ask me about any category or product specs - like what 3PLY means or what products we offer!",
                timestamp: new Date(),
            }]);
            fetchCategories();
        }
    }, [isOpen, messages.length]);

    const fetchCategories = async () => {
        try {
            const res = await fetch("/api/global-chat");
            const data = await res.json();
            if (data.success && data.categories) {
                setCategories(data.categories);
            }
        } catch (error) {
            console.error("Failed to fetch categories:", error);
        }
    };

    const handleSend = async (messageText?: string) => {
        const text = messageText || inputValue.trim();
        if (!text || isTyping) return;

        const userMessage: Message = {
            id: Date.now(),
            role: "user",
            content: text,
            timestamp: new Date(),
        };

        setMessages(prev => [...prev, userMessage]);
        setInputValue("");
        setIsTyping(true);

        try {
            const res = await fetch("/api/global-chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    message: text,
                    conversationHistory: messages.slice(-6).map(m => ({
                        role: m.role,
                        content: m.content,
                    })),
                }),
            });

            const data = await res.json();

            setMessages(prev => [...prev, {
                id: Date.now() + 1,
                role: "assistant",
                content: data.response || "Sorry, I couldn't process that. Try asking about a product!",
                timestamp: new Date(),
            }]);
        } catch {
            setMessages(prev => [...prev, {
                id: Date.now() + 1,
                role: "assistant",
                content: "Oops! Something went wrong. Please try again.",
                timestamp: new Date(),
            }]);
        } finally {
            setIsTyping(false);
        }
    };

    const handleCategoryClick = (category: Category) => {
        setShowCategories(false);
        handleSend(`Tell me about ${category.name}`);
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <>
            {/* Floating Button */}
            <button
                onClick={() => {
                    setIsOpen(!isOpen);
                    setShowPopup(false);
                }}
                className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-all duration-300"
                aria-label="Chat with Chidiya"
            >
                {isOpen ? (
                    <X className="w-6 h-6 text-white" />
                ) : (
                    <MessageCircle className="w-6 h-6 text-white" />
                )}
            </button>

            {/* Popup Message */}
            {showPopup && !isOpen && (
                <div className="fixed bottom-24 right-6 z-50 bg-white rounded-xl shadow-xl p-4 max-w-xs animate-bounce-in border border-orange-100">
                    <button
                        onClick={() => setShowPopup(false)}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-200"
                    >
                        <X className="w-4 h-4" />
                    </button>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full flex items-center justify-center">
                            <Sparkles className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <p className="font-semibold text-gray-800">Have doubts? 🤔</p>
                            <p className="text-sm text-gray-600">Ask Chidiya! I can help.</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Chat Window */}
            {isOpen && (
                <div className="fixed bottom-24 right-6 z-50 w-80 sm:w-96 h-[500px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-200">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-orange-500 to-amber-500 px-4 py-3 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                                <Sparkles className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-white">Chidiya Helper</h3>
                                <p className="text-xs text-white/80">Product Guide</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setShowCategories(!showCategories)}
                            className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
                            title="Browse Categories"
                        >
                            <Folder className="w-5 h-5 text-white" />
                        </button>
                    </div>

                    {/* Categories Dropdown */}
                    {showCategories && (
                        <div className="absolute top-16 right-4 left-4 bg-white rounded-lg shadow-lg border border-gray-200 max-h-48 overflow-y-auto z-10">
                            <div className="p-2 border-b border-gray-100 sticky top-0 bg-white">
                                <p className="text-xs font-semibold text-gray-500 uppercase">Our Categories</p>
                            </div>
                            {categories.map(cat => (
                                <button
                                    key={cat.id}
                                    onClick={() => handleCategoryClick(cat)}
                                    className="w-full text-left px-3 py-2 hover:bg-orange-50 transition-colors border-b border-gray-50 last:border-0"
                                >
                                    <p className="font-medium text-gray-800 text-sm">{cat.name}</p>
                                    {cat.supplierCount !== undefined && cat.supplierCount > 0 && (
                                        <p className="text-xs text-gray-500">{cat.supplierCount} suppliers</p>
                                    )}
                                </button>
                            ))}
                            {categories.length === 0 && (
                                <p className="px-3 py-2 text-sm text-gray-500">Loading categories...</p>
                            )}
                        </div>
                    )}

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
                        {messages.map(msg => (
                            <div
                                key={msg.id}
                                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                            >
                                <div
                                    className={`max-w-[80%] px-4 py-2 rounded-2xl text-sm ${msg.role === "user"
                                            ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-br-md"
                                            : "bg-white text-gray-800 shadow-sm border border-gray-100 rounded-bl-md"
                                        }`}
                                >
                                    {msg.content}
                                </div>
                            </div>
                        ))}
                        {isTyping && (
                            <div className="flex justify-start">
                                <div className="bg-white px-4 py-3 rounded-2xl rounded-bl-md shadow-sm border border-gray-100">
                                    <div className="flex gap-1">
                                        <span className="w-2 h-2 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
                                        <span className="w-2 h-2 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
                                        <span className="w-2 h-2 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Quick Actions */}
                    {messages.length <= 1 && (
                        <div className="px-4 py-2 border-t border-gray-100 bg-white">
                            <p className="text-xs text-gray-500 mb-2">Quick questions:</p>
                            <div className="flex flex-wrap gap-2">
                                {["What is 3PLY?", "Show categories", "What's GSM?"].map(q => (
                                    <button
                                        key={q}
                                        onClick={() => handleSend(q)}
                                        className="text-xs px-3 py-1.5 bg-orange-50 text-orange-600 rounded-full hover:bg-orange-100 transition-colors"
                                    >
                                        {q}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Input */}
                    <div className="p-3 border-t border-gray-200 bg-white">
                        <div className="flex items-center gap-2">
                            <input
                                type="text"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyDown={handleKeyPress}
                                placeholder="Ask about products..."
                                className="flex-1 px-4 py-2 bg-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                                disabled={isTyping}
                            />
                            <button
                                onClick={() => handleSend()}
                                disabled={!inputValue.trim() || isTyping}
                                className="p-2 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full text-white disabled:opacity-50 hover:scale-105 transition-transform"
                            >
                                <Send className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style jsx>{`
                @keyframes bounce-in {
                    0% {
                        opacity: 0;
                        transform: scale(0.8) translateY(10px);
                    }
                    100% {
                        opacity: 1;
                        transform: scale(1) translateY(0);
                    }
                }
                .animate-bounce-in {
                    animation: bounce-in 0.3s ease-out;
                }
            `}</style>
        </>
    );
}

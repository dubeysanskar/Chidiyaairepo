"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";

interface Message {
    id: string;
    role: "user" | "assistant";
    content: string;
    timestamp: Date;
}

interface UserRequirements {
    location: string;
    category: string;
    quantity: string;
    budget: string;
}

interface ChatInterfaceProps {
    userRequirements: UserRequirements;
    sessionId?: string | null;
    onSessionCreated?: (sessionId: string, title: string) => void;
    isLoggedIn?: boolean;
}

export default function ChatInterface({ userRequirements, sessionId, onSessionCreated, isLoggedIn }: ChatInterfaceProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [hasStarted, setHasStarted] = useState(false);
    const [currentSessionId, setCurrentSessionId] = useState<string | null>(sessionId || null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Load existing session or start new one
    useEffect(() => {
        if (sessionId) {
            loadSession(sessionId);
        } else if (!hasStarted) {
            setHasStarted(true);
            setMessages([]);
            sendInitialGreeting();
        }
    }, [sessionId]);

    const loadSession = async (sid: string) => {
        setIsLoading(true);
        try {
            const res = await fetch(`/api/buyer/chat-session?sessionId=${sid}`);
            if (res.ok) {
                const data = await res.json();
                if (data.success && data.session) {
                    const loadedMessages: Message[] = data.session.messages.map((m: { id: string; role: string; content: string; createdAt: string }) => ({
                        id: m.id,
                        role: m.role as "user" | "assistant",
                        content: m.content,
                        timestamp: new Date(m.createdAt),
                    }));
                    setMessages(loadedMessages);
                    setCurrentSessionId(sid);
                    setHasStarted(true);

                    // Restore requirements from session if available
                    if (data.session.location) userRequirements.location = data.session.location;
                    if (data.session.category) userRequirements.category = data.session.category;
                }
            }
        } catch (error) {
            console.error("Failed to load session:", error);
        }
        setIsLoading(false);
    };

    const sendInitialGreeting = async () => {
        setIsLoading(true);

        const reqList = [];
        if (userRequirements.location) reqList.push("Location: " + userRequirements.location);
        if (userRequirements.category) reqList.push("Category: " + userRequirements.category);
        if (userRequirements.quantity) reqList.push("Quantity: " + userRequirements.quantity);
        if (userRequirements.budget) reqList.push("Budget: " + userRequirements.budget);

        const initialMessage = reqList.length > 0
            ? "Hello! I am looking for suppliers with these requirements:\n" + reqList.join("\n")
            : "Hello! I am looking for suppliers.";

        try {
            const response = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    message: initialMessage,
                    conversationHistory: [],
                    userRequirements,
                    messageCount: 0,
                }),
            });

            const data = await response.json();

            if (data.success) {
                setMessages([
                    {
                        id: "1",
                        role: "assistant",
                        content: data.response,
                        timestamp: new Date(),
                    },
                ]);
            }
        } catch (error) {
            console.error("Error sending initial greeting:", error);
            setMessages([
                {
                    id: "1",
                    role: "assistant",
                    content: "Hello! Welcome to ChidiyaAI. I'm here to help you find the best suppliers for your business. What product are you looking for today?",
                    timestamp: new Date(),
                },
            ]);
        }

        setIsLoading(false);
    };

    // Load existing session or start new one
    useEffect(() => {
        if (sessionId) {
            loadSession(sessionId);
        } else if (!hasStarted) {
            setHasStarted(true);
            setMessages([]);
            sendInitialGreeting();
        }
    }, [sessionId]);

    const sendMessage = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            role: "user",
            content: input.trim(),
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMessage]);
        setInput("");
        setIsLoading(true);

        // Create session on first user message if logged in
        if (!currentSessionId && isLoggedIn) {
            try {
                const sessionRes = await fetch("/api/buyer/chat-session", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        ...userRequirements,
                        title: userMessage.content.substring(0, 30),
                    }),
                });
                const sessionData = await sessionRes.json();
                if (sessionData.success) {
                    setCurrentSessionId(sessionData.sessionId);
                    onSessionCreated?.(sessionData.sessionId, userMessage.content.substring(0, 30));
                }
            } catch (error) {
                console.error("Failed to create session:", error);
            }
        }

        try {
            const conversationHistory = messages.map((msg) => ({
                role: msg.role === "user" ? "user" : "model",
                content: msg.content,
            }));

            const response = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    message: userMessage.content,
                    conversationHistory,
                    userRequirements,
                    messageCount: messages.length + 1,
                }),
            });

            const data = await response.json();

            if (data.success) {
                const assistantMessage: Message = {
                    id: (Date.now() + 1).toString(),
                    role: "assistant",
                    content: data.response,
                    timestamp: new Date(),
                };
                setMessages((prev) => [...prev, assistantMessage]);
            }
        } catch (error) {
            console.error("Error sending message:", error);
            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: "assistant",
                content: "I apologize, but I encountered an error. Please try again.",
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, errorMessage]);
        }

        setIsLoading(false);
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    return (
        <div className="flex flex-col h-full bg-slate-900">
            {/* Header */}
            <div className="flex items-center gap-4 p-4 border-b border-slate-800 bg-slate-900/80 backdrop-blur-sm">
                <div className="w-10 h-10 rounded-full overflow-hidden">
                    <Image
                        src="/assests/chidiyaaiicon.png"
                        alt="ChidiyaAI"
                        width={40}
                        height={40}
                        className="w-full h-full object-cover"
                    />
                </div>
                <div>
                    <h1 className="font-semibold text-white">ChidiyaAI Assistant</h1>
                    <p className="text-xs text-slate-400">Your B2B Sourcing Partner</p>
                </div>
                <div className="ml-auto flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                    <span className="text-xs text-slate-400">Online</span>
                </div>
            </div>

            {/* Requirements Summary */}
            {(userRequirements.location || userRequirements.category || userRequirements.quantity || userRequirements.budget) && (
                <div className="px-4 py-3 bg-slate-800/50 border-b border-slate-800">
                    <p className="text-xs text-slate-500 mb-2">Your Requirements:</p>
                    <div className="flex flex-wrap gap-2">
                        {userRequirements.location && (
                            <span className="px-3 py-1 bg-blue-500/10 text-blue-400 text-xs rounded-full border border-blue-500/20">
                                📍 {userRequirements.location}
                            </span>
                        )}
                        {userRequirements.category && (
                            <span className="px-3 py-1 bg-green-500/10 text-green-400 text-xs rounded-full border border-green-500/20">
                                📦 {userRequirements.category}
                            </span>
                        )}
                        {userRequirements.quantity && (
                            <span className="px-3 py-1 bg-purple-500/10 text-purple-400 text-xs rounded-full border border-purple-500/20">
                                📊 {userRequirements.quantity}
                            </span>
                        )}
                        {userRequirements.budget && (
                            <span className="px-3 py-1 bg-yellow-500/10 text-yellow-400 text-xs rounded-full border border-yellow-500/20">
                                💰 {userRequirements.budget}
                            </span>
                        )}
                    </div>
                </div>
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message, index) => (
                    <div
                        key={message.id}
                        className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                        style={{
                            animation: `fadeInUp 0.3s ease-out ${index * 0.1}s both`,
                        }}
                    >
                        <div
                            className={`max-w-[90%] md:max-w-[80%] rounded-2xl px-4 py-3 ${message.role === "user"
                                ? "bg-blue-500 text-white rounded-br-md"
                                : "bg-slate-800 text-slate-100 rounded-bl-md border border-slate-700"
                                }`}
                        >
                            <p className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</p>
                            <p className={`text-[10px] mt-1 ${message.role === "user" ? "text-blue-200" : "text-slate-500"}`}>
                                {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </p>
                        </div>
                    </div>
                ))}

                {isLoading && (
                    <div className="flex justify-start">
                        <div className="bg-slate-800 rounded-2xl rounded-bl-md px-4 py-3 border border-slate-700">
                            <div className="flex gap-1">
                                <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
                                <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
                                <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
                            </div>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-slate-800 bg-slate-900/80 backdrop-blur-sm">
                <div className="flex gap-3">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyPress}
                        placeholder="Type your message..."
                        disabled={isLoading}
                        className="flex-1 px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all disabled:opacity-50"
                    />
                    <button
                        onClick={sendMessage}
                        disabled={!input.trim() || isLoading}
                        className="px-6 py-3 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Send
                    </button>
                </div>
                <p className="text-xs text-slate-600 text-center mt-2">
                    Powered by Gemini AI • ChidiyaAI helps you find verified suppliers
                </p>
            </div>

            <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
        </div>
    );
}

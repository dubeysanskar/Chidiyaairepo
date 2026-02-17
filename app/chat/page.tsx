"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import PreChatQuestionnaire from "@/app/components/chat/PreChatQuestionnaire";
import Link from "next/link";
import ChatInterface from "@/app/components/chat/ChatInterface";

interface UserRequirements {
    location: string;
    category: string;
    quantity: string;
    budget: string;
}

interface ChatSession {
    id: string;
    title: string;
    category?: string;
    location?: string;
    status: string;
    messageCount: number;
    createdAt: string;
    updatedAt: string;
}

export default function ChatPage() {
    const [showQuestionnaire, setShowQuestionnaire] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    useEffect(() => {
        // Open sidebar by default only on desktop
        if (typeof window !== 'undefined' && window.innerWidth >= 768) {
            setSidebarOpen(true);
        }
    }, []);
    const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
    const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [loadingHistory, setLoadingHistory] = useState(false);
    const [userRequirements, setUserRequirements] = useState<UserRequirements>({
        location: "",
        category: "",
        quantity: "",
        budget: "",
    });

    // Check if user is logged in and fetch chat history
    useEffect(() => {
        fetchChatHistory();
    }, []);

    const fetchChatHistory = async () => {
        try {
            setLoadingHistory(true);
            const res = await fetch("/api/buyer/chat-history");
            if (res.status === 401) {
                setIsLoggedIn(false);
                return;
            }
            const data = await res.json();
            if (data.success) {
                setIsLoggedIn(true);
                setChatSessions(data.sessions || []);
            }
        } catch {
            console.error("Failed to fetch chat history");
        } finally {
            setLoadingHistory(false);
        }
    };

    const handleQuestionnaireComplete = (requirements: UserRequirements) => {
        setUserRequirements(requirements);
        setShowQuestionnaire(false);
        setActiveSessionId(null); // New chat
    };

    const handleNewChat = () => {
        setShowQuestionnaire(true);
        setActiveSessionId(null);
        setUserRequirements({ location: "", category: "", quantity: "", budget: "" });
    };

    const handleLoadSession = async (sessionId: string) => {
        setActiveSessionId(sessionId);
        setShowQuestionnaire(false);
        // ChatInterface will load the session's messages
        // Close sidebar on mobile
        if (window.innerWidth < 768) {
            setSidebarOpen(false);
        }
    };

    const handleSessionCreated = useCallback((sessionId: string, title: string) => {
        // Add new session to the top of the list
        const newSession: ChatSession = {
            id: sessionId,
            title: title.substring(0, 30),
            status: "active",
            messageCount: 1,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        setChatSessions(prev => [newSession, ...prev]);
        setActiveSessionId(sessionId);
    }, []);

    // Group sessions by date
    const groupSessionsByDate = (sessions: ChatSession[]) => {
        const groups: Record<string, ChatSession[]> = {};
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const yesterday = new Date(today.getTime() - 86400000);
        const lastWeek = new Date(today.getTime() - 7 * 86400000);

        sessions.forEach(s => {
            const d = new Date(s.updatedAt);
            let key: string;
            if (d >= today) key = "Today";
            else if (d >= yesterday) key = "Yesterday";
            else if (d >= lastWeek) key = "Last 7 Days";
            else key = "Older";

            if (!groups[key]) groups[key] = [];
            groups[key].push(s);
        });

        return groups;
    };

    const groupedSessions = groupSessionsByDate(chatSessions);
    const groupOrder = ["Today", "Yesterday", "Last 7 Days", "Older"];

    return (
        <div className="min-h-screen bg-slate-950">
            {/* Background gradient */}
            <div className="fixed inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-transparent to-transparent"></div>
            </div>

            {/* Main layout */}
            <div className="relative z-10 h-screen flex overflow-hidden">
                {/* Mobile Sidebar Overlay */}
                {sidebarOpen && (
                    <div
                        className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm"
                        onClick={() => setSidebarOpen(false)}
                    ></div>
                )}

                {/* Sidebar */}
                <div
                    className={`${sidebarOpen ? "translate-x-0" : "-translate-x-full"
                        } md:translate-x-0 fixed md:relative z-50 h-full w-[280px] transition-transform duration-300 ease-in-out flex-shrink-0 bg-slate-900/95 backdrop-blur-xl border-r border-slate-800/60 flex flex-col overflow-hidden ${!sidebarOpen && "md:w-0 md:min-w-0 md:border-r-0"
                        }`}
                    style={{
                        width: 280,
                        // On desktop, we want to animate width if we want to support collapsing there too, 
                        // but for now let's keep the existing toggle behavior for desktop if that was the intent,
                        // or just use specific classes. 
                        // The previous code used width transition. Let's adapt.
                    }}
                >
                    {/* Sidebar Header */}
                    <div className="p-4 border-b border-slate-800/60 flex items-center justify-between">
                        <button
                            onClick={handleNewChat}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-slate-800/60 hover:bg-slate-700/60 border border-slate-700/50 rounded-xl text-white text-sm font-medium transition-all hover:border-slate-600"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            New Chat
                        </button>
                        <button
                            onClick={() => setSidebarOpen(false)}
                            className="md:hidden ml-2 p-2 text-slate-400 hover:text-white"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Session List */}
                    <div className="flex-1 overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
                        {loadingHistory ? (
                            <div className="flex items-center justify-center p-8">
                                <div className="w-5 h-5 border-2 border-slate-600 border-t-blue-400 rounded-full animate-spin"></div>
                            </div>
                        ) : !isLoggedIn ? (
                            <div className="p-4 text-center">
                                <p className="text-slate-500 text-xs mb-3">Sign in to save chat history</p>
                                <Link
                                    href="/auth/signin"
                                    className="text-blue-400 text-xs hover:underline"
                                >
                                    Sign In →
                                </Link>
                            </div>
                        ) : chatSessions.length === 0 ? (
                            <div className="p-4 text-center">
                                <p className="text-slate-500 text-xs">No chat history yet</p>
                            </div>
                        ) : (
                            groupOrder.map(group =>
                                groupedSessions[group] && groupedSessions[group].length > 0 && (
                                    <div key={group} className="mb-4">
                                        <p className="px-3 py-2 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                                            {group}
                                        </p>
                                        {groupedSessions[group].map(session => (
                                            <button
                                                key={session.id}
                                                onClick={() => handleLoadSession(session.id)}
                                                className={`w-full text-left px-3 py-2.5 rounded-lg mb-0.5 transition-all group ${activeSessionId === session.id
                                                    ? "bg-slate-700/60 text-white"
                                                    : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200"
                                                    }`}
                                            >
                                                <p className="text-sm truncate leading-snug">{session.title}</p>
                                                {session.category && (
                                                    <p className="text-[10px] mt-0.5 text-slate-500 truncate">
                                                        📦 {session.category}
                                                    </p>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                )
                            )
                        )}
                    </div>

                    {/* Sidebar Footer */}
                    <div className="p-3 border-t border-slate-800/60">
                        <Link
                            href="/"
                            className="flex items-center gap-2 px-3 py-2 text-slate-400 hover:text-white text-sm rounded-lg hover:bg-slate-800/60 transition-colors"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                            </svg>
                            Home
                        </Link>
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 flex flex-col min-w-0 h-full w-full">
                    {/* Top Nav */}
                    <nav className="flex items-center justify-between px-4 py-3 border-b border-slate-800/50 bg-slate-900/50 backdrop-blur-md sticky top-0 z-30">
                        <div className="flex items-center gap-3">
                            {/* Sidebar toggle */}
                            <button
                                onClick={() => setSidebarOpen(!sidebarOpen)}
                                className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800/60 transition-colors"
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            </button>
                            <Image
                                src="/assests/chidiyaailogo.png"
                                alt="ChidiyaAI"
                                width={130}
                                height={35}
                                style={{ height: "24px", width: "auto" }}
                                priority
                                className="md:h-[30px]"
                            />
                        </div>
                        <div className="flex items-center gap-3">
                            <Link
                                href="/"
                                className="hidden md:block text-sm text-slate-400 hover:text-white transition-colors"
                            >
                                Home
                            </Link>
                            <Link
                                href="/supplier"
                                className="text-xs md:text-sm text-slate-400 hover:text-white transition-colors"
                            >
                                For Suppliers
                            </Link>
                        </div>
                    </nav>

                    {/* Chat Area */}
                    <div className="flex-1 max-w-4xl mx-auto w-full">
                        {showQuestionnaire ? (
                            <div className="h-full flex items-center justify-center p-6">
                                <div className="text-center">
                                    <div className="w-24 h-24 mx-auto mb-6 rounded-2xl overflow-hidden animate-pulse">
                                        <Image
                                            src="/assests/chidiyaaiicon.png"
                                            alt="ChidiyaAI"
                                            width={96}
                                            height={96}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <h2 className="text-3xl font-bold text-white mb-3">
                                        Welcome to ChidiyaAI
                                    </h2>
                                    <p className="text-slate-400 max-w-md mx-auto">
                                        Let us help you find the perfect suppliers for your business.
                                        Answer a few quick questions to get started.
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="h-full border-x border-slate-800/50">
                                <ChatInterface
                                    userRequirements={userRequirements}
                                    sessionId={activeSessionId}
                                    onSessionCreated={handleSessionCreated}
                                    isLoggedIn={isLoggedIn}
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Show questionnaire modal */}
            {showQuestionnaire && (
                <PreChatQuestionnaire onComplete={handleQuestionnaireComplete} />
            )}
        </div>
    );
}

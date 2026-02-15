import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";

// GET — fetch all chat sessions for logged-in buyer
export async function GET() {
    try {
        const session = await getServerSession();
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
        }

        const buyer = await prisma.buyer.findUnique({
            where: { email: session.user.email },
        });

        if (!buyer) {
            return NextResponse.json({ sessions: [] });
        }

        const chatSessions = await prisma.chatSession.findMany({
            where: { buyerId: buyer.id },
            orderBy: { updatedAt: "desc" },
            select: {
                id: true,
                title: true,
                category: true,
                location: true,
                status: true,
                createdAt: true,
                updatedAt: true,
                _count: {
                    select: { messages: true },
                },
            },
        });

        // Format sessions with fallback titles
        const sessions = chatSessions.map(s => ({
            id: s.id,
            title: s.title || s.category || "New Chat",
            category: s.category,
            location: s.location,
            status: s.status,
            messageCount: s._count.messages,
            createdAt: s.createdAt,
            updatedAt: s.updatedAt,
        }));

        return NextResponse.json({ success: true, sessions });
    } catch (error) {
        console.error("Chat history fetch error:", error);
        return NextResponse.json(
            { error: "Failed to fetch chat history" },
            { status: 500 }
        );
    }
}

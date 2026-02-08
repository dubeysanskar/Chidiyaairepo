import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
    try {
        // Get session ID from query params
        const { searchParams } = new URL(request.url);
        const sessionId = searchParams.get("id");

        if (!sessionId) {
            return NextResponse.json({ success: false, error: "Session ID required" }, { status: 400 });
        }

        // Use NextAuth session (same as other buyer APIs)
        const session = await getServerSession();
        if (!session?.user?.email) {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }

        // Get buyer
        const buyer = await prisma.buyer.findUnique({
            where: { email: session.user.email }
        });

        if (!buyer) {
            return NextResponse.json({ success: false, error: "Buyer not found" }, { status: 404 });
        }

        // Get chat session with messages
        const chatSession = await prisma.chatSession.findFirst({
            where: {
                id: sessionId,
                buyerId: buyer.id
            },
            include: {
                messages: {
                    orderBy: { createdAt: "asc" }
                }
            }
        });

        if (!chatSession) {
            return NextResponse.json({ success: false, error: "Session not found" }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            session: {
                id: chatSession.id,
                location: chatSession.location,
                category: chatSession.category,
                quantity: chatSession.quantity,
                budget: chatSession.budget,
                status: chatSession.status,
                messages: chatSession.messages.map(msg => ({
                    role: msg.role,
                    content: msg.content,
                    createdAt: msg.createdAt.toISOString()
                }))
            }
        });
    } catch (error) {
        console.error("Error fetching session:", error);
        return NextResponse.json({ success: false, error: "Failed to fetch session" }, { status: 500 });
    }
}

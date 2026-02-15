import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";

// GET — fetch a specific session's messages
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession();
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const sessionId = searchParams.get("sessionId");

        if (!sessionId) {
            return NextResponse.json({ error: "Session ID required" }, { status: 400 });
        }

        const buyer = await prisma.buyer.findUnique({
            where: { email: session.user.email },
        });

        if (!buyer) {
            return NextResponse.json({ error: "Buyer not found" }, { status: 404 });
        }

        const chatSession = await prisma.chatSession.findFirst({
            where: { id: sessionId, buyerId: buyer.id },
            include: {
                messages: {
                    orderBy: { createdAt: "asc" },
                    select: {
                        id: true,
                        role: true,
                        content: true,
                        hasSuppliers: true,
                        supplierIds: true,
                        createdAt: true,
                    },
                },
            },
        });

        if (!chatSession) {
            return NextResponse.json({ error: "Session not found" }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            session: {
                id: chatSession.id,
                title: chatSession.title,
                location: chatSession.location,
                category: chatSession.category,
                quantity: chatSession.quantity,
                budget: chatSession.budget,
                status: chatSession.status,
                messages: chatSession.messages,
            },
        });
    } catch (error) {
        console.error("Fetch session error:", error);
        return NextResponse.json(
            { error: "Failed to fetch session" },
            { status: 500 }
        );
    }
}

// POST — create a new chat session
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession();
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
        }

        const body = await request.json();
        const { location, category, quantity, budget, title } = body;

        // Find or create buyer
        let buyer = await prisma.buyer.findUnique({
            where: { email: session.user.email },
        });

        if (!buyer) {
            buyer = await prisma.buyer.create({
                data: {
                    email: session.user.email,
                    name: session.user.name || "User",
                },
            });
        }

        // Create chat session with title
        const chatSession = await prisma.chatSession.create({
            data: {
                buyerId: buyer.id,
                title: title ? title.substring(0, 30) : null,
                location,
                category,
                quantity,
                budget,
                status: "active",
            },
        });

        // Update buyer inquiry count
        await prisma.buyer.update({
            where: { id: buyer.id },
            data: { inquiryCount: { increment: 1 } },
        });

        // Log activity
        await prisma.activityLog.create({
            data: {
                action: "chat_session_started",
                entityType: "chat_session",
                entityId: chatSession.id,
                message: `Buyer started search${category ? ` for ${category}` : ''}${location ? ` in ${location}` : ''}`,
            },
        });

        return NextResponse.json({
            success: true,
            sessionId: chatSession.id,
        });
    } catch (error) {
        console.error("Create chat session error:", error);
        return NextResponse.json(
            { error: "Failed to create chat session" },
            { status: 500 }
        );
    }
}

// PATCH — update chat session (status, title)
export async function PATCH(request: NextRequest) {
    try {
        const body = await request.json();
        const { sessionId, status, title } = body;

        if (!sessionId) {
            return NextResponse.json({ error: "Session ID required" }, { status: 400 });
        }

        const updateData: Record<string, unknown> = {};
        if (status) updateData.status = status;
        if (title) updateData.title = title.substring(0, 30);

        await prisma.chatSession.update({
            where: { id: sessionId },
            data: updateData,
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Update chat session error:", error);
        return NextResponse.json(
            { error: "Failed to update session" },
            { status: 500 }
        );
    }
}

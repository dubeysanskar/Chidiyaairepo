import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";

export const dynamic = "force-dynamic";

// GET: Fetch buyer's search history (chat sessions with messages)
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession();
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
        }

        const buyer = await prisma.buyer.findUnique({
            where: { email: session.user.email },
        });

        if (!buyer) {
            return NextResponse.json({ success: true, history: [] });
        }

        // Get chat sessions with their messages
        const chatSessions = await prisma.chatSession.findMany({
            where: { buyerId: buyer.id },
            orderBy: { createdAt: "desc" },
            include: {
                messages: {
                    where: { role: "user" },
                    orderBy: { createdAt: "asc" },
                    select: {
                        id: true,
                        content: true,
                        createdAt: true,
                    },
                },
            },
        });

        // Format history with all searches grouped per session
        const history = chatSessions.map((cs) => ({
            id: cs.id,
            location: cs.location,
            category: cs.category,
            quantity: cs.quantity,
            budget: cs.budget,
            status: cs.status,
            createdAt: cs.createdAt,
            searches: cs.messages.map((msg) => ({
                id: msg.id,
                query: msg.content.substring(0, 100),
                timestamp: msg.createdAt,
            })),
        }));

        return NextResponse.json({ success: true, history });
    } catch (error) {
        console.error("History fetch error:", error);
        return NextResponse.json(
            { error: "Failed to fetch history" },
            { status: 500 }
        );
    }
}

// DELETE: Delete chat sessions (single, multiple, or all)
export async function DELETE(request: NextRequest) {
    try {
        const session = await getServerSession();
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
        }

        const buyer = await prisma.buyer.findUnique({
            where: { email: session.user.email },
        });

        if (!buyer) {
            return NextResponse.json({ error: "Buyer not found" }, { status: 404 });
        }

        const { searchParams } = new URL(request.url);
        const ids = searchParams.get("ids");
        const deleteAll = searchParams.get("all") === "true";

        if (deleteAll) {
            // Delete all sessions for this buyer
            const result = await prisma.chatSession.deleteMany({
                where: { buyerId: buyer.id },
            });
            return NextResponse.json({
                success: true,
                deleted: result.count,
                message: "All history deleted",
            });
        }

        if (ids) {
            // Delete specific sessions
            const sessionIds = ids.split(",").map((id) => id.trim());

            // Verify sessions belong to this buyer before deleting
            const result = await prisma.chatSession.deleteMany({
                where: {
                    id: { in: sessionIds },
                    buyerId: buyer.id,
                },
            });

            return NextResponse.json({
                success: true,
                deleted: result.count,
                message: `${result.count} session(s) deleted`,
            });
        }

        return NextResponse.json(
            { error: "Specify 'ids' or 'all=true' to delete" },
            { status: 400 }
        );
    } catch (error) {
        console.error("History delete error:", error);
        return NextResponse.json(
            { error: "Failed to delete history" },
            { status: 500 }
        );
    }
}

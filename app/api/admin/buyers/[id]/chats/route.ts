import { NextResponse } from "next/server";
import { prisma } from "../../../../../../lib/prisma";

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: buyerId } = await params;

        const chatSessions = await prisma.chatSession.findMany({
            where: { buyerId },
            orderBy: { createdAt: "desc" },
            include: {
                messages: {
                    orderBy: { createdAt: "asc" }
                }
            }
        });

        return NextResponse.json({ chatSessions });
    } catch (error) {
        console.error("Fetch Buyer Chats Error:", error);
        return NextResponse.json({ error: "Failed to fetch chats" }, { status: 500 });
    }
}

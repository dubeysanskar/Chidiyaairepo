import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";

const DAILY_CONTACT_LIMIT = 5;

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { supplierId, buyerId, sessionId, category, quantity } = body;

        if (!supplierId) {
            return NextResponse.json({ error: "Supplier ID required" }, { status: 400 });
        }

        // Get buyer from session
        let finalBuyerId = buyerId;
        let buyerEmail: string | null = null;
        let buyerPhone: string | null = null;
        let buyerName: string | null = null;

        if (!finalBuyerId) {
            const session = await getServerSession();
            if (session?.user?.email) {
                const buyer = await prisma.buyer.findUnique({
                    where: { email: session.user.email },
                    select: { id: true, email: true, phone: true, name: true },
                });
                finalBuyerId = buyer?.id;
                buyerEmail = buyer?.email || null;
                buyerPhone = buyer?.phone || null;
                buyerName = buyer?.name || null;
            }
        } else {
            const buyer = await prisma.buyer.findUnique({
                where: { id: finalBuyerId },
                select: { email: true, phone: true, name: true },
            });
            buyerEmail = buyer?.email || null;
            buyerPhone = buyer?.phone || null;
            buyerName = buyer?.name || null;
        }

        // Check daily contact limit
        if (finalBuyerId) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const contactsToday = await prisma.supplierContactLog.count({
                where: {
                    buyerId: finalBuyerId,
                    viewedAt: { gte: today },
                },
            });

            if (contactsToday >= DAILY_CONTACT_LIMIT) {
                return NextResponse.json({
                    success: false,
                    limitExceeded: true,
                    message: "Daily contact limit reached (5 contacts per day)",
                    contactsUsed: contactsToday,
                    limit: DAILY_CONTACT_LIMIT,
                });
            }

            // Log the contact view
            await prisma.supplierContactLog.create({
                data: {
                    buyerId: finalBuyerId,
                    supplierId,
                    sessionId,
                },
            });

            // Auto-create inquiry for supplier dashboard
            // Check if inquiry already exists for this buyer+supplier combo
            const existingInquiry = await prisma.inquiry.findFirst({
                where: {
                    buyerId: finalBuyerId,
                    supplierId,
                    status: { in: ["new", "quoted"] },
                },
            });

            if (!existingInquiry) {
                // Get category from chat session if available
                let productCategory = category || "General Inquiry";
                if (sessionId && !category) {
                    const chatSession = await prisma.chatSession.findUnique({
                        where: { id: sessionId },
                        select: { category: true, title: true },
                    });
                    productCategory = chatSession?.category || chatSession?.title || "General Inquiry";
                }

                await prisma.inquiry.create({
                    data: {
                        buyerId: finalBuyerId,
                        supplierId,
                        product: productCategory,
                        quantity: quantity || "Contact for details",
                        description: `Buyer ${buyerName || buyerEmail || "Unknown"} contacted you about ${productCategory}. Email: ${buyerEmail || "N/A"}${buyerPhone ? `, Phone: ${buyerPhone}` : ""}`,
                        status: "new",
                    },
                });
            }

            // Log activity
            await prisma.activityLog.create({
                data: {
                    action: "supplier_contact_viewed",
                    entityType: "supplier",
                    entityId: supplierId,
                    message: `Buyer ${buyerName || "Unknown"} viewed contact for supplier`,
                },
            });
        }

        // Get supplier details
        const supplier = await prisma.supplier.findUnique({
            where: { id: supplierId },
            select: { phone: true, companyName: true, email: true },
        });

        return NextResponse.json({
            success: true,
            phone: supplier?.phone || "Contact not available",
            email: supplier?.email || null,
            companyName: supplier?.companyName,
        });
    } catch (error) {
        console.error("View contact error:", error);
        return NextResponse.json(
            { error: "Failed to get contact" },
            { status: 500 }
        );
    }
}


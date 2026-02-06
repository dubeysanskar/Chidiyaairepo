import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret-key";

export async function GET(req: Request) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("supplier_token")?.value;

        if (!token) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        let supplierId;
        try {
            const decoded = jwt.verify(token, JWT_SECRET) as any;
            supplierId = decoded.id;
        } catch (e) {
            return NextResponse.json({ error: "Invalid token" }, { status: 401 });
        }

        const supplier = await prisma.supplier.findUnique({
            where: { id: supplierId },
            include: {
                inquiries: true,
                quotes: true,
                documents: true,
                products: {
                    where: { isActive: true },
                    orderBy: { createdAt: "desc" },
                    include: {
                        categoryTemplate: true
                    }
                },
            }
        });

        if (!supplier) {
            return NextResponse.json({ error: "Supplier not found" }, { status: 404 });
        }

        // Check if supplier is approved
        if (supplier.status !== "approved") {
            return NextResponse.json({
                error: "Account not approved",
                status: supplier.status,
                redirect: "/supplier/pending"
            }, { status: 403 });
        }

        // Calculate aggregated stats
        const stats = {
            totalInquiries: supplier.inquiries.length,
            quotesSubmitted: supplier.quotes.length,
            acceptedDeals: supplier.quotes.filter((q: { status: string }) => q.status === "accepted").length,
            // Mock conversion rate logic
            conversionRate: supplier.quotes.length > 0
                ? Math.round((supplier.quotes.filter((q: { status: string }) => q.status === "accepted").length / supplier.quotes.length) * 100)
                : 0,
            profileViews: 120, // Mock for now
            leadAcceptRate: 75 // Mock
        };

        return NextResponse.json({
            supplier,
            stats,
            inquiries: supplier.inquiries, // Or filter active ones
            quotes: supplier.quotes,
            products: supplier.products || []
        });

    } catch (error) {
        console.error("Supplier Dashboard Error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

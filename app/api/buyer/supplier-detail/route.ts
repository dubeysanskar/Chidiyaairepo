import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";

// GET — fetch supplier details (excluding confidential info like GST)
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession();
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const supplierId = searchParams.get("id");

        if (!supplierId) {
            return NextResponse.json({ error: "Supplier ID required" }, { status: 400 });
        }

        const supplier = await prisma.supplier.findUnique({
            where: { id: supplierId },
            select: {
                id: true,
                companyName: true,
                city: true,
                state: true,
                productCategories: true,
                moq: true,
                badges: true,
                description: true,
                capacity: true,
                serviceLocations: true,
                website: true,
                profileImage: true,
                establishedYear: true,
                employeeCount: true,
                certifications: true,
                // Exclude: gstNumber, panNumber, password, email, phone (shown via contact log)
                products: {
                    select: {
                        id: true,
                        name: true,
                        description: true,
                        price: true,
                        priceUnit: true,
                        moq: true,
                    },
                    take: 20,
                },
            },
        });

        if (!supplier) {
            return NextResponse.json({ error: "Supplier not found" }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            supplier,
        });
    } catch (error) {
        console.error("Supplier detail error:", error);
        return NextResponse.json(
            { error: "Failed to fetch supplier details" },
            { status: 500 }
        );
    }
}

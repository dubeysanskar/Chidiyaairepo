import { NextResponse } from "next/server";
import { prisma } from "../../../../../../lib/prisma";

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: buyerId } = await params;

        const contacts = await prisma.supplierContactLog.findMany({
            where: { buyerId },
            orderBy: { viewedAt: "desc" },
            include: {
                buyer: {
                    select: { name: true }
                }
            }
        });

        // Fetch supplier details for each contact
        const contactsWithSuppliers = await Promise.all(
            contacts.map(async (contact) => {
                const supplier = await prisma.supplier.findUnique({
                    where: { id: contact.supplierId },
                    select: { companyName: true, email: true, phone: true }
                });
                return { ...contact, supplier };
            })
        );

        return NextResponse.json({ contacts: contactsWithSuppliers });
    } catch (error) {
        console.error("Fetch Buyer Contacts Error:", error);
        return NextResponse.json({ error: "Failed to fetch contacts" }, { status: 500 });
    }
}

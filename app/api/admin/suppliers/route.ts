import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { sendAdminActionEmail } from "../../../../lib/email";

export async function GET() {
    try {
        const suppliers = await prisma.supplier.findMany({
            orderBy: { createdAt: "desc" },
            include: {
                documents: true,
                products: true
            }
        });
        return NextResponse.json(suppliers);
    } catch (error) {
        console.error("Fetch Suppliers Error:", error);
        return NextResponse.json({ error: "Failed to fetch suppliers" }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        const { id, action, badges, suspensionDays } = await req.json();

        let updateData: any = {};
        let logMessage = "";
        let logAction = action;
        let emailAction: 'approved' | 'suspended' | 'blocked' | 'unblocked' | 'badge_added' | 'badge_removed' | null = null;
        let emailDetails: string | undefined;

        switch (action) {
            case "approve":
                updateData = { status: "approved", suspendedUntil: null };
                logMessage = "Approved supplier";
                emailAction = 'approved';
                break;

            case "reject":
                // Rollback - move back to pending
                updateData = { status: "pending", suspendedUntil: null };
                logMessage = "Rejected/Rolled back supplier to pending";
                logAction = "rollback";
                break;

            case "suspend":
                // Calculate suspension end date
                const days = suspensionDays || 7;
                const suspendedUntil = new Date();
                suspendedUntil.setDate(suspendedUntil.getDate() + days);

                updateData = {
                    status: "suspended",
                    suspendedUntil: suspendedUntil
                };
                logMessage = `Suspended supplier for ${days} days`;
                emailAction = 'suspended';
                emailDetails = `Your account has been suspended for ${days} days.`;
                break;

            case "ban":
                updateData = { status: "banned", suspendedUntil: null };
                logMessage = "Permanently banned supplier";
                emailAction = 'blocked';
                break;

            case "restore":
                updateData = { status: "approved", suspendedUntil: null };
                logMessage = "Restored supplier";
                emailAction = 'unblocked';
                break;

            case "update_badges":
                updateData = { badges: badges || [] };
                logMessage = `Updated badges: ${(badges || []).join(", ") || "none"}`;
                if (badges && badges.length > 0) {
                    emailAction = 'badge_added';
                    emailDetails = badges.join(", ");
                }
                break;

            default:
                return NextResponse.json({ error: "Invalid action" }, { status: 400 });
        }

        const supplier = await prisma.supplier.update({
            where: { id },
            data: updateData,
            include: {
                documents: true,
                products: true
            }
        });

        // Log activity
        await prisma.activityLog.create({
            data: {
                action: logAction,
                entityType: "supplier",
                entityId: id,
                message: `${logMessage}: ${supplier.companyName}`
            }
        });

        // Send email notification (non-blocking)
        if (emailAction && supplier.email) {
            sendAdminActionEmail(
                supplier.email,
                supplier.companyName,
                emailAction,
                'supplier',
                emailDetails
            ).catch(console.error);
        }

        return NextResponse.json(supplier);
    } catch (error) {
        console.error("Supplier Update Error:", error);
        return NextResponse.json({ error: "Failed to update supplier" }, { status: 500 });
    }
}


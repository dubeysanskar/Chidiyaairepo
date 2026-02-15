import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { sendAdminActionEmail, sendSupplierApprovedEmail } from "../../../../lib/email";

export async function GET() {
    try {
        const suppliers = await prisma.supplier.findMany({
            orderBy: { createdAt: "desc" },
            include: {
                documents: true,
                products: true,
                ratings: true,
                supplierCategories: {
                    include: {
                        categoryTemplate: {
                            select: { id: true, name: true, slug: true }
                        }
                    }
                }
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

        // Send approval confirmation email when supplier is approved
        if (action === "approve" && supplier.email) {
            sendSupplierApprovedEmail(supplier.email, supplier.companyName).catch(e =>
                console.error("Approval Email Error:", e)
            );
        }

        return NextResponse.json(supplier);
    } catch (error) {
        console.error("Supplier Update Error:", error);
        return NextResponse.json({ error: "Failed to update supplier" }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json({ error: "Supplier ID required" }, { status: 400 });
        }

        // Get supplier info before deletion for logging
        const supplier = await prisma.supplier.findUnique({
            where: { id },
            select: { companyName: true, email: true }
        });

        if (!supplier) {
            return NextResponse.json({ error: "Supplier not found" }, { status: 404 });
        }

        // Delete related records first, then the supplier
        await prisma.$transaction([
            prisma.supplierDocument.deleteMany({ where: { supplierId: id } }),
            prisma.product.deleteMany({ where: { supplierId: id } }),
            prisma.supplierRating.deleteMany({ where: { supplierId: id } }),
            prisma.supplierCategory.deleteMany({ where: { supplierId: id } }),
            prisma.trialExtensionRequest.deleteMany({ where: { supplierId: id } }),
            prisma.subscriptionPayment.deleteMany({ where: { supplierId: id } }),
            prisma.quote.deleteMany({ where: { supplierId: id } }),
            prisma.supplier.delete({ where: { id } }),
        ]);

        // Log the deletion
        await prisma.activityLog.create({
            data: {
                action: "delete",
                entityType: "supplier",
                entityId: id,
                message: `Permanently deleted supplier: ${supplier.companyName} (${supplier.email})`
            }
        });

        return NextResponse.json({ success: true, message: `Deleted ${supplier.companyName}` });
    } catch (error) {
        console.error("Supplier Delete Error:", error);
        return NextResponse.json({ error: "Failed to delete supplier" }, { status: 500 });
    }
}

// PATCH - Map a SupplierCategory to a CategoryTemplate
export async function PATCH(req: Request) {
    try {
        const { supplierCategoryId, categoryTemplateId, action: patchAction } = await req.json();

        if (!supplierCategoryId) {
            return NextResponse.json({ error: "supplierCategoryId is required" }, { status: 400 });
        }

        if (patchAction === "map" && categoryTemplateId) {
            // Map this supplier category to an existing template
            const updated = await prisma.supplierCategory.update({
                where: { id: supplierCategoryId },
                data: {
                    categoryTemplateId: categoryTemplateId,
                    status: "approved",
                    approvedAt: new Date(),
                },
                include: {
                    supplier: { select: { id: true, companyName: true } },
                    categoryTemplate: { select: { id: true, name: true } }
                }
            });

            // Log activity
            await prisma.activityLog.create({
                data: {
                    action: "map_supplier_category",
                    entityType: "supplierCategory",
                    entityId: supplierCategoryId,
                    message: `Mapped ${updated.supplier?.companyName}'s category "${updated.customName || 'custom'}" → template "${updated.categoryTemplate?.name}"`
                }
            });

            // Refetch full supplier data to return updated state
            const supplier = await prisma.supplier.findUnique({
                where: { id: updated.supplierId },
                include: {
                    documents: true,
                    products: true,
                    ratings: true,
                    supplierCategories: {
                        include: {
                            categoryTemplate: {
                                select: { id: true, name: true, slug: true }
                            }
                        }
                    }
                }
            });

            return NextResponse.json(supplier);
        }

        return NextResponse.json({ error: "Invalid patch action" }, { status: 400 });
    } catch (error) {
        console.error("Supplier Category Mapping Error:", error);
        return NextResponse.json({ error: "Failed to map category" }, { status: 500 });
    }
}

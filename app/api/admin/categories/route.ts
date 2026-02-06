import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";

export async function GET() {
    try {
        // Fetch categories with supplier counts
        const categories = await prisma.category.findMany({
            orderBy: { name: "asc" },
            include: {
                _count: {
                    select: { inquiries: true }
                }
            }
        });

        // Get supplier counts per category by checking productCategories
        const suppliers = await prisma.supplier.findMany({
            where: { status: "approved" },
            select: { productCategories: true }
        });

        // Count suppliers per category
        const categoryCounts: Record<string, number> = {};
        suppliers.forEach(supplier => {
            (supplier.productCategories || []).forEach(cat => {
                const normalizedCat = cat.toLowerCase().trim();
                categoryCounts[normalizedCat] = (categoryCounts[normalizedCat] || 0) + 1;
            });
        });

        // Transform categories
        const transformedCategories = categories.map(cat => ({
            id: cat.id,
            name: cat.name,
            slug: cat.slug,
            description: cat.description,
            isActive: cat.isActive,
            supplierCount: categoryCounts[cat.name.toLowerCase()] || 0,
            inquiryCount: cat._count.inquiries
        }));

        // Also get unique categories from suppliers that might not be in Category table
        const allSupplierCategories = new Set<string>();
        suppliers.forEach(s => s.productCategories?.forEach(c => allSupplierCategories.add(c)));

        // Fetch Supplier Category Requests (NEW - for admin approval)
        const supplierCategoryRequests = await prisma.supplierCategory.findMany({
            orderBy: { createdAt: "desc" },
            include: {
                supplier: {
                    select: { id: true, companyName: true, email: true }
                },
                categoryTemplate: {
                    select: { id: true, name: true }
                }
            }
        });

        // Fetch Category Templates (NEW - for managing templates)
        const categoryTemplates = await prisma.categoryTemplate.findMany({
            orderBy: { name: "asc" },
            include: {
                _count: {
                    select: { supplierCategories: true, products: true }
                }
            }
        });

        // Transform templates
        const transformedTemplates = categoryTemplates.map(t => ({
            id: t.id,
            name: t.name,
            description: t.description,
            specifications: t.specifications,
            supplierCount: t._count.supplierCategories,
            productCount: t._count.products,
            createdAt: t.createdAt
        }));

        // Transform supplier category requests
        const transformedRequests = supplierCategoryRequests.map(req => ({
            id: req.id,
            supplierId: req.supplierId,
            supplierName: req.supplier?.companyName || "Unknown",
            supplierEmail: req.supplier?.email || "",
            categoryTemplateId: req.categoryTemplateId,
            categoryTemplateName: req.categoryTemplate?.name || null,
            customName: req.customName,
            status: req.status,
            createdAt: req.createdAt
        }));

        return NextResponse.json({
            categories: transformedCategories,
            supplierCategories: Array.from(allSupplierCategories),
            totalSuppliers: suppliers.length,
            supplierCategoryRequests: transformedRequests,
            categoryTemplates: transformedTemplates,
            pendingRequestsCount: transformedRequests.filter(r => r.status === "pending").length
        });
    } catch (error) {
        console.error("Fetch Categories Error:", error);
        return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const { name, description } = await req.json();

        const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-");

        const category = await prisma.category.create({
            data: { name, slug, description, isActive: true }
        });

        // Log activity
        await prisma.activityLog.create({
            data: {
                action: "create_category",
                entityType: "category",
                entityId: category.id,
                message: `Created category: ${name}`
            }
        });

        return NextResponse.json(category);
    } catch (error) {
        console.error("Create Category Error:", error);
        return NextResponse.json({ error: "Failed to create category" }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        const { id, name, description, isActive } = await req.json();

        const updateData: any = {};
        if (name !== undefined) {
            updateData.name = name;
            updateData.slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
        }
        if (description !== undefined) updateData.description = description;
        if (isActive !== undefined) updateData.isActive = isActive;

        const category = await prisma.category.update({
            where: { id },
            data: updateData
        });

        // Log activity
        await prisma.activityLog.create({
            data: {
                action: "update_category",
                entityType: "category",
                entityId: category.id,
                message: `Updated category: ${category.name}`
            }
        });

        return NextResponse.json(category);
    } catch (error) {
        console.error("Update Category Error:", error);
        return NextResponse.json({ error: "Failed to update category" }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json({ error: "Category ID required" }, { status: 400 });
        }

        const category = await prisma.category.delete({
            where: { id }
        });

        // Log activity
        await prisma.activityLog.create({
            data: {
                action: "delete_category",
                entityType: "category",
                entityId: id,
                message: `Deleted category: ${category.name}`
            }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Delete Category Error:", error);
        return NextResponse.json({ error: "Failed to delete category" }, { status: 500 });
    }
}

// PATCH - Approve/Reject Supplier Category Requests
export async function PATCH(req: Request) {
    try {
        const { requestId, action, message } = await req.json();

        if (!requestId || !action) {
            return NextResponse.json({ error: "Request ID and action required" }, { status: 400 });
        }

        if (!["approve", "reject"].includes(action)) {
            return NextResponse.json({ error: "Invalid action. Use 'approve' or 'reject'" }, { status: 400 });
        }

        const newStatus = action === "approve" ? "approved" : "rejected";

        const updatedRequest = await prisma.supplierCategory.update({
            where: { id: requestId },
            data: {
                status: newStatus,
                approvedAt: action === "approve" ? new Date() : undefined
            },
            include: {
                supplier: { select: { id: true, companyName: true, email: true } },
                categoryTemplate: { select: { name: true } }
            }
        });

        const categoryName = updatedRequest.categoryTemplate?.name || updatedRequest.customName;

        // Log activity
        await prisma.activityLog.create({
            data: {
                action: `${action}_supplier_category`,
                entityType: "supplierCategory",
                entityId: requestId,
                message: `${action === "approve" ? "Approved" : "Rejected"} category request from ${updatedRequest.supplier?.companyName}: ${categoryName}`
            }
        });

        // Create notification for supplier
        if (updatedRequest.supplier?.id) {
            try {
                await prisma.notification.create({
                    data: {
                        userId: updatedRequest.supplier.id,
                        title: action === "approve"
                            ? `Category Approved: ${categoryName}`
                            : `Category Request Rejected`,
                        message: action === "approve"
                            ? `Your category request for "${categoryName}" has been approved! You can now add products under this category.`
                            : `Your category request for "${categoryName}" was rejected. ${message || "Please contact support for more details."}`,
                        type: action === "approve" ? "success" : "warning",
                        link: "/supplier/dashboard?tab=products"
                    }
                });
            } catch (notifError) {
                console.error("Failed to create notification:", notifError);
                // Continue even if notification fails
            }
        }

        return NextResponse.json({
            success: true,
            message: `Category request ${newStatus}`,
            request: updatedRequest
        });
    } catch (error) {
        console.error("Approve/Reject Category Error:", error);
        return NextResponse.json({ error: "Failed to update category request" }, { status: 500 });
    }
}

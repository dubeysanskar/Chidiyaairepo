import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret-key";

// Helper to get supplier ID from token
async function getSupplierId(): Promise<string | null> {
    const cookieStore = await cookies();
    const token = cookieStore.get("supplier_token")?.value;
    if (!token) return null;

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as { id: string; type: string };
        if (decoded.type !== "supplier") return null;
        return decoded.id;
    } catch {
        return null;
    }
}

// GET - Fetch supplier's categories
export async function GET(request: NextRequest) {
    try {
        const supplierId = await getSupplierId();
        if (!supplierId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const categories = await prisma.supplierCategory.findMany({
            where: { supplierId },
            include: {
                categoryTemplate: {
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                        description: true,
                        specifications: true
                    }
                },
                _count: {
                    select: { products: true }
                }
            },
            orderBy: [
                { isPrimary: 'desc' },
                { createdAt: 'desc' }
            ]
        });

        return NextResponse.json({
            categories,
            count: categories.length
        });
    } catch (error) {
        console.error("Error fetching supplier categories:", error);
        return NextResponse.json(
            { error: "Failed to fetch categories" },
            { status: 500 }
        );
    }
}

// POST - Request new category
export async function POST(request: NextRequest) {
    try {
        const supplierId = await getSupplierId();
        if (!supplierId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { categoryTemplateId, customCategoryName, customName, customDescription, customImage, description } = await request.json();

        // Check if supplier already has this category
        if (categoryTemplateId) {
            const existing = await prisma.supplierCategory.findFirst({
                where: {
                    supplierId,
                    categoryTemplateId
                }
            });

            if (existing) {
                return NextResponse.json(
                    { error: "You already have this category" },
                    { status: 400 }
                );
            }
        }

        // Create the category with pending status (needs admin approval)
        const newCategory = await prisma.supplierCategory.create({
            data: {
                supplierId,
                categoryTemplateId: categoryTemplateId || null,
                customName: customCategoryName || customName || null,
                customDescription: description || customDescription || null,
                customImage: customImage || null,
                status: "pending", // Needs admin approval
                isPrimary: false
            },
            include: {
                categoryTemplate: {
                    select: {
                        id: true,
                        name: true,
                        description: true
                    }
                }
            }
        });

        return NextResponse.json({
            success: true,
            category: newCategory,
            message: "Category request submitted for admin approval"
        });
    } catch (error) {
        console.error("Error creating supplier category:", error);
        return NextResponse.json(
            { error: "Failed to create category" },
            { status: 500 }
        );
    }
}

// DELETE - Remove a category
export async function DELETE(request: NextRequest) {
    try {
        const supplierId = await getSupplierId();
        if (!supplierId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const categoryId = searchParams.get("id");

        if (!categoryId) {
            return NextResponse.json({ error: "Category ID required" }, { status: 400 });
        }

        // Verify ownership
        const category = await prisma.supplierCategory.findFirst({
            where: {
                id: categoryId,
                supplierId
            }
        });

        if (!category) {
            return NextResponse.json({ error: "Category not found" }, { status: 404 });
        }

        if (category.isPrimary) {
            return NextResponse.json(
                { error: "Cannot delete primary category" },
                { status: 400 }
            );
        }

        await prisma.supplierCategory.delete({
            where: { id: categoryId }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting supplier category:", error);
        return NextResponse.json(
            { error: "Failed to delete category" },
            { status: 500 }
        );
    }
}

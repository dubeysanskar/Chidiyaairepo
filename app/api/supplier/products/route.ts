import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "../../../../lib/prisma";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// Helper to get supplier from token
async function getSupplierFromToken(request: NextRequest) {
    const cookieStore = await cookies();
    const token = cookieStore.get("supplier_token")?.value;

    if (!token) {
        return null;
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
        return decoded.id;
    } catch {
        return null;
    }
}

// GET - List all products for a supplier
export async function GET(request: NextRequest) {
    try {
        const supplierId = await getSupplierFromToken(request);

        if (!supplierId) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(request.url);
        const categoryId = searchParams.get("categoryId");

        const where: any = {
            supplierId,
            isActive: true
        };

        if (categoryId) {
            where.supplierCategoryId = categoryId;
        }

        const products = await prisma.product.findMany({
            where,
            include: {
                supplierCategory: {
                    include: {
                        categoryTemplate: {
                            select: {
                                name: true,
                                slug: true
                            }
                        }
                    }
                }
            },
            orderBy: {
                createdAt: "desc"
            }
        });

        return NextResponse.json({
            success: true,
            products,
            count: products.length
        });
    } catch (error) {
        console.error("Failed to fetch products:", error);
        return NextResponse.json(
            { error: "Failed to fetch products" },
            { status: 500 }
        );
    }
}

// POST - Create a new product (supports FormData for images)
export async function POST(request: NextRequest) {
    try {
        const supplierId = await getSupplierFromToken(request);

        if (!supplierId) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        // Check content type for FormData vs JSON
        const contentType = request.headers.get("content-type") || "";

        let name: string, description: string | null, price: number | null;
        let priceUnit: string | null, supplierCategoryId: string | null;
        let categoryTemplateId: string | null, specifications: any;
        let images: string[] = [];
        let category: string | null, priceRange: string | null;
        let moq: string | null, leadTime: string | null;

        if (contentType.includes("multipart/form-data")) {
            // Handle FormData (from new Add Product page)
            const formData = await request.formData();

            name = formData.get("name") as string;
            description = formData.get("description") as string || null;
            price = parseFloat(formData.get("price") as string) || null;
            priceUnit = formData.get("priceUnit") as string || null;
            supplierCategoryId = formData.get("supplierCategoryId") as string || null;
            categoryTemplateId = formData.get("categoryTemplateId") as string || null;

            const specificationsStr = formData.get("specifications") as string;
            try {
                specifications = JSON.parse(specificationsStr || "{}");
            } catch {
                specifications = {};
            }

            // Handle image uploads (placeholder - need cloud storage in production)
            for (let i = 0; i < 5; i++) {
                const file = formData.get(`image_${i}`) as File | null;
                if (file && file.size > 0) {
                    images.push(`/uploads/${Date.now()}_${file.name}`);
                }
            }

            // Legacy fields
            category = null;
            priceRange = null;
            moq = null;
            leadTime = null;
        } else {
            // Handle JSON (legacy endpoint)
            const body = await request.json();
            name = body.name;
            category = body.category || null;
            description = body.description || null;
            priceRange = body.priceRange || null;
            moq = body.moq || null;
            leadTime = body.leadTime || null;
            images = body.images || [];

            // New fields from JSON
            // Parse price - extract number from string (handles "₹25", "25-50", "Rs.100", etc.)
            const priceStr = body.price?.toString() || "";
            const priceMatch = priceStr.replace(/[₹Rs.,\s]/gi, "").match(/[\d.]+/);
            price = priceMatch ? parseFloat(priceMatch[0]) : null;
            priceUnit = body.priceUnit || null;
            supplierCategoryId = body.supplierCategoryId || null;
            categoryTemplateId = body.categoryTemplateId || null;
            specifications = body.specifications || {};
        }

        if (!name) {
            return NextResponse.json(
                { error: "Product name is required" },
                { status: 400 }
            );
        }

        // Verify category ownership if specified
        if (supplierCategoryId) {
            const catCheck = await prisma.supplierCategory.findFirst({
                where: { id: supplierCategoryId, supplierId }
            });

            if (!catCheck) {
                return NextResponse.json(
                    { error: "Category not found" },
                    { status: 404 }
                );
            }

            if (catCheck.status !== "approved") {
                return NextResponse.json(
                    { error: "Category is not approved yet" },
                    { status: 400 }
                );
            }
        }

        const product = await prisma.product.create({
            data: {
                supplierId,
                supplierCategoryId,
                categoryTemplateId,
                name,
                description,
                price,
                priceUnit,
                images,
                specifications,
                // Legacy fields
                category,
                priceRange,
                moq,
                leadTime,
                isActive: true
            },
            include: {
                supplierCategory: {
                    include: {
                        categoryTemplate: {
                            select: { name: true }
                        }
                    }
                }
            }
        });

        return NextResponse.json({
            success: true,
            product
        });
    } catch (error: any) {
        console.error("Failed to create product:", error);
        return NextResponse.json(
            { error: error?.message || "Failed to create product. Please check all required fields." },
            { status: 500 }
        );
    }
}

// PUT - Update a product
export async function PUT(request: NextRequest) {
    try {
        const supplierId = await getSupplierFromToken(request);

        if (!supplierId) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { id, name, category, description, priceRange, moq, leadTime, images, isActive, price, priceUnit, specifications } = body;

        if (!id) {
            return NextResponse.json(
                { error: "Product ID is required" },
                { status: 400 }
            );
        }

        // Verify ownership
        const existingProduct = await prisma.product.findFirst({
            where: { id, supplierId }
        });

        if (!existingProduct) {
            return NextResponse.json(
                { error: "Product not found" },
                { status: 404 }
            );
        }

        const product = await prisma.product.update({
            where: { id },
            data: {
                name: name !== undefined ? name : existingProduct.name,
                category: category !== undefined ? category : existingProduct.category,
                description: description !== undefined ? description : existingProduct.description,
                priceRange: priceRange !== undefined ? priceRange : existingProduct.priceRange,
                moq: moq !== undefined ? moq : existingProduct.moq,
                leadTime: leadTime !== undefined ? leadTime : existingProduct.leadTime,
                images: images !== undefined ? images : existingProduct.images,
                isActive: isActive !== undefined ? isActive : existingProduct.isActive,
                price: price !== undefined ? price : existingProduct.price,
                priceUnit: priceUnit !== undefined ? priceUnit : existingProduct.priceUnit,
                specifications: specifications !== undefined ? specifications : existingProduct.specifications
            }
        });

        return NextResponse.json({
            success: true,
            product
        });
    } catch (error) {
        console.error("Failed to update product:", error);
        return NextResponse.json(
            { error: "Failed to update product" },
            { status: 500 }
        );
    }
}

// DELETE - Delete a product (soft delete)
export async function DELETE(request: NextRequest) {
    try {
        const supplierId = await getSupplierFromToken(request);

        if (!supplierId) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json(
                { error: "Product ID is required" },
                { status: 400 }
            );
        }

        // Verify ownership
        const existingProduct = await prisma.product.findFirst({
            where: { id, supplierId }
        });

        if (!existingProduct) {
            return NextResponse.json(
                { error: "Product not found" },
                { status: 404 }
            );
        }

        // Soft delete
        await prisma.product.update({
            where: { id },
            data: { isActive: false }
        });

        return NextResponse.json({
            success: true,
            message: "Product deleted"
        });
    } catch (error) {
        console.error("Failed to delete product:", error);
        return NextResponse.json(
            { error: "Failed to delete product" },
            { status: 500 }
        );
    }
}

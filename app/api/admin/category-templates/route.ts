import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { existsSync } from "fs";

// GET - Fetch all category templates
export async function GET() {
    try {
        const templates = await prisma.categoryTemplate.findMany({
            orderBy: { name: "asc" },
            include: {
                _count: {
                    select: { supplierCategories: true, products: true }
                }
            }
        });

        return NextResponse.json({
            templates: templates.map(t => ({
                id: t.id,
                name: t.name,
                description: t.description,
                image: t.image,
                specifications: t.specifications,
                commonNames: t.commonNames,
                supplierCount: t._count.supplierCategories,
                productCount: t._count.products,
                createdAt: t.createdAt
            }))
        });
    } catch (error) {
        console.error("Fetch Category Templates Error:", error);
        return NextResponse.json({ error: "Failed to fetch templates" }, { status: 500 });
    }
}

// POST - Create new category template
export async function POST(req: Request) {
    try {
        const formData = await req.formData();
        const name = formData.get("name") as string;
        const description = formData.get("description") as string || "";
        const commonNamesStr = formData.get("commonNames") as string || "";
        const specificationsStr = formData.get("specifications") as string || "[]";
        const imageFile = formData.get("image") as File | null;

        if (!name) {
            return NextResponse.json({ error: "Category name is required" }, { status: 400 });
        }

        // Parse specifications
        let specifications = [];
        try {
            specifications = JSON.parse(specificationsStr);
        } catch (e) {
            console.error("Failed to parse specifications:", e);
        }

        // Parse common names (comma separated)
        const commonNames = commonNamesStr
            .split(",")
            .map(n => n.trim())
            .filter(n => n.length > 0);

        // Handle image upload
        let imagePath = null;
        if (imageFile && imageFile.size > 0) {
            const bytes = await imageFile.arrayBuffer();
            const buffer = Buffer.from(bytes);

            // Create uploads directory if it doesn't exist
            const uploadsDir = path.join(process.cwd(), "public", "uploads", "category-templates");
            if (!existsSync(uploadsDir)) {
                await mkdir(uploadsDir, { recursive: true });
            }

            // Generate unique filename
            const ext = imageFile.name.split(".").pop();
            const fileName = `${Date.now()}-${name.toLowerCase().replace(/[^a-z0-9]/g, "-")}.${ext}`;
            const filePath = path.join(uploadsDir, fileName);

            await writeFile(filePath, buffer);
            imagePath = `/uploads/category-templates/${fileName}`;
        }

        const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-");

        const template = await prisma.categoryTemplate.create({
            data: {
                name,
                slug,
                description,
                image: imagePath,
                specifications,
                commonNames
            }
        });

        // Log activity
        await prisma.activityLog.create({
            data: {
                action: "create_category_template",
                entityType: "categoryTemplate",
                entityId: template.id,
                message: `Created category template: ${name}`
            }
        });

        return NextResponse.json({ success: true, template });
    } catch (error) {
        console.error("Create Category Template Error:", error);
        return NextResponse.json({ error: "Failed to create template" }, { status: 500 });
    }
}

// PUT - Update category template
export async function PUT(req: Request) {
    try {
        const formData = await req.formData();
        const id = formData.get("id") as string;
        const name = formData.get("name") as string;
        const description = formData.get("description") as string || "";
        const commonNamesStr = formData.get("commonNames") as string || "";
        const specificationsStr = formData.get("specifications") as string || "[]";
        const imageFile = formData.get("image") as File | null;

        if (!id || !name) {
            return NextResponse.json({ error: "Template ID and name are required" }, { status: 400 });
        }

        // Parse specifications
        let specifications = [];
        try {
            specifications = JSON.parse(specificationsStr);
        } catch (e) {
            console.error("Failed to parse specifications:", e);
        }

        // Parse common names (comma separated)
        const commonNames = commonNamesStr
            .split(",")
            .map(n => n.trim())
            .filter(n => n.length > 0);

        // Prepare update data
        const updateData: any = {
            name,
            slug: name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
            description,
            specifications,
            commonNames
        };

        // Handle image upload
        if (imageFile && imageFile.size > 0) {
            const bytes = await imageFile.arrayBuffer();
            const buffer = Buffer.from(bytes);

            // Create uploads directory if it doesn't exist
            const uploadsDir = path.join(process.cwd(), "public", "uploads", "category-templates");
            if (!existsSync(uploadsDir)) {
                await mkdir(uploadsDir, { recursive: true });
            }

            // Generate unique filename
            const ext = imageFile.name.split(".").pop();
            const fileName = `${Date.now()}-${name.toLowerCase().replace(/[^a-z0-9]/g, "-")}.${ext}`;
            const filePath = path.join(uploadsDir, fileName);

            await writeFile(filePath, buffer);
            updateData.image = `/uploads/category-templates/${fileName}`;
        }

        const template = await prisma.categoryTemplate.update({
            where: { id },
            data: updateData
        });

        // Log activity
        await prisma.activityLog.create({
            data: {
                action: "update_category_template",
                entityType: "categoryTemplate",
                entityId: template.id,
                message: `Updated category template: ${name}`
            }
        });

        return NextResponse.json({ success: true, template });
    } catch (error) {
        console.error("Update Category Template Error:", error);
        return NextResponse.json({ error: "Failed to update template" }, { status: 500 });
    }
}

// DELETE - Delete category template
export async function DELETE(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json({ error: "Template ID required" }, { status: 400 });
        }

        const template = await prisma.categoryTemplate.delete({
            where: { id }
        });

        // Log activity
        await prisma.activityLog.create({
            data: {
                action: "delete_category_template",
                entityType: "categoryTemplate",
                entityId: id,
                message: `Deleted category template: ${template.name}`
            }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Delete Category Template Error:", error);
        return NextResponse.json({ error: "Failed to delete template" }, { status: 500 });
    }
}

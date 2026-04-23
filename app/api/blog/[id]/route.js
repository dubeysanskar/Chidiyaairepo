import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/blog/[id] — get single blog by ID or slug
export async function GET(request, { params }) {
    try {
        const { id } = await params;
        const blog = await prisma.blog.findFirst({
            where: { OR: [{ id }, { slug: id }] },
            include: { media: { orderBy: { sortOrder: "asc" } } },
        });
        if (!blog) return NextResponse.json({ error: "Not found" }, { status: 404 });
        return NextResponse.json(blog);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch blog" }, { status: 500 });
    }
}

// PUT /api/blog/[id] — update blog (admin only)
export async function PUT(request, { params }) {
    try {
        const adminKey = request.headers.get("x-admin-key");
        if (adminKey !== process.env.ADMIN_SECRET) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        const body = await request.json();
        const { media, ...blogData } = body;

        // Update blog fields
        const blog = await prisma.blog.update({
            where: { id },
            data: blogData,
        });

        // If media provided, replace all media
        if (media !== undefined) {
            await prisma.blogMedia.deleteMany({ where: { blogId: id } });
            if (media.length > 0) {
                await prisma.blogMedia.createMany({
                    data: media.map((m, i) => ({
                        blogId: id,
                        mediaUrl: m.mediaUrl,
                        mediaType: m.mediaType || "image",
                        sortOrder: i,
                        altText: m.altText || null,
                    })),
                });
            }
        }

        const updated = await prisma.blog.findUnique({
            where: { id },
            include: { media: { orderBy: { sortOrder: "asc" } } },
        });

        return NextResponse.json(updated);
    } catch (error) {
        return NextResponse.json({ error: "Failed to update blog" }, { status: 500 });
    }
}

// DELETE /api/blog/[id] — delete blog (admin only)
export async function DELETE(request, { params }) {
    try {
        const adminKey = request.headers.get("x-admin-key");
        if (adminKey !== process.env.ADMIN_SECRET) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        await prisma.blog.delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "Failed to delete blog" }, { status: 500 });
    }
}

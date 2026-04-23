import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/blog — list blogs (optionally filter by published)
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const publishedOnly = searchParams.get("published") === "true";

        const blogs = await prisma.blog.findMany({
            where: publishedOnly ? { published: true } : undefined,
            include: { media: { orderBy: { sortOrder: "asc" } } },
            orderBy: { createdAt: "desc" },
        });
        return NextResponse.json(blogs);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch blogs" }, { status: 500 });
    }
}

// POST /api/blog — create a blog (admin only)
export async function POST(request) {
    try {
        const adminKey = request.headers.get("x-admin-key");
        if (adminKey !== process.env.ADMIN_SECRET) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { media, ...blogData } = body;

        if (!blogData.title || !blogData.slug || !blogData.content) {
            return NextResponse.json({ error: "Title, slug, and content are required" }, { status: 400 });
        }

        // Check slug uniqueness
        const existing = await prisma.blog.findUnique({ where: { slug: blogData.slug } });
        if (existing) {
            return NextResponse.json({ error: "Slug already exists" }, { status: 409 });
        }

        const blog = await prisma.blog.create({
            data: {
                ...blogData,
                media: media?.length ? {
                    create: media.map((m, i) => ({
                        mediaUrl: m.mediaUrl,
                        mediaType: m.mediaType || "image",
                        sortOrder: i,
                        altText: m.altText || null,
                    })),
                } : undefined,
            },
            include: { media: true },
        });

        return NextResponse.json(blog, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: "Failed to create blog" }, { status: 500 });
    }
}

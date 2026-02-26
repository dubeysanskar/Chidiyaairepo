import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { existsSync } from "fs";
import path from "path";

// Serve uploaded files dynamically (fixes 404 in production)
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ path: string[] }> }
) {
    try {
        const { path: pathSegments } = await params;
        const filePath = path.join(process.cwd(), "public", "uploads", ...pathSegments);

        // Security: prevent directory traversal
        const normalizedPath = path.normalize(filePath);
        const uploadsDir = path.join(process.cwd(), "public", "uploads");
        if (!normalizedPath.startsWith(uploadsDir)) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        if (!existsSync(normalizedPath)) {
            return NextResponse.json({ error: "File not found" }, { status: 404 });
        }

        const fileBuffer = await readFile(normalizedPath);
        const ext = path.extname(normalizedPath).toLowerCase();

        const mimeTypes: Record<string, string> = {
            ".jpg": "image/jpeg",
            ".jpeg": "image/jpeg",
            ".png": "image/png",
            ".gif": "image/gif",
            ".webp": "image/webp",
            ".pdf": "application/pdf",
            ".svg": "image/svg+xml",
        };

        const contentType = mimeTypes[ext] || "application/octet-stream";

        return new NextResponse(fileBuffer, {
            headers: {
                "Content-Type": contentType,
                "Cache-Control": "public, max-age=31536000, immutable",
            },
        });
    } catch (error) {
        console.error("File serve error:", error);
        return NextResponse.json({ error: "Failed to serve file" }, { status: 500 });
    }
}

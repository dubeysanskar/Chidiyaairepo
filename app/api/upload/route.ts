import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";

// Define the upload directory - will be in public/uploads
const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get("file") as File | null;
        const type = formData.get("type") as string || "general"; // product, profile, general

        console.log(`[Upload API] Received upload request. Type: ${type}`);

        if (!file) {
            console.error("[Upload API] No file provided");
            return NextResponse.json(
                { error: "No file provided" },
                { status: 400 }
            );
        }

        console.log(`[Upload API] File details: Name=${file.name}, Type=${file.type}, Size=${file.size}`);

        // Validate file type
        const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif", "application/pdf"];
        if (!allowedTypes.includes(file.type)) {
            return NextResponse.json(
                { error: "Invalid file type. Only JPG, PNG, WebP, GIF, and PDF are allowed." },
                { status: 400 }
            );
        }

        // Validate file size (max 15MB)
        const maxSize = 15 * 1024 * 1024; // 15MB
        if (file.size > maxSize) {
            return NextResponse.json(
                { error: "File too large. Maximum size is 15MB." },
                { status: 400 }
            );
        }

        // Create upload directory if it doesn't exist
        const typeDir = path.join(UPLOAD_DIR, type);
        if (!existsSync(typeDir)) {
            await mkdir(typeDir, { recursive: true });
        }

        // Generate unique filename
        const ext = path.extname(file.name) || ".jpg";
        const uniqueName = `${uuidv4()}${ext}`;
        const filePath = path.join(typeDir, uniqueName);

        // Convert file to buffer and save
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        await writeFile(filePath, buffer);

        // Return the public URL — use API route for reliable serving in production
        const publicUrl = `/api/uploads/${type}/${uniqueName}`;

        return NextResponse.json({
            success: true,
            url: publicUrl,
            filename: uniqueName,
            originalName: file.name,
            size: file.size,
            type: file.type
        });

    } catch (error) {
        console.error("Upload error:", error);
        return NextResponse.json(
            { error: "Failed to upload file" },
            { status: 500 }
        );
    }
}

// Handle multiple file uploads
export async function PUT(request: NextRequest) {
    try {
        const formData = await request.formData();
        const files = formData.getAll("files") as File[];
        const type = formData.get("type") as string || "general";

        if (!files || files.length === 0) {
            return NextResponse.json(
                { error: "No files provided" },
                { status: 400 }
            );
        }

        // Create upload directory if it doesn't exist
        const typeDir = path.join(UPLOAD_DIR, type);
        if (!existsSync(typeDir)) {
            await mkdir(typeDir, { recursive: true });
        }

        const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif", "application/pdf"];
        const maxSize = 15 * 1024 * 1024;
        const uploadedFiles = [];
        const errors = [];

        for (const file of files) {
            // Validate file type
            if (!allowedTypes.includes(file.type)) {
                errors.push({ name: file.name, error: "Invalid file type" });
                continue;
            }

            // Validate file size
            if (file.size > maxSize) {
                errors.push({ name: file.name, error: "File too large" });
                continue;
            }

            try {
                const ext = path.extname(file.name) || ".jpg";
                const uniqueName = `${uuidv4()}${ext}`;
                const filePath = path.join(typeDir, uniqueName);

                const bytes = await file.arrayBuffer();
                const buffer = Buffer.from(bytes);
                await writeFile(filePath, buffer);

                uploadedFiles.push({
                    url: `/uploads/${type}/${uniqueName}`,
                    filename: uniqueName,
                    originalName: file.name,
                    size: file.size,
                    type: file.type
                });
            } catch (err) {
                errors.push({ name: file.name, error: "Failed to save file" });
            }
        }

        return NextResponse.json({
            success: true,
            uploaded: uploadedFiles,
            errors: errors.length > 0 ? errors : undefined
        });

    } catch (error) {
        console.error("Multiple upload error:", error);
        return NextResponse.json(
            { error: "Failed to upload files" },
            { status: 500 }
        );
    }
}

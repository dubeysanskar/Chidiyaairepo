import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret-key";

// Verify supplier token from cookies
async function getSupplierFromToken(): Promise<string | null> {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("supplier_token")?.value;
        if (!token) return null;
        const decoded = jwt.verify(token, JWT_SECRET) as { id: string; type: string };
        if (decoded.type !== "supplier") return null;
        return decoded.id;
    } catch {
        return null;
    }
}

export async function POST(req: Request) {
    try {
        const supplierId = await getSupplierFromToken();
        if (!supplierId) {
            return NextResponse.json(
                { error: "Unauthorized. Please register or log in first." },
                { status: 401 }
            );
        }

        const body = await req.json();
        const {
            gstNumber,
            panNumber,
            iecNumber,
            industry,
            documents, // Array of { docType, fileName, fileUrl }
        } = body;

        // Validate required fields
        if (!gstNumber || !panNumber) {
            return NextResponse.json(
                { error: "GST number and PAN number are required." },
                { status: 400 }
            );
        }

        // Update supplier with GST and PAN numbers
        await prisma.supplier.update({
            where: { id: supplierId },
            data: {
                gstNumber,
                panNumber,
                status: "pending_admin_review",
            },
        });

        // Create document records
        if (documents && Array.isArray(documents)) {
            for (const doc of documents) {
                if (doc.fileUrl && doc.docType) {
                    await prisma.supplierDocument.create({
                        data: {
                            supplierId,
                            docType: doc.docType,
                            fileName: doc.fileName || `${doc.docType}.pdf`,
                            fileUrl: doc.fileUrl,
                            status: "pending",
                        },
                    });
                }
            }
        }

        // Create verification event (audit log)
        await prisma.verificationEvent.create({
            data: {
                supplierId,
                eventType: "doc_upload",
                payload: {
                    gstNumber,
                    panNumber,
                    iecNumber: iecNumber || null,
                    industry: industry || null,
                    documentCount: documents?.length || 0,
                    submittedAt: new Date().toISOString(),
                },
            },
        });

        return NextResponse.json({
            success: true,
            message: "Documents submitted successfully. You'll be notified when the admin reviews your profile.",
        });

    } catch (error: any) {
        console.error("Supplier Documents Error:", error?.message || error);
        return NextResponse.json(
            { error: "Failed to submit documents" },
            { status: 500 }
        );
    }
}

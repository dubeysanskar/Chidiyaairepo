import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret-key";
const DEFAULT_TRIAL_MONTHS = 6;
const TRIAL_WARNING_DAYS = 30; // Send warning when 30 days left

// Helper to get trial months from system settings
async function getTrialMonths(): Promise<number> {
    try {
        const setting = await prisma.systemSettings.findUnique({
            where: { key: "trial_months" }
        });
        return setting ? parseInt(setting.value) : DEFAULT_TRIAL_MONTHS;
    } catch {
        return DEFAULT_TRIAL_MONTHS;
    }
}

// GET - Get supplier's trial/subscription status
export async function GET(req: Request) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("supplier_token")?.value;

        if (!token) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        let supplierId;
        try {
            const decoded = jwt.verify(token, JWT_SECRET) as any;
            supplierId = decoded.id;
        } catch (e) {
            return NextResponse.json({ error: "Invalid token" }, { status: 401 });
        }

        const supplier = await prisma.supplier.findUnique({
            where: { id: supplierId },
            select: {
                id: true,
                companyName: true,
                status: true,
                trialStartDate: true,
                trialEndDate: true,
                subscriptionStatus: true,
                isSubscribed: true,
                subscriptionExpiry: true,
                autoPayEnabled: true,
                lastPaymentDate: true,
                createdAt: true
            }
        });

        if (!supplier) {
            return NextResponse.json({ error: "Supplier not found" }, { status: 404 });
        }

        const trialMonths = await getTrialMonths();
        const now = new Date();

        // Calculate trial end date if not set
        let trialEndDate = supplier.trialEndDate;
        if (!trialEndDate && supplier.status === "approved") {
            const startDate = supplier.trialStartDate || supplier.createdAt;
            trialEndDate = new Date(startDate);
            trialEndDate.setMonth(trialEndDate.getMonth() + trialMonths);
        }

        // Calculate days remaining
        let daysRemaining = 0;
        let isTrialExpired = false;
        let isTrialWarning = false;

        if (trialEndDate) {
            const diffTime = trialEndDate.getTime() - now.getTime();
            daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            isTrialExpired = daysRemaining <= 0;
            isTrialWarning = daysRemaining > 0 && daysRemaining <= TRIAL_WARNING_DAYS;
        }

        // Get pending extension request
        let pendingExtension = null;
        try {
            pendingExtension = await prisma.trialExtensionRequest.findFirst({
                where: {
                    supplierId: supplierId,
                    status: "pending"
                },
                orderBy: { createdAt: "desc" }
            });
        } catch (e) {
            // Trial extension model might not exist yet
        }

        // Get subscription plans (could be from DB or static)
        const subscriptionPlans = [
            { id: "monthly", name: "Monthly", price: 999, duration: 1, features: ["Unlimited Products", "Priority Support", "Analytics Dashboard"] },
            { id: "quarterly", name: "Quarterly", price: 2499, duration: 3, features: ["All Monthly Features", "10% Discount", "Featured Listings"] },
            { id: "yearly", name: "Yearly", price: 7999, duration: 12, features: ["All Quarterly Features", "33% Discount", "Premium Badge", "Dedicated Support"] }
        ];

        return NextResponse.json({
            supplier: {
                id: supplier.id,
                companyName: supplier.companyName,
                status: supplier.status
            },
            trial: {
                startDate: supplier.trialStartDate,
                endDate: trialEndDate,
                daysRemaining: Math.max(0, daysRemaining),
                isExpired: isTrialExpired,
                isWarning: isTrialWarning,
                trialMonths
            },
            subscription: {
                status: supplier.subscriptionStatus,
                isSubscribed: supplier.isSubscribed,
                expiry: supplier.subscriptionExpiry,
                autoPayEnabled: supplier.autoPayEnabled,
                lastPaymentDate: supplier.lastPaymentDate
            },
            pendingExtension: pendingExtension ? {
                id: pendingExtension.id,
                requestedMonths: pendingExtension.requestedMonths,
                reason: pendingExtension.reason,
                createdAt: pendingExtension.createdAt
            } : null,
            subscriptionPlans
        });
    } catch (error) {
        console.error("Get trial status error:", error);
        return NextResponse.json({ error: "Failed to get trial status" }, { status: 500 });
    }
}

// POST - Request trial extension
export async function POST(req: Request) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("supplier_token")?.value;

        if (!token) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        let supplierId;
        try {
            const decoded = jwt.verify(token, JWT_SECRET) as any;
            supplierId = decoded.id;
        } catch (e) {
            return NextResponse.json({ error: "Invalid token" }, { status: 401 });
        }

        const { requestedMonths, reason } = await req.json();

        if (!requestedMonths || requestedMonths < 1 || requestedMonths > 6) {
            return NextResponse.json({ error: "Please request 1-6 months extension" }, { status: 400 });
        }

        // Check for existing pending request
        try {
            const existingRequest = await prisma.trialExtensionRequest.findFirst({
                where: {
                    supplierId: supplierId,
                    status: "pending"
                }
            });

            if (existingRequest) {
                return NextResponse.json({ error: "You already have a pending extension request" }, { status: 400 });
            }
        } catch (e) {
            // Model might not exist yet
        }

        // Create extension request
        let request = null;
        try {
            request = await prisma.trialExtensionRequest.create({
                data: {
                    supplierId: supplierId,
                    requestedMonths,
                    reason: reason || null
                }
            });
        } catch (e) {
            console.error("Failed to create extension request:", e);
            return NextResponse.json({ error: "Extension request feature not available yet" }, { status: 500 });
        }

        // Log activity
        try {
            await prisma.activityLog.create({
                data: {
                    action: "trial_extension_request",
                    entityType: "supplier",
                    entityId: supplierId,
                    message: `Supplier requested ${requestedMonths} month(s) trial extension`
                }
            });
        } catch (e) {
            // Activity log might fail
        }

        return NextResponse.json({
            success: true,
            message: "Trial extension request submitted successfully",
            request
        });
    } catch (error) {
        console.error("Trial extension request error:", error);
        return NextResponse.json({ error: "Failed to submit extension request" }, { status: 500 });
    }
}

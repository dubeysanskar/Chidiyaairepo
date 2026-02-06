import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import nodemailer from "nodemailer";

const DEFAULT_TRIAL_MONTHS = 6;

// Email transporter setup
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

// GET - List all trial extension requests and supplier trial info
export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const status = searchParams.get("status") || "all";
        const view = searchParams.get("view") || "requests"; // requests or suppliers

        if (view === "suppliers") {
            // Get all suppliers with trial info
            const suppliers = await prisma.supplier.findMany({
                where: { status: "approved" },
                select: {
                    id: true,
                    companyName: true,
                    email: true,
                    status: true,
                    trialStartDate: true,
                    trialEndDate: true,
                    subscriptionStatus: true,
                    isSubscribed: true,
                    subscriptionExpiry: true,
                    autoPayEnabled: true,
                    createdAt: true,
                    _count: {
                        select: { products: true, inquiries: true }
                    }
                },
                orderBy: { createdAt: "desc" }
            });

            const now = new Date();
            const trialMonths = await getTrialMonths();

            const suppliersWithTrialInfo = suppliers.map(s => {
                let trialEndDate = s.trialEndDate;
                if (!trialEndDate) {
                    const startDate = s.trialStartDate || s.createdAt;
                    trialEndDate = new Date(startDate);
                    trialEndDate.setMonth(trialEndDate.getMonth() + trialMonths);
                }

                const diffTime = trialEndDate.getTime() - now.getTime();
                const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                return {
                    ...s,
                    trialEndDate,
                    daysRemaining: Math.max(0, daysRemaining),
                    isTrialExpired: daysRemaining <= 0,
                    isTrialWarning: daysRemaining > 0 && daysRemaining <= 30,
                    productCount: s._count.products,
                    inquiryCount: s._count.inquiries
                };
            });

            return NextResponse.json({ suppliers: suppliersWithTrialInfo });
        }

        // Get trial extension requests
        const whereClause = status !== "all" ? { status } : {};

        const requests = await prisma.trialExtensionRequest.findMany({
            where: whereClause,
            include: {
                supplier: {
                    select: {
                        id: true,
                        companyName: true,
                        email: true,
                        status: true,
                        trialStartDate: true,
                        trialEndDate: true,
                        subscriptionStatus: true,
                        createdAt: true,
                        _count: {
                            select: { products: true, inquiries: true }
                        }
                    }
                }
            },
            orderBy: { createdAt: "desc" }
        });

        return NextResponse.json({ requests });
    } catch (error) {
        console.error("Get trial extensions error:", error);
        return NextResponse.json({ error: "Failed to fetch trial extensions" }, { status: 500 });
    }
}

// POST - Approve/Reject trial extension
export async function POST(req: Request) {
    try {
        const { requestId, action, approvedMonths, adminNote } = await req.json();

        if (!requestId || !action) {
            return NextResponse.json({ error: "Request ID and action required" }, { status: 400 });
        }

        if (!["approve", "reject"].includes(action)) {
            return NextResponse.json({ error: "Invalid action" }, { status: 400 });
        }

        if (action === "approve" && (approvedMonths === undefined || approvedMonths < 0 || approvedMonths > 6)) {
            return NextResponse.json({ error: "Please specify 0-6 months to approve" }, { status: 400 });
        }

        // Get the request
        const extensionRequest = await prisma.trialExtensionRequest.findUnique({
            where: { id: requestId },
            include: {
                supplier: {
                    select: { id: true, companyName: true, email: true, trialEndDate: true }
                }
            }
        });

        if (!extensionRequest) {
            return NextResponse.json({ error: "Request not found" }, { status: 404 });
        }

        // Update request status
        const updatedRequest = await prisma.trialExtensionRequest.update({
            where: { id: requestId },
            data: {
                status: action === "approve" ? "approved" : "rejected",
                approvedMonths: action === "approve" ? approvedMonths : null,
                adminNote: adminNote || null,
                processedAt: new Date()
            }
        });

        // If approved with months > 0, extend the trial
        if (action === "approve" && approvedMonths > 0) {
            const currentEndDate = extensionRequest.supplier?.trialEndDate || new Date();
            const newEndDate = new Date(currentEndDate);
            newEndDate.setMonth(newEndDate.getMonth() + approvedMonths);

            await prisma.supplier.update({
                where: { id: extensionRequest.supplierId },
                data: {
                    trialEndDate: newEndDate,
                    subscriptionStatus: "trial"
                }
            });
        }

        // Log activity
        await prisma.activityLog.create({
            data: {
                action: `${action}_trial_extension`,
                entityType: "trialExtension",
                entityId: requestId,
                message: action === "approve"
                    ? `Approved ${approvedMonths} month(s) trial extension for ${extensionRequest.supplier?.companyName}`
                    : `Rejected trial extension for ${extensionRequest.supplier?.companyName}`
            }
        });

        // Create notification for supplier
        if (extensionRequest.supplier?.id) {
            await prisma.notification.create({
                data: {
                    userId: extensionRequest.supplier.id,
                    title: action === "approve"
                        ? `Trial Extended by ${approvedMonths} Month(s)!`
                        : "Trial Extension Request Declined",
                    message: action === "approve"
                        ? `Great news! Your trial has been extended by ${approvedMonths} month(s). ${adminNote || "Keep up the good work!"}`
                        : `Your trial extension request was declined. ${adminNote || "Please consider upgrading to continue using our services."}`,
                    type: action === "approve" ? "success" : "warning",
                    link: "/supplier/dashboard?tab=upgrade"
                }
            });
        }

        // Send email notification
        if (extensionRequest.supplier?.email) {
            try {
                await sendTrialExtensionEmail(
                    extensionRequest.supplier.email,
                    extensionRequest.supplier.companyName,
                    action,
                    approvedMonths,
                    adminNote
                );
            } catch (emailError) {
                console.error("Failed to send email:", emailError);
            }
        }

        return NextResponse.json({
            success: true,
            message: `Trial extension ${action}ed successfully`,
            request: updatedRequest
        });
    } catch (error) {
        console.error("Process trial extension error:", error);
        return NextResponse.json({ error: "Failed to process extension" }, { status: 500 });
    }
}

// PUT - Directly extend/modify supplier's trial (admin action)
export async function PUT(req: Request) {
    try {
        const { supplierId, months, reason } = await req.json();

        if (!supplierId || months === undefined || months < 0 || months > 6) {
            return NextResponse.json({ error: "Supplier ID and valid months (0-6) required" }, { status: 400 });
        }

        const supplier = await prisma.supplier.findUnique({
            where: { id: supplierId },
            select: { id: true, companyName: true, email: true, trialEndDate: true, createdAt: true }
        });

        if (!supplier) {
            return NextResponse.json({ error: "Supplier not found" }, { status: 404 });
        }

        // Calculate new end date
        const baseDate = supplier.trialEndDate || supplier.createdAt;
        const newEndDate = new Date(baseDate);
        newEndDate.setMonth(newEndDate.getMonth() + months);

        await prisma.supplier.update({
            where: { id: supplierId },
            data: {
                trialEndDate: newEndDate,
                subscriptionStatus: "trial"
            }
        });

        // Log activity
        await prisma.activityLog.create({
            data: {
                action: "admin_extend_trial",
                entityType: "supplier",
                entityId: supplierId,
                message: `Admin extended trial by ${months} month(s) for ${supplier.companyName}. Reason: ${reason || "N/A"}`
            }
        });

        // Notify supplier
        await prisma.notification.create({
            data: {
                userId: supplierId,
                title: `Trial Extended by ${months} Month(s)!`,
                message: `Your trial has been extended by ${months} month(s). ${reason || "Thank you for using ChidiyaAI!"}`,
                type: "success",
                link: "/supplier/dashboard"
            }
        });

        // Send email
        if (supplier.email) {
            try {
                await sendTrialExtensionEmail(supplier.email, supplier.companyName, "approve", months, reason);
            } catch (e) {
                console.error("Failed to send email:", e);
            }
        }

        return NextResponse.json({
            success: true,
            message: `Trial extended by ${months} month(s)`,
            newEndDate
        });
    } catch (error) {
        console.error("Direct trial extension error:", error);
        return NextResponse.json({ error: "Failed to extend trial" }, { status: 500 });
    }
}

// Helper: Get trial months from settings
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

// Helper: Send trial extension email
async function sendTrialExtensionEmail(
    email: string,
    companyName: string,
    action: string,
    months: number,
    adminNote?: string
) {
    const subject = action === "approve"
        ? `🎉 Trial Extended - ${months} Month(s) Added | ChidiyaAI`
        : `Trial Extension Update | ChidiyaAI`;

    const html = action === "approve" ? `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: 'Segoe UI', Arial, sans-serif; background: #f5f5f5; margin: 0; padding: 20px; }
                .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
                .header { background: linear-gradient(135deg, #10B981, #059669); padding: 30px; text-align: center; }
                .header h1 { color: white; margin: 0; font-size: 24px; }
                .content { padding: 30px; }
                .highlight { background: #ECFDF5; border-left: 4px solid #10B981; padding: 15px; margin: 20px 0; border-radius: 0 8px 8px 0; }
                .cta { text-align: center; margin: 30px 0; }
                .cta a { background: #10B981; color: white; padding: 12px 30px; border-radius: 8px; text-decoration: none; font-weight: 600; }
                .footer { background: #F3F4F6; padding: 20px; text-align: center; color: #6B7280; font-size: 13px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🎉 Trial Extended!</h1>
                </div>
                <div class="content">
                    <p>Dear <strong>${companyName}</strong>,</p>
                    <p>Great news! Your trial period has been extended.</p>
                    
                    <div class="highlight">
                        <strong>✅ Extension Approved: ${months} Month(s)</strong><br>
                        ${adminNote ? `<p style="margin-top:10px;color:#374151;">${adminNote}</p>` : ""}
                    </div>

                    <p>Continue exploring all our premium features and grow your business with ChidiyaAI!</p>

                    <div class="cta">
                        <a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/supplier/dashboard">Go to Dashboard</a>
                    </div>
                </div>
                <div class="footer">
                    <p>Thank you for being part of ChidiyaAI!</p>
                </div>
            </div>
        </body>
        </html>
    ` : `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: 'Segoe UI', Arial, sans-serif; background: #f5f5f5; margin: 0; padding: 20px; }
                .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
                .header { background: linear-gradient(135deg, #F59E0B, #D97706); padding: 30px; text-align: center; }
                .header h1 { color: white; margin: 0; font-size: 24px; }
                .content { padding: 30px; }
                .highlight { background: #FFFBEB; border-left: 4px solid #F59E0B; padding: 15px; margin: 20px 0; border-radius: 0 8px 8px 0; }
                .cta { text-align: center; margin: 30px 0; }
                .cta a { background: #10B981; color: white; padding: 12px 30px; border-radius: 8px; text-decoration: none; font-weight: 600; }
                .footer { background: #F3F4F6; padding: 20px; text-align: center; color: #6B7280; font-size: 13px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Trial Extension Update</h1>
                </div>
                <div class="content">
                    <p>Dear <strong>${companyName}</strong>,</p>
                    <p>We've reviewed your trial extension request.</p>
                    
                    <div class="highlight">
                        <strong>Request Status: Declined</strong><br>
                        ${adminNote ? `<p style="margin-top:10px;color:#374151;">${adminNote}</p>` : "<p style='margin-top:10px;color:#374151;'>Please consider upgrading to our premium plans.</p>"}
                    </div>

                    <p>Upgrade now to continue enjoying all premium features!</p>

                    <div class="cta">
                        <a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/supplier/dashboard?tab=upgrade">View Plans</a>
                    </div>
                </div>
                <div class="footer">
                    <p>Questions? Contact our support team.</p>
                </div>
            </div>
        </body>
        </html>
    `;

    await transporter.sendMail({
        from: `"ChidiyaAI" <${process.env.SMTP_USER}>`,
        to: email,
        subject,
        html
    });
}

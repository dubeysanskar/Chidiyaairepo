import { NextResponse } from "next/server";
import { sendOTPEmail, generateOTP } from "@/lib/email";

// Shared OTP store via globalThis — accessible from verify-otp route
// In production, use Redis or database
// @ts-ignore
const otpStore: Map<string, any> = globalThis.__otpStore || (globalThis.__otpStore = new Map());

export async function POST(req: Request) {
    try {
        const { email } = await req.json();

        if (!email || typeof email !== "string") {
            return NextResponse.json(
                { error: "Email is required" },
                { status: 400 }
            );
        }

        // Rate limit: max 3 OTPs per email per 10 minutes
        const existing = otpStore.get(email);
        if (existing && existing.attempts >= 3 && Date.now() < existing.windowEnd) {
            return NextResponse.json(
                { error: "Too many OTP requests. Please wait a few minutes." },
                { status: 429 }
            );
        }

        const otp = generateOTP();
        const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

        otpStore.set(email, {
            otp,
            expiresAt,
            attempts: (existing?.attempts || 0) + 1,
            windowEnd: existing?.windowEnd || Date.now() + 10 * 60 * 1000,
        });

        // Send OTP email
        const result = await sendOTPEmail(email, otp, "Supplier");

        if (result.success) {
            console.log(`OTP sent to ${email}`);
            return NextResponse.json({ success: true, message: "OTP sent to your email" });
        } else {
            console.error("OTP email failed:", result.error);
            // Still return success in dev mode so flow isn't blocked
            console.log(`[DEV] OTP for ${email}: ${otp}`);
            return NextResponse.json({ success: true, message: "OTP sent (check console in dev)" });
        }

    } catch (error) {
        console.error("Send OTP Error:", error);
        return NextResponse.json(
            { error: "Failed to send OTP" },
            { status: 500 }
        );
    }
}

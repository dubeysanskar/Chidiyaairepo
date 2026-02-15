import { NextResponse } from "next/server";

// Shared OTP store — import from send-otp would cause issues with separate route modules
// In production, use a shared store (Redis/DB). For now, we use a global variable.
// @ts-ignore
const otpStore: Map<string, any> = globalThis.__otpStore || (globalThis.__otpStore = new Map());

export async function POST(req: Request) {
    try {
        const { email, otp } = await req.json();

        if (!email || !otp) {
            return NextResponse.json(
                { error: "Email and OTP are required" },
                { status: 400 }
            );
        }

        const stored = otpStore.get(email);

        if (!stored) {
            return NextResponse.json(
                { success: false, error: "No OTP found. Please request a new one." },
                { status: 400 }
            );
        }

        if (Date.now() > stored.expiresAt) {
            otpStore.delete(email);
            return NextResponse.json(
                { success: false, error: "OTP expired. Please request a new one." },
                { status: 400 }
            );
        }

        if (stored.otp !== otp) {
            return NextResponse.json(
                { success: false, error: "Invalid OTP. Please check and try again." },
                { status: 400 }
            );
        }

        // OTP verified — clean up
        otpStore.delete(email);
        console.log(`OTP verified for ${email}`);

        return NextResponse.json({
            success: true,
            message: "Email verified successfully",
        });

    } catch (error) {
        console.error("Verify OTP Error:", error);
        return NextResponse.json(
            { error: "Failed to verify OTP" },
            { status: 500 }
        );
    }
}

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { sendPasswordResetEmail } from "@/lib/email"
import crypto from "crypto"

export async function POST(request: NextRequest) {
    try {
        const { email } = await request.json()

        if (!email) {
            return NextResponse.json(
                { error: "Email is required" },
                { status: 400 }
            )
        }

        // Find buyer
        const buyer = await prisma.buyer.findUnique({
            where: { email }
        })

        // Always return success for security (don't reveal if email exists)
        if (!buyer) {
            return NextResponse.json({
                success: true,
                message: "If an account exists with this email, you will receive a password reset link."
            })
        }

        // Check if buyer has a password (Google-only users can't reset)
        if (!buyer.password) {
            return NextResponse.json({
                success: true,
                message: "If an account exists with this email, you will receive a password reset link."
            })
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString("hex")
        const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

        // Save token to database
        await prisma.buyer.update({
            where: { id: buyer.id },
            data: {
                resetToken,
                resetTokenExpiry
            }
        })

        // Send email using the existing function
        try {
            await sendPasswordResetEmail(email, resetToken, 'buyer')
        } catch (emailError) {
            console.error("Failed to send reset email:", emailError)
            return NextResponse.json(
                { error: "Failed to send reset email. Please try again." },
                { status: 500 }
            )
        }

        return NextResponse.json({
            success: true,
            message: "If an account exists with this email, you will receive a password reset link."
        })

    } catch (error) {
        console.error("Forgot password error:", error)
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}

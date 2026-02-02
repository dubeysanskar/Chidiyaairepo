import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { sendPasswordResetEmail, generateResetToken } from "@/lib/email"

export async function POST(request: NextRequest) {
    try {
        const { email } = await request.json()

        if (!email) {
            return NextResponse.json(
                { error: "Email is required" },
                { status: 400 }
            )
        }

        // Check if buyer exists
        const buyer = await prisma.buyer.findUnique({
            where: { email }
        })

        if (!buyer) {
            // Don't reveal if email exists for security
            return NextResponse.json({
                success: true,
                message: "If an account exists with this email, you will receive a password reset link."
            })
        }

        // Generate reset token
        const resetToken = generateResetToken()
        const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

        // Save token to database
        await prisma.buyer.update({
            where: { id: buyer.id },
            data: {
                resetToken,
                resetTokenExpiry
            }
        })

        // Send reset email
        await sendPasswordResetEmail(email, resetToken, 'buyer')

        return NextResponse.json({
            success: true,
            message: "If an account exists with this email, you will receive a password reset link."
        })

    } catch (error) {
        console.error("Forgot password error:", error)
        return NextResponse.json(
            { error: "Failed to process request" },
            { status: 500 }
        )
    }
}

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function POST(request: NextRequest) {
    try {
        const { email, token, password } = await request.json()

        if (!email || !token || !password) {
            return NextResponse.json(
                { error: "Email, token, and password are required" },
                { status: 400 }
            )
        }

        if (password.length < 6) {
            return NextResponse.json(
                { error: "Password must be at least 6 characters" },
                { status: 400 }
            )
        }

        // Find buyer with matching token
        const buyer = await prisma.buyer.findUnique({
            where: { email }
        })

        if (!buyer) {
            return NextResponse.json(
                { error: "Invalid reset link" },
                { status: 400 }
            )
        }

        // Verify token matches
        if (buyer.resetToken !== token) {
            return NextResponse.json(
                { error: "Invalid or expired reset link" },
                { status: 400 }
            )
        }

        // Check if token has expired
        if (buyer.resetTokenExpiry && new Date() > buyer.resetTokenExpiry) {
            return NextResponse.json(
                { error: "Reset link has expired. Please request a new one." },
                { status: 400 }
            )
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(password, 10)

        // Update password and clear reset token
        await prisma.buyer.update({
            where: { id: buyer.id },
            data: {
                password: hashedPassword,
                resetToken: null,
                resetTokenExpiry: null
            }
        })

        return NextResponse.json({
            success: true,
            message: "Password reset successfully"
        })

    } catch (error) {
        console.error("Reset password error:", error)
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}

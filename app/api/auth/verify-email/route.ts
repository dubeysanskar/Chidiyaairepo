import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { sendOTPEmail, generateOTP } from "@/lib/email"

// Send OTP for email verification
export async function POST(request: NextRequest) {
    try {
        const { email, action } = await request.json()

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
            return NextResponse.json(
                { error: "Account not found" },
                { status: 404 }
            )
        }

        if (action === 'verify') {
            // Verify OTP
            const { otp } = await request.json()

            if (buyer.verificationOTP !== otp) {
                return NextResponse.json(
                    { error: "Invalid OTP" },
                    { status: 400 }
                )
            }

            if (buyer.otpExpiry && new Date() > buyer.otpExpiry) {
                return NextResponse.json(
                    { error: "OTP has expired. Please request a new one." },
                    { status: 400 }
                )
            }

            // Mark email as verified
            await prisma.buyer.update({
                where: { id: buyer.id },
                data: {
                    emailVerified: true,
                    verificationOTP: null,
                    otpExpiry: null
                }
            })

            return NextResponse.json({
                success: true,
                message: "Email verified successfully!"
            })
        }

        // Generate and send OTP
        const otp = generateOTP()
        const otpExpiry = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

        await prisma.buyer.update({
            where: { id: buyer.id },
            data: {
                verificationOTP: otp,
                otpExpiry
            }
        })

        await sendOTPEmail(email, otp, buyer.name)

        return NextResponse.json({
            success: true,
            message: "OTP sent to your email"
        })

    } catch (error) {
        console.error("Verify email error:", error)
        return NextResponse.json(
            { error: "Failed to process request" },
            { status: 500 }
        )
    }
}

// Verify OTP
export async function PUT(request: NextRequest) {
    try {
        const { email, otp } = await request.json()

        if (!email || !otp) {
            return NextResponse.json(
                { error: "Email and OTP are required" },
                { status: 400 }
            )
        }

        const buyer = await prisma.buyer.findUnique({
            where: { email }
        })

        if (!buyer) {
            return NextResponse.json(
                { error: "Account not found" },
                { status: 404 }
            )
        }

        if (buyer.verificationOTP !== otp) {
            return NextResponse.json(
                { error: "Invalid OTP" },
                { status: 400 }
            )
        }

        if (buyer.otpExpiry && new Date() > buyer.otpExpiry) {
            return NextResponse.json(
                { error: "OTP has expired. Please request a new one." },
                { status: 400 }
            )
        }

        // Mark email as verified
        await prisma.buyer.update({
            where: { id: buyer.id },
            data: {
                emailVerified: true,
                verificationOTP: null,
                otpExpiry: null
            }
        })

        return NextResponse.json({
            success: true,
            message: "Email verified successfully!"
        })

    } catch (error) {
        console.error("Verify OTP error:", error)
        return NextResponse.json(
            { error: "Failed to verify OTP" },
            { status: 500 }
        )
    }
}

import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { prisma } from "@/lib/prisma"
import { sendBuyerWelcomeEmail, sendOTPEmail, generateOTP } from "@/lib/email"

const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret-key"

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { email, password, first_name, last_name } = body

        if (!email || !password) {
            return NextResponse.json(
                { error: "Email and password are required" },
                { status: 400 }
            )
        }

        // Check if user already exists
        const existingBuyer = await prisma.buyer.findUnique({
            where: { email }
        })

        if (existingBuyer) {
            return NextResponse.json(
                { error: "An account with this email already exists" },
                { status: 400 }
            )
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10)

        // Create full name
        const name = [first_name, last_name].filter(Boolean).join(" ") || email.split("@")[0]

        // Generate OTP for email verification
        const otp = generateOTP()
        const otpExpiry = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

        // Create buyer with unverified email
        const buyer = await prisma.buyer.create({
            data: {
                email,
                password: hashedPassword,
                name,
                emailVerified: false,
                verificationOTP: otp,
                otpExpiry
            }
        })

        // Send OTP email for verification
        await sendOTPEmail(buyer.email, otp, buyer.name)

        // Send welcome email (non-blocking)
        sendBuyerWelcomeEmail(buyer.email, buyer.name).catch(console.error)

        // Generate JWT token
        const token = jwt.sign(
            { id: buyer.id, email: buyer.email },
            JWT_SECRET,
            { expiresIn: "7d" }
        )

        // Set cookie
        const cookieStore = await cookies()
        cookieStore.set("auth_token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 7 * 24 * 60 * 60, // 7 days
            path: "/"
        })

        return NextResponse.json({
            success: true,
            requiresVerification: true,
            message: "OTP sent to your email. Please verify to complete registration.",
            user: {
                id: buyer.id,
                email: buyer.email,
                name: buyer.name,
                emailVerified: false
            }
        })

    } catch (error) {
        console.error("Registration error:", error)
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}


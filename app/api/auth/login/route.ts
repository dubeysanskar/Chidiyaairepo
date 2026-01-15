import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { prisma } from "@/lib/prisma"

const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret-key"

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { email, password } = body

        if (!email || !password) {
            return NextResponse.json(
                { error: "Email and password are required" },
                { status: 400 }
            )
        }

        // Find user in Buyer table
        const buyer = await prisma.buyer.findUnique({
            where: { email }
        })

        if (!buyer) {
            return NextResponse.json(
                { error: "Invalid credentials" },
                { status: 401 }
            )
        }

        // Check if user has a password (if created via Google, they might not)
        if (!buyer.password) {
            return NextResponse.json(
                { error: "Please sign in with Google" },
                { status: 401 }
            )
        }

        // Verify password
        const isValidPassword = await bcrypt.compare(password, buyer.password)
        if (!isValidPassword) {
            return NextResponse.json(
                { error: "Invalid credentials" },
                { status: 401 }
            )
        }

        // Generate JWT token
        const token = jwt.sign(
            { id: buyer.id, email: buyer.email },
            JWT_SECRET,
            { expiresIn: "7d" }
        )

        // Set cookie
        const cookieStore = await cookies()

        // Clear any existing supplier session to avoid conflicts
        cookieStore.delete("supplier_token")

        cookieStore.set("auth_token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 7 * 24 * 60 * 60, // 7 days
            path: "/"
        })

        return NextResponse.json({
            success: true,
            user: {
                id: buyer.id,
                email: buyer.email,
                name: buyer.name
            }
        })

    } catch (error) {
        console.error("Login error:", error)
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}

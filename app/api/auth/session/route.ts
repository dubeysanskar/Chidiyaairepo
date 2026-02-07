import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import jwt from "jsonwebtoken"
import { prisma } from "@/lib/prisma"

const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret-key"

export async function GET() {
    try {
        // 1. Check Custom JWT Cookie first
        const cookieStore = await cookies()
        const token = cookieStore.get("auth_token")?.value

        if (token) {
            try {
                const decoded = jwt.verify(token, JWT_SECRET) as { id: string; email: string }

                // Fetch user from database to get latest data
                const buyer = await prisma.buyer.findUnique({
                    where: { id: decoded.id },
                    select: {
                        id: true,
                        email: true,
                        name: true,
                        isSubscribed: true,
                        subscriptionExpiry: true,
                        dailyQueryCount: true,
                        lastQueryDate: true,
                    }
                })

                if (buyer) {
                    return NextResponse.json({
                        user: {
                            id: buyer.id,
                            email: buyer.email,
                            name: buyer.name,
                            isSubscribed: buyer.isSubscribed,
                            subscriptionExpiry: buyer.subscriptionExpiry,
                            dailyQueryCount: buyer.dailyQueryCount,
                            lastQueryDate: buyer.lastQueryDate,
                        }
                    })
                }
            } catch {
                // Token invalid or expired - clear it
                cookieStore.delete("auth_token")
            }
        }

        // 2. Check NextAuth Session (for Google login)
        const session = await getServerSession(authOptions)
        if (session?.user) {
            // @ts-expect-error - id is added in callbacks
            const userId = session.user.id

            // Fetch additional user data from database
            const buyer = await prisma.buyer.findUnique({
                where: { email: session.user.email! },
                select: {
                    id: true,
                    isSubscribed: true,
                    subscriptionExpiry: true,
                    dailyQueryCount: true,
                    lastQueryDate: true,
                }
            })

            return NextResponse.json({
                user: {
                    id: userId || buyer?.id,
                    email: session.user.email,
                    name: session.user.name,
                    image: session.user.image,
                    isSubscribed: buyer?.isSubscribed || false,
                    subscriptionExpiry: buyer?.subscriptionExpiry,
                    dailyQueryCount: buyer?.dailyQueryCount || 0,
                    lastQueryDate: buyer?.lastQueryDate,
                }
            })
        }

        // No session found
        return NextResponse.json({ user: null })

    } catch (error) {
        console.error("Session check error:", error)
        return NextResponse.json({ user: null })
    }
}

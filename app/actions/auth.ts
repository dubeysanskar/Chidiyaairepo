"use server";

import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../api/auth/[...nextauth]/route";

const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret-key";

export async function getUser() {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("auth_token")?.value;
        const supplierToken = cookieStore.get("supplier_token")?.value;
        const adminToken = cookieStore.get("admin_token")?.value;

        let userId;
        let userType = "buyer"; // default to buyer

        // 1. Check Admin Token
        if (adminToken) {
            try {
                const decoded = jwt.verify(adminToken, JWT_SECRET) as { id: string };
                userId = decoded.id;
                userType = "admin";
            } catch {
                // Invalid admin token
            }
        }

        // 2. Check Supplier Token
        if (!userId && supplierToken) {
            try {
                const decoded = jwt.verify(supplierToken, JWT_SECRET) as { id: string };
                userId = decoded.id;
                userType = "supplier";
            } catch {
                // Invalid supplier token
            }
        }

        // 3. Check Buyer Token
        if (!userId && token) {
            try {
                const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
                userId = decoded.id;
                userType = "buyer";
            } catch {
                // Token invalid
            }
        }

        // 4. Check NextAuth Session
        if (!userId) {
            const session = await getServerSession(authOptions);
            // @ts-ignore
            if (session?.user?.id) {
                // @ts-ignore
                userId = session.user.id;
            } else if (session?.user?.email) {
                const user = await prisma.buyer.findUnique({
                    where: { email: session.user.email }
                });
                if (user) {
                    userId = user.id;
                } else {
                    const sup = await prisma.supplier.findUnique({
                        where: { email: session.user.email }
                    });
                    userId = sup?.id;
                }
            }
        }

        if (!userId) {
            return null;
        }

        // Fetch User Data based on determined type/ID
        if (userType === "admin") {
            const admin = await prisma.admin.findUnique({
                where: { id: userId },
                select: { id: true, email: true, name: true, role: true }
            });
            if (admin) return { ...admin, first_name: admin.name, role: admin.role };
        }

        // Buyer Check
        const buyer = await prisma.buyer.findUnique({
            where: { id: userId },
            select: { id: true, email: true, name: true }
        });

        if (buyer) return { ...buyer, first_name: buyer.name, role: "buyer" };

        // Supplier Check
        const supplier = await prisma.supplier.findUnique({
            where: { id: userId },
            select: { id: true, email: true, companyName: true }
        });

        if (supplier) return { ...supplier, first_name: supplier.companyName, role: "supplier" };

        return null;

    } catch (error) {
        console.error("Auth action error:", error);
        return null; // Return null on error
    }
}

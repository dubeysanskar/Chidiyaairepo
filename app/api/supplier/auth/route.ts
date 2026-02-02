import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { sendSupplierWelcomeEmail } from "../../../../lib/email";

const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret-key";

export async function POST(req: Request) {
    try {
        const { action, ...data } = await req.json();

        // Register
        if (action === "register") {
            const {
                companyName,
                email,
                phone,
                password,
                productCategories,
                capacity,
                moq,
                serviceLocations,
            } = data;

            const existing = await prisma.supplier.findUnique({
                where: { email },
                select: { id: true },
            });

            if (existing) {
                return NextResponse.json(
                    { error: "Supplier already registered" },
                    { status: 400 }
                );
            }

            const hashedPassword = await bcrypt.hash(password, 10);

            const supplier = await prisma.supplier.create({
                data: {
                    companyName,
                    email,
                    phone,
                    password: hashedPassword,
                    productCategories,
                    capacity,
                    moq,
                    serviceLocations,
                    status: "pending",
                },
                select: {
                    id: true,
                },
            });

            // Send welcome email (non-blocking)
            sendSupplierWelcomeEmail(email, companyName).catch(console.error);

            const token = jwt.sign(
                { id: supplier.id, type: "supplier" },
                JWT_SECRET,
                { expiresIn: "7d" }
            );

            const response = NextResponse.json({
                success: true,
                supplierId: supplier.id,
            });

            response.cookies.delete("auth_token"); // Clear buyer session
            response.cookies.set("supplier_token", token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                maxAge: 7 * 24 * 60 * 60,
                path: "/",
            });

            return response;
        }


        // Login
        // Login
        if (action === "login") {
            const { email, password } = data;

            const supplier = await prisma.supplier.findUnique({
                where: { email },
                select: {
                    id: true,
                    email: true,
                    password: true,
                    status: true,
                },
            });

            if (!supplier || !(await bcrypt.compare(password, supplier.password))) {
                return NextResponse.json(
                    { error: "Invalid credentials" },
                    { status: 401 }
                );
            }

            if (supplier.status !== "approved") {
                return NextResponse.json(
                    { error: "Account not approved yet" },
                    { status: 403 }
                );
            }

            const token = jwt.sign(
                { id: supplier.id, type: "supplier" },
                JWT_SECRET,
                { expiresIn: "7d" }
            );

            const response = NextResponse.json({ success: true });
            response.cookies.delete("auth_token"); // Clear buyer session
            response.cookies.set("supplier_token", token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                maxAge: 7 * 24 * 60 * 60,
                path: "/",
            });

            return response;
        }


        return NextResponse.json({ error: "Invalid action" }, { status: 400 });

    } catch (error) {
        console.error("Supplier Auth Error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

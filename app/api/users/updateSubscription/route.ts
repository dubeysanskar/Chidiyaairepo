import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(request: Request) {
    try {
        const { email, subscribe, subscriptionExpiry, orderId } = await request.json();

        if (!email) {
            return NextResponse.json({ error: "Email is required" }, { status: 400 });
        }

        // 1. Check if Supplier exists
        const existingSupplier = await prisma.supplier.findUnique({
            where: { email },
        });

        if (existingSupplier) {
            // Calculate new expiry date
            let newExpiry: Date;
            const thirtyDays = 30 * 24 * 60 * 60 * 1000;

            // If they have an active subscription, ADD 30 days to it
            if (existingSupplier.subscriptionExpiry && existingSupplier.subscriptionExpiry > new Date()) {
                newExpiry = new Date(existingSupplier.subscriptionExpiry.getTime() + thirtyDays);
            } else {
                // Expired or no subscription - start fresh from today
                newExpiry = new Date(Date.now() + thirtyDays);
            }

            // Update existing Supplier
            const updatedSupplier = await prisma.supplier.update({
                where: { email },
                data: {
                    isSubscribed: subscribe,
                    subscriptionExpiry: newExpiry,
                    razorpayOrderId: orderId,
                },
            });
            return NextResponse.json(updatedSupplier);
        }

        // 2. If no Supplier, check if Buyer exists to convert
        const buyer = await prisma.buyer.findUnique({
            where: { email },
        });

        if (buyer) {
            // Create new Supplier from Buyer data
            const newSupplier = await prisma.supplier.create({
                data: {
                    email: buyer.email,
                    companyName: buyer.name, // Map Name to Company Name
                    password: buyer.password || "", // Copy hashed password
                    phone: buyer.phone,
                    status: "pending", // Waiting for Admin Approval
                    isSubscribed: subscribe,
                    subscriptionExpiry: subscriptionExpiry ? new Date(subscriptionExpiry) : null,
                    razorpayOrderId: orderId,
                    productCategories: [], // Default empty
                },
            });
            return NextResponse.json(newSupplier);
        }

        return NextResponse.json({ error: "User not found" }, { status: 404 });

    } catch (error) {
        console.error("Error updating subscription:", error);
        return NextResponse.json({ error: "Failed to update subscription." }, { status: 500 });
    }
}

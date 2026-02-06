import { NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(req) {
    const { amount, email, plan } = await req.json();

    const orderData = {
        amount: amount,
        currency: "INR",
        receipt: crypto.randomBytes(10).toString("hex"),
        notes: { email, plan }
    };

    const response = await fetch("https://api.razorpay.com/v1/orders", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Basic ${Buffer.from(
                `${process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`
            ).toString("base64")}`
        },
        body: JSON.stringify(orderData)
    });

    const order = await response.json();

    if (!response.ok) {
        console.error("Razorpay Error:", order);
        return NextResponse.json({ error: order.error?.description || "Razorpay Error" }, { status: response.status });
    }

    return NextResponse.json(order);
}

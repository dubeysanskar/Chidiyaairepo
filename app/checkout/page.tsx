"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Script from "next/script";

import { getUser } from "@/app/actions/auth";

export default function CheckoutPage() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        getUser()
            .then((userData) => {
                if (userData) {
                    setUser(userData);
                } else {
                    router.push("/supplier/login?next=checkout");
                }
            })
            .catch(() => router.push("/supplier/login?next=checkout"))
            .finally(() => setLoading(false));
    }, [router]);

    const handlePayment = async () => {
        if (!user) return;
        setProcessing(true);

        const amount = 299900; // ₹2,999

        try {
            const res = await fetch("/api/payment", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ amount, email: user.email, plan: "pro" }),
            });

            const order = await res.json();
            if (!res.ok) throw new Error(order.error || "Payment initiation failed");

            const options = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
                amount,
                currency: "INR",
                name: "ChidiyaAI",
                description: "Pro Subscription",
                order_id: order.id,
                handler: async (response: any) => {
                    try {
                        const expiryDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
                        await fetch("/api/users/updateSubscription", {
                            method: "PATCH",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                email: user.email,
                                subscribe: true,
                                subscriptionExpiry: expiryDate,
                                orderId: order.id,
                            }),
                        });
                        alert("Payment Successful! Redirecting to Dashboard.");
                        router.push("/supplier/dashboard");
                    } catch (error) {
                        console.error(error);
                        alert("Payment verification failed. Please contact support.");
                    }
                },
                prefill: {
                    name: user.first_name,
                    email: user.email,
                },
                theme: {
                    color: "#0f172a",
                },
            };

            const paymentObject = new (window as any).Razorpay(options);
            paymentObject.open();
        } catch (error: any) {
            alert(error.message);
        } finally {
            setProcessing(false);
        }
    };

    if (loading) return <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>Loading...</div>;

    return (
        <div style={{ minHeight: "100vh", backgroundColor: "#f8fafc", padding: "40px 20px", display: "flex", justifyContent: "center", alignItems: "center" }}>
            <Script src="https://checkout.razorpay.com/v1/checkout.js" />
            <div style={{ backgroundColor: "white", padding: "40px", borderRadius: "16px", boxShadow: "0 4px 20px rgba(0,0,0,0.05)", maxWidth: "500px", width: "100%" }}>
                <h1 style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "8px", color: "#0f172a" }}>Complete Your Subscription</h1>
                <p style={{ color: "#64748b", marginBottom: "32px" }}>Access unlimited searches and verified badge.</p>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", padding: "20px", backgroundColor: "#f1f5f9", borderRadius: "12px" }}>
                    <div>
                        <div style={{ fontWeight: "600", color: "#0f172a" }}>Pro Plan</div>
                        <div style={{ fontSize: "13px", color: "#64748b" }}>Monthly Subscription</div>
                    </div>
                    <div style={{ fontSize: "24px", fontWeight: "bold", color: "#0f172a" }}>₹2,999</div>
                </div>

                <button
                    onClick={handlePayment}
                    disabled={processing}
                    style={{
                        width: "100%",
                        padding: "16px",
                        backgroundColor: "#0f172a",
                        color: "white",
                        border: "none",
                        borderRadius: "12px",
                        fontSize: "16px",
                        fontWeight: "600",
                        cursor: processing ? "not-allowed" : "pointer"
                    }}
                >
                    {processing ? "Processing..." : "Pay Now & Activate"}
                </button>

                <div style={{ textAlign: "center", marginTop: "24px", fontSize: "13px", color: "#94a3b8" }}>
                    Secure payment via Razorpay
                </div>
            </div>
        </div>
    );
}

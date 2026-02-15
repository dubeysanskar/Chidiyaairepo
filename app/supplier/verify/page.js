"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Document upload is now part of the 3-step registration wizard
// This page redirects to the registration page
export default function SupplierVerify() {
    const router = useRouter();

    useEffect(() => {
        router.replace("/supplier/register");
    }, [router]);

    return (
        <div style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "'Inter', system-ui, sans-serif",
            backgroundColor: "#f8fafc",
        }}>
            <div style={{ textAlign: "center", color: "#64748b" }}>
                <p>Redirecting to registration wizard...</p>
            </div>
        </div>
    );
}

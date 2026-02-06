"use client";

import { useState, useEffect } from "react";

export default function UpgradeSection({ showNotification }) {
    const [loading, setLoading] = useState(true);
    const [trialData, setTrialData] = useState(null);
    const [subscriptionData, setSubscriptionData] = useState(null);
    const [pendingExtension, setPendingExtension] = useState(null);
    const [plans, setPlans] = useState([]);
    const [extensionForm, setExtensionForm] = useState({ requestedMonths: 1, reason: "" });
    const [submitting, setSubmitting] = useState(false);
    const [showExtensionModal, setShowExtensionModal] = useState(false);
    const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

    useEffect(() => {
        fetchSubscriptionData();
    }, []);

    // Countdown timer effect
    useEffect(() => {
        if (!trialData?.endDate) return;

        const updateCountdown = () => {
            const endDate = new Date(trialData.endDate);
            const now = new Date();
            const diff = endDate.getTime() - now.getTime();

            if (diff <= 0) {
                setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
                return;
            }

            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);

            setTimeLeft({ days, hours, minutes, seconds });
        };

        updateCountdown();
        const interval = setInterval(updateCountdown, 1000);

        return () => clearInterval(interval);
    }, [trialData?.endDate]);

    const fetchSubscriptionData = async () => {
        try {
            const res = await fetch("/api/supplier/subscription");
            if (res.ok) {
                const data = await res.json();
                setTrialData(data.trial);
                setSubscriptionData(data.subscription);
                setPendingExtension(data.pendingExtension);
                setPlans(data.subscriptionPlans || []);
            }
        } catch (error) {
            console.error("Failed to fetch subscription data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleRequestExtension = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const res = await fetch("/api/supplier/subscription", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(extensionForm)
            });

            const data = await res.json();

            if (res.ok) {
                showNotification("Extension request submitted successfully!", "success");
                setShowExtensionModal(false);
                fetchSubscriptionData();
            } else {
                showNotification(data.error || "Failed to submit request", "error");
            }
        } catch (error) {
            showNotification("Failed to submit request", "error");
        } finally {
            setSubmitting(false);
        }
    };

    const handleUpgrade = (planId) => {
        // TODO: Implement Razorpay payment
        showNotification("Payment integration coming soon!", "info");
    };

    if (loading) {
        return (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: "100px" }}>
                <div style={{ fontSize: "18px", color: "#64748b" }}>Loading subscription info...</div>
            </div>
        );
    }

    const isTrialActive = trialData && !trialData.isExpired && subscriptionData?.status === "trial";
    const isWarning = trialData?.isWarning;

    return (
        <div>
            {/* Header */}
            <div style={{ marginBottom: "32px" }}>
                <h1 style={{ fontSize: "28px", fontWeight: "700", color: "#1e293b", margin: 0 }}>
                    Subscription & Upgrade
                </h1>
                <p style={{ color: "#64748b", marginTop: "8px" }}>
                    Manage your subscription and access premium features
                </p>
            </div>

            {/* Trial Status Card */}
            <div style={{
                background: isTrialActive
                    ? (isWarning ? "linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)" : "linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%)")
                    : (subscriptionData?.isSubscribed ? "linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)" : "linear-gradient(135deg, #FEE2E2 0%, #FECACA 100%)"),
                borderRadius: "16px",
                padding: "32px",
                marginBottom: "32px",
                border: isWarning ? "2px solid #F59E0B" : "none"
            }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "24px" }}>
                    <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
                            <span style={{ fontSize: "32px" }}>
                                {isTrialActive ? (isWarning ? "⚠️" : "🎉") : (subscriptionData?.isSubscribed ? "⭐" : "⏰")}
                            </span>
                            <h2 style={{ fontSize: "24px", fontWeight: "700", color: "#1e293b", margin: 0 }}>
                                {isTrialActive ? "Free Trial Active" :
                                    subscriptionData?.isSubscribed ? "Premium Subscriber" : "Trial Expired"}
                            </h2>
                        </div>
                        <p style={{ color: "#4b5563", fontSize: "16px", maxWidth: "500px" }}>
                            {isTrialActive
                                ? `You're enjoying your ${trialData?.trialMonths || 6}-month free trial. Explore all features and grow your business!`
                                : subscriptionData?.isSubscribed
                                    ? "Thank you for being a premium member! You have access to all features."
                                    : "Your free trial has ended. Upgrade now to continue accessing all features."}
                        </p>
                    </div>

                    {/* Countdown Timer */}
                    {isTrialActive && (
                        <div style={{
                            background: "rgba(255,255,255,0.8)",
                            borderRadius: "16px",
                            padding: "20px 28px",
                            textAlign: "center",
                            boxShadow: "0 4px 6px rgba(0,0,0,0.05)"
                        }}>
                            <div style={{ fontSize: "12px", color: "#64748b", marginBottom: "8px", fontWeight: "600" }}>
                                TIME REMAINING
                            </div>
                            <div style={{ display: "flex", gap: "12px" }}>
                                {[
                                    { value: timeLeft.days, label: "Days" },
                                    { value: timeLeft.hours, label: "Hrs" },
                                    { value: timeLeft.minutes, label: "Min" },
                                    { value: timeLeft.seconds, label: "Sec" }
                                ].map((item, i) => (
                                    <div key={i} style={{ textAlign: "center" }}>
                                        <div style={{
                                            fontSize: "28px",
                                            fontWeight: "700",
                                            color: isWarning ? "#D97706" : "#059669",
                                            fontFamily: "monospace"
                                        }}>
                                            {String(item.value).padStart(2, "0")}
                                        </div>
                                        <div style={{ fontSize: "11px", color: "#64748b" }}>{item.label}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Action Buttons */}
                <div style={{ display: "flex", gap: "12px", marginTop: "24px", flexWrap: "wrap" }}>
                    {isTrialActive && (
                        <button
                            onClick={() => setShowExtensionModal(true)}
                            disabled={!!pendingExtension}
                            style={{
                                padding: "12px 24px",
                                backgroundColor: pendingExtension ? "#9CA3AF" : "#F59E0B",
                                color: "white",
                                border: "none",
                                borderRadius: "8px",
                                fontSize: "14px",
                                fontWeight: "600",
                                cursor: pendingExtension ? "not-allowed" : "pointer"
                            }}
                        >
                            {pendingExtension ? "⏳ Extension Request Pending" : "Request Extension"}
                        </button>
                    )}
                    <a href="#plans" style={{
                        padding: "12px 24px",
                        background: "linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)",
                        color: "white",
                        border: "none",
                        borderRadius: "8px",
                        fontSize: "14px",
                        fontWeight: "600",
                        textDecoration: "none",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "8px"
                    }}>
                        ⭐ View Premium Plans
                    </a>
                </div>
            </div>

            {/* Pending Extension Request Status */}
            {pendingExtension && (
                <div style={{
                    background: "#FEF3C7",
                    border: "1px solid #FCD34D",
                    borderRadius: "12px",
                    padding: "20px",
                    marginBottom: "32px"
                }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <span style={{ fontSize: "24px" }}>📋</span>
                        <div>
                            <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "600", color: "#92400E" }}>
                                Extension Request Pending
                            </h3>
                            <p style={{ margin: "4px 0 0", color: "#B45309", fontSize: "14px" }}>
                                You requested {pendingExtension.requestedMonths} month(s) extension on {new Date(pendingExtension.createdAt).toLocaleDateString()}.
                                Our team is reviewing your request.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Subscription Plans */}
            <div id="plans" style={{ marginBottom: "32px" }}>
                <h2 style={{ fontSize: "22px", fontWeight: "700", color: "#1e293b", marginBottom: "24px" }}>
                    Choose Your Plan
                </h2>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "24px" }}>
                    {/* Free Extension Option */}
                    <div style={{
                        background: "linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)",
                        borderRadius: "16px",
                        padding: "28px",
                        border: "2px solid #F59E0B"
                    }}>
                        <h3 style={{ fontSize: "20px", fontWeight: "600", color: "#92400E", marginBottom: "8px" }}>
                            Free Trial Extension
                        </h3>
                        <div style={{ marginBottom: "20px" }}>
                            <span style={{ fontSize: "36px", fontWeight: "700", color: "#92400E" }}>FREE</span>
                            <span style={{ color: "#B45309", fontSize: "14px" }}> / up to 6 months</span>
                        </div>
                        <ul style={{ listStyle: "none", padding: 0, marginBottom: "24px" }}>
                            {[
                                "Request 1-6 months extension",
                                "Subject to admin approval",
                                "Continue exploring features",
                                "No payment required"
                            ].map((feature, i) => (
                                <li key={i} style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "8px",
                                    padding: "8px 0",
                                    color: "#92400E",
                                    fontSize: "14px"
                                }}>
                                    <span style={{ color: "#F59E0B" }}>✓</span>
                                    {feature}
                                </li>
                            ))}
                        </ul>
                        <button
                            onClick={() => setShowExtensionModal(true)}
                            disabled={!!pendingExtension}
                            style={{
                                width: "100%",
                                padding: "14px",
                                backgroundColor: pendingExtension ? "#9CA3AF" : "#F59E0B",
                                color: "white",
                                border: "none",
                                borderRadius: "10px",
                                fontSize: "15px",
                                fontWeight: "600",
                                cursor: pendingExtension ? "not-allowed" : "pointer"
                            }}
                        >
                            {pendingExtension ? "Request Pending" : "Request Free Extension"}
                        </button>
                    </div>

                    {/* Premium Plan */}
                    <div style={{
                        background: "white",
                        borderRadius: "16px",
                        padding: "28px",
                        boxShadow: "0 4px 6px rgba(0,0,0,0.05)",
                        border: "2px solid #3B82F6",
                        position: "relative"
                    }}>
                        <div style={{
                            position: "absolute",
                            top: "-12px",
                            right: "20px",
                            background: "linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)",
                            color: "white",
                            padding: "4px 12px",
                            borderRadius: "12px",
                            fontSize: "12px",
                            fontWeight: "600"
                        }}>
                            RECOMMENDED
                        </div>
                        <h3 style={{ fontSize: "20px", fontWeight: "600", color: "#1e293b", marginBottom: "8px" }}>
                            Premium Yearly Plan
                        </h3>
                        <div style={{ marginBottom: "20px" }}>
                            <span style={{ fontSize: "36px", fontWeight: "700", color: "#1e293b" }}>₹4,999</span>
                            <span style={{ color: "#64748b", fontSize: "14px" }}>/year</span>
                        </div>
                        <ul style={{ listStyle: "none", padding: 0, marginBottom: "24px" }}>
                            {[
                                "Unlimited Products",
                                "Priority Support",
                                "Analytics Dashboard",
                                "Featured Listings",
                                "Premium Badge",
                                "Dedicated Account Manager"
                            ].map((feature, i) => (
                                <li key={i} style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "8px",
                                    padding: "8px 0",
                                    color: "#4b5563",
                                    fontSize: "14px"
                                }}>
                                    <span style={{ color: "#10B981" }}>✓</span>
                                    {feature}
                                </li>
                            ))}
                        </ul>
                        <button
                            onClick={() => handleUpgrade("yearly")}
                            style={{
                                width: "100%",
                                padding: "14px",
                                background: "linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)",
                                color: "white",
                                border: "none",
                                borderRadius: "10px",
                                fontSize: "15px",
                                fontWeight: "600",
                                cursor: "pointer"
                            }}
                        >
                            Upgrade to Premium
                        </button>
                    </div>
                </div>
            </div>

            {/* Extension Request Modal */}
            {showExtensionModal && (
                <div style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: "rgba(0,0,0,0.5)",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    zIndex: 1000
                }}>
                    <div style={{
                        background: "white",
                        borderRadius: "16px",
                        padding: "32px",
                        maxWidth: "480px",
                        width: "90%",
                        maxHeight: "90vh",
                        overflowY: "auto"
                    }}>
                        <h2 style={{ fontSize: "22px", fontWeight: "700", marginBottom: "8px", color: "#1e293b" }}>
                            Request Trial Extension
                        </h2>
                        <p style={{ color: "#64748b", marginBottom: "24px" }}>
                            Need more time to explore? Request a trial extension and our team will review it.
                        </p>

                        <form onSubmit={handleRequestExtension}>
                            <label style={{ display: "block", marginBottom: "16px" }}>
                                <span style={{ fontSize: "14px", fontWeight: "500", color: "#374151" }}>
                                    How many months do you need?
                                </span>
                                <select
                                    value={extensionForm.requestedMonths}
                                    onChange={(e) => setExtensionForm({ ...extensionForm, requestedMonths: parseInt(e.target.value) })}
                                    style={{
                                        width: "100%",
                                        marginTop: "8px",
                                        padding: "12px",
                                        border: "1px solid #E2E8F0",
                                        borderRadius: "8px",
                                        fontSize: "14px",
                                        color: "#1e293b",
                                        backgroundColor: "white"
                                    }}
                                >
                                    {[1, 2, 3, 4, 5, 6].map(m => (
                                        <option key={m} value={m}>{m} month{m > 1 ? "s" : ""}</option>
                                    ))}
                                </select>
                            </label>

                            <label style={{ display: "block", marginBottom: "24px" }}>
                                <span style={{ fontSize: "14px", fontWeight: "500", color: "#374151" }}>
                                    Why do you need an extension? (Optional)
                                </span>
                                <textarea
                                    value={extensionForm.reason}
                                    onChange={(e) => setExtensionForm({ ...extensionForm, reason: e.target.value })}
                                    placeholder="e.g., Still setting up products, exploring features..."
                                    rows={3}
                                    style={{
                                        width: "100%",
                                        marginTop: "8px",
                                        padding: "12px",
                                        border: "1px solid #E2E8F0",
                                        borderRadius: "8px",
                                        fontSize: "14px",
                                        resize: "vertical",
                                        color: "#1e293b",
                                        backgroundColor: "white"
                                    }}
                                />
                            </label>

                            <div style={{ display: "flex", gap: "12px" }}>
                                <button
                                    type="button"
                                    onClick={() => setShowExtensionModal(false)}
                                    style={{
                                        flex: 1,
                                        padding: "12px",
                                        background: "white",
                                        border: "1px solid #E2E8F0",
                                        borderRadius: "8px",
                                        cursor: "pointer",
                                        color: "#374151",
                                        fontSize: "14px",
                                        fontWeight: "500"
                                    }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    style={{
                                        flex: 1,
                                        padding: "12px",
                                        background: "#F59E0B",
                                        color: "white",
                                        border: "none",
                                        borderRadius: "8px",
                                        fontWeight: "600",
                                        cursor: submitting ? "not-allowed" : "pointer",
                                        opacity: submitting ? 0.7 : 1
                                    }}
                                >
                                    {submitting ? "Submitting..." : "Submit Request"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}


        </div>
    );
}

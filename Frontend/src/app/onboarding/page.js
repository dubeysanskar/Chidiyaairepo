"use client";

import { useState } from "react";
import Link from "next/link";

const steps = [
    {
        id: "business-type",
        title: "What's your business type?",
        subtitle: "Help us understand your business better",
        options: [
            { id: "retailer", label: "Retailer", desc: "I sell products to end consumers" },
            { id: "wholesaler", label: "Wholesaler", desc: "I sell products to other businesses" },
            { id: "manufacturer", label: "Manufacturer", desc: "I manufacture products" },
            { id: "exporter", label: "Exporter/Importer", desc: "I deal in international trade" },
            { id: "other", label: "Other", desc: "Something else" }
        ]
    },
    {
        id: "budget",
        title: "What's your monthly sourcing budget?",
        subtitle: "This helps us match you with the right suppliers",
        options: [
            { id: "small", label: "₹50,000 - ₹2 Lakh", desc: "Small scale sourcing" },
            { id: "medium", label: "₹2 Lakh - ₹10 Lakh", desc: "Medium scale sourcing" },
            { id: "large", label: "₹10 Lakh - ₹50 Lakh", desc: "Large scale sourcing" },
            { id: "enterprise", label: "₹50 Lakh+", desc: "Enterprise level" },
            { id: "other", label: "Other", desc: "Specify your budget" }
        ]
    },
    {
        id: "source",
        title: "How did you hear about us?",
        subtitle: "We'd love to know how you found ChidiyaAI",
        options: [
            { id: "google", label: "Google Search", desc: "" },
            { id: "social", label: "Social Media", desc: "" },
            { id: "friend", label: "Friend/Colleague", desc: "" },
            { id: "ad", label: "Advertisement", desc: "" },
            { id: "other", label: "Other", desc: "Tell us more" }
        ]
    },
    {
        id: "products",
        title: "What products are you interested in?",
        subtitle: "Select all that apply",
        multiSelect: true,
        options: [
            { id: "textiles", label: "Textiles & Fabrics", desc: "" },
            { id: "electronics", label: "Electronics", desc: "" },
            { id: "machinery", label: "Machinery & Equipment", desc: "" },
            { id: "packaging", label: "Packaging Materials", desc: "" },
            { id: "chemicals", label: "Chemicals", desc: "" },
            { id: "food", label: "Food & Beverages", desc: "" },
            { id: "other", label: "Other", desc: "Specify your needs" }
        ]
    }
];

export default function Onboarding() {
    const [currentStep, setCurrentStep] = useState(0);
    const [answers, setAnswers] = useState({});
    const [otherInputs, setOtherInputs] = useState({});
    const [selectedMulti, setSelectedMulti] = useState([]);

    const step = steps[currentStep];
    const progress = ((currentStep + 1) / steps.length) * 100;

    const handleSelect = (optionId) => {
        if (step.multiSelect) {
            if (selectedMulti.includes(optionId)) {
                setSelectedMulti(selectedMulti.filter(id => id !== optionId));
            } else {
                setSelectedMulti([...selectedMulti, optionId]);
            }
        } else {
            setAnswers({ ...answers, [step.id]: optionId });
        }
    };

    const handleNext = () => {
        if (step.multiSelect) {
            setAnswers({ ...answers, [step.id]: selectedMulti });
        }

        if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1);
            setSelectedMulti([]);
        } else {
            // Final step - redirect to signup
            window.location.href = "/auth/signup";
        }
    };

    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    const isSelected = (optionId) => {
        if (step.multiSelect) {
            return selectedMulti.includes(optionId);
        }
        return answers[step.id] === optionId;
    };

    const canProceed = () => {
        if (step.multiSelect) {
            return selectedMulti.length > 0;
        }
        return answers[step.id];
    };

    return (
        <div style={{
            minHeight: "100vh",
            backgroundColor: "#f8fafc",
            fontFamily: "'Inter', system-ui, sans-serif"
        }}>
            {/* Header */}
            <header style={{
                padding: "20px 24px",
                backgroundColor: "white",
                borderBottom: "1px solid #e2e8f0",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between"
            }}>
                <Link href="/" style={{ fontWeight: "bold", fontSize: "20px", color: "#0f172a", textDecoration: "none" }}>
                    Chidiya<span style={{ color: "#3b82f6" }}>AI</span>
                </Link>
                <Link href="/" style={{ color: "#64748b", textDecoration: "none", fontSize: "14px" }}>
                    ← Back to home
                </Link>
            </header>

            {/* Progress Bar */}
            <div style={{ backgroundColor: "#e2e8f0", height: "4px" }}>
                <div style={{
                    width: `${progress}%`,
                    height: "100%",
                    backgroundColor: "#3b82f6",
                    transition: "width 0.3s ease"
                }} />
            </div>

            {/* Main Content */}
            <main style={{
                maxWidth: "600px",
                margin: "0 auto",
                padding: "60px 24px"
            }}>
                {/* Step Counter */}
                <div style={{ marginBottom: "32px", textAlign: "center" }}>
                    <span style={{ color: "#64748b", fontSize: "14px" }}>
                        Step {currentStep + 1} of {steps.length}
                    </span>
                </div>

                {/* Question */}
                <div style={{ textAlign: "center", marginBottom: "40px" }}>
                    <h1 style={{ fontSize: "32px", fontWeight: "bold", color: "#0f172a", marginBottom: "12px" }}>
                        {step.title}
                    </h1>
                    <p style={{ color: "#64748b", fontSize: "16px" }}>
                        {step.subtitle}
                    </p>
                </div>

                {/* Options */}
                <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "40px" }}>
                    {step.options.map((option) => (
                        <div key={option.id}>
                            <button
                                onClick={() => handleSelect(option.id)}
                                style={{
                                    width: "100%",
                                    padding: "20px",
                                    backgroundColor: isSelected(option.id) ? "#eff6ff" : "white",
                                    border: isSelected(option.id) ? "2px solid #3b82f6" : "2px solid #e2e8f0",
                                    borderRadius: "12px",
                                    cursor: "pointer",
                                    textAlign: "left",
                                    transition: "all 0.2s ease"
                                }}
                            >
                                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                    <div style={{
                                        width: "24px",
                                        height: "24px",
                                        borderRadius: step.multiSelect ? "6px" : "50%",
                                        border: isSelected(option.id) ? "none" : "2px solid #cbd5e1",
                                        backgroundColor: isSelected(option.id) ? "#3b82f6" : "transparent",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        color: "white",
                                        fontSize: "14px"
                                    }}>
                                        {isSelected(option.id) && "✓"}
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: "600", color: "#0f172a", marginBottom: option.desc ? "4px" : 0 }}>
                                            {option.label}
                                        </div>
                                        {option.desc && (
                                            <div style={{ fontSize: "14px", color: "#64748b" }}>
                                                {option.desc}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </button>

                            {/* Other Input Field */}
                            {option.id === "other" && isSelected("other") && (
                                <div style={{ marginTop: "12px", paddingLeft: "36px" }}>
                                    <input
                                        type="text"
                                        placeholder={
                                            step.id === "budget" ? "Enter your budget range..." :
                                                step.id === "products" ? "What products are you looking for?" :
                                                    "Please specify..."
                                        }
                                        value={otherInputs[step.id] || ""}
                                        onChange={(e) => setOtherInputs({ ...otherInputs, [step.id]: e.target.value })}
                                        style={{
                                            width: "100%",
                                            padding: "14px",
                                            border: "1px solid #e2e8f0",
                                            borderRadius: "8px",
                                            fontSize: "14px",
                                            outline: "none",
                                            boxSizing: "border-box"
                                        }}
                                    />
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Navigation Buttons */}
                <div style={{ display: "flex", gap: "16px" }}>
                    {currentStep > 0 && (
                        <button
                            onClick={handleBack}
                            style={{
                                flex: 1,
                                padding: "16px",
                                backgroundColor: "white",
                                border: "1px solid #e2e8f0",
                                borderRadius: "8px",
                                fontSize: "16px",
                                fontWeight: "500",
                                color: "#0f172a",
                                cursor: "pointer"
                            }}
                        >
                            Back
                        </button>
                    )}
                    <button
                        onClick={handleNext}
                        disabled={!canProceed()}
                        style={{
                            flex: 1,
                            padding: "16px",
                            backgroundColor: canProceed() ? "#0f172a" : "#e2e8f0",
                            border: "none",
                            borderRadius: "8px",
                            fontSize: "16px",
                            fontWeight: "500",
                            color: canProceed() ? "white" : "#94a3b8",
                            cursor: canProceed() ? "pointer" : "not-allowed"
                        }}
                    >
                        {currentStep === steps.length - 1 ? "Create Account" : "Continue"}
                    </button>
                </div>
            </main>
        </div>
    );
}

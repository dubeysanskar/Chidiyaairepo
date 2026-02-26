"use client";

import { useState } from "react";

export default function ScheduleMeetingModal({ isOpen, onClose }) {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        date: "",
        timeSlot: "10:00",
        topic: "",
    });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");
    const [gcalUrl, setGcalUrl] = useState("");

    const timeSlots = [
        "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
        "12:00", "12:30", "14:00", "14:30", "15:00", "15:30",
        "16:00", "16:30", "17:00", "17:30",
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        if (!formData.name || !formData.email || !formData.date || !formData.topic) {
            setError("Please fill all required fields");
            setLoading(false);
            return;
        }

        try {
            const res = await fetch("/api/schedule-meeting", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to schedule");
            setSuccess(true);
            setGcalUrl(data.gcalUrl || "");
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setFormData({ name: "", email: "", phone: "", date: "", timeSlot: "10:00", topic: "" });
        setSuccess(false);
        setError("");
        setGcalUrl("");
        onClose();
    };

    if (!isOpen) return null;

    // Get minimum date (tomorrow)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const minDate = tomorrow.toISOString().split("T")[0];

    const inputStyle = {
        width: "100%", padding: "12px 14px", border: "1px solid #e2e8f0",
        borderRadius: "10px", fontSize: "14px", outline: "none", backgroundColor: "#f8fafc",
        boxSizing: "border-box",
    };
    const labelStyle = { display: "block", fontSize: "13px", fontWeight: "600", color: "#334155", marginBottom: "6px" };

    return (
        <>
            {/* Backdrop */}
            <div
                onClick={handleClose}
                style={{
                    position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)",
                    zIndex: 9998, backdropFilter: "blur(4px)",
                }}
            />

            {/* Modal */}
            <div style={{
                position: "fixed", top: "50%", left: "50%",
                transform: "translate(-50%, -50%)",
                width: "min(480px, 90vw)", maxHeight: "90vh", overflowY: "auto",
                backgroundColor: "white", borderRadius: "16px",
                boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
                zIndex: 9999, padding: "0",
            }}>
                {/* Header */}
                <div style={{
                    padding: "24px 24px 0",
                    display: "flex", justifyContent: "space-between", alignItems: "flex-start",
                }}>
                    <div>
                        <h2 style={{ fontSize: "20px", fontWeight: "700", color: "#0f172a", margin: "0 0 4px" }}>
                            📅 Schedule a Meeting
                        </h2>
                        <p style={{ fontSize: "13px", color: "#64748b", margin: 0 }}>
                            Book a call with our team
                        </p>
                    </div>
                    <button onClick={handleClose} style={{
                        background: "none", border: "none", fontSize: "20px", cursor: "pointer",
                        color: "#94a3b8", padding: "4px",
                    }}>✕</button>
                </div>

                <div style={{ padding: "20px 24px 24px" }}>
                    {success ? (
                        /* Success State */
                        <div style={{ textAlign: "center", padding: "20px 0" }}>
                            <div style={{ fontSize: "48px", marginBottom: "16px" }}>✅</div>
                            <h3 style={{ fontSize: "18px", fontWeight: "600", color: "#0f172a", marginBottom: "8px" }}>
                                Meeting Request Sent!
                            </h3>
                            <p style={{ fontSize: "14px", color: "#64748b", marginBottom: "24px" }}>
                                Our team will confirm your meeting shortly via email.
                            </p>
                            {gcalUrl && (
                                <a href={gcalUrl} target="_blank" rel="noopener noreferrer"
                                    style={{
                                        display: "inline-flex", alignItems: "center", gap: "8px",
                                        backgroundColor: "#3b82f6", color: "white",
                                        padding: "12px 24px", borderRadius: "10px",
                                        textDecoration: "none", fontWeight: "600", fontSize: "14px",
                                        marginBottom: "12px",
                                    }}>
                                    📅 Add to Google Calendar
                                </a>
                            )}
                            <div style={{ marginTop: "12px" }}>
                                <button onClick={handleClose} style={{
                                    padding: "10px 20px", backgroundColor: "#f1f5f9",
                                    border: "none", borderRadius: "8px", cursor: "pointer",
                                    fontSize: "14px", color: "#64748b",
                                }}>
                                    Close
                                </button>
                            </div>
                        </div>
                    ) : (
                        /* Form */
                        <form onSubmit={handleSubmit}>
                            {error && (
                                <div style={{
                                    padding: "10px 14px", backgroundColor: "#fef2f2", border: "1px solid #fecaca",
                                    color: "#dc2626", borderRadius: "8px", fontSize: "13px", marginBottom: "16px",
                                }}>⚠️ {error}</div>
                            )}

                            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                                <div>
                                    <label style={labelStyle}>Your Name *</label>
                                    <input type="text" value={formData.name}
                                        onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                                        placeholder="John Doe" style={inputStyle} />
                                </div>
                                <div>
                                    <label style={labelStyle}>Email *</label>
                                    <input type="email" value={formData.email}
                                        onChange={e => setFormData(p => ({ ...p, email: e.target.value }))}
                                        placeholder="john@example.com" style={inputStyle} />
                                </div>
                                <div>
                                    <label style={labelStyle}>Phone (optional)</label>
                                    <input type="tel" value={formData.phone}
                                        onChange={e => setFormData(p => ({ ...p, phone: e.target.value }))}
                                        placeholder="+91 XXXXX XXXXX" style={inputStyle} />
                                </div>
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                                    <div>
                                        <label style={labelStyle}>Preferred Date *</label>
                                        <input type="date" value={formData.date} min={minDate}
                                            onChange={e => setFormData(p => ({ ...p, date: e.target.value }))}
                                            style={inputStyle} />
                                    </div>
                                    <div>
                                        <label style={labelStyle}>Time Slot *</label>
                                        <select value={formData.timeSlot}
                                            onChange={e => setFormData(p => ({ ...p, timeSlot: e.target.value }))}
                                            style={inputStyle}>
                                            {timeSlots.map(t => {
                                                const [h, m] = t.split(":");
                                                const hour = parseInt(h);
                                                const ampm = hour >= 12 ? "PM" : "AM";
                                                const display = `${hour > 12 ? hour - 12 : hour}:${m} ${ampm}`;
                                                return <option key={t} value={t}>{display}</option>;
                                            })}
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label style={labelStyle}>Topic / Agenda *</label>
                                    <textarea value={formData.topic}
                                        onChange={e => setFormData(p => ({ ...p, topic: e.target.value }))}
                                        placeholder="What would you like to discuss?"
                                        rows={3} style={{ ...inputStyle, resize: "vertical" }} />
                                </div>
                            </div>

                            <button type="submit" disabled={loading}
                                style={{
                                    width: "100%", marginTop: "20px", padding: "14px",
                                    backgroundColor: "#0f172a", color: "white",
                                    border: "none", borderRadius: "10px",
                                    fontWeight: "600", fontSize: "15px",
                                    cursor: loading ? "not-allowed" : "pointer",
                                    opacity: loading ? 0.6 : 1,
                                }}>
                                {loading ? "Sending..." : "Request Meeting →"}
                            </button>

                            <p style={{ fontSize: "11px", color: "#94a3b8", textAlign: "center", marginTop: "12px" }}>
                                Our team will confirm via email within 24 hours
                            </p>
                        </form>
                    )}
                </div>
            </div>
        </>
    );
}

"use client";

import { useState } from "react";

const mockSuppliers = [
    { id: 1, name: "Premium Textile Corp", gst: "27AAACP1234A1ZE", email: "contact@premiumtextile.com", phone: "+91 98765 43210", category: "Textiles", status: "pending", badges: [], documents: ["GST Certificate", "PAN Card"] },
    { id: 2, name: "Excel Manufacturing", gst: "24AABCE5678F1ZK", email: "info@excel.com", phone: "+91 87654 32109", category: "Electronics", status: "approved", badges: ["gst", "premium"], documents: ["GST Certificate"] },
    { id: 3, name: "Quality Fabrics", gst: "27AABCQ1122G1ZM", email: "sales@quality.in", phone: "+91 76543 21098", category: "Textiles", status: "approved", badges: ["gst"], documents: ["GST Certificate"] },
    { id: 4, name: "Fake Corp", gst: "INVALID123", email: "fake@example.com", phone: "+91 11111 11111", category: "Chemicals", status: "suspended", badges: [], documents: [] },
];

const badgeTypes = [
    { id: "gst", label: "GST ✓", color: "#22c55e" },
    { id: "premium", label: "Premium ★", color: "#3b82f6" },
];

const tabs = ["pending", "approved", "suspended", "banned"];

export default function SuppliersPage() {
    const [activeTab, setActiveTab] = useState("pending");
    const [suppliers, setSuppliers] = useState(mockSuppliers);

    const filteredSuppliers = suppliers.filter(s => s.status === activeTab);

    const handleAction = (id, action) => {
        setSuppliers(suppliers.map(s => {
            if (s.id === id) {
                if (action === "approve") return { ...s, status: "approved" };
                if (action === "suspend") return { ...s, status: "suspended" };
                if (action === "restore") return { ...s, status: "approved" };
            }
            return s;
        }));
    };

    return (
        <div>
            <style dangerouslySetInnerHTML={{
                __html: `
                .sup-page { padding: 0; }
                .sup-title { font-size: 24px; font-weight: bold; color: white; margin-bottom: 4px; }
                .sup-tabs { display: flex; gap: 8px; margin-bottom: 20px; overflow-x: auto; padding-bottom: 8px; }
                .sup-tab { padding: 10px 16px; border-radius: 8px; font-size: 14px; white-space: nowrap; cursor: pointer; border: 1px solid #334155; background: #1e293b; color: #94a3b8; }
                .sup-tab.active { background: #3b82f6; border-color: #3b82f6; color: white; }
                .sup-card { background: #1e293b; border-radius: 12px; border: 1px solid #334155; margin-bottom: 16px; overflow: hidden; }
                .sup-card-header { padding: 16px; border-bottom: 1px solid #334155; }
                .sup-card-name { font-size: 18px; font-weight: 600; color: white; margin-bottom: 8px; }
                .sup-card-meta { font-size: 13px; color: #94a3b8; margin-bottom: 12px; }
                .sup-card-badges { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 12px; }
                .sup-card-actions { display: flex; gap: 8px; flex-wrap: wrap; }
                .sup-card-details { padding: 16px; display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; }
                .sup-detail-item { }
                .sup-detail-label { font-size: 11px; color: #64748b; text-transform: uppercase; margin-bottom: 2px; }
                .sup-detail-value { font-size: 14px; color: white; word-break: break-all; }
                .sup-btn { padding: 8px 16px; border-radius: 6px; font-size: 13px; cursor: pointer; border: none; }
                .sup-btn-approve { background: #22c55e; color: white; }
                .sup-btn-reject { background: transparent; color: #ef4444; border: 1px solid #ef4444; }
                .sup-btn-restore { background: #22c55e20; color: #22c55e; border: 1px solid #22c55e; }
                .sup-empty { background: #1e293b; border-radius: 12px; padding: 40px; text-align: center; color: #64748b; }
                
                @media (min-width: 768px) {
                    .sup-title { font-size: 28px; }
                    .sup-card-details { flex-direction: row; gap: 24px; }
                    .sup-detail-item { flex: 1; }
                }
            `}} />

            {/* Header */}
            <div style={{ marginBottom: "20px" }}>
                <h1 className="sup-title">Supplier Management</h1>
                <p style={{ color: "#64748b", fontSize: "14px" }}>Approve, manage, and award badges</p>
            </div>

            {/* Tabs */}
            <div className="sup-tabs">
                {tabs.map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`sup-tab ${activeTab === tab ? "active" : ""}`}
                    >
                        {tab.charAt(0).toUpperCase() + tab.slice(1)} ({suppliers.filter(s => s.status === tab).length})
                    </button>
                ))}
            </div>

            {/* Supplier Cards */}
            {filteredSuppliers.length === 0 ? (
                <div className="sup-empty">No suppliers in this category</div>
            ) : (
                filteredSuppliers.map((supplier) => (
                    <div key={supplier.id} className="sup-card">
                        <div className="sup-card-header">
                            <div className="sup-card-name">{supplier.name}</div>

                            {supplier.badges.length > 0 && (
                                <div className="sup-card-badges">
                                    {supplier.badges.map((badgeId) => {
                                        const badge = badgeTypes.find(b => b.id === badgeId);
                                        return badge ? (
                                            <span key={badgeId} style={{ padding: "3px 10px", backgroundColor: `${badge.color}20`, color: badge.color, borderRadius: "12px", fontSize: "12px" }}>
                                                {badge.label}
                                            </span>
                                        ) : null;
                                    })}
                                </div>
                            )}

                            <div className="sup-card-meta">
                                GST: {supplier.gst} • {supplier.category}
                            </div>

                            <div className="sup-card-actions">
                                {supplier.status === "pending" && (
                                    <>
                                        <button onClick={() => handleAction(supplier.id, "approve")} className="sup-btn sup-btn-approve">Approve</button>
                                        <button onClick={() => handleAction(supplier.id, "suspend")} className="sup-btn sup-btn-reject">Reject</button>
                                    </>
                                )}
                                {(supplier.status === "suspended" || supplier.status === "banned") && (
                                    <button onClick={() => handleAction(supplier.id, "restore")} className="sup-btn sup-btn-restore">Restore</button>
                                )}
                            </div>
                        </div>

                        <div className="sup-card-details">
                            <div className="sup-detail-item">
                                <div className="sup-detail-label">Email</div>
                                <div className="sup-detail-value">{supplier.email}</div>
                            </div>
                            <div className="sup-detail-item">
                                <div className="sup-detail-label">Phone</div>
                                <div className="sup-detail-value">{supplier.phone}</div>
                            </div>
                            <div className="sup-detail-item" style={{ gridColumn: "span 2" }}>
                                <div className="sup-detail-label">Documents</div>
                                <div className="sup-detail-value">{supplier.documents.length > 0 ? supplier.documents.join(", ") : "None"}</div>
                            </div>
                        </div>
                    </div>
                ))
            )}
        </div>
    );
}

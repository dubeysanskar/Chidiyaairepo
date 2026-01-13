"use client";

import Link from "next/link";

const stats = [
    { label: "Pending", value: 12, color: "#f59e0b", icon: "⏳", href: "/admin/suppliers" },
    { label: "Suppliers", value: 156, color: "#22c55e", icon: "🏭", href: "/admin/suppliers" },
    { label: "Flagged", value: 5, color: "#ef4444", icon: "🚩", href: "/admin/buyers" },
    { label: "Inquiries", value: 47, color: "#3b82f6", icon: "📬", href: "/admin/logs" },
];

const recentActivity = [
    { id: 1, message: "Approved: Excel Manufacturing", time: "5 min ago", icon: "✓" },
    { id: 2, message: "AI flagged suspicious buyer", time: "12 min ago", icon: "🚩" },
    { id: 3, message: "Premium badge to Quality Fabrics", time: "1 hour ago", icon: "🏆" },
    { id: 4, message: "Suspended: Fake Corp", time: "2 hours ago", icon: "⛔" },
];

const aiAlerts = [
    { id: 1, severity: "high", title: "Fake supplier detected", desc: "Mismatched GST", action: "Review" },
    { id: 2, severity: "medium", title: "Unusual inquiry pattern", desc: "15 identical inquiries", action: "Check" },
    { id: 3, severity: "low", title: "Documents pending", desc: "3 suppliers waiting 48+ hours", action: "Process" },
];

export default function AdminDashboard() {
    return (
        <div>
            <style dangerouslySetInnerHTML={{
                __html: `
                .dash-title { font-size: 24px; font-weight: bold; color: white; margin-bottom: 4px; }
                .dash-stats { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-bottom: 24px; }
                .dash-stat { background: #1e293b; padding: 16px; border-radius: 12px; border: 1px solid #334155; text-decoration: none; display: block; }
                .dash-stat-icon { font-size: 20px; margin-bottom: 8px; }
                .dash-stat-value { font-size: 28px; font-weight: bold; }
                .dash-stat-label { font-size: 12px; color: #94a3b8; margin-top: 4px; }
                .dash-grid { display: flex; flex-direction: column; gap: 20px; }
                .dash-card { background: #1e293b; border-radius: 16px; border: 1px solid #334155; padding: 20px; }
                .dash-card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
                .dash-card-title { font-size: 18px; font-weight: 600; color: white; }
                .dash-card-badge { padding: 4px 10px; background: #ef444420; color: #ef4444; border-radius: 12px; font-size: 12px; }
                .dash-alert { padding: 14px; background: #0f172a; border-radius: 10px; margin-bottom: 12px; }
                .dash-alert-title { color: white; font-size: 14px; font-weight: 500; margin-bottom: 4px; }
                .dash-alert-desc { color: #64748b; font-size: 13px; margin-bottom: 8px; }
                .dash-alert-btn { padding: 6px 12px; background: #334155; border: none; border-radius: 6px; color: white; font-size: 12px; cursor: pointer; }
                .dash-activity { display: flex; align-items: center; gap: 12px; padding: 12px; background: #0f172a; border-radius: 10px; margin-bottom: 10px; }
                .dash-activity-icon { font-size: 16px; }
                .dash-activity-text { flex: 1; color: white; font-size: 13px; }
                .dash-activity-time { color: #64748b; font-size: 11px; }
                .dash-actions { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-top: 24px; }
                .dash-action { padding: 14px; border-radius: 8px; font-size: 13px; font-weight: 500; text-decoration: none; text-align: center; display: block; }
                
                @media (min-width: 768px) {
                    .dash-title { font-size: 28px; }
                    .dash-stats { grid-template-columns: repeat(4, 1fr); }
                    .dash-grid { flex-direction: row; }
                    .dash-card { flex: 1; }
                    .dash-actions { grid-template-columns: repeat(4, 1fr); }
                }
            `}} />

            {/* Header */}
            <div style={{ marginBottom: "20px" }}>
                <h1 className="dash-title">Dashboard</h1>
                <p style={{ color: "#64748b", fontSize: "14px" }}>Welcome back! Here's what's happening.</p>
            </div>

            {/* Stats - 2 columns mobile, 4 desktop */}
            <div className="dash-stats">
                {stats.map((stat, i) => (
                    <Link key={i} href={stat.href} className="dash-stat">
                        <div className="dash-stat-icon">{stat.icon}</div>
                        <div className="dash-stat-value" style={{ color: stat.color }}>{stat.value}</div>
                        <div className="dash-stat-label">{stat.label}</div>
                    </Link>
                ))}
            </div>

            {/* Main Grid - stacked mobile, side-by-side desktop */}
            <div className="dash-grid">
                {/* AI Alerts */}
                <div className="dash-card">
                    <div className="dash-card-header">
                        <span className="dash-card-title">🤖 AI Alerts</span>
                        <span className="dash-card-badge">{aiAlerts.length} Active</span>
                    </div>
                    {aiAlerts.map((alert) => (
                        <div key={alert.id} className="dash-alert" style={{ borderLeft: `3px solid ${alert.severity === "high" ? "#ef4444" : alert.severity === "medium" ? "#f59e0b" : "#3b82f6"}` }}>
                            <div className="dash-alert-title">{alert.title}</div>
                            <div className="dash-alert-desc">{alert.desc}</div>
                            <button className="dash-alert-btn">{alert.action}</button>
                        </div>
                    ))}
                </div>

                {/* Recent Activity */}
                <div className="dash-card">
                    <div className="dash-card-header">
                        <span className="dash-card-title">📋 Recent Activity</span>
                        <Link href="/admin/logs" style={{ color: "#3b82f6", fontSize: "13px", textDecoration: "none" }}>View All</Link>
                    </div>
                    {recentActivity.map((activity) => (
                        <div key={activity.id} className="dash-activity">
                            <span className="dash-activity-icon">{activity.icon}</span>
                            <span className="dash-activity-text">{activity.message}</span>
                            <span className="dash-activity-time">{activity.time}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Quick Actions - 2 columns mobile, 4 desktop */}
            <div className="dash-actions">
                <Link href="/admin/suppliers" className="dash-action" style={{ background: "#f59e0b20", color: "#f59e0b", border: "1px solid #f59e0b40" }}>Review Suppliers</Link>
                <Link href="/admin/buyers" className="dash-action" style={{ background: "#ef444420", color: "#ef4444", border: "1px solid #ef444440" }}>Check Flagged</Link>
                <Link href="/admin/categories" className="dash-action" style={{ background: "#22c55e20", color: "#22c55e", border: "1px solid #22c55e40" }}>Categories</Link>
                <Link href="/admin/logs" className="dash-action" style={{ background: "#3b82f620", color: "#3b82f6", border: "1px solid #3b82f640" }}>Audit Logs</Link>
            </div>
        </div>
    );
}

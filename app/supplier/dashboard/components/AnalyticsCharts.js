"use client";

import { useState, useMemo } from "react";
import {
    BarChart, Bar, LineChart, Line, AreaChart, Area,
    PieChart, Pie, Cell, RadialBarChart, RadialBar,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";

const COLORS = ["#3b82f6", "#8b5cf6", "#22c55e", "#f59e0b", "#ef4444", "#06b6d4"];

// Chart 1: Inquiries Trend
export function InquiriesTrendChart({ data, chartType = "bar" }) {
    const chartData = useMemo(() => {
        if (!data?.labels || !data?.inquiries) return [];
        return data.labels.map((label, i) => ({
            name: label,
            inquiries: data.inquiries[i] || 0
        }));
    }, [data]);

    if (chartData.length === 0) {
        return <div style={{ textAlign: "center", color: "#64748b", padding: "40px" }}>No data available</div>;
    }

    const renderChart = () => {
        switch (chartType) {
            case "line":
                return (
                    <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#64748b" }} />
                        <YAxis tick={{ fontSize: 12, fill: "#64748b" }} />
                        <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", backgroundColor: "white", color: "#1e293b" }} />
                        <Line type="monotone" dataKey="inquiries" stroke="#3b82f6" strokeWidth={3} dot={{ fill: "#3b82f6", r: 5 }} />
                    </LineChart>
                );
            case "area":
                return (
                    <AreaChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#64748b" }} />
                        <YAxis tick={{ fontSize: 12, fill: "#64748b" }} />
                        <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", backgroundColor: "white", color: "#1e293b" }} />
                        <Area type="monotone" dataKey="inquiries" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                    </AreaChart>
                );
            default: // bar
                return (
                    <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#64748b" }} />
                        <YAxis tick={{ fontSize: 12, fill: "#64748b" }} />
                        <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", backgroundColor: "white", color: "#1e293b" }} />
                        <Bar dataKey="inquiries" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                );
        }
    };

    return (
        <ResponsiveContainer width="100%" height={200}>
            {renderChart()}
        </ResponsiveContainer>
    );
}

// Chart 2: Performance Overview
export function PerformanceChart({ stats, chartType = "progress" }) {
    const data = [
        { name: "Profile Views", value: stats?.profileViews || 0, max: 200, fill: "#3b82f6" },
        { name: "Lead Accept Rate", value: stats?.leadAcceptRate || 0, max: 100, fill: "#22c55e" },
        { name: "Conversion Rate", value: stats?.conversionRate || 0, max: 100, fill: "#f59e0b" }
    ];

    if (chartType === "donut" || chartType === "pie") {
        const pieData = data.map(d => ({ name: d.name, value: d.value || 1 }));
        return (
            <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                    <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={chartType === "donut" ? 50 : 0}
                        outerRadius={80}
                        paddingAngle={2}
                        dataKey="value"
                        label={({ name, value }) => `${value}`}
                    >
                        {pieData.map((entry, index) => (
                            <Cell key={index} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: "white", color: "#1e293b", borderRadius: 8 }} />
                    <Legend />
                </PieChart>
            </ResponsiveContainer>
        );
    }

    if (chartType === "radial") {
        const radialData = data.map((d, i) => ({
            name: d.name,
            value: d.value,
            fill: COLORS[i]
        }));
        return (
            <ResponsiveContainer width="100%" height={200}>
                <RadialBarChart cx="50%" cy="50%" innerRadius="20%" outerRadius="90%" data={radialData}>
                    <RadialBar background dataKey="value" />
                    <Tooltip contentStyle={{ backgroundColor: "white", color: "#1e293b", borderRadius: 8 }} />
                    <Legend iconType="circle" />
                </RadialBarChart>
            </ResponsiveContainer>
        );
    }

    // Default: Progress bars
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {data.map((item, i) => (
                <div key={i}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                        <span style={{ color: "#64748b", fontSize: "14px" }}>{item.name}</span>
                        <span style={{ fontWeight: "600", color: "#1e293b" }}>
                            {item.name.includes("Rate") ? `${item.value}%` : item.value}
                        </span>
                    </div>
                    <div style={{ height: "10px", backgroundColor: "#e2e8f0", borderRadius: "5px", overflow: "hidden" }}>
                        <div
                            style={{
                                width: `${Math.min((item.value / item.max) * 100, 100)}%`,
                                height: "100%",
                                backgroundColor: item.fill,
                                borderRadius: "5px",
                                transition: "width 0.5s ease"
                            }}
                        />
                    </div>
                </div>
            ))}
        </div>
    );
}

// Chart 3: Quotes vs Deals
export function QuotesDealsChart({ data, chartType = "grouped" }) {
    const chartData = useMemo(() => {
        if (!data?.labels || !data?.quotes || !data?.deals) return [];
        return data.labels.map((label, i) => ({
            name: label,
            quotes: data.quotes[i] || 0,
            deals: data.deals[i] || 0
        }));
    }, [data]);

    if (chartData.length === 0) {
        return <div style={{ textAlign: "center", color: "#64748b", padding: "40px" }}>No data available</div>;
    }

    if (chartType === "stacked") {
        return (
            <ResponsiveContainer width="100%" height={200}>
                <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#64748b" }} />
                    <YAxis tick={{ fontSize: 12, fill: "#64748b" }} />
                    <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", backgroundColor: "white", color: "#1e293b" }} />
                    <Legend />
                    <Bar dataKey="quotes" stackId="a" fill="#8b5cf6" radius={[0, 0, 0, 0]} />
                    <Bar dataKey="deals" stackId="a" fill="#22c55e" radius={[4, 4, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
        );
    }

    if (chartType === "comparison" || chartType === "line") {
        return (
            <ResponsiveContainer width="100%" height={200}>
                <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#64748b" }} />
                    <YAxis tick={{ fontSize: 12, fill: "#64748b" }} />
                    <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", backgroundColor: "white", color: "#1e293b" }} />
                    <Legend />
                    <Line type="monotone" dataKey="quotes" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 4 }} />
                    <Line type="monotone" dataKey="deals" stroke="#22c55e" strokeWidth={2} dot={{ r: 4 }} />
                </LineChart>
            </ResponsiveContainer>
        );
    }

    // Default: Grouped bar
    return (
        <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#64748b" }} />
                <YAxis tick={{ fontSize: 12, fill: "#64748b" }} />
                <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", backgroundColor: "white", color: "#1e293b" }} />
                <Legend />
                <Bar dataKey="quotes" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="deals" fill="#22c55e" radius={[4, 4, 0, 0]} />
            </BarChart>
        </ResponsiveContainer>
    );
}

// Chart 4: Category Distribution
export function CategoryDistributionChart({ products, chartType = "pie" }) {
    const chartData = useMemo(() => {
        const categoryCount = {};
        (products || []).forEach(p => {
            // Try category string, then categoryTemplate.name, then product name, then "Other"
            const cat = p.category || p.categoryTemplate?.name || p.name || "Other";
            categoryCount[cat] = (categoryCount[cat] || 0) + 1;
        });
        const total = products?.length || 1;
        return Object.entries(categoryCount).map(([name, count], i) => ({
            name,
            value: count,
            percentage: Math.round((count / total) * 100),
            fill: COLORS[i % COLORS.length]
        }));
    }, [products]);

    if (chartData.length === 0) {
        return <div style={{ textAlign: "center", color: "#64748b", padding: "40px" }}>No products to analyze</div>;
    }

    if (chartType === "bar") {
        return (
            <ResponsiveContainer width="100%" height={200}>
                <BarChart data={chartData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis type="number" tick={{ fontSize: 12, fill: "#64748b" }} />
                    <YAxis dataKey="name" type="category" tick={{ fontSize: 12, fill: "#64748b" }} width={100} />
                    <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", backgroundColor: "white", color: "#1e293b" }} />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                        {chartData.map((entry, index) => (
                            <Cell key={index} fill={entry.fill} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        );
    }

    if (chartType === "treemap") {
        // Fallback to horizontal bar for treemap (can add Treemap later)
        return (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {chartData.map((cat, i) => (
                    <div key={i}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                            <span style={{ fontSize: "13px", color: "#64748b" }}>{cat.name}</span>
                            <span style={{ fontSize: "13px", fontWeight: "600", color: "#1e293b" }}>{cat.percentage}%</span>
                        </div>
                        <div style={{ height: "10px", backgroundColor: "#e2e8f0", borderRadius: "5px", overflow: "hidden" }}>
                            <div style={{
                                width: `${cat.percentage}%`,
                                height: "100%",
                                backgroundColor: cat.fill,
                                borderRadius: "5px",
                                transition: "width 0.5s ease"
                            }} />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    // Pie chart (default)
    return (
        <ResponsiveContainer width="100%" height={200}>
            <PieChart>
                <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    outerRadius={70}
                    dataKey="value"
                    label={({ name, percentage }) => `${name}: ${percentage}%`}
                    labelLine
                >
                    {chartData.map((entry, index) => (
                        <Cell key={index} fill={entry.fill} />
                    ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: "white", color: "#1e293b", borderRadius: 8 }} />
            </PieChart>
        </ResponsiveContainer>
    );
}

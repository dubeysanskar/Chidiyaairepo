import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret-key";

// GET /api/supplier/analytics - Get real analytics data for supplier dashboard
export async function GET(request: NextRequest) {
    try {
        // Get auth token from cookies (same as dashboard API)
        const cookieStore = await cookies();
        const token = cookieStore.get("supplier_token")?.value;

        if (!token) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Verify token
        let supplierId: string;
        try {
            const decoded = jwt.verify(token, JWT_SECRET) as any;
            supplierId = decoded.id;
        } catch {
            return NextResponse.json({ error: "Invalid token" }, { status: 401 });
        }

        // Get query params
        const { searchParams } = new URL(request.url);
        const period = searchParams.get("period") || "monthly"; // weekly, monthly, sixMonths, yearly
        const category = searchParams.get("category") || "all";
        const product = searchParams.get("product") || "all";

        // Calculate date range based on period
        const now = new Date();
        let startDate: Date;
        let groupBy: 'day' | 'week' | 'month' = 'week';

        switch (period) {
            case "weekly":
                startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                groupBy = 'day';
                break;
            case "biweekly":
                startDate = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
                groupBy = 'day';
                break;
            case "monthly":
                startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                groupBy = 'week';
                break;
            case "quarterly":
                startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
                groupBy = 'week';
                break;
            case "sixMonths":
                startDate = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);
                groupBy = 'month';
                break;
            case "yearly":
                startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
                groupBy = 'month';
                break;
            default:
                startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        }

        // Build where clause for category/product filters
        const inquiryWhere: any = {
            supplierId,
            createdAt: { gte: startDate }
        };

        if (category !== "all") {
            inquiryWhere.category = { name: category };
        }

        if (product !== "all") {
            inquiryWhere.product = { contains: product, mode: "insensitive" };
        }

        // Fetch all inquiries for this supplier in the time range
        const inquiries = await prisma.inquiry.findMany({
            where: inquiryWhere,
            include: {
                quotes: {
                    where: { supplierId }
                },
                category: true
            },
            orderBy: { createdAt: 'asc' }
        });

        // Fetch quotes by this supplier
        const quotes = await prisma.quote.findMany({
            where: {
                supplierId,
                createdAt: { gte: startDate }
            },
            orderBy: { createdAt: 'asc' }
        });

        // Count profile views (from SupplierContactLog)
        const profileViews = await prisma.supplierContactLog.count({
            where: {
                supplierId,
                viewedAt: { gte: startDate }
            }
        });

        // Calculate totals
        const totalInquiries = inquiries.length;
        const totalQuotes = quotes.length;
        const acceptedQuotes = quotes.filter(q => q.status === "accepted").length;
        const conversionRate = totalQuotes > 0 ? Math.round((acceptedQuotes / totalQuotes) * 100) : 0;

        // Calculate lead accept rate (quotes submitted vs inquiries received)
        const leadAcceptRate = totalInquiries > 0 ? Math.round((totalQuotes / totalInquiries) * 100) : 0;

        // Generate time series data
        const labels: string[] = [];
        const inquiriesData: number[] = [];
        const quotesData: number[] = [];
        const dealsData: number[] = [];

        // Group data by time period
        if (groupBy === 'day') {
            // For weekly/biweekly - group by day
            const days = period === 'weekly' ? 7 : 14;
            for (let i = days - 1; i >= 0; i--) {
                const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
                const dayStart = new Date(date.setHours(0, 0, 0, 0));
                const dayEnd = new Date(date.setHours(23, 59, 59, 999));

                labels.push(dayStart.toLocaleDateString('en-US', { weekday: 'short' }));
                inquiriesData.push(inquiries.filter(inq =>
                    new Date(inq.createdAt) >= dayStart && new Date(inq.createdAt) <= dayEnd
                ).length);
                quotesData.push(quotes.filter(q =>
                    new Date(q.createdAt) >= dayStart && new Date(q.createdAt) <= dayEnd
                ).length);
                dealsData.push(quotes.filter(q =>
                    q.status === 'accepted' && new Date(q.createdAt) >= dayStart && new Date(q.createdAt) <= dayEnd
                ).length);
            }
        } else if (groupBy === 'week') {
            // For monthly/quarterly - group by week
            const weeks = period === 'monthly' ? 4 : 12;
            for (let i = weeks - 1; i >= 0; i--) {
                const weekEnd = new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000);
                const weekStart = new Date(weekEnd.getTime() - 7 * 24 * 60 * 60 * 1000);

                labels.push(`Week ${weeks - i}`);
                inquiriesData.push(inquiries.filter(inq =>
                    new Date(inq.createdAt) >= weekStart && new Date(inq.createdAt) <= weekEnd
                ).length);
                quotesData.push(quotes.filter(q =>
                    new Date(q.createdAt) >= weekStart && new Date(q.createdAt) <= weekEnd
                ).length);
                dealsData.push(quotes.filter(q =>
                    q.status === 'accepted' && new Date(q.createdAt) >= weekStart && new Date(q.createdAt) <= weekEnd
                ).length);
            }
        } else {
            // For sixMonths/yearly - group by month
            const months = period === 'sixMonths' ? 6 : 12;
            for (let i = months - 1; i >= 0; i--) {
                const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
                const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);

                labels.push(monthDate.toLocaleDateString('en-US', { month: 'short' }));
                inquiriesData.push(inquiries.filter(inq => {
                    const d = new Date(inq.createdAt);
                    return d.getMonth() === monthDate.getMonth() && d.getFullYear() === monthDate.getFullYear();
                }).length);
                quotesData.push(quotes.filter(q => {
                    const d = new Date(q.createdAt);
                    return d.getMonth() === monthDate.getMonth() && d.getFullYear() === monthDate.getFullYear();
                }).length);
                dealsData.push(quotes.filter(q => {
                    const d = new Date(q.createdAt);
                    return q.status === 'accepted' && d.getMonth() === monthDate.getMonth() && d.getFullYear() === monthDate.getFullYear();
                }).length);
            }
        }

        // Get category distribution
        const categoryCount: Record<string, number> = {};
        inquiries.forEach(inq => {
            const cat = inq.category?.name || inq.product || "Other";
            categoryCount[cat] = (categoryCount[cat] || 0) + 1;
        });

        const categoryDistribution = Object.entries(categoryCount).map(([name, count]) => ({
            name,
            count,
            percentage: totalInquiries > 0 ? Math.round((count / totalInquiries) * 100) : 0
        }));

        return NextResponse.json({
            success: true,
            stats: {
                totalInquiries,
                totalQuotes,
                acceptedDeals: acceptedQuotes,
                conversionRate,
                profileViews,
                leadAcceptRate
            },
            chartData: {
                labels,
                inquiries: inquiriesData,
                quotes: quotesData,
                deals: dealsData
            },
            categoryDistribution,
            period,
            startDate: startDate.toISOString(),
            endDate: now.toISOString()
        });

    } catch (error) {
        console.error("Analytics API error:", error);
        return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 });
    }
}

import { NextResponse } from "next/server";

// ============================================
// GST Lookup API — Mock provider (swap for ClearTax/MastersIndia later)
// ============================================

// In-memory cache: GSTIN -> { data, timestamp }
const gstCache = new Map<string, { data: GSTResult; timestamp: number }>();
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

// Rate limiting: IP -> { count, windowStart }
const rateLimitMap = new Map<string, { count: number; windowStart: number }>();
const RATE_LIMIT = 5; // max lookups per window
const RATE_WINDOW = 60 * 1000; // 1 minute

interface GSTResult {
    legalName: string;
    gstStatus: string;
    registeredOn: string;
    principalPlace: string;
    stateCode: string;
    businessType: string;
    registeredEmail: string;
}

// Validate GSTIN format: 15 chars, specific pattern
function isValidGSTIN(gstin: string): boolean {
    const pattern = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    return pattern.test(gstin.toUpperCase());
}

// Mock GST provider — simulates real API behavior
// Replace this function body with ClearTax/MastersIndia API call in production
async function fetchGSTProfile(gstin: string): Promise<GSTResult | null> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));

    // Extract state code from GSTIN (first 2 digits)
    const stateCode = gstin.substring(0, 2);
    const stateMap: Record<string, string> = {
        "01": "Jammu & Kashmir", "02": "Himachal Pradesh", "03": "Punjab",
        "04": "Chandigarh", "05": "Uttarakhand", "06": "Haryana",
        "07": "Delhi", "08": "Rajasthan", "09": "Uttar Pradesh",
        "10": "Bihar", "11": "Sikkim", "12": "Arunachal Pradesh",
        "13": "Nagaland", "14": "Manipur", "15": "Mizoram",
        "16": "Tripura", "17": "Meghalaya", "18": "Assam",
        "19": "West Bengal", "20": "Jharkhand", "21": "Odisha",
        "22": "Chhattisgarh", "23": "Madhya Pradesh", "24": "Gujarat",
        "27": "Maharashtra", "29": "Karnataka", "32": "Kerala",
        "33": "Tamil Nadu", "36": "Telangana", "37": "Andhra Pradesh",
    };

    const state = stateMap[stateCode] || "Unknown State";

    // Simulate a "not found" for specific test patterns
    if (gstin.includes("00000")) {
        return null; // Not found
    }

    // Generate mock business profile from GSTIN
    const businessTypes = ["Private Limited Company", "Partnership", "Proprietorship", "LLP"];
    const businessType = businessTypes[parseInt(gstin.charAt(4)) % businessTypes.length];

    // Generate a plausible company name from the PAN portion of GSTIN
    const panPart = gstin.substring(2, 12);
    const companyPrefixes = ["Enterprises", "Industries", "Trading Co", "Pvt Ltd", "Solutions"];
    const prefix = companyPrefixes[parseInt(gstin.charAt(10)) % companyPrefixes.length];

    const legalName = `${panPart.substring(0, 5)} ${prefix}`;

    // Generate a plausible registered email from PAN portion
    // In production, this comes from real GST API
    const emailName = legalName.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '');
    const registeredEmail = `${emailName}@gst-registered.example.com`;

    return {
        legalName,
        gstStatus: "Active",
        registeredOn: `${2015 + (parseInt(gstin.charAt(3)) % 8)}-01-15`,
        principalPlace: `${state}`,
        stateCode,
        businessType,
        registeredEmail,
    };
}

export async function POST(req: Request) {
    try {
        // Rate limiting
        const clientIP = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
        const now = Date.now();

        const rateEntry = rateLimitMap.get(clientIP);
        if (rateEntry) {
            if (now - rateEntry.windowStart < RATE_WINDOW) {
                if (rateEntry.count >= RATE_LIMIT) {
                    return NextResponse.json(
                        { error: "Too many requests. Please wait a minute and try again." },
                        { status: 429 }
                    );
                }
                rateEntry.count++;
            } else {
                rateLimitMap.set(clientIP, { count: 1, windowStart: now });
            }
        } else {
            rateLimitMap.set(clientIP, { count: 1, windowStart: now });
        }

        const { gstin } = await req.json();

        if (!gstin || typeof gstin !== "string") {
            return NextResponse.json(
                { error: "GSTIN is required" },
                { status: 400 }
            );
        }

        const normalizedGSTIN = gstin.trim().toUpperCase();

        if (!isValidGSTIN(normalizedGSTIN)) {
            return NextResponse.json(
                { error: "Invalid GSTIN format. Must be 15 characters (e.g., 22AAAAA0000A1Z5)" },
                { status: 400 }
            );
        }

        // Check cache
        const cached = gstCache.get(normalizedGSTIN);
        if (cached && (now - cached.timestamp) < CACHE_TTL) {
            return NextResponse.json({
                success: true,
                cached: true,
                data: cached.data,
            });
        }

        // Fetch from provider
        const result = await fetchGSTProfile(normalizedGSTIN);

        if (!result) {
            return NextResponse.json({
                success: false,
                error: "GSTIN not found. Check the number and try again.",
            });
        }

        // Cache result
        gstCache.set(normalizedGSTIN, { data: result, timestamp: now });

        return NextResponse.json({
            success: true,
            cached: false,
            data: result,
        });

    } catch (error: any) {
        console.error("GST Lookup Error:", error?.message || error);
        return NextResponse.json(
            { error: "Failed to lookup GST details" },
            { status: 500 }
        );
    }
}

import { NextRequest, NextResponse } from "next/server";
import {
    generateChatResponse,
    shouldFetchSuppliers,
    ChatMessage,
    UserRequirements,
    CategoryContext,
    CategorySpec,
    extractProvidedSpecs,
    matchCategory,
    getMissingSpecs
} from "@/lib/gemini";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";

const DAILY_QUERY_LIMIT = 3;

interface SupplierResult {
    id: string;
    companyName: string;
    city: string;
    state?: string;
    productCategories: string[];
    moq?: string;
    badges: string[];
    phone?: string;
    description?: string;
    matchScore: number;
    rating: number;
    price: string;
    priceUnit: string;
}

// Calculate match score based on requirements
function calculateMatchScore(supplier: {
    city?: string | null;
    productCategories: string[];
    badges: string[];
}, requirements: UserRequirements | undefined, matchedCategory?: CategoryContext): number {
    const categoryName = matchedCategory?.name || requirements?.category || "";

    // Check if supplier matches the requested category
    const hasCategory = categoryName ? supplier.productCategories?.some(cat => {
        const catLower = cat.toLowerCase();
        const reqLower = categoryName.toLowerCase();
        // Check for partial matches in both directions
        return catLower.includes(reqLower) ||
            reqLower.includes(catLower) ||
            // Also check common keywords
            reqLower.split(' ').some(word => word.length > 3 && catLower.includes(word));
    }) : true;

    // If category doesn't match at all, return 0 - don't show irrelevant suppliers
    if (categoryName && !hasCategory) {
        return 0;
    }

    let score = 60; // Base score for approved suppliers with matching category

    // Location match - important (+25)
    if (requirements?.location && supplier.city) {
        const locationMatch = supplier.city.toLowerCase().includes(requirements.location.toLowerCase()) ||
            requirements.location.toLowerCase().includes(supplier.city.toLowerCase());
        if (locationMatch) score += 25;
    }

    // Badges bonus (up to +15)
    if (supplier.badges) {
        if (supplier.badges.includes("verified")) score += 5;
        if (supplier.badges.includes("gst")) score += 5;
        if (supplier.badges.includes("premium")) score += 5;
    }

    return Math.min(score, 100);
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const {
            message,
            conversationHistory = [],
            userRequirements,
            messageCount = 0,
            sessionId  // Accept sessionId from frontend
        }: {
            message: string;
            conversationHistory: ChatMessage[];
            userRequirements?: UserRequirements;
            messageCount?: number;
            sessionId?: string;  // Optional session ID
        } = body;

        if (!message) {
            return NextResponse.json({ error: "Message is required" }, { status: 400 });
        }

        // Get user session for query tracking
        let buyerId: string | null = null;
        let isSubscribed = false;
        const session = await getServerSession();
        if (session?.user?.email) {
            const buyer = await prisma.buyer.findUnique({
                where: { email: session.user.email },
            });
            buyerId = buyer?.id || null;
            const buyerAny = buyer as { isSubscribed?: boolean; subscriptionExpiry?: Date } | null;
            if (buyerAny?.isSubscribed && buyerAny?.subscriptionExpiry && buyerAny.subscriptionExpiry > new Date()) {
                isSubscribed = true;
            }
        }

        // Check daily query limit (skip for subscribed users)
        if (buyerId && !isSubscribed) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const queriesToday = await prisma.chatSession.count({
                where: {
                    buyerId,
                    createdAt: { gte: today },
                },
            });

            if (queriesToday >= DAILY_QUERY_LIMIT) {
                return NextResponse.json({
                    success: false,
                    limitExceeded: true,
                    response: "You've reached your daily query limit (3 queries per day). Subscribe for unlimited access!",
                    queriesUsed: queriesToday,
                    limit: DAILY_QUERY_LIMIT,
                });
            }
        }

        // Save user message to database if sessionId is provided
        if (sessionId && buyerId) {
            try {
                await prisma.chatMessage.create({
                    data: {
                        sessionId,
                        role: "user",
                        content: message,
                    },
                });
            } catch (msgError) {
                console.error("Failed to save user message:", msgError);
            }
        }


        // Fetch category templates from database for smart matching
        const categoryTemplates = await prisma.categoryTemplate.findMany({
            where: { isActive: true },
            select: {
                id: true,
                name: true,
                slug: true,
                description: true,
                specifications: true,
                commonNames: true,
            },
        });

        // Convert DB data to CategoryContext format
        const categories: CategoryContext[] = categoryTemplates.map(cat => ({
            name: cat.name,
            slug: cat.slug,
            description: cat.description || undefined,
            commonNames: cat.commonNames || [],
            specifications: (cat.specifications as unknown as CategorySpec[]) || [],
        }));

        // Match user's message to a category
        const fullConversation = conversationHistory.map(m => m.content).join(" ") + " " + message;
        const matchedCategory = matchCategory(fullConversation, categories);

        // Extract specifications user has already provided
        let providedSpecs: { key: string; value: string }[] = [];
        let missingSpecs: CategorySpec[] = [];

        if (matchedCategory) {
            providedSpecs = extractProvidedSpecs(fullConversation, matchedCategory.specifications);
            missingSpecs = getMissingSpecs(providedSpecs, matchedCategory.specifications);
        }

        let supplierData: string | undefined;
        let suppliers: SupplierResult[] = [];

        // Check if we should fetch suppliers from database
        if (shouldFetchSuppliers(messageCount, message, providedSpecs, missingSpecs)) {
            try {
                // Build query based on user requirements and matched category
                const whereClause: Record<string, unknown> = {
                    status: "approved",
                };

                const categoryName = matchedCategory?.name || userRequirements?.category;
                if (categoryName) {
                    whereClause.productCategories = {
                        hasSome: [categoryName],
                    };
                }

                if (userRequirements?.location) {
                    whereClause.city = {
                        contains: userRequirements.location,
                        mode: "insensitive",
                    };
                }

                // Fetch suppliers with their products
                const [exactMatchPromise, broadMatchPromise] = [
                    prisma.supplier.findMany({
                        where: whereClause,
                        take: 10,
                        orderBy: { createdAt: "desc" },
                        select: {
                            id: true,
                            companyName: true,
                            city: true,
                            state: true,
                            productCategories: true,
                            moq: true,
                            badges: true,
                            phone: true,
                            description: true,
                            products: {
                                where: { isActive: true },
                                take: 5,
                                select: {
                                    price: true,
                                    priceUnit: true,
                                    moq: true,
                                },
                            },
                        },
                    }),
                    prisma.supplier.findMany({
                        where: { status: "approved" },
                        take: 10,
                        select: {
                            id: true,
                            companyName: true,
                            city: true,
                            state: true,
                            productCategories: true,
                            moq: true,
                            badges: true,
                            phone: true,
                            description: true,
                            products: {
                                where: { isActive: true },
                                take: 5,
                                select: {
                                    price: true,
                                    priceUnit: true,
                                    moq: true,
                                },
                            },
                        },
                    }),
                ];

                const dbSuppliers = await exactMatchPromise;
                // Combine and deduplicate suppliers
                const broadSuppliers = await broadMatchPromise;
                const allSuppliers = dbSuppliers.length > 0 ? dbSuppliers : broadSuppliers;

                // Filter to only include suppliers that actually match the category
                const rawSuppliers = allSuppliers.filter(s => {
                    if (!categoryName) return true;
                    const catLower = categoryName.toLowerCase();
                    return s.productCategories?.some(pc => {
                        const pcLower = pc.toLowerCase();
                        return pcLower.includes(catLower) ||
                            catLower.includes(pcLower) ||
                            catLower.split(' ').some(word => word.length > 3 && pcLower.includes(word));
                    });
                });

                // Map supplier data with actual pricing from products
                suppliers = rawSuppliers
                    .map(s => {
                        const matchScore = calculateMatchScore(s, userRequirements, matchedCategory ?? undefined);
                        const rating = Math.min(5, 3.5 + (matchScore / 66));

                        // Get actual price from products if available
                        const productWithPrice = s.products.find(p => p.price);
                        const price = productWithPrice?.price
                            ? `₹${productWithPrice.price}`
                            : `₹${Math.floor(Math.random() * 40) + 5}`;
                        const priceUnit = productWithPrice?.priceUnit || "piece";
                        const moq = productWithPrice?.moq || s.moq || `${(Math.floor(Math.random() * 10) + 1) * 100} pcs`;

                        return {
                            id: s.id,
                            companyName: s.companyName,
                            city: s.city || "India",
                            state: s.state || undefined,
                            productCategories: s.productCategories,
                            moq,
                            badges: s.badges,
                            phone: s.phone || undefined,
                            description: s.description || undefined,
                            matchScore,
                            rating: Math.round(rating * 10) / 10,
                            price,
                            priceUnit,
                        };
                    })
                    .filter(s => s.matchScore > 0) // Remove suppliers with no category match
                    .sort((a, b) => {
                        if (b.matchScore !== a.matchScore) return b.matchScore - a.matchScore;
                        if (b.rating !== a.rating) return b.rating - a.rating;
                        const priceA = parseInt(a.price.replace(/[₹,]/g, ""));
                        const priceB = parseInt(b.price.replace(/[₹,]/g, ""));
                        return priceA - priceB;
                    })
                    .slice(0, 5);

                if (suppliers.length > 0) {
                    supplierData = suppliers.map((s, index) =>
                        `${index + 1}. ${s.companyName} – ${s.city} – ${s.badges.join(", ")}`
                    ).join("\n");
                }
            } catch (dbError) {
                console.error("Database query error:", dbError);
            }
        }

        // Generate AI response with category context
        const aiResponse = await generateChatResponse(
            message,
            conversationHistory,
            userRequirements,
            supplierData,
            {
                categories,
                matchedCategory: matchedCategory ?? undefined,
                providedSpecs,
                missingSpecs,
            }
        );

        // Save AI response to database if sessionId is provided
        if (sessionId && buyerId) {
            try {
                await prisma.chatMessage.create({
                    data: {
                        sessionId,
                        role: "assistant",
                        content: aiResponse,
                    },
                });
            } catch (msgError) {
                console.error("Failed to save assistant message:", msgError);
            }
        }

        return NextResponse.json({
            success: true,
            response: aiResponse,
            hasSuppliers: suppliers.length > 0,
            suppliers: suppliers.length > 0 ? suppliers : undefined,
            matchedCategory: matchedCategory?.name,
            providedSpecs,
            missingSpecs: missingSpecs.map(s => s.name),
        });
    } catch (error) {
        console.error("Chat API Error:", error);
        return NextResponse.json(
            { error: "Failed to process chat message" },
            { status: 500 }
        );
    }
}

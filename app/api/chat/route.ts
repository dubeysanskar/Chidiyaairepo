import { NextRequest, NextResponse } from "next/server";
import {
    generateChatResponse,
    shouldFetchSuppliers,
    ChatMessage,
    UserRequirements,
    CategoryContext,
    CategorySpec,
    ProductContext,
    extractProvidedSpecs,
    matchCategory,
    getMissingSpecs
} from "@/lib/gemini";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";

const DAILY_QUERY_LIMIT = 5;

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
    rating: number | null;
    price: string;
    priceUnit: string;
}

// Calculate match score based on requirements — STRICT category-first scoring
function calculateMatchScore(supplier: {
    city?: string | null;
    productCategories: string[];
    badges: string[];
    hasProducts?: boolean;
    hasRealPrice?: boolean;
}, requirements: UserRequirements | undefined, matchedCategory?: CategoryContext): number {
    const categoryName = matchedCategory?.name || requirements?.category || "";

    // STRICT: If category is specified, supplier MUST have it
    if (!categoryName) return 0; // No category = no results

    const hasExactCategory = supplier.productCategories?.some(cat => {
        const catLower = cat.toLowerCase().trim();
        const reqLower = categoryName.toLowerCase().trim();
        return catLower === reqLower || catLower.includes(reqLower) || reqLower.includes(catLower);
    });

    if (!hasExactCategory) return 0; // No category match = 0, never show

    let score = 40; // Base: has matching category (40%)

    // Location match (+25)
    if (requirements?.location && supplier.city) {
        const supplierCity = supplier.city.toLowerCase().trim();
        const reqLocation = requirements.location.toLowerCase().trim();
        if (supplierCity.includes(reqLocation) || reqLocation.includes(supplierCity)) {
            score += 25;
        }
    }

    // Has real products listed (+15)
    if (supplier.hasProducts) score += 15;

    // Has real pricing (+10)
    if (supplier.hasRealPrice) score += 10;

    // Badges bonus (up to +10)
    if (supplier.badges) {
        if (supplier.badges.includes("verified")) score += 4;
        if (supplier.badges.includes("gst")) score += 3;
        if (supplier.badges.includes("premium")) score += 3;
    }

    return Math.min(score, 95); // Cap at 95 — 100 is reserved for perfect verified matches
}

// Detect if user is asking for a specific product/category
function detectProductMention(message: string, fullConversation?: string): boolean {
    const textToCheck = (fullConversation || message).toLowerCase();
    const currentMessage = message.toLowerCase();

    // Patterns that indicate user is looking for a specific product
    const productPatterns = [
        /looking\s+for\s+\w+/i,
        /need\s+\w+/i,
        /want\s+\w+/i,
        /require\s+\w+/i,
        /searching\s+for\s+\w+/i,
        /find\s+\w+/i,
        /i\s+need\s+\w+/i,
        /i\s+want\s+\w+/i,
        /in\s+bulk/i,
        /bulk\s+quantity/i,
        /cheap\s+and\s+bulk/i,
    ];

    // Check for product-related patterns in full conversation
    const hasProductPattern = productPatterns.some(pattern => pattern.test(textToCheck));

    // Also check for common product-related words
    const productWords = ['supplier', 'suppliers', 'manufacturer', 'vendor', 'buy', 'purchase', 'order', 'bulk', 'wholesale'];
    const hasProductWord = productWords.some(word => textToCheck.includes(word));

    // Check if user is asking to see results (should trigger showing what we have)
    const wantsResults = /show\s+(me\s+)?results?/i.test(currentMessage) ||
        /what\s+do\s+you\s+have/i.test(currentMessage) ||
        /no\s+(not)?\s*(currently)?/i.test(currentMessage);

    // Check if message contains specific product-like nouns (not just greetings)
    const greetings = ['hi', 'hello', 'hey', 'good morning', 'good evening', 'thanks', 'thank you'];
    const isJustGreeting = greetings.some(g => currentMessage.trim() === g || currentMessage.trim().startsWith(g + ' '));

    return (hasProductPattern || hasProductWord || wantsResults) && !isJustGreeting;
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const {
            message,
            conversationHistory = [],
            userRequirements,
            messageCount = 0
        }: {
            message: string;
            conversationHistory: ChatMessage[];
            userRequirements?: UserRequirements;
            messageCount?: number;
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
                    response: `You've reached your daily query limit (${DAILY_QUERY_LIMIT} queries per day). Subscribe for unlimited access!`,
                    queriesUsed: queriesToday,
                    limit: DAILY_QUERY_LIMIT,
                });
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

        // Detect if user mentioned a specific product/category that doesn't exist in our DB
        const userMentionedProduct = detectProductMention(message, fullConversation);
        const categoryNotFound = userMentionedProduct && !matchedCategory;


        // Get list of available category names for guidance
        const availableCategories = categories.map(c => c.name);

        // Only fetch suppliers if we have a matching category (or no specific category mentioned)
        // Don't fetch if user asked for something we don't have
        // FIXED: Also require a valid matchedCategory - no suppliers for greetings/gibberish
        const canFetchSuppliers = matchedCategory && !categoryNotFound && shouldFetchSuppliers(messageCount, message, providedSpecs, missingSpecs);

        if (canFetchSuppliers) {

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

                // Fetch suppliers — ONLY exact category matches, NO broad fallback
                const dbSuppliers = await prisma.supplier.findMany({
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
                            take: 10,
                            select: {
                                name: true,
                                price: true,
                                priceUnit: true,
                                moq: true,
                                specifications: true,
                            },
                        },
                    },
                });

                // Strict filtering: only suppliers whose categories actually match
                const rawSuppliers = categoryName
                    ? dbSuppliers.filter(s => {
                        const catLower = categoryName.toLowerCase().trim();
                        return s.productCategories?.some(pc => {
                            const pcLower = pc.toLowerCase().trim();
                            return pcLower === catLower || pcLower.includes(catLower) || catLower.includes(pcLower);
                        });
                    })
                    : []; // No category = no results

                // Map supplier data — NO fake prices or ratings
                suppliers = rawSuppliers
                    .map(s => {
                        const productWithPrice = s.products.find(p => p.price);
                        const hasProducts = s.products.length > 0;
                        const hasRealPrice = !!productWithPrice?.price;

                        const matchScore = calculateMatchScore(
                            { ...s, hasProducts, hasRealPrice },
                            userRequirements,
                            matchedCategory ?? undefined
                        );

                        // Real price only — no fake random prices
                        const price = hasRealPrice
                            ? `₹${productWithPrice.price}`
                            : "Contact for pricing";
                        const priceUnit = productWithPrice?.priceUnit || "piece";
                        const moq = productWithPrice?.moq || s.moq || "Contact for MOQ";

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
                            rating: null, // Only show real ratings when available
                            price,
                            priceUnit,
                        };
                    })
                    .filter(s => s.matchScore > 0)
                    .sort((a, b) => b.matchScore - a.matchScore)
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

        // Build product catalog for AI context
        let productCatalog: ProductContext[] = [];
        if (matchedCategory) {
            try {
                const catalogProducts = await prisma.product.findMany({
                    where: {
                        isActive: true,
                        supplier: { status: "approved" },
                        OR: [
                            { categoryTemplate: { name: matchedCategory.name } },
                            { category: { contains: matchedCategory.name, mode: "insensitive" } },
                        ],
                    },
                    take: 15,
                    select: {
                        name: true,
                        price: true,
                        priceUnit: true,
                        moq: true,
                        specifications: true,
                        supplier: {
                            select: {
                                companyName: true,
                                city: true,
                                badges: true,
                            },
                        },
                    },
                });

                productCatalog = catalogProducts.map(p => ({
                    name: p.name,
                    price: p.price || undefined,
                    priceUnit: p.priceUnit || undefined,
                    moq: p.moq || undefined,
                    specifications: (p.specifications && typeof p.specifications === 'object' && !Array.isArray(p.specifications))
                        ? p.specifications as Record<string, string>
                        : undefined,
                    supplierName: p.supplier.companyName,
                    supplierCity: p.supplier.city || "India",
                    supplierBadges: p.supplier.badges || [],
                }));
            } catch (catalogError) {
                console.error("Product catalog fetch error:", catalogError);
            }
        }

        // Generate AI response with category context
        const aiResponse = await generateChatResponse(
            message,
            conversationHistory,
            userRequirements,
            categoryNotFound ? undefined : supplierData, // Don't pass suppliers if category not found
            {
                categories,
                matchedCategory: matchedCategory ?? undefined,
                providedSpecs,
                missingSpecs,
                categoryNotFound,
                availableCategories,
                productCatalog,
            }
        );

        // IMPORTANT: When category not found, NEVER return suppliers
        const shouldShowSuppliers = !categoryNotFound && suppliers.length > 0;

        return NextResponse.json({
            success: true,
            response: aiResponse,
            hasSuppliers: shouldShowSuppliers,
            suppliers: shouldShowSuppliers ? suppliers : undefined,
            matchedCategory: matchedCategory?.name,
            categoryNotFound,
            availableCategories: categoryNotFound ? availableCategories : undefined,
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

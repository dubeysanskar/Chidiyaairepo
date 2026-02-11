import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { prisma } from "@/lib/prisma";

// Use main API key first, fall back to helper key
const HELPER_API_KEY = process.env.GEMINI_API_KEY || process.env.GEMINI_HELPER_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";
const ai = new GoogleGenAI({ apiKey: HELPER_API_KEY });

// Build system prompt for helper bot
function buildHelperSystemPrompt(categories: Array<{ name: string; description?: string | null }>, products: string[]): string {
    const categoryList = categories.map(c => `- ${c.name}${c.description ? `: ${c.description}` : ''}`).join('\n');
    const productList = products.slice(0, 20).join(', ');

    return `You are Chidiya, a friendly product guide for Indian B2B buyers on ChidiyaAI platform.

PERSONALITY:
- Warm, helpful, and conversational - like a knowledgeable friend
- Use simple everyday language
- Understand Indian business terms and local product names

YOUR ROLE:
- Explain product categories and what they include
- Help users understand product specifications and terminology
- Guide users to explore what categories we offer
- Answer general questions about products

PRODUCT TERMINOLOGY TO EXPLAIN:
- PLY (3PLY, 5PLY, 7PLY): Number of layers in corrugated boxes. More PLY = stronger box
- GSM: Grams per Square Meter - measures paper/fabric thickness
- MOQ: Minimum Order Quantity
- Food-grade: Safe for food contact
- BIS certified: Bureau of Indian Standards approved

INDIAN PRODUCT NAMES YOU SHOULD KNOW:
- Thermocol = Expanded Polystyrene/Styrofoam
- Dabbe/Dabba = Boxes/Containers
- Polythene/Polythin = Plastic bags/sheets
- Kagaz = Paper
- Kapda = Fabric/Cloth

OUR CATEGORIES:
${categoryList}

SAMPLE PRODUCTS WE COVER:
${productList}

WHAT YOU CAN SHARE:
✅ Category names and descriptions
✅ Product types and specifications
✅ Common uses for products
✅ Industry terminology explanations
✅ General product knowledge

WHAT YOU CANNOT SHARE (SECURITY):
❌ Supplier phone numbers or emails
❌ Contact details of any kind
❌ Specific pricing information
❌ Internal business data

RESPONSE STYLE:
- Keep responses SHORT (2-3 sentences)
- NO markdown formatting (no **, *, #)
- Plain text only
- Be helpful but don't oversell

If user asks for something unrelated to products/business:
"Hey! I'm here to help with product questions. What would you like to know about our categories?"

If user asks for contact info:
"For contacting suppliers, please use our main chat to search and connect with verified suppliers!"`;
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { message, conversationHistory = [], selectedCategory } = body;

        if (!message || typeof message !== "string") {
            return NextResponse.json(
                { error: "Message is required" },
                { status: 400 }
            );
        }

        // Fetch categories from database (NO contact info)
        const categoryTemplates = await prisma.categoryTemplate.findMany({
            where: { isActive: true },
            select: {
                name: true,
                description: true,
            },
        });

        // Fetch unique product categories from suppliers (NO contact info)
        const suppliers = await prisma.supplier.findMany({
            where: { status: "approved" },
            select: {
                productCategories: true,
            },
        });

        const allProducts = [...new Set(suppliers.flatMap(s => s.productCategories || []))];

        // Build system prompt
        let systemPrompt = buildHelperSystemPrompt(categoryTemplates, allProducts);

        // Add selected category context if provided
        if (selectedCategory) {
            systemPrompt += `\n\nThe user has selected the category "${selectedCategory}". Focus your answers on this category. Explain what products fall under it, common specs, and terminology.`;
        }

        // Build conversation parts
        const contents: Array<{ role: string; parts: Array<{ text: string }> }> = [
            { role: 'user', parts: [{ text: systemPrompt }] },
            { role: 'model', parts: [{ text: 'I understand. I am Chidiya, your product guide. I will help users understand our product categories and specifications while keeping contact information secure. How can I help you today?' }] },
        ];

        // Add conversation history
        for (const msg of conversationHistory) {
            contents.push({
                role: msg.role === 'assistant' ? 'model' : 'user',
                parts: [{ text: msg.content }],
            });
        }

        // Add current message
        contents.push({
            role: 'user',
            parts: [{ text: message }],
        });

        const response = await ai.models.generateContent({
            model: "gemini-2.0-flash",
            contents,
        });

        const responseText = response.text || "";

        if (!responseText) {
            console.warn("Global Chat: Empty response from Gemini API");
            return NextResponse.json({
                success: true,
                response: "I'm having a moment! Could you try asking again?",
                categories: categoryTemplates.map(c => c.name),
            });
        }

        // Clean response of any markdown
        const cleanResponse = responseText
            .replace(/\*\*/g, "")
            .replace(/\*/g, "")
            .replace(/#{1,3}\s/g, "");

        return NextResponse.json({
            success: true,
            response: cleanResponse,
            categories: categoryTemplates.map(c => c.name),
        });

    } catch (error: any) {
        console.error("Global Chat API Error:", error?.message || error);
        return NextResponse.json(
            { error: "Failed to process message", details: error?.message || "Unknown error" },
            { status: 500 }
        );
    }
}

// GET endpoint to fetch categories (for category browser)
export async function GET() {
    try {
        const categoryTemplates = await prisma.categoryTemplate.findMany({
            where: { isActive: true },
            select: {
                id: true,
                name: true,
                description: true,
                slug: true,
            },
            orderBy: { name: 'asc' },
        });

        // Get product counts per category
        const suppliers = await prisma.supplier.findMany({
            where: { status: "approved" },
            select: {
                productCategories: true,
            },
        });

        const categoryCounts: Record<string, number> = {};
        suppliers.forEach(s => {
            (s.productCategories || []).forEach(cat => {
                categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
            });
        });

        const categoriesWithCounts = categoryTemplates.map(cat => ({
            ...cat,
            supplierCount: categoryCounts[cat.name] || 0,
        }));

        return NextResponse.json({
            success: true,
            categories: categoriesWithCounts,
        });

    } catch (error) {
        console.error("Categories fetch error:", error);
        return NextResponse.json(
            { error: "Failed to fetch categories" },
            { status: 500 }
        );
    }
}

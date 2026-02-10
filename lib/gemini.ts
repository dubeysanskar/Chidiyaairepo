import { GoogleGenAI } from "@google/genai";

// Initialize with API key from environment
const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.GEMINI_API_KEY || "";
const ai = new GoogleGenAI({ apiKey });

// Message history type
export interface ChatMessage {
    role: "user" | "model";
    content: string;
}

// User requirements from pre-chat questionnaire
export interface UserRequirements {
    location?: string;
    category?: string;
    quantity?: string;
    budget?: string;
}

// Category specification from database
export interface CategorySpec {
    name: string;
    key: string;
    type: "single" | "multi";
    important: boolean;
    options: string[];
}

// Category context from database
export interface CategoryContext {
    name: string;
    slug: string;
    description?: string;
    commonNames: string[];
    specifications: CategorySpec[];
}

// Extract specifications that user already provided in their message
export function extractProvidedSpecs(
    message: string,
    categorySpecs: CategorySpec[]
): { key: string; value: string }[] {
    const lowerMessage = message.toLowerCase();
    const providedSpecs: { key: string; value: string }[] = [];

    for (const spec of categorySpecs) {
        for (const option of spec.options) {
            // Check if user mentioned this option (or close variant)
            const optionLower = option.toLowerCase();
            const optionVariants = [
                optionLower,
                optionLower.replace(/\s+/g, ""), // "65 ml" -> "65ml"
                optionLower.replace(/[()]/g, "").trim(), // Remove parentheses
            ];

            for (const variant of optionVariants) {
                if (variant !== "other" && lowerMessage.includes(variant)) {
                    providedSpecs.push({ key: spec.key, value: option });
                    break;
                }
            }
        }
    }

    return providedSpecs;
}

// Match user message to a category using common names and keyword matching
export function matchCategory(
    message: string,
    categories: CategoryContext[]
): CategoryContext | null {
    const lowerMessage = message.toLowerCase();
    // Generic words that are too ambiguous to match alone
    const stopWords = ['and', 'the', 'for', 'raw', 'fabric', 'fabrics', 'materials',
        'paper', 'plastic', 'tape', 'tapes', 'bag', 'bags', 'box', 'boxes',
        'sheet', 'sheets', 'roll', 'rolls', 'wrap', 'wraps', 'cup', 'cups'];

    // PASS 1: Exact full name match (highest priority)
    for (const category of categories) {
        if (lowerMessage.includes(category.name.toLowerCase())) {
            return category;
        }
    }

    // PASS 2: Common names match
    for (const category of categories) {
        for (const commonName of category.commonNames || []) {
            if (lowerMessage.includes(commonName.toLowerCase())) {
                return category;
            }
        }
    }

    // PASS 3: Slug match
    for (const category of categories) {
        if (lowerMessage.includes(category.slug.replace(/-/g, " "))) {
            return category;
        }
    }

    // PASS 4: Keyword matching - require specificity
    // For multi-word categories, need at least 2 matching words
    // For single unique keywords (like "corrugated", "thermocol"), 1 match is enough
    for (const category of categories) {
        const categoryWords = category.name.toLowerCase().split(' ')
            .filter(word => word.length > 3 && !stopWords.includes(word));

        if (categoryWords.length === 0) continue;

        const matchingWords = categoryWords.filter(word => lowerMessage.includes(word));

        // Single unique word (e.g., "corrugated", "polyester", "thermocol") - 1 match is enough
        if (categoryWords.length === 1 && matchingWords.length === 1) {
            return category;
        }

        // Multi-word category - need at least 2 matching unique words
        if (categoryWords.length >= 2 && matchingWords.length >= 2) {
            return category;
        }
    }

    return null;
}

// Get missing important specifications
export function getMissingSpecs(
    providedSpecs: { key: string; value: string }[],
    categorySpecs: CategorySpec[]
): CategorySpec[] {
    const providedKeys = new Set(providedSpecs.map(s => s.key));

    return categorySpecs.filter(
        spec => spec.important && !providedKeys.has(spec.key)
    );
}

// Build dynamic system prompt with category context
export function buildSystemPrompt(
    categories: CategoryContext[],
    matchedCategory?: CategoryContext,
    providedSpecs?: { key: string; value: string }[],
    missingSpecs?: CategorySpec[],
    suppliersFound?: boolean,
    categoryNotFound?: boolean,
    availableCategories?: string[]
): string {
    let prompt = `You are Chidiya, a warm and friendly B2B sourcing assistant for India. You speak like a helpful friend, not a robot.

PERSONALITY:
- Sound natural and conversational, like texting a friend who knows about suppliers
- Never repeat yourself or ask the same type of question twice
- Be direct and helpful - don't give generic responses
- Use simple, everyday language

CRITICAL RULES:
- Keep responses SHORT (1-2 sentences max)
- NO markdown formatting (no **, no *, no #)
- Plain text only
- NEVER start with "I understand you're looking for..." or similar robotic phrases
- NEVER repeat what they just told you back to them
- If user says "no" or "show me results" - stop asking questions!
- NEVER assume what product the user wants - ask them first!
- If user just says "hi" or "hey" - greet them and ask what they're looking for
- Examples in welcome message (Paper Cups, Boxes) are just EXAMPLES - don't assume user wants them!
- If user types gibberish or unclear text - ask them to clarify what product they need

`;


    // CATEGORY NOT FOUND - Handle when user asks for something we don't have
    if (categoryNotFound) {
        const topCategories = (availableCategories || []).slice(0, 5).join(", ");
        prompt += `IMPORTANT: The user wants something we DON'T have suppliers for!

DON'T keep asking questions. Be honest and direct:
- Tell them we don't have that category yet
- Suggest 2-3 categories we DO have
- Ask if any interest them

GOOD RESPONSE EXAMPLE:
"Sorry, we don't have clay suppliers yet! We're growing though. Right now we have ${topCategories}. Any of these work for you?"

BAD (robotic) RESPONSE - NEVER DO THIS:
"I understand you're looking for clay. Could you please tell me more about your requirements?"

AVAILABLE CATEGORIES: ${topCategories}
`;
        return prompt;
    }

    // Response structure based on whether suppliers are found
    if (suppliersFound) {
        prompt += `WHEN SHOWING SUPPLIERS:
- Quick acknowledgment like "Got it! Here are some matches for you."
- The supplier cards appear BELOW your message automatically
- You can suggest being more specific for better results

GOOD: "Found some paper cup suppliers in Noida! These are sorted by relevance."
BAD: "Based on your requirements, I have found the following suppliers for paper cups."

DON'T list the suppliers - the cards do that. Just add a friendly note!
`;
    } else {
        prompt += `WHEN NEEDING MORE INFO:
- Ask ONE simple question max
- Be casual and direct
- DON'T repeat back what they said

GOOD: "Paper cups - got it! What size do you need?"
BAD: "I understand you're looking for paper cups. Could you please specify the size?"

If they say "no" or "show results" - just say we need a bit more info or show what we have!
`;
    }


    // Add category knowledge
    if (categories.length > 0) {
        prompt += `AVAILABLE CATEGORIES:\n`;
        for (const cat of categories.slice(0, 8)) {
            prompt += `- ${cat.name}\n`;
        }
        prompt += "\n";
    }


    // Add matched category context
    if (matchedCategory) {
        prompt += `USER IS LOOKING FOR: ${matchedCategory.name}\n`;

        if (providedSpecs && providedSpecs.length > 0) {
            prompt += `Details provided: `;
            prompt += providedSpecs.map(s => `${s.key}=${s.value}`).join(", ");
            prompt += "\n";
        }

        if (!suppliersFound && missingSpecs && missingSpecs.length > 0) {
            const nextSpec = missingSpecs[0];
            prompt += `You may ask about: ${nextSpec.name}\n`;
        }
    }

    prompt += `
Remember: Supplier cards appear BELOW your text message. Your job is just to acknowledge and guide, not list anything.`;

    return prompt;
}

// Generate a response from Gemini with category context
export async function generateChatResponse(
    userMessage: string,
    conversationHistory: ChatMessage[],
    userRequirements?: UserRequirements,
    supplierData?: string,
    categoryContext?: {
        categories: CategoryContext[];
        matchedCategory?: CategoryContext;
        providedSpecs?: { key: string; value: string }[];
        missingSpecs?: CategorySpec[];
        categoryNotFound?: boolean;
        availableCategories?: string[];
    }
): Promise<string> {
    try {
        // Detect if suppliers were found
        const suppliersFound = !!supplierData && supplierData.length > 0;
        const categoryNotFound = categoryContext?.categoryNotFound ?? false;
        const availableCategories = categoryContext?.availableCategories ?? [];

        // Build dynamic system prompt
        const systemPrompt = categoryContext
            ? buildSystemPrompt(
                categoryContext.categories,
                categoryContext.matchedCategory,
                categoryContext.providedSpecs,
                categoryContext.missingSpecs,
                suppliersFound,
                categoryNotFound,
                availableCategories
            )
            : buildSystemPrompt([], undefined, undefined, undefined, suppliersFound, false, []);


        // Build the conversation context
        let contextMessage = "";

        if (userRequirements) {
            const reqs = [];
            if (userRequirements.location) reqs.push("Location: " + userRequirements.location);
            if (userRequirements.category) reqs.push("Category: " + userRequirements.category);
            if (userRequirements.quantity) reqs.push("Quantity: " + userRequirements.quantity);
            if (userRequirements.budget) reqs.push("Budget: " + userRequirements.budget);

            if (reqs.length > 0) {
                contextMessage = "\n\nUser's initial requirements:\n" + reqs.join("\n");
            }
        }

        // Add supplier data notification
        if (supplierData) {
            contextMessage += "\n\n[System: Supplier cards are now displayed in the UI. DO NOT list suppliers. Just acknowledge you found them and ask if user needs to refine their search.]";
        }

        // Build the full prompt with history
        const historyText = conversationHistory
            .map((msg) => (msg.role === "user" ? "User" : "Assistant") + ": " + msg.content)
            .join("\n\n");

        const fullPrompt = systemPrompt + contextMessage + "\n\n" +
            (historyText ? "Previous conversation:\n" + historyText + "\n\n" : "") +
            "User: " + userMessage + "\n\nAssistant:";

        // Call Gemini API
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: fullPrompt,
        });

        // Extract text from response
        const text = response.candidates?.[0]?.content?.parts?.[0]?.text ||
            response.text ||
            "I apologize, but I could not generate a response. Please try again.";

        return text;
    } catch (error: unknown) {
        console.error("Gemini API Error:", error);

        // Check if it's a rate limit error
        const errorStr = String(error);
        if (errorStr.includes("429") || errorStr.includes("quota")) {
            return "I'm experiencing high traffic right now. Please try again in a few seconds. Your request for " +
                (userRequirements?.category || "packaging products") + " in " +
                (userRequirements?.location || "your area") + " is noted!";
        }

        throw error;
    }
}

// Check if we should fetch suppliers based on conversation
export function shouldFetchSuppliers(
    messageCount: number,
    lastMessage: string,
    providedSpecs?: { key: string; value: string }[],
    missingImportantSpecs?: CategorySpec[]
): boolean {
    const lowerMessage = lastMessage.toLowerCase();

    // Greetings should never trigger supplier fetch
    const greetings = ['hi', 'hello', 'hey', 'good morning', 'good evening', 'thanks', 'thank you', 'bye'];
    const isJustGreeting = greetings.some(g => lowerMessage.trim() === g || lowerMessage.trim() === g + '!');
    if (isJustGreeting) return false;

    // Product keywords that indicate user wants to find suppliers
    const productKeywords = [
        "cup", "box", "tape", "bag", "wrap", "packaging", "poly", "corrugated", "bopp",
        "need", "want", "looking", "find", "search", "get", "show", "require", "order",
        "supplier", "buy", "purchase", "bulk", "wholesale", "manufacturer", "vendor",
        "textile", "fabric", "cotton", "paper", "plastic", "thermocol", "bubble",
        "shipping", "carton", "pouch", "label", "sticker", "print"
    ];

    // Check if message contains product keywords
    const hasProductKeyword = productKeywords.some(keyword => lowerMessage.includes(keyword));

    // User explicitly wants results
    const wantsResults = /show\s+(me\s+)?results?/i.test(lowerMessage) ||
        /show\s+(me\s+)?supplier/i.test(lowerMessage) ||
        /yes/i.test(lowerMessage.trim()) ||
        /no\s+preference/i.test(lowerMessage);

    // Always fetch if user mentions a product or quantity  
    const hasQuantity = /\d+/.test(lastMessage);

    // If we have provided specs, fetch suppliers
    const hasSpecs = providedSpecs && providedSpecs.length >= 1;

    // FIXED: Much more permissive - the caller already checks for matchedCategory
    // So if we get here, a category IS matched. Show suppliers in these cases:
    // 1. User has product keyword (they're asking about a product)
    // 2. User provided any specs or quantity
    // 3. User explicitly wants results
    // 4. After 2+ messages (they've been chatting, show something)
    return hasProductKeyword || hasQuantity || hasSpecs || wantsResults || messageCount >= 2;
}

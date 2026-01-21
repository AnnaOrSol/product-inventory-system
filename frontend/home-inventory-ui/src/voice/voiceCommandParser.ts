import type { Product } from "@/types/product";

export type VoiceIntent = "ADD" | "REMOVE";

export interface ParsedVoiceCommand {
    product: Product | null;
    quantity: number;
    intent: VoiceIntent;
    rawText: string;
}

export const parseVoiceCommand = (
    text: string,
    products: Product[]
): ParsedVoiceCommand => {
    const normalized = text.toLowerCase();

    // quantity
    const numberMatch = normalized.match(/\d+/);
    const quantity = numberMatch ? parseInt(numberMatch[0], 10) : 1;

    // intent
    let intent: VoiceIntent = "ADD";
    if (["נגמר", "חסר", "הורד", "תוציא", "סיימתי"].some(w => normalized.includes(w))) {
        intent = "REMOVE";
    }

    // product matching (name + aliases)
    const product =
        products.find(p =>
            [p.name, ...(p.aliases || [])]
                .some(alias => normalized.includes(alias.toLowerCase()))
        ) || null;

    return {
        product,
        quantity: intent === "REMOVE" ? -quantity : quantity,
        intent,
        rawText: text
    };
};

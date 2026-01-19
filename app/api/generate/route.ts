import { NextRequest, NextResponse } from "next/server";
import { generateText } from "ai";
import { GenerateRequest, GenerateResponse } from "@/lib/types";
import {
    buildSystemPrompt,
    getOpenRouterClient,
    processUploadedFiles,
    validateRequest,
    buildMessages,
    calculateTokenUsage,
} from "@/lib/llm";

export async function POST(request: NextRequest) {
    try {
        const body: GenerateRequest = await request.json();

        // Validate request
        const validation = validateRequest(body);
        if (!validation.valid) {
            return NextResponse.json(
                { success: false, error: validation.error },
                { status: validation.error?.includes("API key") ? 500 : 400 },
            );
        }

        // Process uploaded files
        const { parsedDocuments, visualFiles } = body.uploadedFiles
            ? await processUploadedFiles(body.uploadedFiles)
            : { parsedDocuments: [], visualFiles: [] };

        // Build prompt and messages
        const systemPrompt = buildSystemPrompt({ ...body, parsedDocuments });
        const model = getOpenRouterClient(body.model);
        const messages = buildMessages(systemPrompt, visualFiles);

        // Generate text
        const { text, usage } = await generateText({
            model,
            messages,
            temperature: 0.7,
        });

        // Calculate token usage
        const tokenUsage = calculateTokenUsage(usage, body.model);

        const result: GenerateResponse = {
            success: true,
            content: {
                whatLearned: text,
            },
            tokenUsage,
        };

        return NextResponse.json(result);
    } catch (error) {
        console.error("Generation error:", error);
        return NextResponse.json(
            { success: false, error: "Internal server error" },
            { status: 500 },
        );
    }
}

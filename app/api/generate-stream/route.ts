import { NextRequest } from "next/server";
import { streamText } from "ai";
import { GenerateRequest } from "@/lib/types";
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
            return new Response(JSON.stringify({ error: validation.error }), {
                status: validation.error?.includes("API key") ? 500 : 400,
                headers: { "Content-Type": "application/json" },
            });
        }

        // Process uploaded files
        const { parsedDocuments, visualFiles } = body.uploadedFiles
            ? await processUploadedFiles(body.uploadedFiles)
            : { parsedDocuments: [], visualFiles: [] };

        // Build prompt and messages
        const systemPrompt = buildSystemPrompt({ ...body, parsedDocuments });
        const model = getOpenRouterClient(body.model);
        const messages = buildMessages(systemPrompt, visualFiles);

        // Use AI SDK's streamText with messages
        const result = streamText({
            model,
            messages,
            temperature: 0.7,
        });

        // Create a custom stream that appends token usage at the end
        const encoder = new TextEncoder();

        const customStream = new ReadableStream({
            async start(controller) {
                try {
                    // Stream the text content
                    for await (const chunk of result.textStream) {
                        controller.enqueue(encoder.encode(chunk));
                    }

                    // After streaming completes, get usage data and send it
                    const finalResult = await result;
                    const usage = await finalResult.usage;

                    console.log("Usage data:", usage); // Debug log

                    // Calculate token usage
                    const tokenUsage = calculateTokenUsage(usage, body.model);

                    console.log("Calculated usage:", tokenUsage); // Debug log

                    // Send token usage as special marker
                    const tokenData = `\n__TOKEN_USAGE__:${JSON.stringify(tokenUsage)}`;
                    controller.enqueue(encoder.encode(tokenData));

                    controller.close();
                } catch (error) {
                    console.error("Stream error:", error);
                    controller.error(error);
                }
            },
        });

        return new Response(customStream, {
            headers: {
                "Content-Type": "text/plain; charset=utf-8",
                "Cache-Control": "no-cache",
                Connection: "keep-alive",
            },
        });
    } catch (error) {
        console.error("Generation error:", error);
        return new Response(
            JSON.stringify({
                error: error instanceof Error ? error.message : "Unknown error",
            }),
            { status: 500, headers: { "Content-Type": "application/json" } },
        );
    }
}

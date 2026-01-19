import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { GenerateRequest, TokenUsage } from "./types";
import { config, AllowedModelId } from "./config";
import { parseDocument } from "./documentParser";

/**
 * Validate request body
 */
export function validateRequest(body: GenerateRequest): {
    valid: boolean;
    error?: string;
} {
    if (!body.otherActivity || !body.who || !body.where) {
        return { valid: false, error: "Missing required fields" };
    }
    if (!process.env.OPENROUTER_API_KEY) {
        return { valid: false, error: "OpenRouter API key not configured" };
    }
    return { valid: true };
}

/**
 * Process uploaded files and extract text content from documents
 */
export async function processUploadedFiles(
    files: Array<{ name: string; type: string; dataUrl: string }>,
): Promise<{
    parsedDocuments: Array<{ fileName: string; text: string; type: string }>;
    visualFiles: Array<{ name: string; type: string; dataUrl: string }>;
}> {
    const parsedDocuments: Array<{
        fileName: string;
        text: string;
        type: string;
    }> = [];
    const visualFiles: Array<{ name: string; type: string; dataUrl: string }> =
        [];

    for (const file of files) {
        // Images and PDFs can be passed directly to Claude as visual content
        if (file.type.startsWith("image/") || file.type === "application/pdf") {
            visualFiles.push(file);
        }
        // Other document types need to be parsed
        else {
            const parsed = await parseDocument(
                file.dataUrl,
                file.name,
                file.type,
            );
            if (parsed && parsed.text) {
                parsedDocuments.push(parsed);
            }
        }
    }

    return { parsedDocuments, visualFiles };
}

// Initialize OpenRouter client
export function getOpenRouterClient(model: AllowedModelId) {
    const modelData = config.allowedModels.find((m) => m.id === model);
    if (!modelData) {
        throw new Error("Model not found");
    }

    const openrouter = createOpenRouter({
        apiKey: process.env.OPENROUTER_API_KEY,
    });

    return openrouter(modelData.model);
}

// Method-specific prompt guidance
const METHOD_PROMPTS: Record<string, string> = {
    assessment:
        "Reflect on what was assessed, the feedback you received, and identify specific strengths and development areas that emerged from the assessment.",
    assignments:
        "Describe the assignment objectives, what you produced, the skills you developed, and how it relates to your work role.",
    classroom:
        "Detail the topics covered, key concepts learned, how you engaged with the material, and practical applications to your role.",
    coaching:
        "Explain the coaching focus, specific skills or techniques learned, guidance received, and how you'll apply this coaching.",
    conferences:
        "Describe the key presentations attended, insights gained, networking opportunities, and how the conference content relates to your development.",
    contextualised:
        "Explain how you applied literacy or numeracy skills in a practical work context, what you learned, and how it improves your effectiveness.",
    "field-visits":
        "Describe what you observed, what you learned from seeing practices in action, and how you'll apply these insights.",
    placements:
        "Explain what tasks you performed, what supervision you received, skills practiced, and key learnings from the work placement.",
    "industry-visits":
        "Detail what you observed during the visit, industry practices you learned about, and how this relates to your own role and development.",
    projects:
        "Explain the project objectives, your specific role and contributions, challenges faced, skills developed, and outcomes achieved.",
    manufacturer:
        "Describe the equipment or machinery, the training received, safety considerations, practical skills gained, and how you'll use this in your role.",
    meetings:
        "Explain the meeting purpose, your participation, key decisions or discussions, and what you learned from the meeting.",
    mentoring:
        "Describe your mentoring relationship, the guidance and advice received, insights gained, and how you're applying the mentor's wisdom.",
    online: "Detail the course or training content, key modules completed, skills or knowledge gained, and practical applications to your work.",
    "new-elements":
        "Explain the new tasks or responsibilities, what made them challenging, how you approached learning them, and what you can now do.",
    reading:
        "Cite the materials you read (books, articles, documentation), summarize key takeaways, and explain how this relates to your work context.",
    research:
        "Describe your research topic and approach, sources consulted, key findings, and how this research informs your work or development.",
    "self-study":
        "Explain what you studied, your learning approach, resources used, concepts mastered, and how this study benefits your role.",
    simulations:
        "Describe the simulation or demonstration witnessed, what it illustrated, practical insights gained, and how you'll apply this learning.",
    testing:
        "Explain what was tested, the approach taken, results observed, what you learned from the testing process, and implications for your work.",
};

export function buildSystemPrompt(data: {
    date: string;
    duration: number;
    method?: string;
    otherActivity?: string;
    who: string;
    where: string;
    validatedBy?: string;
    prompt?: string;
    activityTypes?: string[];
    uploadedFiles?: Array<{ name: string; type: string; dataUrl: string }>;
    parsedDocuments?: Array<{ fileName: string; text: string; type: string }>;
    previousGenerations?: string[];
}): string {
    const methodInfo = config.trainingMethods.find((m) => m.id === data.method);
    const methodName = methodInfo?.label || data.method || "training activity";
    const methodGuidance = data.method ? METHOD_PROMPTS[data.method] || "" : "";

    // Adjust word count based on duration - Keep it BRIEF like real apprentice logs
    let targetWords = "20-30";
    let maxWords = "35";
    if (data.duration >= 4) {
        targetWords = "45-55";
        maxWords = "60";
    } else if (data.duration >= 2) {
        targetWords = "30-40";
        maxWords = "45";
    } else if (data.duration < 1) {
        targetWords = "15-25";
        maxWords = "30";
    }

    const activityList =
        data.activityTypes && data.activityTypes.length > 0
            ? `\n\nSpecific activities covered:\n${data.activityTypes.map((a) => `- ${a}`).join("\n")}`
            : "";

    const customPrompt = data.prompt
        ? `\n\nAdditional context: ${data.prompt}`
        : "";

    // Build document content section
    let documentContent = "";

    if (data.parsedDocuments && data.parsedDocuments.length > 0) {
        documentContent = `\n\n=== DOCUMENT CONTENT ===\n\n`;
        data.parsedDocuments.forEach((doc) => {
            documentContent += `Document: ${doc.fileName}\n${doc.text}\n\n`;
        });
        documentContent += `=== END DOCUMENT CONTENT ===\n\nIMPORTANT: Use the content from the documents above to provide specific details about what was learned.`;
    }

    const attachedFiles =
        data.uploadedFiles && data.uploadedFiles.length > 0
            ? `\n\nAttached files for context (${data.uploadedFiles.length}):\n${data.uploadedFiles
                  .map((f) => {
                      if (f.type.startsWith("image/")) {
                          return `- ${f.name} (image - visible in chat)`;
                      } else if (f.type === "application/pdf") {
                          return `- ${f.name} (PDF - visible in chat)`;
                      } else {
                          return `- ${f.name} (${f.type} - content extracted)`;
                      }
                  })
                  .join(
                      "\n",
                  )}\n\nIMPORTANT: Review all attached images and PDFs shown above for specific details about what was learned during this activity. Reference concrete information from these files in your response.`
            : "";

    const historyContext =
        data.previousGenerations && data.previousGenerations.length > 0
            ? `\n\n=== PREVIOUS VERSIONS (for context only, do NOT repeat) ===\n\n${data.previousGenerations
                  .map(
                      (gen, i) =>
                          `Version ${data.previousGenerations!.length - i}:\n${gen}`,
                  )
                  .join(
                      "\n\n",
                  )}\n\n=== END PREVIOUS VERSIONS ===\n\nNOTE: The above are previous attempts. Generate something NEW and different while staying consistent with the activity details.`
            : "";

    return `You are helping a UK apprentice write their official Off-The-Job (OTJ) training log entry.

Training Details:
- Date: ${data.date}
- Duration: ${data.duration} hours
- Method: ${methodName}${methodInfo ? ` - ${methodInfo.description}` : ""}
- Activity: ${data.otherActivity || "Learning activity"}
- Who: ${data.who}
- Where: ${data.where}${activityList}${customPrompt}${documentContent}${attachedFiles}${historyContext}

Write a brief "What I Learned" entry in the style of real apprentice logs. Study these examples:

"I learnt how to log my Off The Job training in Maytas Hub and covered my KSBs and what I will need to do to achieve my goals."

"Started working on more console-based applications in C# like a calculator and working through the conditionals exercises."

"I learned about the platform I will be using to learn C#, Codio, and how I will create the project using C#."

"I used Wireshark to view saved network traffic and utilised the filters to sort through and identify traffic that may be suspicious. I also used nmap to find open ports in online services."

"I added support for deserializing data dynamically from a JSON file to my progress check task."

"I learned how to create a class diagram and specify the different stereotypes and relationships within it."

CRITICAL GUIDELINES:
1. Aim for ${targetWords} words - try to use the full word count available
2. Write like brief technical notes, not a formal essay
3. Use simple, direct language - start with "I learned/covered/worked on/created..."
4. Mention specific technologies, tools, frameworks, or concepts by name
5. No elaborate explanations - just state what was done/learned
6. Focus on concrete activities and outcomes
7. Pack in as much relevant detail as possible within the word limit
8. ${methodGuidance}

AVOID AI-WRITING PATTERNS (write like a real person):
- NO inflated language: Don't use "serves as," "stands as," "testament," "pivotal," "crucial," "underscores," "highlights," "broader," "evolving landscape"
- NO promotional fluff: Avoid "vibrant," "rich," "profound," "groundbreaking," "renowned," "breathtaking," "nestled"
- NO -ing superficial analysis: Don't add phrases like "highlighting," "emphasizing," "showcasing," "reflecting," "symbolizing"
- NO vague claims: Skip "experts believe," "industry reports," "some argue" - use specific facts
- NO rule of three spam: Don't force everything into groups of three
- NO em dash overuse: Use regular punctuation
- NO copula avoidance: Use "is/are/has" normally - don't replace with "serves as," "boasts," "features"
- NO hedging chains: Don't say "potentially possibly might" - just "might"
- NO chatbot language: Never say "I hope this helps," "let me know," "here is"

WRITE WITH PERSONALITY:
- Vary sentence length naturally (short and long mixed)
- Use "I" perspective naturally (it's an apprentice log)
- Be specific about what you actually did/learned
- It's okay to show uncertainty or mixed feelings
- Sound like actual notes someone typed quickly

Example of what NOT to do:
"I delved into the intricate landscape of C# programming, exploring its pivotal features. This serves as a testament to the evolving nature of software development, highlighting the crucial role of object-oriented programming in fostering robust applications."

Example of what to DO:
"I learned C# basics including classes, methods, and inheritance. Created a simple console calculator to practice conditionals and user input handling."

Write the entry now (aim for ${targetWords} words, absolute max ${maxWords}):`;
}

/**
 * Build messages array with visual files
 */
export function buildMessages(
    systemPrompt: string,
    visualFiles: Array<{ name: string; type: string; dataUrl: string }>,
): any[] {
    const messages: any[] = [];

    if (visualFiles.length > 0) {
        const content: any[] = [{ type: "text", text: systemPrompt }];

        // Add all visual files (images and PDFs) to the message
        for (const file of visualFiles) {
            content.push({
                type: "image",
                image: file.dataUrl,
            });
        }

        messages.push({ role: "user", content });
    } else {
        messages.push({ role: "user", content: systemPrompt });
    }

    return messages;
}

/**
 * Calculate token usage and estimated cost
 */
export function calculateTokenUsage(
    usage: any,
    modelId: AllowedModelId,
): TokenUsage {
    const modelData = config.allowedModels.find((m) => m.id === modelId);
    // Try both property name variations (different AI SDK versions/providers use different names)
    const inputTokens = usage?.inputTokens || usage?.promptTokens || 0;
    const outputTokens = usage?.outputTokens || usage?.completionTokens || 0;
    const totalTokens = usage?.totalTokens || inputTokens + outputTokens;
    const estimatedCost = modelData
        ? (inputTokens / 1_000_000) * modelData.inputCostPerMillion +
          (outputTokens / 1_000_000) * modelData.outputCostPerMillion
        : 0;

    return {
        inputTokens,
        outputTokens,
        totalTokens,
        estimatedCost,
    };
}

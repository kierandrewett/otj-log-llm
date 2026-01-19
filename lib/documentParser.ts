import mammoth from "mammoth";
import * as XLSX from "xlsx";
import { PDFParse } from "pdf-parse";

// Initialize PDF parser
async function parsePDF(buffer: Buffer): Promise<{ text: string }> {
    const parser = new PDFParse(buffer);
    const result = await parser.getText();
    return { text: result.text };
}

export interface ParsedDocument {
    text: string;
    fileName: string;
    type: string;
}

/**
 * Extract text content from various document formats
 */
export async function parseDocument(
    dataUrl: string,
    fileName: string,
    type: string,
): Promise<ParsedDocument | null> {
    try {
        // Convert data URL to Buffer
        const base64Data = dataUrl.split(",")[1];
        const buffer = Buffer.from(base64Data, "base64");

        let extractedText = "";

        // Parse Word documents (.docx)
        if (
            type ===
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
            type === "application/msword" ||
            fileName.endsWith(".docx") ||
            fileName.endsWith(".doc")
        ) {
            const result = await mammoth.extractRawText({ buffer });
            extractedText = result.value;
        }
        // Parse PDF documents
        else if (type === "application/pdf" || fileName.endsWith(".pdf")) {
            const data = await parsePDF(buffer);
            extractedText = data.text;
        }
        // Parse Excel spreadsheets (.xlsx, .xls)
        else if (
            type ===
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
            type === "application/vnd.ms-excel" ||
            fileName.endsWith(".xlsx") ||
            fileName.endsWith(".xls")
        ) {
            const workbook = XLSX.read(buffer, { type: "buffer" });
            const sheets = workbook.SheetNames.map((name) => {
                const sheet = workbook.Sheets[name];
                return `Sheet: ${name}\n${XLSX.utils.sheet_to_txt(sheet)}`;
            });
            extractedText = sheets.join("\n\n");
        }
        // Parse PowerPoint (.pptx) - basic text extraction
        else if (
            type ===
                "application/vnd.openxmlformats-officedocument.presentationml.presentation" ||
            fileName.endsWith(".pptx")
        ) {
            // Note: PPTX text extraction is complex, using basic approach
            extractedText = `[PowerPoint file: ${fileName} - text extraction limited]`;
        }
        // Plain text files
        else if (type.includes("text/") || fileName.endsWith(".txt")) {
            extractedText = buffer.toString("utf-8");
        }

        if (extractedText) {
            // Limit text length to prevent token overflow (max ~4000 words)
            const words = extractedText.split(/\s+/);
            if (words.length > 4000) {
                extractedText =
                    words.slice(0, 4000).join(" ") +
                    "\n[... content truncated ...]";
            }

            return {
                text: extractedText.trim(),
                fileName,
                type,
            };
        }

        return null;
    } catch (error) {
        console.error(`Error parsing document ${fileName}:`, error);
        return null;
    }
}

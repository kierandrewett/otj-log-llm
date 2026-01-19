import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { join } from "path";
import { DEFAULT_CONFIG } from "@/lib/config";
import merge from "deepmerge";
import deepmerge from "deepmerge";

export async function GET() {
    try {
        // Get config file path from environment variable
        const configPath = process.env.CONFIG_FILE_PATH;

        if (!configPath) {
            console.warn(
                "CONFIG_FILE_PATH not set, using default configuration",
            );
            return NextResponse.json({
                success: true,
                config: DEFAULT_CONFIG,
            });
        }

        // Resolve the path (support both absolute and relative paths)
        const absolutePath = configPath.startsWith("/")
            ? configPath
            : join(process.cwd(), configPath);

        // Read the config file
        const fileContent = await readFile(absolutePath, "utf-8");
        const userConfig = JSON.parse(fileContent);

        // Deep merge user config with defaults
        // Any arrays in user config will replace defaults
        const mergedConfig = deepmerge(DEFAULT_CONFIG, userConfig, {
            arrayMerge: (_, sourceArray) => sourceArray,
        });

        return NextResponse.json({
            success: true,
            config: mergedConfig,
        });
    } catch (error) {
        console.error("Failed to load config file:", error);

        // Return default config on error
        return NextResponse.json(
            {
                success: false,
                error:
                    error instanceof Error
                        ? error.message
                        : "Failed to load config",
                config: DEFAULT_CONFIG,
            },
            { status: 200 }, // Still return 200 so app can handle gracefully
        );
    }
}

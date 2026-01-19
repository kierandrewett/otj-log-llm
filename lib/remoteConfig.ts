/**
 * Remote Configuration Loader
 *
 * Fetches configuration from /api/config and merges with local defaults
 */

import { TrainingMethod, AllowedModel, AllowedModelId } from "./config";

export interface RemoteConfig {
    builtInWho?: string[];
    builtInWhere?: string[];
    builtInActivities?: string[];
    validationOptions?: Array<{ value: string; label: string }>;
    defaultFormValues?: {
        model?: AllowedModelId;
        who?: string;
        where?: string;
        validatedBy?: string;
    };
    minDuration?: number;
    defaultUseStreaming?: boolean;
    maxFileSize?: number;
    allowedFileTypes?: string[];
    apiTimeout?: number;
    exportJsonSpacing?: number;
    trainingMethods?: TrainingMethod[];
    allowedModels?: AllowedModel[];
}

/**
 * Fetch remote configuration from API
 * Returns the merged config (already merged with defaults on the server)
 */
export async function fetchRemoteConfig(): Promise<RemoteConfig | null> {
    try {
        const response = await fetch("/api/config", {
            cache: "no-store",
        });

        const data = await response.json();

        if (data.success && data.config) {
            console.log("Remote configuration loaded successfully");
            return data.config;
        } else {
            console.error("Failed to load remote config:", data.error);
            return null;
        }
    } catch (error) {
        console.error("Failed to fetch remote config:", error);
        return null;
    }
}

"use client";

import { useEffect, useState } from "react";
import { fetchRemoteConfig } from "@/lib/remoteConfig";
import { applyRemoteConfig } from "@/lib/config";

/**
 * Config Provider Component
 * Loads remote configuration on app startup
 */
export default function ConfigProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const [configLoaded, setConfigLoaded] = useState(false);

    useEffect(() => {
        async function loadConfig() {
            try {
                const remoteConfig = await fetchRemoteConfig();
                applyRemoteConfig(remoteConfig);

                if (remoteConfig) {
                    console.log("Remote configuration loaded successfully");
                } else {
                    console.log("Using default configuration");
                }
            } catch (error) {
                console.error("Failed to load configuration:", error);
            } finally {
                setConfigLoaded(true);
            }
        }

        loadConfig();
    }, []);

    // Show loading state while config is being fetched
    if (!configLoaded) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
                    <p className="mt-4 text-gray-600 dark:text-gray-400">
                        Loading configuration...
                    </p>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}

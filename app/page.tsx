"use client";

import React, { useState, useEffect } from "react";
import { useFormik } from "formik";
import FormSection from "@/components/FormSection";
import OutputSection from "@/components/OutputSection";
import { FormData, SavedLog, GenerateResponse } from "@/lib/types";
import { config, getFormValidationSchema } from "@/lib/config";

export default function Home() {
    const [generatedContent, setGeneratedContent] = useState<
        Array<{
            id: string;
            content: string;
            timestamp: number;
            model?: string;
            tokenUsage?: {
                inputTokens: number;
                outputTokens: number;
                totalTokens: number;
                estimatedCost: number;
            };
        }>
    >([]);
    const [currentGenerationContent, setCurrentGenerationContent] =
        useState("");
    const [useStreaming, setUseStreaming] = useState(
        config.defaultUseStreaming,
    );
    const [errors, setErrors] = useState<string[]>([]);

    // Initialize Formik
    const formik = useFormik<FormData>({
        initialValues: {
            model: config.defaultFormValues.model,
            date: "",
            startTime: "",
            endTime: "",
            duration: 0,
            method: "",
            otherActivity: "",
            who: config.defaultFormValues.who,
            where: config.defaultFormValues.where,
            validatedBy: config.defaultFormValues.validatedBy,
            prompt: "",
            activityTypes: [],
            uploadedFiles: [],
            includeHistory: false,
        },
        validationSchema: getFormValidationSchema(),
        onSubmit: async (values) => {
            if (useStreaming) {
                handleGenerateStream(values);
            } else {
                handleGenerate(values);
            }
        },
    });

    const [isGenerating, setIsGenerating] = useState(false);

    // Update generation history when streaming completes
    useEffect(() => {
        if (
            !isGenerating &&
            currentGenerationContent &&
            generatedContent.length > 0
        ) {
            setGeneratedContent((prev) => {
                const updated = [...prev];
                if (updated[0].content === "") {
                    // Remove token usage marker if present
                    const cleanContent = currentGenerationContent
                        .split("__TOKEN_USAGE__:")[0]
                        .trim();
                    updated[0].content = cleanContent;
                }
                return updated;
            });
        }
    }, [isGenerating, currentGenerationContent]);

    const handleLoadLog = (log: SavedLog) => {
        formik.setValues(log.formData);
        if (log.generatedVersions && log.generatedVersions.length > 0) {
            setGeneratedContent(log.generatedVersions);
        } else {
            // Fallback for old saved logs without generatedVersions
            setGeneratedContent([
                {
                    id: Date.now().toString(),
                    content: log.whatLearned,
                    timestamp: log.timestamp,
                    model: log.formData.model,
                },
            ]);
        }
    };

    const handleSaveLog = () => {
        if (generatedContent.length === 0) return;

        const latestContent = generatedContent[0].content;
        const newLog: SavedLog = {
            id: Date.now().toString(),
            timestamp: Date.now(),
            formData: { ...formik.values },
            whatLearned: latestContent,
            generatedVersions: generatedContent.map((gen) => ({
                id: gen.id,
                content: gen.content,
                timestamp: gen.timestamp,
                model: gen.model ?? "unknown",
                tokenUsage: gen.tokenUsage,
            })),
        };

        // Save to localStorage directly
        const existingLogs = localStorage.getItem("otj_logs");
        const logs = existingLogs ? JSON.parse(existingLogs) : [];
        localStorage.setItem("otj_logs", JSON.stringify([newLog, ...logs]));
        alert("Log saved successfully!");
    };

    const handleGenerateStream = async (values: FormData) => {
        setErrors([]);
        setCurrentGenerationContent("");
        setIsGenerating(true);
        const generationId = Date.now().toString();
        let tokenUsage: any = undefined;

        try {
            const response = await fetch("/api/generate-stream", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    model: values.model,
                    date: values.date,
                    duration: values.duration,
                    method: values.method,
                    otherActivity: values.otherActivity,
                    who: values.who,
                    where: values.where,
                    validatedBy: values.validatedBy,
                    prompt: values.prompt,
                    activityTypes: values.activityTypes,
                    uploadedFiles: values.uploadedFiles,
                    previousGenerations: values.includeHistory
                        ? generatedContent.map((g) => g.content)
                        : undefined,
                }),
            });

            if (!response.ok) {
                const data = await response.json();

                throw new Error(`${data.error || response.statusText}`);
            }

            // Read the text stream from AI SDK's toTextStreamResponse
            const reader = response.body?.getReader();
            const decoder = new TextDecoder();

            if (reader) {
                let fullText = "";
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    // Decode and immediately update state for true streaming
                    const chunk = decoder.decode(value, { stream: false });
                    fullText += chunk;

                    // Check if chunk contains token usage marker
                    if (fullText.includes("__TOKEN_USAGE__:")) {
                        const parts = fullText.split("__TOKEN_USAGE__:");
                        const textContent = parts[0];
                        try {
                            tokenUsage = JSON.parse(parts[1]);
                        } catch (e) {
                            console.error("Failed to parse token usage:", e);
                        }
                        setCurrentGenerationContent(textContent);
                    } else {
                        setCurrentGenerationContent(fullText);
                    }
                }
            }

            // After streaming is complete, add to history
            setGeneratedContent((prev) => [
                {
                    id: generationId,
                    content: "", // Will be set from currentGenerationContent
                    timestamp: parseInt(generationId),
                    model: values.model,
                    tokenUsage: tokenUsage,
                },
                ...prev,
            ]);
        } catch (error) {
            console.error("Streaming error:", error);
            setErrors([`Failed to generate content: ${error}`]);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleGenerate = async (values: FormData) => {
        setErrors([]);
        setCurrentGenerationContent("");
        setIsGenerating(true);
        const generationId = Date.now().toString();

        try {
            const response = await fetch("/api/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    model: values.model,
                    date: values.date,
                    duration: values.duration,
                    method: values.method,
                    otherActivity: values.otherActivity,
                    who: values.who,
                    where: values.where,
                    validatedBy: values.validatedBy,
                    prompt: values.prompt,
                    activityTypes: values.activityTypes,
                    uploadedFiles: values.uploadedFiles,
                    previousGenerations: values.includeHistory
                        ? generatedContent.map((g) => g.content)
                        : undefined,
                }),
            });

            const data: GenerateResponse = await response.json();

            if (!data.success || !data.content) {
                throw new Error(data.error || "Failed to generate content");
            }

            setCurrentGenerationContent(data.content.whatLearned);
            setGeneratedContent((prev) => [
                {
                    id: generationId,
                    content: data.content!.whatLearned,
                    timestamp: parseInt(generationId),
                    model: values.model,
                    tokenUsage: data.tokenUsage,
                },
                ...prev,
            ]);
        } catch (error) {
            console.error("Generation error:", error);
            setErrors(["Failed to generate content. Please try again."]);
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <main className="min-h-screen max-w-[1500px] mx-auto [@media(min-width:1500px)]:px-4 [@media(min-width:1500px)]:py-10">
            <div className="mx-auto space-y-4">
                <form onSubmit={formik.handleSubmit} className="space-y-4">
                    {/* Main Content: Form and Output Side by Side */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 [@media(min-width:1500px)]:gap-4">
                        {/* Left: Form + Saved Logs */}
                        <FormSection
                            formik={formik}
                            onLoadLog={handleLoadLog}
                        />

                        {/* Right: Output */}
                        <div className="border-l lg:border-t-0 border-t flex flex-col max-h-screen h-screen [@media(min-width:1500px)]:rounded-lg [@media(min-width:1500px)]:border border-gray-200 dark:border-[rgb(30,30,30)] shadow-sm overflow-auto bg-white dark:bg-[rgb(10,10,10)] border-gray-200 dark:border-[rgb(30,30,30)]">
                            <header className="sticky p-4 top-0 z-10 border-b shadow-sm bg-gradient-to-b from-gray-50 to-white dark:from-[rgb(20,20,20)] dark:to-[rgb(10,10,10)] border-gray-200 dark:border-[rgb(30,30,30)]">
                                {/* Title */}
                                <div className="mb-4">
                                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                        AI Generated Reflection
                                    </h2>
                                    <p className="text-xs mt-0.5 text-gray-500 dark:text-gray-400">
                                        Review and save your learning reflection
                                    </p>
                                </div>

                                {/* Model Selection & Settings */}
                                <div className="rounded-lg border p-3 mb-3 bg-white dark:bg-[rgb(20,20,20)] border-gray-200 dark:border-[rgb(40,40,40)]">
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400">
                                            Settings
                                        </span>
                                        <div className="flex items-center gap-2">
                                            <img
                                                src={
                                                    config.allowedModels.find(
                                                        (m) =>
                                                            m.id ===
                                                            formik.values.model,
                                                    )?.icon
                                                }
                                                alt="Model Icon"
                                                className="w-4 h-4"
                                            />
                                            <select
                                                className="px-2 py-1 rounded text-xs font-medium focus:ring-2 focus:ring-blue-500 transition-colors input-field"
                                                value={formik.values.model}
                                                onChange={(e) =>
                                                    formik.setFieldValue(
                                                        "model",
                                                        e.target.value,
                                                    )
                                                }
                                            >
                                                {config.allowedModels.map(
                                                    (model) => (
                                                        <option
                                                            key={model.id}
                                                            value={model.id}
                                                        >
                                                            {model.label}
                                                        </option>
                                                    ),
                                                )}
                                            </select>
                                        </div>
                                    </div>

                                    {/* Include History Option */}
                                    {generatedContent.length > 0 && (
                                        <label className="flex items-center gap-2 text-xs cursor-pointer transition-colors text-gray-600 dark:text-gray-400">
                                            <input
                                                type="checkbox"
                                                checked={
                                                    formik.values.includeHistory
                                                }
                                                onChange={(e) =>
                                                    formik.setFieldValue(
                                                        "includeHistory",
                                                        e.target.checked,
                                                    )
                                                }
                                                className="w-3.5 h-3.5 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                                            />
                                            <span>
                                                Include previous versions (
                                                {generatedContent.length})
                                            </span>
                                        </label>
                                    )}
                                </div>

                                {/* Generate Button */}
                                <button
                                    type="submit"
                                    disabled={
                                        isGenerating ||
                                        !formik.isValid ||
                                        !formik.dirty
                                    }
                                    className="w-full py-2.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:grayscale disabled:hover:bg-blue-600 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md mb-3"
                                >
                                    {isGenerating ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <span className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
                                            Generating...
                                        </span>
                                    ) : (
                                        "Generate Learning Reflection"
                                    )}
                                </button>

                                {/* Errors */}
                                {errors.length > 0 && (
                                    <div className="border rounded-lg p-3 mb-3 bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-700">
                                        <h3 className="font-semibold mb-1.5 text-xs text-red-900 dark:text-red-200">
                                            Please fix the following errors:
                                        </h3>
                                        <ul className="list-disc list-inside space-y-0.5">
                                            {errors.map((error, idx) => (
                                                <li
                                                    key={idx}
                                                    className="text-xs text-red-700 dark:text-red-300"
                                                >
                                                    {error}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </header>

                            <OutputSection
                                generationHistory={generatedContent}
                                currentGenerationContent={
                                    currentGenerationContent
                                }
                                isGenerating={isGenerating}
                                onRegenerate={() => formik.handleSubmit()}
                                onSave={handleSaveLog}
                                onUpdateHistory={setGeneratedContent}
                            />
                        </div>
                    </div>
                </form>
            </div>
        </main>
    );
}
